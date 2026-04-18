const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "astrologer"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const propertySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    propertyName: String,
    propertyType: String,
    purpose: String,
    city: String,
    area: String,
    facing: String,
    entrance: String,
    floors: String,
    analysisFloor: String,
    notes: String,
    fileName: String,
    fileUrl: {
      type: String,
      required: true,
    },

    reviewStatus: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },

    status: {
      type: String,
      default: "Preliminary Report Ready",
    },

    reviewedAt: Date,
    reviewedBy: String,

    messages: [messageSchema],
  },
  { timestamps: true }
);

// Compound index for optimized property retrieval for users, sorted by most recent
propertySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Property", propertySchema);
