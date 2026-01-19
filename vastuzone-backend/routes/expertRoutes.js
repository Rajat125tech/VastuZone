const express = require("express");
const Property = require("../models/Property");
const requireExpert = require("../middleware/requireExpert");

const router = express.Router();

router.get("/chats", requireExpert, async (req, res) => {
  try {
    const properties = await Property.find({
      messages: { $exists: true, $not: { $size: 0 } },
    }).sort({ updatedAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error("Expert fetch error:", error);
    res.status(500).json({ message: "Failed to load chats" });
  }
});

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
    console.error("Expert reply error:", error);
    res.status(500).json({ message: "Reply failed" });
  }
});

module.exports = router;
