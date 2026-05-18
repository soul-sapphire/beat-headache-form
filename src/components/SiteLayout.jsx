import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ReadingProgressBar from "./ReadingProgressBar";
import BackToTopButton from "./BackToTopButton";
import ScrollToTop from "./ScrollToTop";
import Lumi from "./Lumi";

export default function SiteLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_35%),linear-gradient(to_bottom,#f8fafc,#ffffff,#ecfeff)] dark:bg-[radial-gradient(circle_at_top_left,#0c4a6e,transparent_30%),linear-gradient(to_bottom,#020617,#0f172a,#020617)] text-slate-800 dark:text-slate-200 antialiased font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Scroll and Progress Helpers */}
      <ScrollToTop />
      <ReadingProgressBar />
      <BackToTopButton />
      {import.meta.env.VITE_AI_CHAT_ENABLED === "true" && <Lumi />}

      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-sky-600 focus:text-white focus:rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-300 font-bold transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Subtle background decorative shapes */}
      <div className="absolute top-[10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-sky-200/20 dark:bg-sky-500/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[45%] right-[-10%] w-[25rem] h-[25rem] rounded-full bg-cyan-200/15 dark:bg-cyan-500/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[25%] left-[5%] w-[35rem] h-[35rem] rounded-full bg-indigo-100/20 dark:bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[5%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-teal-100/15 dark:bg-teal-500/5 blur-3xl pointer-events-none -z-10" />

      {/* Top Warning Banner for Emergencies */}
      <div className="no-print bg-rose-600 text-white py-2 px-4 text-center text-xs font-semibold shadow-inner relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <span>⚠️</span>
          <span>
            <strong>Emergency Notice:</strong> If your child is experiencing severe sudden headache, neurological changes, or fever with stiff neck, seek emergency medical care immediately.
          </span>
        </div>
      </div>

      <Navbar />

      <main id="main-content" className="flex-grow relative z-10 focus:outline-none">
        {children}
      </main>

      <Footer />
    </div>
  );
}
