const admin = require("../config/firebaseAdmin");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = decodedToken; // contains uid, email, etc.
    next();
  } catch (error) {
    console.error("Firebase auth error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = verifyToken;
