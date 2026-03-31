const Review = require("../model/Review");
const Reading = require("../model/Reading");
const { createNotification } = require("./notificationController");
const { logActivity } = require("./activityController");

exports.createReview = async (req, res) => {
  try {
    const { bookId, bookTitle, rating, text } = req.body;

    if (!bookId || !rating || !text) {
      return res.status(400).json({ message: "bookId, rating, and text are required" });
    }

    const existing = await Review.findOne({ userId: req.user.id, bookId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this book" });
    }

    const review = await Review.create({
      userId:    req.user.id,
      userName:  req.user.name,
      bookId,
      bookTitle: bookTitle || "",
      rating,
      text,
    });

    // Log activity
    await logActivity({
      userId:       req.user.id,
      userName:     req.user.name,
      type:         "review",
      bookId,
      bookTitle:    bookTitle || "",
      reviewId:     review._id,
      reviewRating: rating,
      reviewText:   text,
    });

    // Notify all users who are currently reading this book
    const readers = await Reading.find({
      bookId,
      userId: { $ne: req.user.id },
      status: "reading",
    });

    for (const reader of readers) {
      await createNotification({
        recipient:  reader.userId,
        sender:     req.user.id,
        senderName: req.user.name,
        type:       "review",
        reviewId:   review._id,
        bookId,
        bookTitle:  bookTitle || "",
      });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReviewsByBook = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ reviews, avgRating: parseFloat(avgRating.toFixed(1)) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};