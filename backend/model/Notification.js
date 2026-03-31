const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Who triggered it
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: { type: String, required: true },

    type: {
      type: String,
      enum: ["follow", "like", "reply", "review"],
      required: true,
    },

    // Context — all optional depending on type
    postId:    { type: mongoose.Schema.Types.ObjectId, ref: "Post",   default: null },
    reviewId:  { type: mongoose.Schema.Types.ObjectId, ref: "Review", default: null },
    bookId:    { type: String, default: "" },
    bookTitle: { type: String, default: "" },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model("Notification", notificationSchema);