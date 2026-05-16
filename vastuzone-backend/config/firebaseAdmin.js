const admin = require("firebase-admin");

if (!admin.apps.length) {
  // Try to initialize using application default credentials, or env vars
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
    // Depending on deployment, you might need admin.credential.cert(...)
    // Ensure you handle secrets securely.
  });
}

module.exports = admin;
