const { GoogleGenerativeAI } = require("@google/generative-ai");
const knowledgeStore = require("./ragKnowledgeStore");
const logger = require("../utils/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generates grounded Vastu recommendations using RAG over canonical knowledge chunks
 * @param {Object} propertyData - Property details (facing, entrance, directions, notes, etc.)
 * @param {Object} evaluatedReport - Output from deterministic evaluateVastu()
 * @returns {Promise<Object>} Grounded recommendations & source citations
 */
async function generateGroundedRecommendations(propertyData, evaluatedReport) {
  const defaultFallback = createFallbackResponse(propertyData, evaluatedReport);

  try {
    // 1. Initialize Knowledge Base if needed
    await knowledgeStore.initialize();

    // 2. Identify rooms and issues to build target queries
    const roomsToCheck = [
      { name: "Kitchen", direction: propertyData.kitchenDirection },
      { name: "Master Bedroom", direction: propertyData.masterBedroomDirection },
      { name: "Kids Bedroom", direction: propertyData.kidsBedroomDirection },
      { name: "Bathroom", direction: propertyData.bathroomDirection },
      { name: "Pooja Room", direction: propertyData.poojaRoomDirection },
      { name: "Living Room", direction: propertyData.livingRoomDirection },
      { name: "Main Entrance", direction: propertyData.entrance },
    ];

    let retrievedDocs = [];
    const seenDocIds = new Set();

    // 3. Perform Retrieval for each layout component & warning
    for (const item of roomsToCheck) {
      if (!item.direction) continue;
      const queryStr = `${item.name} in ${item.direction} non-structural remedies Vastu Shastra`;
      const docs = await knowledgeStore.search(queryStr, { room: item.name, direction: item.direction }, 2);

      for (const doc of docs) {
        if (!seenDocIds.has(doc.metadata.id)) {
          seenDocIds.add(doc.metadata.id);
          retrievedDocs.push(doc);
        }
      }
    }

    // Also search based on warnings
    if (evaluatedReport.roomWarnings && evaluatedReport.roomWarnings.length > 0) {
      for (const warning of evaluatedReport.roomWarnings) {
        const docs = await knowledgeStore.search(warning, {}, 2);
        for (const doc of docs) {
          if (!seenDocIds.has(doc.metadata.id)) {
            seenDocIds.add(doc.metadata.id);
            retrievedDocs.push(doc);
          }
        }
      }
    }

    if (retrievedDocs.length === 0) {
      logger.warn("No RAG knowledge documents retrieved. Using deterministic fallback.");
      return defaultFallback;
    }

    // 4. Format context text & sources list
    const contextText = retrievedDocs
      .map((doc, idx) => `[Source ${idx + 1}]: ${doc.metadata.title} (${doc.metadata.sourceReference})\nContent: ${doc.pageContent}`)
      .join("\n\n");

    const availableSources = retrievedDocs.map((doc) => ({
      title: doc.metadata.title,
      reference: doc.metadata.sourceReference,
    }));

    // 5. If no GEMINI_API_KEY is present, return structured RAG recommendations using retrieved doc templates directly
    if (!process.env.GEMINI_API_KEY) {
      logger.info("GEMINI_API_KEY missing. Constructing direct RAG recommendations from retrieved context.");
      return formatDirectRAGResponse(retrievedDocs, evaluatedReport);
    }

    // 6. Query Gemini LLM with Strict Grounding System Instructions
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for high factual adherence
      },
    });

    const prompt = `
You are a professional Vastu Shastra Advisor.
Your task is to provide grounded, non-structural Vastu recommendations based STRICTLY on the retrieved knowledge context provided below.

==================================================
GROUNDING RULES (STRICT COMPLIANCE REQUIRED):
1. Rely PRIMARY on the retrieved knowledge chunks provided under "RETRIEVED KNOWLEDGE CONTEXT".
2. Do NOT invent unsupported Vastu rules or fictitious texts.
3. If retrieved evidence does not cover a specific issue, explicitly state: "Insufficient retrieved context for specific non-structural remedy."
4. Tailor recommendations to property constraints (e.g., non-demolition remedies suitable for apartments/rented spaces).
5. For EVERY recommendation, cite the exact source title and reference from the provided sources.
6. Do NOT recommend structural wall demolitions. Focus on non-structural remedies (color balance, elemental shifts, crystals, plants, salt placement).
==================================================

PROPERTY DETAILS:
- Property Name: ${propertyData.propertyName || "N/A"}
- Type: ${propertyData.propertyType || "Apartment"}
- Facing: ${propertyData.facing || "N/A"}
- Main Entrance: ${propertyData.entrance || "N/A"}
- Kitchen Direction: ${propertyData.kitchenDirection || "N/A"}
- Master Bedroom Direction: ${propertyData.masterBedroomDirection || "N/A"}
- Bathroom Direction: ${propertyData.bathroomDirection || "N/A"}
- Pooja Room Direction: ${propertyData.poojaRoomDirection || "N/A"}
- User Notes: ${propertyData.notes || "None"}

DETECTED OBSERVATIONS & WARNINGS:
${evaluatedReport.roomWarnings ? evaluatedReport.roomWarnings.join("\n") : "None"}

RETRIEVED KNOWLEDGE CONTEXT:
${contextText}

OUTPUT SCHEMA REQUIRED (JSON):
{
  "groundedRecommendations": [
    {
      "issue": "Specific room/direction observation or Vastu defect",
      "recommendation": "Actionable non-structural remedy",
      "reasoning": "Elemental or directional explanation derived from retrieved knowledge",
      "remedyType": "NON_STRUCTURAL",
      "sources": [
        {
          "title": "Exact Title from Source",
          "reference": "Exact Reference from Source"
        }
      ]
    }
  ],
  "summaryNote": "Brief grounded summary of overall audit findings"
}
`;

    const generatePromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Gemini API call timed out after 15000ms")), 15000)
    );

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    logger.info("✅ Grounded RAG recommendations successfully generated by Gemini.");
    return {
      groundedRecommendations: parsedData.groundedRecommendations || [],
      summaryNote: parsedData.summaryNote || "Grounded analysis synthesized using Vastu Shastra literature.",
      knowledgeSources: availableSources,
    };
  } catch (error) {
    logger.warn(`LLM Grounded synthesis failed (${error.message}). Falling back to direct RAG retrieved knowledge format.`);
    if (typeof retrievedDocs !== "undefined" && retrievedDocs && retrievedDocs.length > 0) {
      return formatDirectRAGResponse(retrievedDocs, evaluatedReport);
    }
    return defaultFallback;
  }
}

