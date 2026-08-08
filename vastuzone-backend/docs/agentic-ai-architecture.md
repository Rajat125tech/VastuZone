# 📐 VastuZone Agentic AI Technical Architecture Document

This document provides a comprehensive technical breakdown of the Agentic AI architecture integrated into **VastuZone**.

---

## 1. RATIONALE & SYSTEM PHILOSOPHY

VastuZone avoids generic chatbot wrappers by separating deterministic domain math, vector-based knowledge grounding, and stateful multi-step vision validation:

1. **Why RAG Exists**: Generative LLMs hallucinate non-traditional or contradictory Vastu remedies. RAG anchors recommendation generation to a verified vector dataset of traditional texts (`vastuKnowledgeBase.json`).
2. **Why LangChain Exists**: Provides standardized abstractions for Document modeling, vector store indexing, prompt templating, and model chaining.
3. **Why LangGraph Exists**: Single-shot LLM vision extraction fails on low-quality, rotated, or ambiguous floor plans. LangGraph enables stateful loops, conditional validation edges, refinement retries, and human interruption gates.
4. **Why Deterministic Evaluation Remains Separate**: Numerical Vastu scoring ($0-100$) relies on strict mathematical cardinal weights (`vastuEvaluator.js`). Keeping this deterministic ensures reproducible scoring that LLMs cannot arbitrarily drift.
5. **Why Human-in-the-Loop is Necessary**: High-risk structural Vastu recommendations require human expert verification prior to client report publication.

---

## 2. LANGGRAPH STATE MACHINE ARCHITECTURE

```
                            START (PDF Upload)
                                    │
                                    v
                           ImagePreparationNode
                                    │
                                    v
                        VisionExtractionNode <───┐
                                    │            │ Reanalysis
                                    v            │ (Target == "vision")
                        SpatialValidationNode    │
                                    │            │
                     ┌──────────────┴──────────┐ │
                     │  Spatial Validation OK? │ │
                     └──────────────┬──────────┘ │
                        NO /        │ YES        │
                     Retries < 2    v            │
                        │   DeterministicNode    │
                        v           │            │
                 RefinementNode     v            │
                                 RAGNode         │
                                    │            │
                                    v            │
                            expertReviewNode ────┘
                             (Pause Gate)
                                    │ (Resume)
                                    v
                             FinalReportNode
                                    │
                                    v
                                   END
```

---

## 3. STATE ANNOTATION SCHEMA (`VastuGraphAnnotation`)

```typescript
interface VastuAgentState {
  propertyId: string;
  userId: string;
  pdfBuffer: Buffer | null;
  fileName: string;
  propertyMetadata: Object;

  // Vision Extraction
  pageImageBase64: string | null;
  extractedDirections: Record<string, string> | null;

  // Validation & Retries
  isValid: boolean;
  validationErrors: string[];
  retryCount: number;
  refinementPrompt: string | null;
  isFallback: boolean;

  // Deterministic Math
  deterministicScore: number;
  scoreBand: string;
  vastuTips: string[];
  roomWarnings: string[];

  // Phase 1 RAG
  groundedRecommendations: Array<Object>;
  summaryNote: string;
  knowledgeSources: Array<Object>;

  // Phase 3 HITL Audit State
  reviewStatus: "pending" | "reviewed" | "APPROVED" | "EDITED" | "REANALYSIS_REQUESTED";
  expertId: string | null;
  expertDecision: "APPROVE" | "EDIT" | "REQUEST_REANALYSIS" | null;
  expertNotes: string | null;
  aiRecommendations: Array<Object>;       // Original AI output
  expertModifications: Array<Object> | null; // Expert edits if modified
  finalRecommendations: Array<Object>;    // Final published output
  reviewTimestamp: string | null;

  savedProperty: Object | null;
  executionStatus: string;
}
```

---

## 4. WORKFLOW EXECUTION DETAILS

### A. Spatial Validation & Refinement Loop
* `SpatialValidationNode` checks directions against the 8 valid cardinal/intercardinal list (`North`, `South`, `East`, `West`, `North-East`, `North-West`, `South-East`, `South-West`), verifies critical rooms (Kitchen & Master Bedroom), and detects quadrant contradictions.
* If invalid and `retryCount < 2`, `routeAfterValidation` triggers `RefinementNode`.
* If retries are exhausted ($retryCount \ge 2$), execution routes to `ManualInputFallbackNode`, loading user inputs to guarantee zero crash rate.

### B. Phase 1 Grounded RAG Retrieval
* `RAGRecommendationNode` invokes `ragKnowledgeStore.search(query)` via TF-IDF cosine similarity across traditional Vastu texts.
* Gemini 2.5 Flash formats remedies with strict JSON schema constraints and canonical citation citations (`title`, `reference`).

### C. Human-in-the-Loop Interruption & Resumption
* `expertReviewNode` calls `@langchain/langgraph` `interrupt()`, setting `reviewStatus: "pending"`, `executionStatus: "WAITING_FOR_EXPERT"`, and emitting Socket.io event `"expertReviewRequired"`.
* When an expert submits an action via `/api/expert/reviews/:id/*`, `resumeVastuAgentGraph(id, payload)` invokes `new Command({ resume: payload })`.
* `routeAfterExpertReview` checks `expertDecision`:
  * `APPROVE` or `EDIT` $\rightarrow$ Proceeds to `FinalReportNode` $\rightarrow$ Generates PDF.
  * `REQUEST_REANALYSIS` $\rightarrow$ Routes back to `visionExtractionNode` or `ragRecommendationNode`.

---

## 5. PERSISTENCE & PROCESS RESTART SAFETY

* **RAM Checkpointer**: Uses LangGraph `MemorySaver` keyed by `thread_id: propertyId`.
* **Process-Restart Recovery**: State snapshots are persisted in MongoDB `Property.graphState`. If the Node.js server restarts while an expert review is pending, `resumeVastuAgentGraph` reads the snapshot from MongoDB, re-hydrates the state, and completes execution without data loss.
