const User    = require("../model/User");
const OTP     = require("../model/OTP");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const { sendOTPEmail } = require("../config/mailer");

// ── Step 1: Request OTP ──────────────────────────────────
// Validates input, hashes password, stores temp record, emails OTP
exports.requestOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Block if email already has a verified account
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert: replace any previous pending OTP for this email
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        otp,
        name,
        hashedPassword,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("requestOTP error:", error.message);
    res.status(500).json({ message: "Failed to send OTP. Check your email address." });
  }
};

// ── Step 2: Verify OTP & create account ─────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = await OTP.findOne({ email: email.toLowerCase() });

    if (!record) {
      return res.status(400).json({ message: "OTP expired or not found. Please request a new one." });
    }

    if (record.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    // Double-check account wasn't created while OTP was pending
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await OTP.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({ message: "Account already exists. Please log in." });
    }

    // Create the verified account
    const user = await User.create({
      name:     record.name,
      email:    record.email,
      password: record.hashedPassword,
    });

    // Clean up OTP record
    await OTP.deleteOne({ email: email.toLowerCase() });

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("verifyOTP error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Login ────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── Get current user ─────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};