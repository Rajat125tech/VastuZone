# 🏠 VastuZone: Smart Vastu Consultation & Engineering Platform

[![Full Stack](https://img.shields.io/badge/Stack-MERN--Firebase-blue.svg)](#-core-technologies)
[![System Architecture](https://img.shields.io/badge/Architecture-Event--Driven-orange.svg)](#-technical-architecture)
[![Auth](https://img.shields.io/badge/Auth-Firebase--Hybrid-yellow.svg)](#-security--authentication)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

**VastuZone** is a high-performance, full-stack digital ecosystem designed to bridge traditional Vastu Shastra principles with modern software engineering. It features a deterministic evaluation engine, real-time bi-directional communication, and a secure, transaction-safe consultation workflow.

---

## 🚀 Core Features

### 👤 For Users
- **🏘️ Intelligent Property Analysis:** Add property details and upload floor plans (PDF) for instant Vastu evaluation.
- **📊 Automated Scoring:** Receive immediate compliance scores and localized remedial suggestions.
- **💬 Real-time Expert Chat:** Direct, low-latency communication with Vastu consultants.
- **📅 Appointment Lifecycle:** Book sessions, track status, and manage payments in one interface.
- **🎥 Virtual Consultations:** Seamless integration with Google Meet for paid consultation sessions.

### 🧑‍💼 For Experts
- **🧾 Consultation Dashboard:** Centralized view of all upcoming and past appointments.
- **🔗 Meeting Management:** Dynamically attach and update meeting links for user sessions.
- **✅ Transaction Validation:** Mark appointments as paid or completed to trigger automated workflows.

---

## 🏗️ Technical Architecture & Implementation

### 1. Hybrid Authentication & Identity Management
The platform employs a sophisticated hybrid auth strategy to ensure security and data consistency:
- **Identity Provider:** Firebase Authentication manages secure sign-in, session persistence, and token issuance.
- **State Synchronization:** A custom React `ProtectedRoute` utilizes the `onAuthStateChanged` observer pattern to synchronize client-side auth state with backend expectations, preventing UI flickering and unauthorized access.
- **Data Enrichment:** A specialized MongoDB `User` model extends Firebase identities with application-specific metadata and role-based access control (RBAC).

### 2. Real-time Event-Driven Communication
Leveraging **Socket.io**, VastuZone implements a high-availability communication layer:
- **Room-based Isolation:** Consultations are partitioned into isolated socket rooms, ensuring message privacy and efficient broadcast narrowcasting.
- **Stateful Connections:** The backend dynamically maps Socket IDs to authenticated Firebase UIDs, enabling precise targeted event delivery.

### 3. Automated Vastu Inference Engine
The core logic is a deterministic, rule-based engine that processes spatial data through a weighted scoring algorithm:
- **Cardinal Analysis:** Evaluates property facing and entrance directions.
- **Spatial Mapping:** Checks the placement of Kitchen (SE), Master Bedroom (SW), Pooja Room (NE), and other rooms.
- **Geometric Evaluation:** Rewards regular shapes (Square/Rectangle) and identifies energy flow disturbances in irregular plots.

---

## 🛠️ Tech Stack & Engineering Details

### Backend (Node.js/Express/MongoDB)
- **RBAC Middleware:** Custom logic (`requireExpert`) validates requests by intercepting headers and cross-referencing Firebase UIDs against MongoDB role attributes.
- **Asset Pipeline:** Integrated **Cloudinary** via **Multer-Storage-Cloudinary**, specifically configured for `raw` resource handling to support secure PDF floor plan uploads with a 10MB buffer.
- **Payment Processing:** Server-side **Razorpay** integration with signature verification ensures idempotent and secure transaction cycles.

### Frontend (React/TypeScript/Query)
- **Server State Management:** Utilizes **React Query (@tanstack/react-query)** for efficient caching, background revalidation, and optimistic UI updates.
- **API Strategy:** A custom `authFetch` wrapper abstracts the injection of Firebase authentication headers into standard `fetch` calls, ensuring consistent security across all network requests.
- **Data Visualization:** Integrated **Chart.js** for visual representation of Vastu compliance metrics.

---

## 🧠 Vastu Evaluation Logic Overview

| Factor | Ideal Placement | Compliance Impact |
| :--- | :--- | :--- |
| **Main Entrance** | North, East | High Bonus |
| **Kitchen** | South-East | Vital for "Agni" (Fire) |
| **Master Bedroom**| South-West | Essential for Stability |
| **Pooja Room** | North-East | Spiritual Energy Hub |
| **Property Shape** | Square/Rectangle | Flow Consistency |

### Score Classification
- 🟢 **80+:** Excellent Compliance
- 🟡 **60-79:** Good (Minor Corrections Recommended)
- 🔴 **<60:** Needs Vastu Remedies

---

## 📁 System Design

```text
VastuZone/
├── vastuzone-backend/
│   ├── middleware/        # RBAC & Multer-Cloudinary pipeline
│   ├── utils/             # Deterministic Vastu logic & Razorpay helpers
│   ├── config/            # DB Cluster & Cloudinary SDK setup
│   └── models/            # Mongoose ODM schemas (User, Property, Appointment)
└── vastuzone-frontend/
    ├── src/
    │   ├── utils/         # Auth synchronization & authFetch wrapper
    │   ├── ProtectedRoute # Auth Guarding HOC
    │   ├── pages/         # Dashboard, ExpertChat, ViewReports
    │   └── firebase.js    # Firebase SDK initialization
```

---

## 📸 Screenshots

| User Dashboard | Automated Report | Real-time Chat |
| :---: | :---: | :---: |
| ![Dashboard](screenshots/dashboard.png) | ![Reports](screenshots/reports.png) | ![Chat](screenshots/chatbox.png) |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone and Install
```bash
git clone https://github.com/Rajat125tech/VastuZone.git
cd VastuZone
```

### 2️⃣ Backend Configuration
`vastuzone-backend/.env`:
```env
PORT=5001
MONGO_URI=your_mongodb_uri
FIREBASE_PROJECT_ID=your_id
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
CLOUDINARY_NAME=your_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
```
```bash
cd vastuzone-backend && npm install && npm run dev
```

### 3️⃣ Frontend Configuration
`vastuzone-frontend/.env`:
```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_id
```
```bash
cd vastuzone-frontend && npm install && npm start
```

---

## 👨‍💻 Author

**Rajat Srivastava**  
*Full-Stack Engineer | AI/ML Student @ VIT Vellore*  
📍 Vellore, India  
[GitHub](https://github.com/Rajat125tech)

---

## 📜 License
This project is licensed under the **ISC License**.
