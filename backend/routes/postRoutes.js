const express = require("express");
const router = express.Router();
const { createPost } = require("../controllers/postController");
const { getPosts } = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:bookId" , getPosts);
router.post("/" , authMiddleware , createPost);

module.exports = router;