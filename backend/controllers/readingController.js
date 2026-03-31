const Reading = require("../model/Reading");
const { logActivity } = require("./activityController");

exports.addToReading = async (req, res) => {
  try {
    const { bookId, title, author, cover, status } = req.body;

    if (!bookId || !title || !status) {
      return res.status(400).json({ message: "bookId, title, and status are required" });
    }

    const isNew = !(await Reading.findOne({ userId: req.user.id, bookId }));

    const reading = await Reading.findOneAndUpdate(
      { userId: req.user.id, bookId },
      { userId: req.user.id, bookId, title, author, cover, status },
      { upsert: true, new: true }
    );

    // Only log activity on first add
    if (isNew) {
      const activityType = status === "completed" ? "completed" : "shelf_add";
      await logActivity({
        userId:      req.user.id,
        userName:    req.user.name,
        type:        activityType,
        bookId,
        bookTitle:   title,
        bookCover:   cover || "",
        shelfStatus: status,
      });
    }

    res.status(201).json(reading);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserBooks = async (req, res) => {
  try {
    const books = await Reading.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const book = await Reading.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Log completion activity
    if (status === "completed") {
      await logActivity({
        userId:    req.user.id,
        userName:  req.user.name,
        type:      "completed",
        bookId:    book.bookId,
        bookTitle: book.title,
        bookCover: book.cover || "",
      });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeBook = async (req, res) => {
  try {
    const book = await Reading.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};