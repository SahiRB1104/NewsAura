import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  feedback: String,
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// ➕ POST route to save feedback
router.post("/", async (req, res) => {
  try {
    const { name, email, feedback } = req.body;
    if (!feedback) return res.status(400).json({ message: "Feedback required" });

    const newFeedback = new Feedback({ name, email, feedback });
    await newFeedback.save();
    res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving feedback", error: err.message });
  }
});

export default router;