/**
 * Direct RAG formatter without LLM (used when API key is unconfigured or offline)
 */
function formatDirectRAGResponse(retrievedDocs, evaluatedReport) {
  const recommendations = retrievedDocs.map((doc) => ({
    issue: `${doc.metadata.room} in ${doc.metadata.direction}`,
    recommendation: doc.metadata.content,
    reasoning: `Based on canonical guidance from ${doc.metadata.sourceReference}`,
    remedyType: doc.metadata.remedyType || "NON_STRUCTURAL",
    sources: [
      {
        title: doc.metadata.title,
        reference: doc.metadata.sourceReference,
      },
    ],
  }));

  const knowledgeSources = retrievedDocs.map((doc) => ({
    title: doc.metadata.title,
    reference: doc.metadata.sourceReference,
  }));

  return {
    groundedRecommendations: recommendations,
    summaryNote: "Grounded remedies retrieved directly from canonical Vastu Knowledge Base.",
    knowledgeSources,
  };
}

/**
 * Deterministic fallback response generator
 */
function createFallbackResponse(propertyData, evaluatedReport) {
  const fallbackRecs = (evaluatedReport.roomWarnings || []).map((warning) => ({
    issue: warning,
    recommendation: "Apply non-structural balance: keep area clean, well-lit, and use appropriate elemental colors.",
    reasoning: "Deterministic rule check based on standard spatial orientation matrix.",
    remedyType: "NON_STRUCTURAL",
    sources: [
      {
        title: "Deterministic Vastu Evaluator",
        reference: "vastuEvaluator.js",
      },
    ],
  }));

  return {
    groundedRecommendations: fallbackRecs,
    summaryNote: "Fallback recommendations generated by deterministic engine.",
    knowledgeSources: [
      {
        title: "Deterministic Vastu Evaluator",
        reference: "vastuEvaluator.js",
      },
    ],
  };
}

module.exports = { generateGroundedRecommendations };
