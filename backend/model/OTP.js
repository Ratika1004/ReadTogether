    const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  // Temporary user data held until OTP is verified
  name: { type: String, required: true },
  hashedPassword: { type: String, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Auto-delete after 10 minutes
  },
});

// Only one pending OTP per email at a time
otpSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("OTP", otpSchema);