import express from "express";
import { GoogleGenAI } from "@google/genai";
import NodeCache from "node-cache";
import Sentiment from "sentiment";

const router = express.Router();

// ✅ Gemini Client Setup (new SDK)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ✅ Cache (1 hour)
const sentimentCache = new NodeCache({ stdTTL: 3600 });

// ✅ Local fallback analyzer (free npm package)
const localSentiment = new Sentiment();

/**
 * @route POST /api/sentiment
 * @desc Analyze sentiment using Gemini (fallback to local on error)
 */
router.post("/", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // ✅ Check cache
    const cacheKey = content.slice(0, 100);
    const cached = sentimentCache.get(cacheKey);
    if (cached) {
      console.log("✅ Returning cached sentiment");
      return res.json(cached);
    }

    console.log("🤖 Using Gemini API for sentiment...");

    // ✅ Create prompt
    const prompt = `
      Analyze the sentiment of the following text and return JSON only:
      {
        "sentiment": "Positive" | "Negative" | "Neutral",
        "score": number between -1 and 1
      }

      Text: """${content}"""
    `;

    // ✅ Generate with Gemini (new SDK syntax)
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // ✅ Correct model name for google/genai
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // ✅ Extract and clean model output
    const rawText = response.output_text || response.text || "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const sentimentData = JSON.parse(cleaned);

    // ✅ Cache the result
    sentimentCache.set(cacheKey, sentimentData);
    res.json(sentimentData);
  } catch (error) {
    console.error("❌ Error in sentiment analysis route:", error);

    // ✅ Fallback when Gemini quota exceeded
    if (error.status === 429 || error.message?.includes("Quota")) {
      console.warn("⚠️ Gemini quota exceeded, using fallback sentiment...");

      const { content } = req.body;
      const fallback = localSentiment.analyze(content);
      const result = {
        sentiment:
          fallback.score > 0
            ? "Positive"
            : fallback.score < 0
            ? "Negative"
            : "Neutral",
        score: fallback.score / 10,
      };

      sentimentCache.set(content.slice(0, 100), result);
      return res.json(result);
    }

    // ✅ Generic fallback
    const { content } = req.body;
    const fallback = localSentiment.analyze(content);
    const result = {
      sentiment:
        fallback.score > 0
          ? "Positive"
          : fallback.score < 0
          ? "Negative"
          : "Neutral",
      score: fallback.score / 10,
    };

    sentimentCache.set(content.slice(0, 100), result);
    res.json(result);
  }
});

export default router;
