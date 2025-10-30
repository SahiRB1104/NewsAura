import { useState, useRef, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Square,
  Volume2,
  Loader2,
  Send,
} from "lucide-react";
import { useArticleSummary } from "../hooks/useArticleSummary";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

const categoryColors = {
  top: "from-blue-500 to-purple-500",
  business: "from-emerald-500 to-teal-500",
  entertainment: "from-pink-500 to-rose-500",
  health: "from-green-500 to-emerald-500",
  sports: "from-orange-500 to-red-500",
  technology: "from-indigo-500 to-blue-500",
};

// 🌍 Supported Languages
const supportedLanguages: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  gu: "Gujarati",
  kn: "Kannada",
  ta: "Tamil",
  te: "Telugu",
  ur: "Urdu",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Chinese (Simplified)",
  ru: "Russian",
  ar: "Arabic",
};

const supportedTtsLanguages = Object.keys(supportedLanguages);

// 🕒 Helper to format seconds → mm:ss
const formatTime = (sec: number) => {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SummaryPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { summary, loading, error, article } = useArticleSummary(id!);

  const category = location.state?.category || "top";
  const gradientColor = categoryColors[category as keyof typeof categoryColors];

  const [language, setLanguage] = useState("en");
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  // 🔊 Audio states
  const [speaking, setSpeaking] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const isTtsSupported = supportedTtsLanguages.includes(language);

  // 💬 Comments
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState<any>(null);

  // 📊 Word count
  const wordCount = (translatedSummary || summary?.content || "")
    .split(/\s+/)
    .filter(Boolean).length;

  // 🧠 Translate API
  const translateText = async (text: string, lang: string) => {
    try {
      setTranslating(true);
      const res = await fetch("http://localhost:3000/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Translate API error");
      setTranslatedSummary(data.translatedText || text);
    } catch (err) {
      console.error("Translation failed:", err);
      setTranslatedSummary(text);
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    if (summary?.content) {
      if (language === "en") setTranslatedSummary(summary.content);
      else translateText(summary.content, language);
    }
  }, [summary, language]);

  // 🔄 Language switch stops + restarts
  useEffect(() => {
    if (speaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSpeaking(false);
      setTimeout(() => handleSpeak(), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // 🎤 Generate TTS
  const handleSpeak = async () => {
    const textToSpeak = translatedSummary || summary?.content;
    if (!textToSpeak || !isTtsSupported) return console.log("TTS not supported");

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setTtsLoading(true);
      setSpeaking(true);

      const res = await fetch("http://localhost:3000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, language }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "TTS failed");

      const fileUrl = data.url.startsWith("http")
        ? data.url
        : `http://localhost:3000${data.url}`;
      const audioResp = await fetch(fileUrl);
      if (!audioResp.ok) throw new Error("Failed to load TTS audio");

      const blob = await audioResp.blob();
      if (audioObjectUrlRef.current) URL.revokeObjectURL(audioObjectUrlRef.current);
      const objectUrl = URL.createObjectURL(blob);
      audioObjectUrlRef.current = objectUrl;

      if (audioRef.current) {
        audioRef.current.src = objectUrl;
        audioRef.current.load();
        audioRef.current.oncanplaythrough = () => {
          audioRef.current?.play();
          setSpeaking(true);
        };
      }
    } catch (err) {
      console.error("TTS error:", err);
      setSpeaking(false);
    } finally {
      setTtsLoading(false);
    }
  };

  // ⏸️ Pause / Resume
  const handleStop = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setSpeaking(true);
    } else {
      audioRef.current.pause();
      setSpeaking(false);
    }
  };

  // 👤 User session
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 💬 Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(`http://localhost:3000/api/comments/${id}`);
      const data = await res.json();
      setComments(data);
    };
    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return toast.error("Enter a comment");

    try {
      await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: id,
          articleTitle: summary?.title,
          user: user?.displayName || "Anonymous",
          email: user?.email || "Unknown",
          text: commentText,
        }),
      });
      setCommentText("");
      toast.success("Comment added!");
      const res = await fetch(`http://localhost:3000/api/comments/${id}`);
      setComments(await res.json());
    } catch {
      toast.error("Failed to post comment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 flex">
      {/* ---------- MAIN SUMMARY SECTION ---------- */}
      <div className="max-w-3xl mx-auto px-4 flex-1">
        <Link
          to={`/category/${category}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md mr-2 transform group-hover:-translate-x-1 transition-transform duration-200">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="font-medium">
            Back to {category.charAt(0).toUpperCase() + category.slice(1)} Articles
          </span>
        </Link>

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
            <p className="mt-4 text-gray-600">Generating summary...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h3 className="text-red-800 font-medium">Error loading summary</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {summary && (
          <div className="transform transition-all duration-500 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${gradientColor} p-8`}>
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-white opacity-75" />
                  <h1 className="ml-3 text-2xl font-bold text-white">
                    {summary.title}
                  </h1>
                </div>
              </div>

              <div className="p-6">
                {/* 🌍 Language Selector */}
                <div className="mb-6 flex flex-wrap gap-3 items-center">
                  <label className="font-medium text-gray-700">Translate to:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 border rounded-lg shadow bg-white text-gray-700 min-w-[180px]"
                  >
                    <optgroup label="🇮🇳 Indian Languages">
                      {["en", "hi", "bn", "gu", "kn", "ta", "te", "ur"].map((code) => (
                        <option key={code} value={code}>
                          {supportedLanguages[code]}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌐 Global Languages">
                      {["fr", "de", "es", "it", "ja", "ko", "zh-CN", "ru", "ar"].map(
                        (code) => (
                          <option key={code} value={code}>
                            {supportedLanguages[code]}
                          </option>
                        )
                      )}
                    </optgroup>
                  </select>
                  {translating && (
                    <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                  )}
                  <span className="text-sm text-gray-600 ml-4">
                    Words: <strong>{wordCount}</strong>
                  </span>
                </div>

                {/* 📝 Summary */}
                <div className="prose prose-lg max-w-none">
                  {(translatedSummary || summary.content)
                    .split("\n")
                    .map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed text-gray-800">
                        {paragraph}
                      </p>
                    ))}
                </div>

                {/* 🔊 TTS Controls */}
                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    {ttsLoading ? (
                      <button
                        disabled
                        className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg shadow cursor-not-allowed"
                      >
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSpeak}
                          disabled={!isTtsSupported || translating || ttsLoading}
                          className={`flex items-center px-4 py-2 rounded-lg shadow transition ${
                            isTtsSupported && !translating && !ttsLoading
                              ? "bg-indigo-500 text-white hover:bg-indigo-600"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          <Volume2 className="h-5 w-5 mr-2" />
                          Listen
                        </button>

                        <button
                          onClick={handleStop}
                          disabled={!audioRef.current}
                          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
                        >
                          <Square className="h-5 w-5 mr-2" />
                          {speaking ? "Pause" : "Resume"}
                        </button>
                      </>
                    )}
                  </div>

                  {/* 🎵 Audio Player Bar */}
                  <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <input
                      type="range"
                      min={0}
                      max={audioDuration || 0}
                      step={0.1}
                      value={audioProgress}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (audioRef.current) audioRef.current.currentTime = val;
                        setAudioProgress(val);
                      }}
                      className="w-full accent-indigo-500"
                    />
                    <div className="flex justify-between font-mono">
                      <span>{formatTime(audioProgress)}</span>
                      <span>{formatTime(audioDuration)}</span>
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    onTimeUpdate={() => {
                      if (audioRef.current)
                        setAudioProgress(audioRef.current.currentTime);
                    }}
                    onLoadedMetadata={() => {
                      if (audioRef.current)
                        setAudioDuration(audioRef.current.duration || 0);
                    }}
                    onEnded={() => {
                      setSpeaking(false);
                      setAudioProgress(0);
                    }}
                    controls={false}
                  />
                </div>

                {/* 🔗 Original Article */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  {article?.sourceUrl && (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Read Original Article
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------- COMMENT SECTION ---------- */}
      <div className="hidden md:flex fixed right-4 top-20 bottom-4 w-[360px] bg-white rounded-2xl shadow-xl border border-gray-200 flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold p-3">
          Comments
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {comments.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-4">
              No comments yet
            </p>
          )}
          {comments.map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <p className="text-sm text-gray-800">{c.text}</p>
              <p className="text-[11px] text-gray-500 mt-1">
                — {c.user} • {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleCommentSubmit}
          className="border-t border-gray-200 p-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
          />
          <button
            type="submit"
            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SummaryPage;
