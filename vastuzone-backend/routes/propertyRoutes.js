const express = require("express");
const Property = require("../models/Property");
const evaluateVastu = require("../utils/vastuEvaluator");

// Cloudinary + Multer
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

/* ================================
   CLOUDINARY + MULTER CONFIG
================================ */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vastuzone_pdfs",
    resource_type: "raw", // REQUIRED for PDFs
    allowed_formats: ["pdf"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* ================================
   CREATE PROPERTY
================================ */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const report = evaluateVastu(req.body);

    // ✅ Cloudinary details
    const fileUrl = req.file.path;
    const fileName = req.file.originalname;

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

      fileName,
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

    console.log("✅ Property saved with Cloudinary PDF");
    res.status(201).json(property);
  } catch (error) {
    console.error("❌ Property save failed:", error);
    res.status(500).json({
      message: "Failed to save property",
      error: error.message,
    });
  }
});

/* ================================
   GET ALL PROPERTIES
================================ */
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

/* ================================
   GET USER PROPERTIES
================================ */
router.get("/user/:userId", async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

/* ================================
   GET PROPERTY BY ID
================================ */
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch {
    res.status(404).json({ message: "Property not found" });
  }
});

/* ================================
   ADD MESSAGE
================================ */
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

    property.messages.push({ sender, text });
    await property.save();

    res.status(200).json(property.messages);
  } catch {
    res.status(500).json({ message: "Failed to send message" });
  }
});

/* ================================
   MARK AS REVIEWED (ALL FOR USER)
================================ */
router.post("/mark-reviewed/:userId", async (req, res) => {
  try {
    const result = await Property.updateMany(
      { userId: req.params.userId, reviewStatus: "pending" },
      {
        $set: {
          reviewStatus: "reviewed",
          reviewedAt: new Date(),
          reviewedBy: "expert",
        },
      }
    );

    res.status(200).json({
      message: "Properties marked as reviewed",
      modifiedCount: result.modifiedCount,
    });
  } catch {
    res.status(500).json({ message: "Failed to mark reviewed" });
  }
});

/* ================================
   MARK AS REVIEWED (SINGLE PROPERTY)
================================ */
router.post("/mark-reviewed-single/:propertyId", async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.propertyId,
      {
        $set: {
          reviewStatus: "reviewed",
          reviewedAt: new Date(),
          reviewedBy: "expert",
        },
      },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Property marked as reviewed",
      property,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark reviewed" });
  }
});

module.exports = router;
