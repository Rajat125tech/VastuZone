const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("⚠️ MONGO_URI environment variable is missing!");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI.trim();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    if (logger && logger.error) {
      logger.error("❌ MongoDB connection failed:", error);
    }
    console.error("👉 Troubleshooting Checklist:");
    console.error("1. Verify MONGO_URI in Render environment settings (Check for typos in cluster domain, e.g. cluster0.xxx.mongodb.net).");
    console.error("2. Ensure 0.0.0.0/0 (Allow Access from Anywhere) is added to MongoDB Atlas -> Network Access.");
    console.error("3. If using mongodb+srv:// and DNS SRV fails, try using the standard mongodb:// connection string format.");
  }
};

module.exports = connectDB;

