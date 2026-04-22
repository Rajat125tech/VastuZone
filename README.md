# 🏠 VastuZone: A High-Performance Full-Stack Vastu Consultation Ecosystem

[![System Architecture](https://img.shields.io/badge/Architecture-Event--Driven-orange.svg)](#-technical-architecture)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN--Firebase-blue.svg)](#-core-technologies)
[![Auth](https://img.shields.io/badge/Auth-Firebase--Hybrid-yellow.svg)](#-security--authentication)

VastuZone is a production-grade digital platform that synchronizes traditional Vastu Shastra principles with modern full-stack engineering. It features a deterministic evaluation engine, real-time bi-directional communication, and a secure, transaction-safe consultation workflow.

---

## 🏗️ Technical Architecture

### 1. Hybrid Authentication & Identity Management
VastuZone employs a sophisticated hybrid auth strategy:
- **Identity Provider:** Firebase Authentication manages secure sign-in, session persistence, and token issuance.
- **State Synchronization:** A custom React `ProtectedRoute` utilizes the `onAuthStateChanged` observer pattern to synchronize client-side auth state with backend expectations, preventing UI flickering and unauthorized access.
- **Data Enrichment:** A specialized MongoDB `User` model extends Firebase identities with application-specific metadata, roles (User/Expert), and consultation history.

### 2. Real-time Event-Driven Communication
Leveraging **Socket.io**, the platform implements a low-latency communication layer:
- **Room-based Isolation:** Consultations are partitioned into isolated socket rooms, ensuring message privacy and efficient broadcast narrowcasting.
- **Stateful Connections:** The backend dynamically maps Socket IDs to authenticated Firebase UIDs, enabling precise targeted event delivery.

### 3. Automated Vastu Evaluation Engine
The core logic is a deterministic, rule-based inference engine that:
- Processes multi-dimensional spatial data (cardinal directions, room shapes, functional placements).
- Executes weighted scoring algorithms to calculate compliance indices.
- Generates context-aware remedial suggestions and spatial warnings.

---

## 🛠️ Core Technologies & Implementation Details

### Backend (Node.js/Express/MongoDB)
- **Role-Based Access Control (RBAC):** Custom middleware (`requireExpert`) validates requests by intercepting headers and cross-referencing Firebase UIDs against MongoDB role attributes.
- **Asset Pipeline:** Integrated **Cloudinary** via **Multer-Storage-Cloudinary**. Configured for `raw` resource handling to support secure PDF floor plan uploads with a 10MB buffer limit.
- **Data Modeling:** Complex Mongoose schemas with nested sub-documents (e.g., `messages` within `Property`) and strict type validation.
- **Payment Processing:** Server-side **Razorpay** integration with signature verification ensures idempotent and secure transaction cycles.

### Frontend (React/TypeScript/Query)
- **Server State Management:** Utilizes **React Query (@tanstack/react-query)** for efficient caching, background revalidation, and optimistic UI updates.
- **Component Architecture:** A modular, component-based UI leveraging **Lucide React** for consistent iconography and **Sonner** for non-blocking notification management.
- **API Strategy:** A custom `authFetch` wrapper abstracts the injection of Firebase authentication headers into standard `fetch` calls, ensuring consistent security across all network requests.

---

## 📁 System Design

```text
VastuZone/
├── vastuzone-backend/
│   ├── middleware/        # RBAC & Multer-Cloudinary pipeline
│   ├── utils/             # Deterministic Vastu logic & Payment helpers
│   ├── config/            # DB Cluster & Cloudinary SDK setup
│   └── models/            # Mongoose ODM schemas
└── vastuzone-frontend/
    ├── src/
    │   ├── utils/         # Auth synchronization & API wrappers
    │   ├── ProtectedRoute # Higher-Order Component for Auth Guarding
    │   └── firebase.js    # Firebase SDK initialization
```

---

## 🔒 Security & Data Integrity

- **Environment Isolation:** Strict use of `.env` configurations for API secrets, connection strings, and service keys.
- **Network Security:** Configured CORS (Cross-Origin Resource Sharing) policies to whitelist specific production and development origins.
- **Persistence:** Auth persistence is locked to `browserSessionPersistence` for enhanced security in shared environments.

---

## ⚙️ Engineering Setup

### Environment Requirements
- **Node.js** v18+
- **MongoDB** Atlas Cluster
- **Firebase** Project with Auth enabled
- **Razorpay & Cloudinary** API Credentials

### Installation Lifecycle
1. **Initialize Cluster:** Configure MongoDB and update `MONGO_URI`.
2. **Backend Deployment:**
   ```bash
   cd vastuzone-backend && npm install && npm run dev
   ```
3. **Frontend Deployment:**
   ```bash
   cd vastuzone-frontend && npm install && npm start
   ```

---

## 👨‍💻 Engineering Lead

**Rajat Srivastava**  
*Full-Stack Engineer | AI/ML Specialist*  
📍 VIT Vellore  
[GitHub](https://github.com/Rajat125tech) | [Portfolio](https://yourportfolio.com)

---

## 📜 License
Licensed under the **ISC License** – designed for open innovation.
