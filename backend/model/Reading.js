const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, default: "Unknown" },
    cover: { type: String, default: "" },
    status: {
      type: String,
      enum: ["reading", "completed", "wishlist"],
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate entries for same user + book
readingSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("Reading", readingSchema);