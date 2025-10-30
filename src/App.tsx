import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SummaryPage from "./pages/SummaryPage";
import Register from "./components/Register";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./components/ForgotPassword";
import Feedback from "./pages/Feedback";
import MyBookmarks from "./pages/myBookmarks";
import MyReadLater from "./pages/MyReadLater";

function AppContent() {
  const location = useLocation();

  // 🧠 Add a refresh trigger counter
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🔄 Called when Navbar’s Refresh button is clicked
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // ✅ Hide Navbar on Login and Register pages
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      {/* ✅ Show Navbar only when user is logged in */}
      {!hideNavbar && <Navbar onRefresh={handleRefresh} />}

      <main className={`container mx-auto py-6 ${hideNavbar ? "pt-0" : ""}`}>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/category/:category"
            element={
              <ProtectedRoute>
                {/* 🧩 Pass refreshTrigger down to HomePage */}
                <HomePage refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/summary/:id"
            element={
              <ProtectedRoute>
                <SummaryPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ✅ Feedback */}
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            }
          />

          {/* ✅ Bookmarks */}
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <MyBookmarks />
              </ProtectedRoute>
            }
          />

          {/* ✅ Read Later */}
          <Route
            path="/readLater"
            element={
              <ProtectedRoute>
                <MyReadLater />
              </ProtectedRoute>
            }
          />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

export default App;
