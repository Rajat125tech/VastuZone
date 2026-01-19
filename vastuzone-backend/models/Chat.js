const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "expert"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    readByExpert: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String, 
      required: true,
      unique: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
