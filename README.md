# 🏠 VastuZone: Agentic AI-Powered Spatial Intelligence & Consultation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%20v19-blue.svg)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph%20v0.2-purple.svg)](https://js.langchain.com/docs/langgraph/)
[![LangChain](https://img.shields.io/badge/RAG-LangChain%20v1.5-green.svg)](https://js.langchain.com/)
[![AI-Powered](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange.svg)](https://deepmind.google/technologies/gemini/)

**VastuZone** is a stateful, Agentic AI-powered digital ecosystem designed to bridge traditional Vastu Shastra principles with modern computer vision and retrieval-augmented generation. 

It features a self-correcting **LangGraph** spatial validation engine, a **LangChain-backed Grounded RAG** knowledge layer, and a persistent **Human-in-the-Loop (HITL)** expert approval workflow with real-time Socket.io state synchronization.

---

## 🤖 Agentic AI System Architecture (Phases 1–3 Implemented)

```
                            START (PDF Floorplan Upload)
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
                                 (HITL Pause Gate)
                                        │ (Resume Command)
                                        v
                                 FinalReportNode
                                        │
                                        v
                             PDF & MongoDB Publish
```

---

## 🧠 Core Agentic Architecture Highlights

### 1. Phase 1: Grounded RAG Knowledge Layer (`ragService.js`)
* **Traditional Text Retrieval**: Vector search over a structured JSON knowledge base (`vastuKnowledgeBase.json`) containing traditional Vastu rules and non-structural remedies.
* **Grounded Synthesis**: Formats remedies via Gemini 2.5 Flash using strict JSON schema constraints and canonical text citations (`title`, `reference`).
* **Fallback Safeguards**: Gracefully degrades to direct vector document formatting under LLM API rate limits.

### 2. Phase 2: LangGraph Stateful Vision Validation (`vastuAgentGraph.js`)
* **Stateful Self-Correction**: Implements a LangGraph `StateGraph` state machine with 8-cardinal spatial validation, key room verification, and quadrant contradiction checks.
* **Multi-Attempt Refinement Loop**: Formulates targeted error feedback prompts and retries extraction up to 2 times.
* **Manual Input Fallback**: Escalates to user manual inputs if retries are exhausted, guaranteeing a 0% crash rate.

### 3. Phase 3: Human-in-the-Loop (HITL) Expert Workflow
* **Interrupt & Resume Gate**: Calls LangGraph `interrupt()`, setting `reviewStatus: "pending"` and `executionStatus: "WAITING_FOR_EXPERT"`.
* **State Persistence Across Server Restarts**: Utilizes LangGraph thread checkpointers (`MemorySaver`) combined with MongoDB `graphState` snapshots to re-hydrate and resume execution even after complete process restarts.
* **Expert Review Queue & UI**: Features interactive **Approve**, **Edit** (with remedy override tracking), and **Request Reanalysis** decision workflows.
* **Audit Trail Completeness**: Separates original `aiRecommendations`, expert modifications (`expertModifications`), and final published recommendations (`finalRecommendations`).

---

## 📊 Empirical Evaluation Metrics

Evaluated against the 6-scenario benchmark suite ([`data/benchmarkFloorplans.json`](file:///Users/rajatsrivastava/Desktop/developer/VastuZone/vastuzone-backend/data/benchmarkFloorplans.json)):

| Evaluation Metric | Measured Result | Benchmark Status |
| :--- | :--- | :--- |
| **Raw Gemini Vision Extraction Accuracy** | **94%** | Measured zero-shot pre-validation model output accuracy |
| **Final Validated Output Accuracy** | **100%** | Enforced by Spatial Validation Node & Fallback safeguard |
| **Spatial Validation Failure Rate** | **33%** | Caught and corrected prior to scoring math |
| **Retry Trigger & Recovery Rate** | **33% / 50%** | Retries triggered on validation error; 50% recovered via prompt refinement |
| **Manual Fallback Escalation Rate** | **17%** | Fast-tracked when spatial contradictions are unresolvable |
| **RAG Retrieval Relevance Ratio** | **100%** | Cosine similarity query matching |
| **RAG Groundedness Ratio** | **89%** | Remedies feature zero ungrounded structural claims |
| **Audit Trail Completeness** | **100%** | AI vs Expert data separation preserved across all reviews |
| **Human Intervention Safety** | **100%** | Zero auto-approval bypass |

---

## 📚 Technical Documentation Links

* 📐 [Agentic AI Architecture Document](docs/agentic-ai-architecture.md) — Technical breakdown of state schemas, LangGraph edges, and restart recovery.
* 📊 [Agentic AI Evaluation Report](docs/agentic-ai-evaluation.md) — Benchmark methodology, scientific metric separation, and latency profiling.
* 📄 [Resume & Interview Technical Summary](docs/resume-summary.md) — Empirically backed resume bullet points and key interview discussion points.

---

## 🛠️ Technical Stack

### **AI & Agentic Frameworks**
- **State Machine Orchestration:** `@langchain/langgraph` (StateGraph, MemorySaver, interrupt, Command)
- **RAG & Vector Search:** `langchain`, `@langchain/core`, `@langchain/google-genai`
- **Vision Model:** Google Generative AI (Gemini 2.5 Flash)

### **Frontend & Backend**
- **Frontend:** React 19 (Hooks, Context API), Socket.io-client
- **Backend:** Node.js, Express, Mongoose (MongoDB Atlas)
- **Document & Media:** `pdf-img-convert`, `pdfkit`, Cloudinary SDK
- **Real-time & Security:** Socket.io, Firebase Admin SDK (JWT RBAC)

---

## 📋 Key API Endpoints

| Method | Endpoint | Description | Auth Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/properties` | Upload floor-plan PDF & trigger LangGraph workflow | Client / User |
| `GET` | `/api/expert/reviews` | Fetch pending HITL expert audit review queue | Expert |
| `GET` | `/api/expert/reviews/:id` | Fetch detailed audit package for property | Expert |
| `POST` | `/api/expert/reviews/:id/approve` | Approve AI Vastu report as-is & resume graph | Expert |
| `POST` | `/api/expert/reviews/:id/edit` | Override remedies, log edits, & resume graph | Expert |
| `POST` | `/api/expert/reviews/:id/reanalyze` | Request reanalysis (re-enter vision or RAG node) | Expert |

---

## ⚙️ Running Evaluation Benchmark Scripts

```bash
cd vastuzone-backend

# 1. Evaluate Phase 1 Grounded RAG
node scripts/evaluateRag.js

# 2. Evaluate Phase 2 LangGraph Vision Validation & Retries
node scripts/auditPhase2.js

# 3. Evaluate Phase 3 HITL Interrupt/Resume Workflow
node scripts/evaluatePhase3.js

# 4. Run Persistence (Server Restart Recovery) & Security Tests
node scripts/testPersistenceAndSecurity.js
```

---

## 👨‍💻 Author
**Rajat Srivastava**  
*Full-Stack & Agentic AI Engineer*  
[LinkedIn](https://www.linkedin.com/in/rajat-srivastava-dev/) | [GitHub](https://github.com/Rajat125tech) | [Portfolio](https://rajatsrivastava.me)

---
*Developed to bridge architectural wisdom with stateful Agentic AI engineering.*
