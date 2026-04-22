const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Appointment = require("../models/Appointment");

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  const firebaseUid = req.headers["x-user-uid"];
  if (!firebaseUid) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findOne({ firebaseUid });
    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get high-level stats
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: "user" });
    const expertCount = await User.countDocuments({ role: "expert" });
    const appointmentCount = await Appointment.countDocuments();
    
    const paidAppointments = await Appointment.find({ status: { $in: ["paid", "completed"] } });
    const totalRevenue = paidAppointments.reduce((sum, appt) => sum + (appt.amount || 0), 0);

    res.json({
      users: userCount,
      experts: expertCount,
      appointments: appointmentCount,
      revenue: totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put("/users/:id/role", requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["user", "expert", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
