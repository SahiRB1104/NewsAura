import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { Trash2, Loader2, Calendar, ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const MyBookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  // 📦 Fetch user's bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/bookmarks/${user.uid}`);
        setBookmarks(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  // ❌ Delete bookmark
  const handleDelete = async (articleId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/bookmarks/${user?.uid}/${articleId}`);
      setBookmarks((prev) =>
        prev.filter((item) => item.article.id !== articleId)
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // 📄 Redirect to summary page
  const handleSummarize = (article: any) => {
    navigate(`/summary/${article.id}`, {
      state: { category: article.category },
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading bookmarks...
      </div>
    );

  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 🔙 Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-blue-600 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>

      {/* 🧩 Page Title */}
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        📚 My Bookmarks
      </h1>

      {/* 📰 Bookmark Grid */}
      {bookmarks.length === 0 ? (
        <p className="text-center text-gray-500">No bookmarks yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookmarks.map((item) => (
            <div
              key={item.article.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <img
                src={item.article.imageUrl}
                alt={item.article.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h2 className="font-semibold text-lg line-clamp-2 mb-2">
                  {item.article.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                  {item.article.description}
                </p>

                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded-md">
                    {item.article.category}
                  </span>
                  <span className="inline-flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(item.article.pubDate).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  Saved by:{" "}
                  <span className="font-medium">{item.username}</span>
                </p>

                {/* 🔗 Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleSummarize(item.article)}
                    className="flex items-center text-green-600 hover:text-green-700 text-sm"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Summarize
                  </button>

                  <button
                    onClick={() => handleDelete(item.article.id)}
                    className="text-red-500 hover:text-red-600 text-sm flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookmarks;
