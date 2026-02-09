const express = require("express");
const User = require("../models/User");

const router = express.Router();
router.post("/create", async (req, res) => {
  try {
    const { firebaseUid, email, name } = req.body;

    if (!firebaseUid || !email || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        name,
        role: "user",
      });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(" User creation failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      firebaseUid: user.firebaseUid,
      name: user.name,        
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(" Fetch user failed", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/sync", async (req, res) => {
  try {
    const { uid, name, email } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: "Missing uid or email" });
    }

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        name: name || "User",
        email,
      });
    }

    res.json(user);
  } catch (err) {
    console.error("User sync error:", err);
    res.status(500).json({ message: "User sync failed" });
  }
});


module.exports = router;
