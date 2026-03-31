const Activity = require("../model/Activity");
const User = require("../model/User");

// Get friend feed — activities from people the current user follows
exports.getFriendFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("following");
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const followingIds = currentUser.following;

    if (followingIds.length === 0) {
      return res.json({ activities: [], empty: true });
    }

    const activities = await Activity.find({ userId: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .limit(60);

    res.json({ activities, empty: activities.length === 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Internal helper — called from other controllers to log an activity
exports.logActivity = async ({
  userId,
  userName,
  type,
  bookId,
  bookTitle,
  bookCover,
  postId,
  postText,
  reviewId,
  reviewRating,
  reviewText,
  shelfStatus,
}) => {
  try {
    await Activity.create({
      userId,
      userName,
      type,
      bookId:       bookId       || "",
      bookTitle:    bookTitle    || "",
      bookCover:    bookCover    || "",
      postId:       postId       || null,
      postText:     postText     || "",
      reviewId:     reviewId     || null,
      reviewRating: reviewRating || 0,
      reviewText:   reviewText   || "",
      shelfStatus:  shelfStatus  || "",
    });
  } catch (error) {
    // Non-critical — never throw
    console.error("Activity log failed:", error.message);
  }
};