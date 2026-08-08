const { Document } = require("@langchain/core/documents");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger");

/**
 * Tokenize text into normalized lowercase term array
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * TF-IDF Vectorizer and In-Memory Vector Store using LangChain Document models
 */
class TfIdfVectorStore {
  constructor(documents = []) {
    this.documents = documents;
    this.vocabulary = new Set();
    this.docCount = documents.length;
    this.idfMap = new Map();
    this.docVectors = [];
    if (documents.length > 0) {
      this.buildIndex();
    }
  }

  buildIndex() {
    const docTermFreqs = [];
    const docFreqs = new Map();

    // 1. Calculate Term Frequencies (TF) per document
    for (const doc of this.documents) {
      const tokens = tokenize(doc.pageContent);
      const tf = new Map();
      tokens.forEach((token) => {
        this.vocabulary.add(token);
        tf.set(token, (tf.get(token) || 0) + 1);
      });
      docTermFreqs.push({ doc, tf, totalTokens: tokens.length });

      // Unique terms per doc for Document Frequency (DF)
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach((token) => {
        docFreqs.set(token, (docFreqs.get(token) || 0) + 1);
      });
    }

    // 2. Calculate Inverse Document Frequency (IDF)
    for (const [term, df] of docFreqs.entries()) {
      this.idfMap.set(term, Math.log((this.docCount + 1) / (df + 1)) + 1);
    }

    // 3. Construct Normalized TF-IDF Vector for each document
    this.docVectors = docTermFreqs.map(({ doc, tf, totalTokens }) => {
      const vector = new Map();
      let normSq = 0;
      for (const [term, count] of tf.entries()) {
        const tfVal = count / totalTokens;
        const idfVal = this.idfMap.get(term) || 1;
        const tfidf = tfVal * idfVal;
        vector.set(term, tfidf);
        normSq += tfidf * tfidf;
      }
      return { doc, vector, norm: Math.sqrt(normSq) };
    });
  }

  similaritySearch(query, k = 4, filter = {}) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.docVectors.length === 0) {
      return this.documents.slice(0, k);
    }

    // Build Query TF-IDF Vector
    const queryTf = new Map();
    queryTokens.forEach((t) => queryTf.set(t, (queryTf.get(t) || 0) + 1));
    const queryVector = new Map();
    let queryNormSq = 0;

    for (const [term, count] of queryTf.entries()) {
      const tfVal = count / queryTokens.length;
      const idfVal = this.idfMap.get(term) || 1;
      const tfidf = tfVal * idfVal;
      queryVector.set(term, tfidf);
      queryNormSq += tfidf * tfidf;
    }

    const queryNorm = Math.sqrt(queryNormSq);

    // Compute Cosine Similarity for each document
    const scoredDocs = this.docVectors.map(({ doc, vector, norm }) => {
      let dotProduct = 0;
      for (const [term, qVal] of queryVector.entries()) {
        if (vector.has(term)) {
          dotProduct += qVal * vector.get(term);
        }
      }

      let similarityScore = norm > 0 && queryNorm > 0 ? dotProduct / (norm * queryNorm) : 0;

      // Metadata exact match boosting
      const m = doc.metadata;
      if (filter.room && m.room && m.room.toLowerCase() === filter.room.toLowerCase()) {
        similarityScore += 0.5;
      }
      if (filter.direction && m.direction && m.direction.toLowerCase() === filter.direction.toLowerCase()) {
        similarityScore += 0.5;
      }

      return { doc, score: similarityScore };
    });

    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, k).map((item) => item.doc);
  }
}

class VastuKnowledgeStore {
  constructor() {
    this.vectorStore = null;
    this.documents = [];
    this.isInitialized = false;
  }

  /**
   * Initializes the Vector Store with the Vastu Knowledge Base JSON dataset
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      const dataPath = path.join(__dirname, "../data/vastuKnowledgeBase.json");
      if (!fs.existsSync(dataPath)) {
        logger.warn("Vastu Knowledge base JSON not found at path:", dataPath);
        return;
      }

      const rawData = fs.readFileSync(dataPath, "utf-8");
      const knowledgeItems = JSON.parse(rawData);

      // Map raw items into LangChain Document instances with full metadata
      this.documents = knowledgeItems.map((item) => {
        const pageContent = `Title: ${item.title}\nCategory: ${item.category}\nRoom: ${item.room}\nDirection: ${item.direction}\nRemedy Type: ${item.remedyType}\nProperty Type: ${item.propertyType}\nOwnership: ${item.ownership}\nSource: ${item.source} (${item.sourceReference})\nContent: ${item.content}`;

        return new Document({
          pageContent,
          metadata: {
            id: item.id,
            source: item.source,
            title: item.title,
            category: item.category,
            room: item.room,
            direction: item.direction,
            remedyType: item.remedyType,
            propertyType: item.propertyType,
            ownership: item.ownership,
            sourceReference: item.sourceReference,
          },
        });
      });

      // Build Vector Store Index
      this.vectorStore = new TfIdfVectorStore(this.documents);
      logger.info(`✅ Vastu Vector Store initialized with ${this.documents.length} LangChain documents.`);
      this.isInitialized = true;
    } catch (error) {
      logger.error("Failed to initialize Vastu Knowledge Store:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Search for top-K relevant knowledge chunks based on query & room/direction filters
   * @param {string} query - Search query
   * @param {Object} filter - Optional attributes (room, direction, ownership)
   * @param {number} topK - Number of top documents to return
   * @returns {Promise<Array<Document>>}
   */
  async search(query, filter = {}, topK = 4) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.vectorStore) {
      return this.documents.slice(0, topK);
    }

    return this.vectorStore.similaritySearch(query, topK, filter);
  }
}

// Singleton instance export
const knowledgeStore = new VastuKnowledgeStore();
module.exports = knowledgeStore;
