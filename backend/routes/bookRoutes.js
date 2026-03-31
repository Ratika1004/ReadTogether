const express = require("express");
const router = express.Router();
const { searchBooks, getBookById } = require("../controllers/bookController");

router.get("/search", searchBooks);
router.get("/:id", getBookById);

module.exports = router;