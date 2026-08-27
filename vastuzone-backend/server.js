require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorMiddleware");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const expertRoutes = require("./routes/expertRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Base list of allowed origins
const defaultOrigins = [
  "https://vastuzone.in",
  "https://www.vastuzone.in",
  "https://vastuzone-frontend.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
];

// Helper to extract and normalize origins from environment variables (comma-separated or single URLs)
const parseEnvOrigins = () => {
  const envKeys = [
    "ALLOWED_ORIGINS",
    "FRONTEND_URL",
    "CLIENT_URL",
    "CORS_ORIGIN",
  ];

  const parsed = [];
  for (const key of envKeys) {
    const val = process.env[key];
    if (typeof val === "string" && val.trim()) {
      val
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean)
        .forEach((origin) => {
          if (!parsed.includes(origin)) {
            parsed.push(origin);
          }
        });
    }
  }
  return parsed;
};

// Merge default trusted origins with environment variables (deduplicated)
const allowedOrigins = Array.from(
  new Set([...defaultOrigins, ...parseEnvOrigins()])
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/+$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-user-uid",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Mount CORS middleware (handles all preflight OPTIONS and cross-origin requests)
app.use(cors(corsOptions));

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
