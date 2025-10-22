import express from "express";
import NodeCache from "node-cache";
import gTTS from "gtts";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 🗂️ Temp folder
const TMP_DIR = path.resolve("./tmp_tts");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// 🕒 Cache 4 hours
const ttsCache = new NodeCache({ stdTTL: 14400, checkperiod: 600 });
ttsCache.on("del", (k, f) => {
  const file = path.join(TMP_DIR, f);
  if (fs.existsSync(file)) fs.unlink(file, () => console.log(`🗑️ Deleted ${f}`));
});

const gttsSupported = ["hi", "bn", "gu", "kn", "ml", "ta", "te", "en"];

// 🔊 AWS Polly setup
const polly = new PollyClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Marathi / Punjabi voice mapping
const pollyVoiceMap = {
  mr: { LanguageCode: "hi-IN", VoiceId: "Aditi" }, // Marathi not native, Hindi voice fallback
  pa: { LanguageCode: "pa-IN", VoiceId: "Kajal" }, // Punjabi voice
};

function safeFileName(text, lang) {
  return crypto.createHash("md5").update(`${lang}:${text}`).digest("hex") + ".mp3";
}

async function generatePollyTTS(text, lang, filePath) {
  const config = pollyVoiceMap[lang];
  if (!config) throw new Error(`No Polly config for ${lang}`);

  console.log(`🎧 Using Amazon Polly for [${lang}]...`);
  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: text,
    VoiceId: config.VoiceId,
    LanguageCode: config.LanguageCode,
  });

  const { AudioStream } = await polly.send(command);
  if (!AudioStream) throw new Error("No audio from Polly");

  const buffer = Buffer.from(await AudioStream.transformToByteArray());
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Polly TTS generated for [${lang}]`);
}

// 🧩 Main route
router.post("/", async (req, res) => {
  const { text, language = "en" } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const fileName = safeFileName(text, language);
  const filePath = path.join(TMP_DIR, fileName);

  // 🧠 Cached?
  if (fs.existsSync(filePath)) {
    ttsCache.set(fileName, fileName);
    return res.json({ success: true, url: `/tts/${fileName}`, cached: true });
  }

  try {
    console.log(`🎙️ Generating new TTS for [${language}]...`);

    if (gttsSupported.includes(language)) {
      // 🟢 gTTS default
      const gtts = new gTTS(text, language);
      await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(filePath);
        gtts
          .stream()
          .on("error", reject)
          .pipe(ws)
          .on("finish", resolve)
          .on("error", reject);
      });
      console.log(`✅ gTTS saved: ${fileName}`);
    } else if (["mr", "pa"].includes(language)) {
      // 🟣 Polly fallback
      await generatePollyTTS(text, language, filePath);
    } else {
      throw new Error(`Language '${language}' not supported`);
    }

    ttsCache.set(fileName, fileName);
    res.json({ success: true, url: `/tts/${fileName}` });
  } catch (err) {
    console.error("❌ Final TTS failure:", err.message);
    res.status(500).json({ error: "TTS generation failed", details: err.message });
  }
});

export default router;
