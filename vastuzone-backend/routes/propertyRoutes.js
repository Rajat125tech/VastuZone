const express = require("express");
const Property = require("../models/Property");
const multer = require("multer");
const evaluateVastu = require("../utils/vastuEvaluator");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Property file is required" });
    }

    const report = evaluateVastu(req.body);

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const property = await Property.create({
      userId,
      propertyName: req.body.propertyName,
      propertyType: req.body.propertyType,
      purpose: req.body.purpose,
      city: req.body.city,
      area: req.body.area,
      facing: req.body.facing,
      entrance: req.body.entrance,
      notes: req.body.notes,

      livingRoomDirection: req.body.livingRoomDirection,
      kitchenDirection: req.body.kitchenDirection,
      masterBedroomDirection: req.body.masterBedroomDirection,
      kidsBedroomDirection: req.body.kidsBedroomDirection,
      bathroomDirection: req.body.bathroomDirection,
      poojaRoomDirection: req.body.poojaRoomDirection,

      fileName: req.file.filename,
      fileUrl,

      vastuScore: report.vastuScore,
      scoreBand: report.scoreBand,
      scoreColor: report.scoreColor,
      vastuTips: report.vastuTips,
      roomWarnings: report.roomWarnings,

      status: "Preliminary Report Ready",
      reviewStatus: "pending",
      messages: [],
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("❌ Property save failed:", error);
    res.status(500).json({ message: error.message });
  }
});
    
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error("❌ Failed to fetch properties");
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});
router.get("/user/:userId", async (req, res) => {
  try {
    const properties = await Property.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error("❌ Failed to fetch user properties");
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    res.status(404).json({ message: "Property not found" });
  }
});

router.post("/:id/message", async (req, res) => {
  try {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.messages.push({
      sender,
      text,
      createdAt: new Date(),
    });

    await property.save();
    res.status(200).json(property.messages);
  } catch (error) {
    console.error("❌ Message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});
router.post("/mark-reviewed/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Property.updateMany(
      {
        userId,
        reviewStatus: "pending",
      },
      {
        $set: {
          reviewStatus: "reviewed",
          reviewedAt: new Date(),
          reviewedBy: "expert", // later: expertId
        },
      }
    );

    res.status(200).json({
      message: "Properties marked as reviewed",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Mark reviewed error:", error);
    res.status(500).json({ message: "Failed to mark reviewed" });
  }
});

module.exports = router;
