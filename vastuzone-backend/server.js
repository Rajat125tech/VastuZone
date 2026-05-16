const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
require("dotenv").config();
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorMiddleware");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const expertRoutes = require("./routes/expertRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const allowedOrigins = [
  "https://vastuzone-frontend.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/expert", expertRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true, 
  },
});


io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
