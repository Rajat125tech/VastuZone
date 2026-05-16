const User = require("../models/User");
const admin = require("../config/firebaseAdmin");

const requireExpert = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const user = await User.findOne({ firebaseUid });

    if (!user || user.role !== "expert") {
      return res.status(403).json({ message: "Expert access only" });
    }

    req.expert = user;
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Expert auth error:", error);
    res.status(401).json({ message: "Unauthorized - Invalid token or Server error" });
  }
};

module.exports = requireExpert;
