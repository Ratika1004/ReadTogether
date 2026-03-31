const express = require("express");
const router = express.Router();
const {
  addToReading,
  getUserBooks,
  updateStatus,
  removeBook,
} = require("../controllers/readingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, addToReading);
router.get("/my-books", authMiddleware, getUserBooks);
router.patch("/:id/status", authMiddleware, updateStatus);
router.delete("/:id", authMiddleware, removeBook);

module.exports = router;