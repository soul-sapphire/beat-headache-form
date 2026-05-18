import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "beatHeadache.theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(THEME_KEY) || "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 focus-visible:ring-4 focus-visible:ring-sky-300 dark:focus-visible:ring-cyan-800 focus-visible:outline-none transition-all duration-200 cursor-pointer"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-4.5 w-4.5 shrink-0 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-4.5 w-4.5 shrink-0 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Light</span>
        </>
      )}
    </button>
  );
}
