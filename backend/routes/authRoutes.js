const express = require("express");
const router  = express.Router();
const {
  requestOTP,
  verifyOTP,
  login,
  getMe,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup/request-otp", requestOTP);
router.post("/signup/verify-otp",  verifyOTP);
router.post("/login",              login);
router.get("/me", authMiddleware,  getMe);

module.exports = router;