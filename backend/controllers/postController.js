const Post = require("../model/Post");
const { createNotification } = require("./notificationController");
const { logActivity } = require("./activityController");

exports.createPost = async (req, res) => {
  try {
    const { bookId, bookTitle, text } = req.body;

    if (!bookId || !text) {
      return res.status(400).json({ message: "bookId and text are required" });
    }

    const post = await Post.create({
      userId: req.user.id,
      userName: req.user.name,
      bookId,
      bookTitle: bookTitle || "",
      text,
    });

    // Log to activity feed
    await logActivity({
      userId:    req.user.id,
      userName:  req.user.name,
      type:      "post",
      bookId,
      bookTitle: bookTitle || "",
      postId:    post._id,
      postText:  text,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ bookId: req.params.bookId })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feed" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId   = req.user.id;
    const alreadyLiked = post.likes.map(String).includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);

      // Notify post author
      await createNotification({
        recipient:  post.userId,
        sender:     req.user.id,
        senderName: req.user.name,
        type:       "like",
        postId:     post._id,
        bookId:     post.bookId,
        bookTitle:  post.bookTitle,
      });
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.replyToPost = async (req, res) => {
  try {
    const { bookId, bookTitle, text, replyToId } = req.body;

    if (!bookId || !text) {
      return res.status(400).json({ message: "bookId and text are required" });
    }

    const post = await Post.create({
      userId:    req.user.id,
      userName:  req.user.name,
      bookId,
      bookTitle: bookTitle || "",
      text,
      replyTo:   replyToId || null,
    });

    // Notify original post author if replying to someone else's post
    if (replyToId) {
      const original = await Post.findById(replyToId);
      if (original) {
        await createNotification({
          recipient:  original.userId,
          sender:     req.user.id,
          senderName: req.user.name,
          type:       "reply",
          postId:     original._id,
          bookId:     original.bookId,
          bookTitle:  original.bookTitle,
        });
      }
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};