const express = require("express");
const Chat = require("../models/Chat");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status = "active" } = req.query;

    // ✅ BACKWARD COMPATIBILITY: If status is 'active', also find chats with no status field
    const query = status === "active" 
      ? { $or: [{ status: "active" }, { status: { $exists: false } }] }
      : { status };

    const chats = await Chat.find(query).sort({ updatedAt: -1 });

    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const user = await User.findOne({ firebaseUid: chat.userId });

        return {
          _id: chat._id,
          userId: chat.userId,
          userName: user?.name || "Unknown User",
          email: user?.email || "",
          messages: chat.messages,
          status: chat.status,
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

// ✅ ADDED: Resolve Chat (Mark as Done)
router.post("/:userId/resolve", async (req, res) => {
  try {
    const { userId } = req.params;
    const chat = await Chat.findOneAndUpdate(
      { userId },
      { status: "resolved" },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat resolved successfully", chat });
  } catch (err) {
    console.error("❌ Failed to resolve chat", err);
    res.status(500).json({ message: "Failed to resolve chat" });
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
    const { userId } = req.params;

    if (!sender || !text) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const chat = await Chat.findOne({ userId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const message = {
      sender,
      text,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    // 🔥 REAL-TIME EMIT
    const io = req.app.get("io");
    io.to(userId).emit("newMessage", {
      userId,
      message,
    });

    res.status(200).json(message);
  } catch (err) {
    console.error("❌ Failed to send message", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});


module.exports = router;
