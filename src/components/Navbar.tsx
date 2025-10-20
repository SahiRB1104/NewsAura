import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Newspaper,
  Menu,
  X,
  UserCircle2,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import {
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const categories = [
  { id: "top" },
  { id: "business" },
  { id: "entertainment" },
  { id: "health" },
  { id: "sports" },
  { id: "technology" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  // ✅ Detect Firebase logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = currentUser?.displayName || "User";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <NavLink
            to="/category/top"
            className="flex items-center transform hover:scale-105 transition-transform duration-200"
          >
            <div className="relative flex items-center">
              <Newspaper className="h-8 w-8 text-white drop-shadow-md" />
              <div className="absolute -inset-1 bg-white opacity-25 rounded-full blur animate-pulse"></div>
            </div>
            <span className="ml-3 text-xl font-bold text-white drop-shadow-md">
              NewsAura
            </span>
          </NavLink>

          {/* Mobile Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {categories.map(({ id }) => (
              <NavLink
                key={id}
                to={`/category/${id}`}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                    isActive
                      ? "bg-white text-emerald-700 shadow-md"
                      : "text-white hover:bg-emerald-600 hover:text-emerald-100"
                  }`
                }
              >
                {id}
              </NavLink>
            ))}

            {/* ✅ User Dropdown */}
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 bg-white text-emerald-700 px-3 py-1.5 rounded-full font-medium shadow-md hover:bg-emerald-100 transition-all duration-200"
              >
                <UserCircle2 className="h-5 w-5" />
                <span>{displayName}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md overflow-hidden animate-fadeIn">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-emerald-700 hover:bg-emerald-50 transition"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-emerald-600 bg-opacity-95 shadow-lg rounded-b-xl transition-all">
          <div className="px-4 py-3 space-y-2 flex flex-col items-start">
            {categories.map(({ id }) => (
              <NavLink
                key={id}
                to={`/category/${id}`}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `w-full text-left px-4 py-2 rounded-md font-medium capitalize transition-all duration-200 ${
                    isActive
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-white hover:bg-emerald-500 hover:text-white"
                  }`
                }
              >
                {id}
              </NavLink>
            ))}

            {/* Mobile User Info + Logout */}
            <div className="flex items-center gap-2 mt-3 px-3 text-white font-medium">
              <UserCircle2 className="h-5 w-5" />
              <span>{displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 bg-white text-emerald-700 hover:bg-emerald-100 py-2 rounded-md font-medium shadow-md transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
