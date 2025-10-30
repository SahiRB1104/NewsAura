// server/routes/comments.js
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const commentSchema = new mongoose.Schema({
  articleId: String,
  articleTitle: String,
  user: String,
  email: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

// 📝 POST - Add new comment
router.post("/", async (req, res) => {
  try {
    const { articleId, articleTitle, user, email, text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const newComment = new Comment({ articleId, articleTitle, user, email, text });
    await newComment.save();
    res.status(200).json({ message: "Comment added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📜 GET - Fetch comments for one article
router.get("/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const comments = await Comment.find({ articleId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
