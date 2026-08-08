const express = require("express");
const Property = require("../models/Property");
const requireExpert = require("../middleware/requireExpert");
const { resumeVastuAgentGraph } = require("../agents/vastuAgentGraph");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * GET /api/expert/chats
 * Fetches active/resolved user chats for expert panel
 */
router.get("/chats", requireExpert, async (req, res) => {
  try {
    const properties = await Property.find({
      messages: { $exists: true, $not: { $size: 0 } },
    }).sort({ updatedAt: -1 });

    res.json(properties);
  } catch (error) {
    logger.error("Expert fetch error:", error);
    res.status(500).json({ message: "Failed to load chats" });
  }
});

/**
 * POST /api/expert/reply/:propertyId
 * Sends an expert reply to a user inquiry thread
 */
router.post("/reply/:propertyId", requireExpert, async (req, res) => {
  try {
    const { text } = req.body;
    const { propertyId } = req.params;

    if (!text) {
      return res.status(400).json({ message: "Message required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.messages.push({
      sender: "expert",
      text,
      createdAt: new Date(),
    });

    await property.save();
    res.json({ message: "Reply sent" });
  } catch (error) {
    logger.error("Expert reply error:", error);
    res.status(500).json({ message: "Reply failed" });
  }
});

/* ==================================================
   PHASE 3: HUMAN-IN-THE-LOOP EXPERT REVIEW APIS
================================================== */

/**
 * GET /api/expert/reviews
 * Fetches all properties currently pending expert review or already reviewed
 */
router.get("/reviews", requireExpert, async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const query = status === "pending" 
      ? { $or: [{ reviewStatus: "pending" }, { executionStatus: "WAITING_FOR_EXPERT" }] }
      : { reviewStatus: { $in: ["reviewed", "APPROVED", "EDITED", "REANALYSIS_REQUESTED"] } };

    const reviews = await Property.find(query).sort({ updatedAt: -1 });
    res.json(reviews);
  } catch (error) {
    logger.error("Failed to fetch expert review queue:", error.message);
    res.status(500).json({ message: "Failed to fetch review queue" });
  }
});

/**
 * GET /api/expert/reviews/:propertyId
 * Fetches details for a specific property audit review
 */
router.get("/reviews/:propertyId", requireExpert, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property audit review not found" });
    }
    res.json(property);
  } catch (error) {
    logger.error("Failed to fetch review details:", error.message);
    res.status(500).json({ message: "Failed to fetch review details" });
  }
});

/**
 * POST /api/expert/reviews/:propertyId/approve
 * Expert approves the AI-generated Vastu report without modifications
 */
router.post("/reviews/:propertyId/approve", requireExpert, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { notes } = req.body;
    const expertId = req.user?.uid || "expert_auditor";

    logger.info(`[Expert API] Expert ${expertId} approving report ${propertyId}`);

    const updatedProperty = await resumeVastuAgentGraph(propertyId, {
      decision: "APPROVE",
      expertId,
      notes: notes || "Approved by expert auditor.",
    });

    res.json({
      message: "Vastu report approved successfully.",
      property: updatedProperty,
    });
  } catch (error) {
    logger.error("Expert approve error:", error.message);
    res.status(500).json({ message: "Failed to approve report: " + error.message });
  }
});

/**
 * POST /api/expert/reviews/:propertyId/edit
 * Expert edits/overrides AI recommendations before publishing final report
 */
router.post("/reviews/:propertyId/edit", requireExpert, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { notes, editedRecommendations } = req.body;
    const expertId = req.user?.uid || "expert_auditor";

    if (!editedRecommendations || !Array.isArray(editedRecommendations)) {
      return res.status(400).json({ message: "editedRecommendations array is required" });
    }

    logger.info(`[Expert API] Expert ${expertId} editing report ${propertyId}`);

    const updatedProperty = await resumeVastuAgentGraph(propertyId, {
      decision: "EDIT",
      expertId,
      notes: notes || "Modified by expert auditor.",
      editedRecommendations,
    });

    res.json({
      message: "Vastu report modified and published successfully.",
      property: updatedProperty,
    });
  } catch (error) {
    logger.error("Expert edit error:", error.message);
    res.status(500).json({ message: "Failed to edit report: " + error.message });
  }
});

/**
 * POST /api/expert/reviews/:propertyId/reanalyze
 * Expert requests re-analysis (vision re-extraction or RAG re-evaluation)
 */
router.post("/reviews/:propertyId/reanalyze", requireExpert, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { notes, reanalysisTarget, reason } = req.body;
    const expertId = req.user?.uid || "expert_auditor";

    logger.info(`[Expert API] Expert ${expertId} requesting reanalysis for report ${propertyId}`);

    const updatedProperty = await resumeVastuAgentGraph(propertyId, {
      decision: "REQUEST_REANALYSIS",
      expertId,
      notes: notes || "Reanalysis requested by expert auditor.",
      reanalysisTarget: reanalysisTarget || "rag",
      reason: reason || notes || "Expert requested re-evaluation",
    });

    res.json({
      message: "Reanalysis requested successfully. Graph re-entered target node.",
      property: updatedProperty,
    });
  } catch (error) {
    logger.error("Expert reanalyze error:", error.message);
    res.status(500).json({ message: "Failed to request reanalysis: " + error.message });
  }
});

module.exports = router;
