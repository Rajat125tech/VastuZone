const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const path = require("path");
const chatRoutes = require("./routes/chatRoutes");




const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

connectDB();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/chat", require("./routes/chatRoutes"));



app.use(express.urlencoded({ extended: true }));

app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/expert", require("./routes/expertRoutes"));
app.use("/api/users", userRoutes);
app.use("/api/appointments", require("./routes/appointmentRoutes"));


app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(` Server running on ${PORT}`);
});
