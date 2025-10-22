import express from "express";
import { GoogleGenAI } from "@google/genai";
import NodeCache from "node-cache";
import { createRequire } from "module";

const router = express.Router();

/* ──────────────────────────────────────────────
   ✅ Load CommonJS module safely using createRequire
────────────────────────────────────────────── */
let translateFn = null;
try {
  const require = createRequire(import.meta.url);
  const translate = require("@vitalets/google-translate-api");
  translateFn = translate.default || translate.translate || translate;
  if (typeof translateFn !== "function") {
    throw new Error("translateFn not callable");
  }
  console.log("✅ Fallback translator ready (via createRequire)");
} catch (err) {
  console.error("❌ Fallback translator initialization failed:", err.message);
}

/* ──────────────────────────────────────────────
   🔑 Gemini GenAI Setup
────────────────────────────────────────────── */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* ──────────────────────────────────────────────
   🧠 Translation Cache (1 hour)
────────────────────────────────────────────── */
const translationCache = new NodeCache({ stdTTL: 3600 });

/* ──────────────────────────────────────────────
   🌍 Supported Languages (Added Marathi)
────────────────────────────────────────────── */
const supportedLangs = [
  "en", "hi", "mr", "ta", "te", "gu", "kn", "ml", "bn", "pa",
  "fr", "de", "es", "ja", "zh"
];

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

/* ──────────────────────────────────────────────
   🚀 POST /api/translate
────────────────────────────────────────────── */
router.post("/", async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or targetLang" });
  }

  if (!supportedLangs.includes(targetLang)) {
    return res.status(400).json({ error: `Language '${targetLang}' not supported` });
  }

  try {
    // ✅ Cache check
    const cacheKey = `${targetLang}:${text.slice(0, 200)}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      console.log("✅ Returning cached translation");
      return res.json(cached);
    }

    console.log(`🌐 Translating to ${targetLang} using Gemini 2.0...`);

    const prompt = `
You are an expert multilingual translator fluent in all Indian and international languages.
Translate the following text into **${languageNames[targetLang]} (${targetLang})**.
Maintain tone, emotion, and meaning precisely.
If the text is in Devanagari script (like Hindi or Marathi), ensure it uses correct vocabulary for ${languageNames[targetLang]}.
Output only the translated text, no explanations or comments.

Text:
"""${text}"""
`;

    // 🧠 Gemini translation attempt
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const translatedText =
      response.output_text?.trim() ||
      response.text?.trim() ||
      response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "";

    if (!translatedText) throw new Error("Empty translation from Gemini");

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

    if (error.message.includes("RESOURCE_EXHAUSTED")) {
      console.warn("⚠️ Gemini quota exceeded — switching to fallback translator...");
    }

    // ✅ FALLBACK: Google Translate API
    try {
      if (!translateFn || typeof translateFn !== "function") {
        throw new Error("translateFn not callable (fallback unavailable)");
      }

      console.log(`🔄 Using fallback translator for ${targetLang}...`);
      const fallback = await translateFn(text, { to: targetLang });

      const result = {
        success: true,
        translatedText: fallback.text,
        targetLang,
        model: "fallback-google-translate",
        source: "Fallback Translator",
      };

      translationCache.set(`${targetLang}:${text.slice(0, 200)}`, result);
      console.log("✅ Fallback translation successful");
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
