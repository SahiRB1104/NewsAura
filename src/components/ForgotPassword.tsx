import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("📧 Password reset email sent! Check your inbox to continue.", {
        style: { background: "#10B981", color: "#fff", fontWeight: 500 },
      });

      // Delay redirect so toast can show
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      toast.error("⚠️ Failed to send reset email. Try again.", {
        style: { background: "#EF4444", color: "#fff", fontWeight: 500 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-white to-green-50">
      <div className="bg-green-600 bg-opacity-100 backdrop-blur-xl border border-white/30 rounded-2xl p-8 w-[400px] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">

        <h1 className="text-center text-2xl font-semibold text-white mb-3">
          Forgot Password
        </h1>
        <p className="text-center text-white text-sm mb-6 opacity-90">
          Enter your registered email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-green-400 outline-none bg-white/90 text-gray-700 placeholder-gray-400 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-white text-green-700 font-semibold py-3 rounded-lg transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-300"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate("/category/top")}
            className="flex items-center text-white hover:text-emerald-200 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to News
          </button>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center text-white hover:text-emerald-200 transition"
          >
            Back to Login
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
