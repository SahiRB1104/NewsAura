import express from "express";

// Import named export instead of default
import { translate } from "@vitalets/google-translate-api";

const router = express.Router();

router.post("/translate", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text || !language) {
      return res
        .status(400)
        .json({ error: "Text and target language are required" });
    }

    // Perform translation
    const result = await translate(text, { to: language });

    res.json({ translated: result.text });
  } catch (error) {
    console.error("Translation API error:", error);
    res
      .status(500)
      .json({ error: "Translation failed", details: error.message });
  }
});

export default router;
