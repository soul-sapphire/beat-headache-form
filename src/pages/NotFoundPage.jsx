import React from "react";
import { Link } from "react-router-dom";
import { Home, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="py-24 max-w-lg mx-auto px-4 text-center space-y-6 transition-colors duration-300">
      <div className="inline-flex p-4 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-3xl animate-bounce">
        <Compass className="h-12 w-12" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">404 - Page Not Found</h1>
        <p className="text-slate-600 dark:text-slate-350 text-sm">
          We couldn't locate the clinical route or information page you're trying to reach.
        </p>
      </div>

      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md shadow-cyan-100 dark:shadow-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
