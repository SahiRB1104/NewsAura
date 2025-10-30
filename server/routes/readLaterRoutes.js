// routes/readLaterRoutes.js
import express from "express";
import ReadLater from "../models/ReadLater.js";
const router = express.Router();

// 📥 Save article
router.post("/", async (req, res) => {
  try {
    const { userId, username, article } = req.body;
    const existing = await ReadLater.findOne({
      userId,
      "article.id": article.id,
    });
    if (existing) return res.status(400).json({ message: "Already saved" });

    const saved = await ReadLater.create({ userId, username, article });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📦 Get user’s Read Later
router.get("/:userId", async (req, res) => {
  try {
    const items = await ReadLater.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Remove article
router.delete("/:userId/:articleId", async (req, res) => {
  try {
    await ReadLater.findOneAndDelete({
      userId: req.params.userId,
      "article.id": req.params.articleId,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
