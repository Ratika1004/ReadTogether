const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/",            authMiddleware, getNotifications);
router.get("/unread",      authMiddleware, getUnreadCount);
router.patch("/read-all",  authMiddleware, markAllRead);
router.patch("/:id/read",  authMiddleware, markOneRead);

module.exports = router;