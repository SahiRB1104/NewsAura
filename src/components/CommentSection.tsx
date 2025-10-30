import { useEffect, useState, useRef } from "react";
import {
  Send,
  MessageCircle,
  Trash2,
  Heart,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface CommentSectionProps {
  articleId: string;
  articleTitle?: string;
}

interface Comment {
  _id: string;
  text: string;
  user: string;
  email: string;
  createdAt: string;
  likes?: number;
  replies?: Comment[];
}

const CommentSection = ({ articleId, articleTitle }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  // 🔄 For dragging
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  // 👤 Track logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 💬 Fetch comments
  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/comments/${articleId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
  }, [open]);

  // 📝 Submit new comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return toast.error("Enter a comment");

    try {
      await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          articleTitle,
          user: user?.displayName || "Anonymous",
          email: user?.email || "Unknown",
          text: commentText,
        }),
      });
      setCommentText("");
      toast.success("Comment added!");
      fetchComments();
    } catch {
      toast.error("Failed to post comment");
    }
  };

  // 💬 Submit reply
  const handleReplySubmit = async (commentId: string) => {
    if (!replyText.trim()) return toast.error("Enter a reply");

    try {
      await fetch(`http://localhost:3000/api/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user?.displayName || "Anonymous",
          email: user?.email || "Unknown",
          text: replyText,
        }),
      });
      setReplyText("");
      setReplyTo(null);
      toast.success("Reply added!");
      fetchComments();
    } catch {
      toast.error("Failed to post reply");
    }
  };

  // ❤️ Like comment
  const handleLike = async (commentId: string) => {
    try {
      await fetch(`http://localhost:3000/api/comments/${commentId}/like`, {
        method: "POST",
      });
      fetchComments();
    } catch {
      toast.error("Failed to like comment");
    }
  };

  // ❌ Delete comment
  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: "DELETE",
      });
      toast.success("Comment deleted!");
      fetchComments();
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  // 🖱️ Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    setDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <>
      {/* 💬 Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-xl z-50 transition-all duration-200"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* 🪟 Floating Chat Card */}
      <div
        ref={cardRef}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        className={`fixed bottom-20 right-6 w-[90%] sm:w-[380px] bg-white shadow-2xl border border-gray-200 rounded-2xl transition-all duration-300 ease-in-out z-40 flex flex-col overflow-hidden cursor-move ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold p-3 rounded-t-2xl cursor-grab">
          <span>Comments</span>
          <button onClick={() => setOpen(false)} className="text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[350px]">
          {comments.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-4">
              No comments yet
            </p>
          )}
          {comments.map((c) => (
            <div
              key={c._id}
              className="bg-gray-50 rounded-lg p-2 border border-gray-200"
            >
              <div className="flex justify-between">
                <p className="text-sm text-gray-800">{c.text}</p>
                {user?.email === c.email && (
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                — {c.user} • {new Date(c.createdAt).toLocaleString()}
              </p>

              <div className="flex gap-3 mt-2 text-sm text-gray-600">
                <button
                  onClick={() => handleLike(c._id)}
                  className="flex items-center gap-1 hover:text-emerald-600"
                >
                  <Heart className="h-4 w-4" /> {c.likes || 0}
                </button>
                <button
                  onClick={() =>
                    setReplyTo(replyTo === c._id ? null : c._id)
                  }
                  className="hover:text-emerald-600"
                >
                  Reply
                </button>
              </div>

              {replyTo === c._id && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 text-sm border rounded-lg px-2 py-1"
                  />
                  <button
                    onClick={() => handleReplySubmit(c._id)}
                    className="px-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
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
    </>
  );
};

export default CommentSection;
