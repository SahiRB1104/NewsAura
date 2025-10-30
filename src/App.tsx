
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SummaryPage from "./pages/SummaryPage";
import Register from "./components/Register";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./components/ForgotPassword";
import Feedback from "./pages/Feedback";


function AppContent() {
  const location = useLocation();

  // ✅ Hide Navbar on Login and Register pages
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      {/* Show Navbar only when user is logged in */}
      {!hideNavbar && <Navbar />}

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
                <HomePage />
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

          {/* ✅ Add the Profile route here */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
           <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Feedback />
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
