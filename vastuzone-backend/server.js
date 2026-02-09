const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

/* ================================
   CORS
================================ */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://vastuzone-frontend.onrender.com",
    ],
    credentials: true,
  })
);

/* ================================
   BODY PARSERS
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================
   DATABASE
================================ */
connectDB();

/* ================================
   ROUTES
================================ */
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/expert", require("./routes/expertRoutes"));
app.use("/api/users", userRoutes);
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/chat", chatRoutes);

/* ================================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("API running");
});

/* ================================
   SERVER
================================ */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
