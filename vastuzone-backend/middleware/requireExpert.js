const User = require("../models/User");

const requireExpert = async (req, res, next) => {
  try {
    const firebaseUid = req.headers["x-user-uid"];

    if (!firebaseUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUid });

    if (!user || user.role !== "expert") {
      return res.status(403).json({ message: "Expert access only" });
    }

    req.expert = user;
    next();
  } catch (error) {
    console.error("Expert auth error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = requireExpert;
