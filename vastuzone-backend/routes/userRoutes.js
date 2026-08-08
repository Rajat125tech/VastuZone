const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * POST /api/users/create
 * Creates or retrieves user record in MongoDB
 */
router.post("/create", async (req, res) => {
  try {
    const { firebaseUid, email, name } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ firebaseUid });

      if (!user) {
        user = await User.create({
          firebaseUid,
          email,
          name: name || email.split("@")[0] || "User",
          role: "user",
        });
      }

      return res.status(200).json(user);
    }

    // Fallback if MongoDB is temporarily connecting/unavailable
    logger.warn(`[User API] MongoDB inactive. Returning fallback auth session for UID: ${firebaseUid}`);
    return res.status(200).json({
      firebaseUid,
      email,
      name: name || email.split("@")[0] || "User",
      role: "user",
    });
  } catch (err) {
    logger.error("User creation error:", err.message);
    // Return graceful fallback session so login does not fail
    return res.status(200).json({
      firebaseUid: req.body.firebaseUid,
      email: req.body.email,
      name: req.body.name || "User",
      role: "user",
    });
  }
});

/**
 * GET /api/users/me/:firebaseUid
 * Fetches user metadata by Firebase UID
 */
router.get("/me/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ firebaseUid });

      if (user) {
        return res.json({
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      }
    }

    // Fallback default user object if not found or DB reconnecting
    return res.json({
      firebaseUid,
      name: "User",
      email: "",
      role: "user",
    });
  } catch (error) {
    logger.error("Fetch user error:", error.message);
    return res.json({
      firebaseUid: req.params.firebaseUid,
      name: "User",
      email: "",
      role: "user",
    });
  }
});

/**
 * POST /api/users/sync
 * Syncs user data from Firebase auth
 */
router.post("/sync", async (req, res) => {
  try {
    const { firebaseUid, name, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "Missing firebaseUid or email" });
    }

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ firebaseUid });

      if (!user) {
        user = await User.create({
          firebaseUid,
          name: name || "User",
          email,
          role: "user",
        });
      }

      return res.status(200).json(user);
    }

    return res.status(200).json({
      firebaseUid,
      name: name || "User",
      email,
      role: "user",
    });
  } catch (err) {
    logger.error("User sync error:", err.message);
    return res.status(200).json({
      firebaseUid: req.body.firebaseUid,
      name: req.body.name || "User",
      email: req.body.email,
      role: "user",
    });
  }
});

module.exports = router;
