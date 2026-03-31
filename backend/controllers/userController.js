const User = require("../model/User");
const { createNotification } = require("./notificationController");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name avatar")
      .populate("following", "name avatar");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetId  = req.params.id;
    const currentId = req.user.id;

    if (targetId === currentId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const [target, current] = await Promise.all([
      User.findById(targetId),
      User.findById(currentId),
    ]);

    if (!target) return res.status(404).json({ message: "User not found" });

    const isFollowing = current.following.map(String).includes(targetId);

    if (isFollowing) {
      current.following = current.following.filter((id) => id.toString() !== targetId);
      target.followers  = target.followers.filter((id) => id.toString() !== currentId);
    } else {
      current.following.push(targetId);
      target.followers.push(currentId);

      await createNotification({
        recipient:  targetId,
        sender:     currentId,
        senderName: req.user.name,
        type:       "follow",
      });
    }

    await Promise.all([current.save(), target.save()]);

    res.json({ following: !isFollowing, followerCount: target.followers.length });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Search users by name — returns whether current user follows each result
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: "Query required" });
    }

    const currentUser = await User.findById(req.user.id).select("following");

    const users = await User.find({
      name:  { $regex: q.trim(), $options: "i" },
      _id:   { $ne: req.user.id }, // Exclude self
    })
      .select("name avatar bio followers")
      .limit(20);

    const followingSet = new Set(currentUser.following.map(String));

    const results = users.map((u) => ({
      _id:            u._id,
      name:           u.name,
      avatar:         u.avatar,
      bio:            u.bio,
      followerCount:  u.followers.length,
      isFollowing:    followingSet.has(u._id.toString()),
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};