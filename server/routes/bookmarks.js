import express from "express";
import Bookmark from "../models/Bookmark.js";

const router = express.Router();

// 📌 POST /api/bookmarks  → Save bookmark
router.post("/", async (req, res) => {
  try {
    const { userId, username, article } = req.body;

    if (!userId || !username || !article) {
      return res.status(400).json({ error: "Missing userId, username or article" });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      userId,
      "article.id": article.id,
    });

    if (existing) {
      return res.status(200).json({ message: "Already bookmarked" });
    }

    const newBookmark = await Bookmark.create({ userId, username, article });
    res.status(201).json(newBookmark);
  } catch (err) {
    console.error("Error saving bookmark:", err);
    res.status(500).json({ error: "Failed to save bookmark" });
  }
});


// 📂 GET /api/bookmarks/:userId  → Get user's saved articles
router.get("/:userId", async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(bookmarks);
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// ❌ DELETE /api/bookmarks/:userId/:articleId  → Remove bookmark
router.delete("/:userId/:articleId", async (req, res) => {
  try {
    const { userId, articleId } = req.params;
    await Bookmark.findOneAndDelete({ userId, "article.id": articleId });
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    console.error("Error deleting bookmark:", err);
    res.status(500).json({ error: "Failed to delete bookmark" });
  }
});

export default router;
