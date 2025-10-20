import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink, Square, Volume2, Loader2 } from 'lucide-react';
import { useArticleSummary } from '../hooks/useArticleSummary';

const categoryColors = {
  top: 'from-blue-500 to-purple-500',
  business: 'from-emerald-500 to-teal-500',
  entertainment: 'from-pink-500 to-rose-500',
  health: 'from-green-500 to-emerald-500',
  sports: 'from-orange-500 to-red-500',
  technology: 'from-indigo-500 to-blue-500',
};

// 🌍 Supported languages
const supportedLanguages: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  
  fr: "French",
  es: "Spanish",
  de: "German",
  ja: "Japanese",
  zh: "Chinese",
};

const SummaryPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { summary, loading, error, article } = useArticleSummary(id!);

  const category = location.state?.category || 'top';
  const gradientColor = categoryColors[category as keyof typeof categoryColors];

  // 🌍 State for translation & TTS
  const [language, setLanguage] = useState("en");
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  // 🔊 TTS state
  const [speaking, setSpeaking] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 📝 Fetch translation from backend
  const translateText = async (text: string, lang: string) => {
    try {
      setTranslating(true);
      const res = await fetch("http://localhost:3000/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });

      const data = await res.json();
      setTranslatedSummary(data.translated || text);
    } catch (err) {
      console.error("Translation failed:", err);
      setTranslatedSummary(text);
    } finally {
      setTranslating(false);
    }
  };

  // 🔄 Auto-translate whenever language changes
  useEffect(() => {
    if (summary?.content) {
      if (language === "en") {
        setTranslatedSummary(summary.content);
      } else {
        translateText(summary.content, language);
      }
    }
  }, [summary, language]);

  // 🔊 Generate TTS
  const handleSpeak = async () => {
    const textToSpeak = translatedSummary || summary?.content;
    if (!textToSpeak) return;

    try {
      setTtsLoading(true);
      setSpeaking(true);

      const res = await fetch("http://localhost:3000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, language }),
      });

      if (!res.ok) throw new Error("Failed to generate audio");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setTtsLoading(false);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(err => {
          console.error("Audio playback failed:", err);
          setSpeaking(false);
        });
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setTtsLoading(false);
      setSpeaking(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
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
                  <h1 className="ml-3 text-2xl font-bold text-white">{summary.title}</h1>
                </div>
              </div>

              <div className="p-6">
                {/* 🌍 Language Selector */}
                <div className="mb-6 flex gap-3 items-center">
                  <label className="font-medium text-gray-700">Translate to:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 border rounded-lg shadow bg-white text-gray-700"
                  >
                    {Object.entries(supportedLanguages).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  {translating && <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />}
                </div>

                {/* 📝 Summary */}
                <div className="prose prose-lg max-w-none">
                  {(translatedSummary || summary.content)
                    .split('\n')
                    .map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                </div>

                {/* 🔊 TTS Controls */}
                <div className="mt-6 flex gap-4 items-center">
                  {ttsLoading ? (
                    <button
                      disabled
                      className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg shadow cursor-not-allowed"
                    >
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </button>
                  ) : !speaking ? (
                    <button
                      onClick={handleSpeak}
                      className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
                    >
                      <Volume2 className="h-5 w-5 mr-2" />
                      Listen
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Stop
                    </button>
                  )}
                </div>

                {/* 🎵 Hidden audio element */}
                <audio ref={audioRef} onEnded={() => setSpeaking(false)} />

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
    </div>
  );
};

export default SummaryPage;
