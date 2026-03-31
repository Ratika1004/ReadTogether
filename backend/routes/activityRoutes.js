const express = require("express");
const router = express.Router();
const { getFriendFeed } = require("../controllers/activityController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/friend-feed", authMiddleware, getFriendFeed);

module.exports = router;