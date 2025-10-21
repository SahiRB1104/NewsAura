import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // ✅ Handle Email Registration
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // ✅ Update Firebase profile with username
      await updateProfile(user, { displayName: formData.username });

      localStorage.setItem("isLoggedIn", "true");

      toast.success(`🎉 Welcome, ${formData.username}!`, {
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: 500,
        },
      });

      // Short delay for toast to appear before redirect
      setTimeout(() => navigate("/category/top"), 1200);
    } catch (err: any) {
      toast.error("⚠️ Registration failed. Please try again.", {
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: 500,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Google Signup
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      localStorage.setItem("isLoggedIn", "true");

      toast.success(`🎉 Welcome, ${user.displayName || "User"}!`, {
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: 500,
        },
      });

      setTimeout(() => navigate("/category/top"), 1200);
    } catch (err: any) {
      toast.error("⚠️ Google Sign-up failed. Please try again.", {
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: 500,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const redirectToLogin = () => navigate("/login");

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-white to-green-50">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-opacity-100 backdrop-blur-xl border border-white/30 rounded-2xl p-8 w-[400px] shadow-lg">
        <h1 className="text-center text-2xl font-semibold text-white mb-6">
          Register
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="username"
            type="text"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-green-400 outline-none bg-white/90 text-gray-700 placeholder-gray-400 transition"
          />
          <input
            id="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-green-400 outline-none bg-white/90 text-gray-700 placeholder-gray-400 transition"
          />

          {/* ✅ Password Input with Show/Hide */}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-900"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-white text-green-700 font-semibold py-3 rounded-lg transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-300"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-1 border-white/50" />
          <span className="px-2 text-white text-sm">or</span>
          <hr className="flex-1 border-white/50" />
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-white text-green-700 font-semibold py-3 rounded-lg flex items-center justify-center hover:bg-green-100 transition"
        >
          <FaGoogle className="mr-2" /> Sign up with Google
        </button>

        <button
          onClick={redirectToLogin}
          className="w-full mt-4 bg-green-200 bg-opacity-40 border border-green-600 text-green-900 font-medium py-3 rounded-lg hover:bg-green-100 transition"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default Register;
