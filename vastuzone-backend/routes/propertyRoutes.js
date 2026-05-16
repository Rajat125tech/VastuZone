const express = require("express");
const Property = require("../models/Property");
const evaluateVastu = require("../utils/vastuEvaluator");
const validateRequest = require("../middleware/validateRequest");
const { createPropertySchema } = require("../validations/propertySchema");
const { extractDirectionsFromPDF } = require("../utils/aiVision");
const logger = require("../utils/logger");

// Cloudinary + Multer
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

/* ================================
   MULTER MEMORY STORAGE CONFIG
================================ */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* ================================
   CREATE PROPERTY
================================ */
router.post("/", upload.single("file"), validateRequest(createPropertySchema), async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // 1. AI Vision: Extract directions from PDF
    logger.info("Starting AI Vision extraction...");
    const aiExtractedDirections = await extractDirectionsFromPDF(req.file.buffer);

    // Merge AI data with manual data (manual data takes priority if provided)
    const propertyData = {
      ...aiExtractedDirections,
      ...req.body, // req.body values will override AI values if both exist
    };

    // 2. Evaluate Vastu using merged data
    const report = evaluateVastu(propertyData);

    // 3. Upload to Cloudinary manually from buffer
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "vastuzone_pdfs", resource_type: "raw" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    const fileUrl = cloudinaryResult.secure_url;
    const fileName = req.file.originalname;

    // 4. Save to Database
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

      // Using merged data
      livingRoomDirection: propertyData.livingRoomDirection,
      kitchenDirection: propertyData.kitchenDirection,
      masterBedroomDirection: propertyData.masterBedroomDirection,
      kidsBedroomDirection: propertyData.kidsBedroomDirection,
      bathroomDirection: propertyData.bathroomDirection,
      poojaRoomDirection: propertyData.poojaRoomDirection,

      fileName,
      fileUrl,

      vastuScore: report.vastuScore,
      scoreBand: report.scoreBand,
      scoreColor: report.scoreColor,
      vastuTips: report.vastuTips,
      roomWarnings: report.roomWarnings,

      status: "AI-Analyzed Report Ready",
      reviewStatus: "pending",
      messages: [],
    });

    logger.info(`✅ Property ${property._id} saved with AI analysis`);
    res.status(201).json(property);
  } catch (error) {
    logger.error("❌ Property save failed:", error);
    next(error); // Pass to global error handler
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
