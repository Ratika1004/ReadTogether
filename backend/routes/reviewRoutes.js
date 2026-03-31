const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviewsByBook,
  getReviewsByUser,
  deleteReview,
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createReview);
router.get("/book/:bookId", getReviewsByBook);
router.get("/user/:userId", getReviewsByUser);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;