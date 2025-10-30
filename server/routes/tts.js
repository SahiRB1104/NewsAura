// ✅ FINAL HYBRID TTS ROUTE (Polly + gTTS)
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

// 🗂️ Temporary directory
const TMP_DIR = path.resolve("./tmp_tts");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// 🕒 Cache + auto-delete every 4 hours
const ttsCache = new NodeCache({ stdTTL: 14400, checkperiod: 600 });
ttsCache.on("del", (k, f) => {
  const file = path.join(TMP_DIR, f);
  if (fs.existsSync(file))
    fs.unlink(file, () => console.log(`🗑️ Deleted expired TTS: ${f}`));
});

// ⚙️ AWS Polly client (for Hindi + English)
const polly = new PollyClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 🎤 Polly voices
const pollyVoiceMap = {
  hi: { LanguageCode: "hi-IN", VoiceId: "Aditi" }, // Hindi
  en: { LanguageCode: "en-IN", VoiceId: "Raveena" } // English-India
};

// 🧩 gTTS supported languages
const gttsSupported = [
  "bn","gu","kn","ta","te","ur",
  "fr","de","es","it","ja","ko","zh-CN","ru","ar"
];

function safeFileName(text, lang) {
  return crypto.createHash("md5").update(`${lang}:${text}`).digest("hex") + ".mp3";
}

// 🎙️ Main TTS endpoint
router.post("/", async (req, res) => {
  const { text, language = "en" } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const fileName = safeFileName(text, language);
  const filePath = path.join(TMP_DIR, fileName);

  // ⚡ Cached version
  if (fs.existsSync(filePath)) {
    ttsCache.set(fileName, fileName);
    return res.json({ success: true, url: `/tts/${fileName}`, cached: true });
  }

  try {
    console.log(`🎙️ Generating TTS for [${language}]...`);

    // 🟣 Use Polly for English + Hindi
    if (pollyVoiceMap[language]) {
      console.log(`🎧 Using Amazon Polly for [${language}]`);
      const cfg = pollyVoiceMap[language];
      const command = new SynthesizeSpeechCommand({
        OutputFormat: "mp3",
        Text: text,
        VoiceId: cfg.VoiceId,
        LanguageCode: cfg.LanguageCode,
      });
      const { AudioStream } = await polly.send(command);
      if (!AudioStream) throw new Error("No audio from Polly");
      const buf = Buffer.from(await AudioStream.transformToByteArray());
      fs.writeFileSync(filePath, buf);
      console.log(`✅ Polly TTS saved: ${fileName}`);
    }

    // 🟢 Use gTTS for all other supported languages
    else if (gttsSupported.includes(language)) {
      console.log(`🎧 Using gTTS for [${language}]`);
      const gtts = new gTTS(text, language);
      await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(filePath);
        gtts.stream().on("error", reject).pipe(ws).on("finish", resolve);
      });
      console.log(`✅ gTTS saved: ${fileName}`);
    }

    else {
      throw new Error(`Language '${language}' not supported`);
    }

    ttsCache.set(fileName, fileName);
    res.json({ success: true, url: `/tts/${fileName}` });
  } catch (err) {
    console.error("❌ TTS error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
