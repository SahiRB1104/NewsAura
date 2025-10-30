import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Tag,
  ExternalLink,
  FileText,
  Share2,
  Bookmark,
  BookmarkCheck,
  X,
} from "lucide-react";
import axios from "axios";
import { getAuth } from "firebase/auth";
const auth = getAuth();
// import { useAuth } from "../context/AuthContext"; // Uncomment if you have auth context

const categoryColors = {
  top: "bg-gradient-to-r from-blue-500 to-purple-500",
  business: "bg-gradient-to-r from-emerald-500 to-teal-500",
  entertainment: "bg-gradient-to-r from-pink-500 to-rose-500",
  health: "bg-gradient-to-r from-green-500 to-emerald-500",
  sports: "bg-gradient-to-r from-orange-500 to-red-500",
  technology: "bg-gradient-to-r from-indigo-500 to-blue-500",
};

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    sourceUrl: string;
    source: string;
    category: string;
    pubDate: string;
  };
}

interface SentimentData {
  sentiment: "Positive" | "Negative" | "Neutral";
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const navigate = useNavigate();
  const formattedDate = new Date(article.pubDate).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loadingSentiment, setLoadingSentiment] = useState(true);
  const [errorSentiment, setErrorSentiment] = useState<string | null>(null);

  const [showShare, setShowShare] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  // const { user } = useAuth(); // If you have auth

  // ✅ Generate concise summary (~40 words)
  const generateSummary = (title: string, description?: string) => {
    const text = description && description.trim() !== "" ? description : title;
    const words = text.trim().split(/\s+/);
    return words.length > 40 ? words.slice(0, 40).join(" ") + "..." : words.join(" ");
  };
  const shortSummary = generateSummary(article.title, article.description);

  // ✅ Fetch sentiment
  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoadingSentiment(true);
        const response = await axios.post(`${API_BASE_URL}/sentiment`, {
          content: article.description || article.title,
        });
        setSentiment(response.data);
        setErrorSentiment(null);
      } catch (err) {
        console.error("Error fetching sentiment:", err);
        setErrorSentiment("Failed to fetch sentiment");
      } finally {
        setLoadingSentiment(false);
      }
    };
    fetchSentiment();
  }, [article.id]);

  // ✅ Display sentiment label
  const getSentimentDisplay = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <span className="text-green-600 font-semibold">😊 Positive</span>;
      case "Negative":
        return <span className="text-red-600 font-semibold">😞 Negative</span>;
      default:
        return <span className="text-gray-600 font-semibold">😐 Neutral</span>;
    }
  };

  // 🔖 Bookmark handler
  const handleBookmark = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to save articles!");
    return;
  }

  try {
    await axios.post(`${API_BASE_URL}/bookmarks`, {
      userId: user.uid,
      username: user.displayName || user.email, // 👤 store name or email
      article,
    });
    setBookmarked(true);
  } catch (err) {
    console.error("Bookmark error:", err);
  }
};

  // 📤 Share logic
  const message = `${article.title}\n\n${shortSummary}\n\nRead more: ${article.sourceUrl}`;

  const shareLinks = [
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      color: "bg-green-500",
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        article.sourceUrl
      )}&quote=${encodeURIComponent(article.title + " — " + shortSummary)}`,
      color: "bg-blue-600",
    },
    {
      name: "Instagram",
      url: `https://www.instagram.com/?url=${encodeURIComponent(article.sourceUrl)}`,
      color: "bg-pink-500",
    },
    {
      name: "Twitter/X",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${article.title}\n${shortSummary}\n${article.sourceUrl}`
      )}`,
      color: "bg-black",
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `${shortSummary}\n\nRead more: ${article.sourceUrl}`,
          url: article.sourceUrl,
        });
      } catch (err) {
        console.error("Share cancelled or failed", err);
      }
    } else {
      setShowShare(!showShare);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-[500px] flex flex-col">
      {/* 🖼 Image + category/date */}
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 h-[180px] overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 bg-black/50 rounded-full px-2 py-1 backdrop-blur-sm">
            <Calendar className="h-3 w-3 text-white" />
            <span className="text-xs text-white">{formattedDate}</span>
          </div>
          <div
            className={`${
              categoryColors[article.category as keyof typeof categoryColors]
            } rounded-full px-2 py-1 backdrop-blur-sm`}
          >
            <span className="text-xs font-medium text-white capitalize">
              {article.category}
            </span>
          </div>
        </div>
      </div>

      {/* 📄 Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="text-lg font-bold mb-2 line-clamp-2">{article.title}</h2>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">{shortSummary}</p>

        {/* 😊 Sentiment Display */}
        <div className="text-sm mb-3">
          {loadingSentiment ? (
            <span className="text-gray-400 italic">Analyzing sentiment...</span>
          ) : errorSentiment ? (
            <span className="text-red-500">{errorSentiment}</span>
          ) : sentiment ? (
            getSentimentDisplay(sentiment.sentiment)
          ) : (
            <span className="text-gray-500">No sentiment available</span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="inline-flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            {article.source}
          </span>
        </div>

        {/* 🔗 Buttons */}
        <div className="flex justify-between items-center gap-2">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 text-sm"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Read More
          </a>

          <button
            onClick={() =>
              navigate(`/summary/${article.id}`, {
                state: { category: article.category },
              })
            }
            className="flex-1 flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 text-sm"
          >
            <FileText className="h-3 w-3 mr-1" />
            Summarize
          </button>

          {/* 🔖 Bookmark */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg border ${
              bookmarked ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-700"
            } hover:scale-105 transition`}
            title="Save for later"
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>

          {/* 📤 Share */}
          <div className="relative">
            <button
              onClick={handleNativeShare}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:scale-105 transition"
              title="Share article"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {showShare && (
              <div className="absolute right-0 mt-2 bg-white shadow-md rounded-lg p-2 flex gap-2 z-20">
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${link.color} text-white px-2 py-1 rounded-md text-xs hover:opacity-90`}
                  >
                    {link.name}
                  </a>
                ))}
                <button onClick={() => setShowShare(false)}>
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
