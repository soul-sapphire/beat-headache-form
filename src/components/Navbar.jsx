import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, FileText } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Resources", path: "/resources" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
    { name: "Feedback", path: "/feedback" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="no-print sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group focus-visible:ring-4 focus-visible:ring-sky-300 dark:focus-visible:ring-cyan-800 focus-visible:outline-none rounded-xl p-1">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 rounded-xl shadow-md shadow-cyan-200/50 dark:shadow-none group-hover:scale-105 transition-transform duration-300">
                <Activity className="h-5 w-5 text-white animate-pulse" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 dark:from-white dark:via-cyan-300 dark:to-white bg-clip-text text-transparent tracking-tight">
                Beat Headache
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:ring-4 focus-visible:ring-sky-300 dark:focus-visible:ring-cyan-800 focus-visible:outline-none ${
                  isActive(link.path)
                    ? "text-sky-700 dark:text-cyan-400 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100/50 dark:border-cyan-800/40 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pl-3 border-l border-slate-200 dark:border-slate-800 ml-2.5 flex items-center space-x-3">
              <ThemeToggle />
              <Link
                to="/new-patient"
                className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 dark:from-sky-500 dark:via-cyan-500 dark:to-blue-600 hover:from-slate-950 hover:to-black dark:hover:from-sky-600 dark:hover:to-blue-700 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sky-300 dark:focus-visible:ring-cyan-800 focus-visible:outline-none"
              >
                <FileText className="h-4 w-4 text-cyan-400 dark:text-slate-950" />
                <span>New Patient Form</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-900 focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100 visible" : "max-h-0 opacity-0 invisible overflow-hidden"
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-4 space-y-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none ${
                isActive(link.path)
                  ? "text-sky-700 dark:text-cyan-400 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100/50 dark:border-cyan-800/40"
                  : "text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 pb-2 border-t border-slate-100 dark:border-slate-850 px-4">
            <Link
              to="/new-patient"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 dark:from-sky-500 dark:via-cyan-500 dark:to-blue-600 text-white dark:text-slate-950 rounded-xl text-base font-bold shadow-md shadow-slate-900/10 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
            >
              <FileText className="h-5 w-5 text-cyan-400 dark:text-slate-950" />
              <span>New Patient Form</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
