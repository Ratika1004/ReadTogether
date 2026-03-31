const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    bookId: { type: String, required: true },
    bookTitle: { type: String, default: "" },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: [true, "Review text is required"],
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

// One review per user per book
reviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);