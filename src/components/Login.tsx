import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      localStorage.setItem("isLoggedIn", "true");

      toast.success(`✅ Welcome back, ${user.displayName || "User"} 👋`, {
        style: { background: "#10B981", color: "#fff", fontWeight: 500 },
      });

      setTimeout(() => navigate("/category/top"), 1200);
    } catch (err: any) {
      toast.error("⚠️ Invalid credentials. Try again.", {
        style: { background: "#F87171", color: "#fff", fontWeight: 500 },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("isLoggedIn", "true");

      toast.success(`✅ Logged in as ${user.displayName || "Google User"}!`, {
        style: { background: "#10B981", color: "#fff", fontWeight: 500 },
      });

      setTimeout(() => navigate("/category/top"), 1200);
    } catch (err: any) {
      toast.error("⚠️ Google login failed. Please try again.", {
        style: { background: "#F87171", color: "#fff", fontWeight: 500 },
      });
    } finally {
      setLoading(false);
    }
  };

  const redirectToRegister = () => navigate("/register");

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-white to-green-50">
      <div className="bg-green-600 bg-opacity-100 backdrop-blur-xl border border-white/30 rounded-2xl p-8 w-[400px] shadow-xl">
        <h1 className="text-center text-3xl font-bold text-white mb-8 tracking-wide">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-green-400 outline-none bg-white/90 text-gray-700 placeholder-gray-400 transition"
          />

          {/* ✅ Password Field with Toggle */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full p-3 pr-10 rounded-lg border-none focus:ring-2 focus:ring-green-400 outline-none bg-white/90 text-gray-700 placeholder-gray-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-900 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* ✅ Forgot Password (Aligned & Subtle) */}
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-white/90 hover:text-white underline-offset-2 hover:underline transition"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-white text-green-700 font-semibold py-3 rounded-lg shadow-md transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-300"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-1 border-white/50" />
          <span className="px-3 text-white text-sm">or</span>
          <hr className="flex-1 border-white/50" />
        </div>

        {/* ✅ Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-green-700 font-semibold py-3 rounded-lg flex items-center justify-center shadow-md hover:bg-green-100 transition"
        >
          <FaGoogle className="mr-2" /> Login with Google
        </button>

        {/* ✅ Register Redirect */}
        <button
          onClick={redirectToRegister}
          className="w-full mt-5 bg-green-200 bg-opacity-40 border border-green-600 text-green-900 font-medium py-3 rounded-lg hover:bg-green-100 transition"
        >
          Don’t have an account? Register
        </button>
      </div>
    </div>
  );
};

export default Login;
