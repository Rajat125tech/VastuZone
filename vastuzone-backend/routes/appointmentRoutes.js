const express = require("express");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const requireExpert = require("../middleware/requireExpert");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { userId, date, slot } = req.body;

    if (!userId || !date || !slot) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ firebaseUid: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const appointment = await Appointment.create({
      userId,
      userName: user.name,
      email: user.email,
      appointmentDate: date,
      timeSlot: slot,
      status: "pending_payment",
      amount: 299,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Failed to create appointment" });
  }
});

router.get("/user/:userId", async (req, res) => {
  const appointments = await Appointment.find({
    userId: req.params.userId,
  }).sort({ createdAt: -1 });

  res.json(appointments);
});

router.get("/expert", requireExpert, async (req, res) => {
  const appointments = await Appointment.find({
    status: { $in: ["pending_payment", "paid"] },
  }).sort({ appointmentDate: 1 });

  res.json(appointments);
});

router.post("/expert/:id/meet-link", requireExpert, async (req, res) => {
  const { meetLink } = req.body;

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { meetLink },
    { new: true }
  );

  res.json(appointment);
});

router.post("/pay/:id", async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: "Not found" });

  if (appointment.status === "paid") {
    return res.status(400).json({ message: "Already paid" });
  }

  const order = await razorpay.orders.create({
    amount: appointment.amount * 100,
    currency: "INR",
    receipt: `appt_${appointment._id}`,
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    appointmentId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  await Appointment.findByIdAndUpdate(appointmentId, { status: "paid" });

  res.json({ message: "Payment successful" });
});

module.exports = router;
