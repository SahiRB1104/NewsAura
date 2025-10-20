import express from "express";
import gTTS from "gtts";

const router = express.Router();

// 🎤 Generate TTS only
router.post("/tts", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const lang = language || "en";

    const gtts = new gTTS(text, lang);

    res.setHeader("Content-Type", "audio/mpeg");

    gtts.stream().pipe(res).on("error", (err) => {
      console.error("gTTS Stream Error:", err);
      res.status(500).json({ error: "Failed to stream audio" });
    });
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

export default router;
