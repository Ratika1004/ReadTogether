const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  followUser,
  searchUsers,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/search", authMiddleware, searchUsers);
router.get("/:id", authMiddleware, getProfile);
router.patch("/me", authMiddleware, updateProfile);
router.patch("/:id/follow", authMiddleware, followUser);

module.exports = router;