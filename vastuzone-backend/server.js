const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const expertRoutes = require("./routes/expertRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://vastuzone-frontend.onrender.com",
    ],
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

app.get("/", (req, res) => {
  res.send("API running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://vastuzone-frontend.onrender.com",
    methods: ["GET", "POST"],
    credentials: false, 
  },
});


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
