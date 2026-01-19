const express = require("express");
const Chat = require("../models/Chat");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });

    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const user = await User.findOne({ firebaseUid: chat.userId });

        return {
          _id: chat._id,
          userId: chat.userId,
          userName: user?.name || "Unknown User", // ✅ FIXED
          email: user?.email || "",
          messages: chat.messages,
          updatedAt: chat.updatedAt,
        };
      })
    );

    res.json(enrichedChats);
  } catch (err) {
    console.error("❌ Failed to fetch chats", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    let chat = await Chat.findOne({ userId: req.params.userId });

    if (!chat) {
      chat = await Chat.create({
        userId: req.params.userId,
        messages: [],
      });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat" });
  }
});

router.post("/:userId/message", async (req, res) => {
  try {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const chat = await Chat.findOne({ userId: req.params.userId });
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ sender, text });
    await chat.save();

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
