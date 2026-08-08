const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Property = require("../models/Property");
const evaluateVastu = require("../utils/vastuEvaluator");
const validateRequest = require("../middleware/validateRequest");
const { createPropertySchema } = require("../validations/propertySchema");
const { runVastuAgentGraph } = require("../agents/vastuAgentGraph");
const { generateGroundedRecommendations } = require("../services/ragService");
const logger = require("../utils/logger");
const { generatePropertyPDF } = require("../utils/pdfGenerator");

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
   CREATE PROPERTY (LANGGRAPH ORCHESTRATED)
================================ */
router.post("/", upload.single("file"), validateRequest(createPropertySchema), async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    logger.info(`[propertyRoutes] Initiating LangGraph Agentic Pipeline for user ${userId}...`);

    // Execute Phase 2 LangGraph Orchestration
    const property = await runVastuAgentGraph({
      userId,
      pdfBuffer: req.file.buffer,
      fileName: req.file.originalname,
      propertyMetadata: req.body,
    });

    logger.info(`✅ Property ${property._id} successfully created via LangGraph Pipeline`);
    res.status(201).json(property);
  } catch (error) {
    logger.error("❌ LangGraph Property processing failed:", error);
    next(error); // Pass to global error handler
  }
});


/* ================================
   GET ALL PROPERTIES
================================ */
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    logger.error("❌ Failed to fetch all properties:", error);
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
});

/* ================================
   GET USER PROPERTIES
================================ */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === "undefined" || userId === "null") {
      return res.json([]);
    }

    if (mongoose.connection.readyState !== 1) {
      logger.warn(`[propertyRoutes] MongoDB inactive (readyState=${mongoose.connection.readyState}). Reconnecting...`);
      await connectDB();
    }

    const properties = await Property.find({ userId }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    logger.error(`❌ Failed to fetch properties for user ${req.params.userId}:`, error);
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
});

/* ================================
   GET PROPERTY BY ID
================================ */
router.get("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    logger.error(`❌ Failed to fetch property ${req.params.id}:`, error);
    res.status(404).json({ message: "Property not found" });
  }
});

/* ================================
   DOWNLOAD DETAILED REPORT (PDF)
================================ */
router.get("/:id/download-report", async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Re-evaluate Vastu for fresh report data
    const report = evaluateVastu(property);

    if ((!property.groundedRecommendations || property.groundedRecommendations.length === 0) && report.roomWarnings.length > 0) {
      const ragResult = await generateGroundedRecommendations(property, report);
      report.groundedRecommendations = ragResult.groundedRecommendations;
      report.knowledgeSources = ragResult.knowledgeSources;
    } else {
      report.groundedRecommendations = property.groundedRecommendations;
      report.knowledgeSources = property.knowledgeSources;
    }

    const pdfBuffer = await generatePropertyPDF(property, report);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=VastuReport_${property.propertyName.replace(/\s+/g, "_")}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    logger.error("PDF Download failed:", error);
    next(error);
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
