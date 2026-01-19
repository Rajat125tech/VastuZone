🏠 VastuZone – Smart Vastu Consultation Platform

VastuZone is a full-stack web application that enables users to analyze property Vastu compliance, book expert consultations, and make secure payments — all in one seamless platform.

The system combines rule-based Vastu logic, real-time chat, appointment scheduling, and payment gateway integration to deliver a complete digital consultation experience.

🚀 Live Features
👤 User Features

🔐 Secure authentication using Firebase Authentication

🏘 Add property details with floor plan upload

📊 Automated Vastu score & recommendations

📁 View detailed Vastu reports

💬 Chat with Vastu experts

📅 Book consultation appointments

💳 Pay securely using Razorpay

🎥 Join Google Meet consultations after payment

🧑‍💼 Expert Features

🧾 View upcoming appointments

🔗 Add Google Meet links

💬 Chat with users

✅ Mark appointments as paid / completed

🧠 Vastu Evaluation Logic

The application evaluates Vastu compliance using rule-based scoring considering:

Property shape & facing direction

Main entrance direction

Living room, kitchen, bathroom, bedrooms, pooja room placement

Weighted deductions and bonuses

Final score classification:

Excellent

Good (Minor Corrections)

Needs Vastu Remedies

🛠 Tech Stack
Frontend

React.js

React Router

Firebase Authentication

CSS (custom styling)

Backend

Node.js

Express.js

MongoDB + Mongoose

Firebase Admin SDK

Razorpay Payment Gateway

📁 Project Structure
VastuZone/
│
├── vastuzone-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── firebase.js
│   └── package.json
│
├── vastuzone-backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
├── .gitignore
└── README.md

🔐 Environment Variables

Create a .env file in both frontend and backend.

Frontend (.env)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=

Backend (.env)
MONGO_URI=
FIREBASE_PROJECT_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=


⚠️ Never commit .env files to GitHub

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/VastuZone.git
cd VastuZone

2️⃣ Backend Setup
cd vastuzone-backend
npm install
npm run dev

3️⃣ Frontend Setup
cd vastuzone-frontend
npm install
npm start

💳 Payment Integration

Integrated using Razorpay

Secure order creation & signature verification

Payment status updates appointment automatically

🔒 Security Measures

Environment variables for all secrets

Firebase token-based authentication

Protected backend routes

GitHub push protection handled correctly

📌 Future Enhancements

📱 Mobile responsive UI

📊 Admin analytics dashboard

🤖 AI-based Vastu suggestions

📄 Downloadable PDF reports

🌍 Multi-language support

👨‍💻 Author

Rajat Srivastava
🎓 AI/ML Student | Full-Stack Developer
📍 VIT Vellore
