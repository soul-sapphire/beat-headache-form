import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/20 to-blue-50/30 text-slate-800 antialiased font-sans">
      {/* Top Warning Banner for Emergencies */}
      <div className="bg-rose-600 text-white py-2 px-4 text-center text-xs font-semibold shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <span>⚠️</span>
          <span>
            <strong>Emergency Notice:</strong> If your child is experiencing severe sudden headache, neurological changes, or fever with stiff neck, seek emergency medical care immediately.
          </span>
        </div>
      </div>

      <Navbar />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}
