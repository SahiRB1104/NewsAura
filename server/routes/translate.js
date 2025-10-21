import express from "express";
import { GoogleGenAI } from "@google/genai";
import NodeCache from "node-cache";
import pkg from "@vitalets/google-translate-api";
const translate = pkg.default;
 // ✅ Free fallback translator

const router = express.Router();

// ✅ Gemini Client Setup (latest GenAI SDK)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ✅ Cache translations (1 hour)
const translationCache = new NodeCache({ stdTTL: 3600 });

// ✅ Supported language codes
const supportedLangs = [
  "en", "hi", "mr", "ta", "te", "gu", "kn", "ml", "bn", "pa",
  "fr", "de", "es", "ja", "zh"
];

// ✅ Mapping for clarity in prompts
const languageNames = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  ta: "Tamil",
  te: "Telugu",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  pa: "Punjabi",
  fr: "French",
  es: "Spanish",
  de: "German",
  ja: "Japanese",
  zh: "Chinese (Simplified)"
};

/**
 * @route POST /api/translate
 * @desc Translate text using Gemini 2.0, fallback to free translator if fails or for Marathi
 */
router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing text or targetLang" });
    }

    if (!supportedLangs.includes(targetLang)) {
      return res.status(400).json({
        error: `Language '${targetLang}' not supported`,
      });
    }

    // ✅ Check cache
    const cacheKey = `${targetLang}:${text.slice(0, 200)}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      console.log("✅ Returning cached translation");
      return res.json(cached);
    }

    // ✅ Special rule: Marathi should use fallback directly (Gemini often returns Hindi)
    if (targetLang === "mr") {
      console.log("🪄 Marathi detected — using fallback translator directly");
      const fallback = await translate(text, { to: "mr" });

      const result = {
        success: true,
        translatedText: fallback.text,
        targetLang,
        model: "fallback-google-translate",
        source: "Forced Fallback (Marathi)",
      };

      translationCache.set(cacheKey, result);
      return res.json(result);
    }

    console.log(`🌐 Translating to ${targetLang} using Gemini 2.0...`);

    // ✅ Improved Gemini translation prompt
    const prompt = `
You are an expert multilingual translator fluent in all Indian and international languages.
Translate the following text into **${languageNames[targetLang]} (${targetLang})**.
Maintain tone, emotion, and meaning precisely.
If the text is in Devanagari script (like Hindi or Marathi), ensure it uses correct vocabulary for ${languageNames[targetLang]}.
Output only the translated text, no explanations or comments.

Text:
"""${text}"""
`;

    // ✅ Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const translatedText =
      response.output_text?.trim() ||
      response.text?.trim() ||
      "";

    if (!translatedText || translatedText.length < 2) {
      throw new Error("Empty translation from Gemini");
    }

    const result = {
      success: true,
      translatedText,
      targetLang,
      model: "gemini-2.0-flash",
      source: "Gemini GenAI",
    };

    translationCache.set(cacheKey, result);
    res.json(result);

  } catch (error) {
    console.error("⚠️ Gemini translation failed:", error.message);

    // ✅ FALLBACK: Free Google Translate API for all others
    try {
      const { text, targetLang } = req.body;
      console.log(`🔄 Using fallback translator for ${targetLang}...`);

      const fallback = await translate(text, { to: targetLang });

      const result = {
        success: true,
        translatedText: fallback.text,
        targetLang,
        model: "fallback-google-translate",
        source: "Fallback Translator",
      };

      translationCache.set(`${targetLang}:${text.slice(0, 200)}`, result);
      res.json(result);
    } catch (fallbackError) {
      console.error("❌ Fallback translation failed:", fallbackError.message);
      res.status(500).json({
        success: false,
        error: "Both Gemini and fallback translation failed",
      });
    }
  }
});

export default router;
