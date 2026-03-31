const Notification = require("../model/Notification");

// Get all notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get unread count only (used for navbar badge)
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Mark one as read
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true }
    );
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Internal helper — called by other controllers, not a route
exports.createNotification = async ({
  recipient,
  sender,
  senderName,
  type,
  postId,
  reviewId,
  bookId,
  bookTitle,
}) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender.toString()) return;

    await Notification.create({
      recipient,
      sender,
      senderName,
      type,
      postId:    postId    || null,
      reviewId:  reviewId  || null,
      bookId:    bookId    || "",
      bookTitle: bookTitle || "",
    });
  } catch (error) {
    // Notifications are non-critical — never throw
    console.error("Notification creation failed:", error.message);
  }
};