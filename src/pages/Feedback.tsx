// src/pages/Feedback.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import toast from "react-hot-toast";

const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error("⚠️ Please enter your feedback first.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.displayName || "Anonymous",
          email: user?.email || "Not provided",
          feedback,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");

      setFeedback("");
      setSubmitted(true);
      toast.success("✅ Feedback submitted successfully!");
      setTimeout(() => setSubmitted(false), 2000);
    } catch (err) {
      toast.error("⚠️ Failed to send feedback. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-white to-green-50 px-6 relative">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 w-[420px] shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 text-center text-white">

        <div className="flex flex-col items-center mb-6">
          <MessageSquare className="h-20 w-20 text-white drop-shadow-md" />
          <h2 className="mt-4 text-2xl font-bold text-white">Feedback</h2>
          <p className="text-emerald-100 text-sm">
            Share your thoughts about NewsAura!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write your feedback..."
            className="w-full h-32 p-3 rounded-lg border-none bg-white/90 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none transition resize-none"
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 bg-white text-green-700 font-semibold py-3 rounded-lg flex justify-center items-center gap-2 shadow-md transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-300"
            }`}
          >
            <Send className="h-5 w-5" />
            {loading ? "Sending..." : "Send Feedback"}
          </button>
        </form>

        {submitted && (
          <div className="mt-4 text-emerald-100 flex justify-center items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-5 w-5" />
            Feedback submitted!
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => navigate("/category/top")}
            className="flex items-center justify-center text-white hover:text-emerald-200 transition mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to News
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
