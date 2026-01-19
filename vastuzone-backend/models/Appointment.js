const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // firebaseUid
      required: true,
      index: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    appointmentDate: {
      type: String, // yyyy-mm-dd
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      default: 299,
    },

    status: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "completed",
        "cancelled",
      ],
      default: "pending_payment",
    },

    meetLink: {
      type: String,
      default: "",
    },

    maxDurationMinutes: {
      type: Number,
      default: 60,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
