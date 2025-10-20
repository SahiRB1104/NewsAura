import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  UserCircle2,
  Save,
  LogOut,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

const Profile: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // ✅ Detect logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Update username
  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      await updateProfile(user, { displayName });
      toast.success("✅ Profile updated successfully!", {
        style: { background: "#10B981", color: "#fff", fontWeight: 500 },
      });
    } catch (error) {
      toast.error("⚠️ Error updating profile.", {
        style: { background: "#EF4444", color: "#fff", fontWeight: 500 },
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Handle Modal Confirmation
  const openModal = () => {
    if (!confirmUpdate) {
      toast.error("⚠️ Please confirm before updating your password.", {
        style: { background: "#F87171", color: "#fff", fontWeight: 500 },
      });
      return;
    }
    if (newPassword.trim().length < 6) {
      toast.error("⚠️ Password must be at least 6 characters long.", {
        style: { background: "#F87171", color: "#fff", fontWeight: 500 },
      });
      return;
    }
    setShowModal(true);
  };

  const confirmPasswordUpdate = async () => {
    if (!user) return;
    setShowModal(false);
    try {
      setIsChangingPassword(true);
      await updatePassword(user, newPassword);
      setNewPassword("");
      setConfirmUpdate(false);
      toast.success("🔒 Password updated successfully!", {
        style: { background: "#10B981", color: "#fff", fontWeight: 500 },
      });
    } catch (error) {
      toast.error("⚠️ Error updating password. Try re-login.", {
        style: { background: "#F87171", color: "#fff", fontWeight: 500 },
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("isLoggedIn");
    toast("👋 Logged out successfully!", {
      style: { background: "#FBBF24", color: "#000", fontWeight: 500 },
    });
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-white to-green-50 px-6 relative">
      <div className="bg-green-600 bg-opacity-100 backdrop-blur-xl border border-white/30 rounded-2xl p-8 w-[420px] shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300">

        {/* ✅ Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <UserCircle2 className="h-24 w-24 text-white drop-shadow-md" />
          <h2 className="mt-4 text-2xl font-bold text-white">
            {displayName || "Your Name"}
          </h2>
          <p className="text-emerald-100 text-sm">{user?.email}</p>
        </div>

        {/* ✅ Update Username */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-white mb-2">
            Username
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 rounded-lg border-none bg-white/90 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none transition"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full bg-white text-green-700 font-semibold py-3 rounded-lg flex justify-center items-center gap-2 shadow-md transition ${
            isSaving ? "opacity-60 cursor-not-allowed" : "hover:bg-green-300"
          }`}
        >
          <Save className="h-5 w-5" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        {/* ✅ Password Update Section */}
        <div className="mt-8">
          <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5" /> Change Password
          </h3>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-lg border-none bg-white/90 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-900"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <label className="flex items-center mt-3 text-white text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={confirmUpdate}
              onChange={(e) => setConfirmUpdate(e.target.checked)}
              className="mr-2 accent-green-600 cursor-pointer"
            />
            <ShieldCheck className="h-4 w-4 mr-1 text-white opacity-80" />
            I confirm I want to update my password
          </label>

          <button
            onClick={openModal}
            disabled={isChangingPassword || !confirmUpdate}
            className={`w-full mt-4 bg-white text-green-700 font-semibold py-3 rounded-lg flex justify-center items-center gap-2 shadow-md transition ${
              isChangingPassword || !confirmUpdate
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-green-300"
            }`}
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>

        {/* ✅ Navigation */}
        <div className="flex justify-between items-center mt-8 text-sm font-medium">
          <button
            onClick={() => navigate("/category/top")}
            className="flex items-center text-white hover:text-emerald-200 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to News
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center text-red-100 hover:text-red-300 transition"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>
      </div>

      {/* ✅ Custom Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md text-center relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Confirm Password Update
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to update your password? You’ll need to log
              in again after changing it.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmPasswordUpdate}
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2 transition"
              >
                <CheckCircle2 size={18} /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
