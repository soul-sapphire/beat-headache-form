import React from "react";

export default function SectionHeader({ title, subtitle, tag, centered = true }) {
  return (
    <div className={`mb-12 space-y-3 ${centered ? "text-center max-w-3xl mx-auto" : "text-left"}`}>
      {tag && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100 uppercase tracking-wider">
          {tag}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-slate-600 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
