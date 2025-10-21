import express from "express";
import { GoogleGenAI } from "@google/genai";
import NodeCache from "node-cache";
import gTTS from "gtts";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🕒 File cache for 30 minutes (1800 seconds)
const ttsCache = new NodeCache({ stdTTL: 1800, checkperiod: 60 }); 

// 🎧 Directory for saved MP3s
const TMP_DIR = path.resolve("./tmp_tts");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// 🧹 Delete expired files automatically
ttsCache.on("del", (key, fileName) => {
  const filePath = path.join(TMP_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (!err) console.log(`🗑️ Deleted expired TTS file: ${fileName}`);
    });
  }
});

function extractBase64(raw) {
  if (!raw) return null;
  const cleaned = raw
    .replace(/```(?:json|base64)?/g, "")
    .replace(/```/g, "")
    .replace(/[^\w+/=]/g, "")
    .trim();
  return cleaned.length > 100 ? cleaned : null;
}

function safeFileName(text, lang) {
  return crypto.createHash("md5").update(`${lang}:${text}`).digest("hex") + ".mp3";
}

// 🎤 Generate or return TTS
router.post("/tts", async (req, res) => {
  const { text, language = "en" } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const cacheKey = `${language}:${text.slice(0, 200)}`;
  const fileName = safeFileName(text, language);
  const filePath = path.join(TMP_DIR, fileName);

  // ✅ Return cached file if exists
  if (fs.existsSync(filePath)) {
    console.log("🎧 Using cached TTS:", fileName);
    ttsCache.set(cacheKey, fileName); // refresh TTL
    return res.json({ success: true, url: `/tts/${fileName}`, cached: true });
  }

  try {
    console.log(`🎙️ Generating new TTS for [${language}]...`);

    const prompt = `
      Convert the text below into an MP3 voice audio encoded in base64 (no headers, no explanation).
      Text in ${language}:
      """${text}"""
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw =
      response.output_text ||
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    const base64 = extractBase64(raw);
    if (base64) {
      const buffer = Buffer.from(base64, "base64");
      if (buffer.length > 1000) {
        fs.writeFileSync(filePath, buffer);
        ttsCache.set(cacheKey, fileName);
        console.log(`✅ Saved Gemini TTS: ${fileName}`);
        return res.json({ success: true, url: `/tts/${fileName}`, cached: false });
      }
    }

    throw new Error("Gemini returned invalid audio");
  } catch (err) {
    console.warn("⚠️ Gemini TTS failed:", err.message);
    console.log("➡️ Falling back to gTTS...");

    try {
      const gtts = new gTTS(text, language);
      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        gtts.stream()
          .on("error", reject)
          .pipe(writeStream)
          .on("finish", resolve)
          .on("error", reject);
      });

      console.log(`✅ gTTS fallback saved: ${fileName}`);
      ttsCache.set(cacheKey, fileName);
      return res.json({ success: true, url: `/tts/${fileName}`, cached: false });
    } catch (fallbackErr) {
      console.error("❌ Final TTS Failure:", fallbackErr);
      return res.status(500).json({ error: "Failed to generate TTS" });
    }
  }
});

export default router;
