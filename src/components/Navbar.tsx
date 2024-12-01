import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Newspaper, Menu, X } from 'lucide-react';

const categories = [
  { id: 'top', color: 'from-blue-500 to-purple-500' },
  { id: 'business', color: 'from-emerald-500 to-teal-500' },
  { id: 'entertainment', color: 'from-pink-500 to-rose-500' },
  { id: 'health', color: 'from-green-500 to-emerald-500' },
  { id: 'sports', color: 'from-orange-500 to-red-500' },
  { id: 'technology', color: 'from-indigo-500 to-blue-500' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <NavLink 
            to="/category/top" 
            className="flex items-center transform hover:scale-105 transition-transform duration-200"
          >
            <div className="relative">
              <Newspaper className="h-8 w-8 text-white hover:text-emerald-100" />
              <div className="absolute -inset-1 bg-white opacity-25 rounded-full blur animate-pulse"></div>
            </div>
            <span className="ml-3 text-xl font-bold text-white hover:text-emerald-100">
              NewsAggregator
            </span>
          </NavLink>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-emerald-100 hover:bg-emerald-600 focus:outline-none"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-2">
            {categories.map(({ id, color }) => (
              <NavLink
                key={id}
                to={`/category/${id}`}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                    isActive
                      ? `bg-white text-emerald-700 shadow-lg scale-105`
                      : 'text-white hover:text-emerald-100 hover:bg-emerald-600'
                  }`
                }
              >
                <span className="relative">
                  {id}
                  {id === 'top' && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  )}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:hidden absolute w-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg z-50 transition-all duration-200 ease-in-out`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {categories.map(({ id, color }) => (
            <NavLink
              key={id}
              to={`/category/${id}`}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg text-base font-medium capitalize transition-all duration-200 ${
                  isActive
                    ? `bg-white text-emerald-700`
                    : 'text-white hover:text-emerald-100 hover:bg-emerald-600'
                }`
              }
            >
              <span className="relative">
                {id}
                {id === 'top' && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;