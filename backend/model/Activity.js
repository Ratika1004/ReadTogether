const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },

    type: {
      type: String,
      // post       = wrote a discussion post
      // shelf_add  = added a book to any shelf
      // completed  = marked a book as finished
      // review     = wrote a review
      enum: ["post", "shelf_add", "completed", "review"],
      required: true,
    },

    bookId:    { type: String,   default: "" },
    bookTitle: { type: String,   default: "" },
    bookCover: { type: String,   default: "" },

    // For posts
    postId:   { type: mongoose.Schema.Types.ObjectId, ref: "Post",   default: null },
    postText: { type: String, default: "" },

    // For reviews
    reviewId:     { type: mongoose.Schema.Types.ObjectId, ref: "Review", default: null },
    reviewRating: { type: Number, default: 0 },
    reviewText:   { type: String, default: "" },

    // For shelf_add
    shelfStatus: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-delete after 60 days
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 60 });
activitySchema.index({ userId: 1 });

module.exports = mongoose.model("Activity", activitySchema);