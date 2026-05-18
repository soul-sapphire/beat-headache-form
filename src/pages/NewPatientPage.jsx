import React from "react";
import BeatHeadacheNewPatientForm from "../BeatHeadacheNewPatientForm";
import { Activity, ShieldCheck, FileText, Database, FileSpreadsheet } from "lucide-react";

export default function NewPatientPage() {
  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 via-cyan-50/10 to-blue-50/20 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Premium Navy Gradient Intro Panel */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white shadow-2xl overflow-hidden px-8 py-10 sm:py-12 lg:p-14 text-center space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl mx-auto space-y-3 relative z-10">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 uppercase tracking-wider">
              🏥 Patient Registration Suite
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              New Patient Headache Form
            </h1>
            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-normal">
              Complete the structured form below to organize headache history, warning signs, lifestyle factors, and report information. You can save drafts locally, generate reports, and export deidentified data where consent is given.
            </p>
          </div>

          {/* BADGES */}
          <div className="flex flex-wrap justify-center items-center gap-3 relative z-10 pt-2">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 shadow-inner">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Structured intake</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 shadow-inner">
              <Activity className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span>Doctor review support</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-300 border border-sky-400/20 shadow-inner">
              <FileText className="h-3.5 w-3.5 text-sky-400" />
              <span>Patient summary</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-400/20 shadow-inner">
              <FileSpreadsheet className="h-3.5 w-3.5 text-purple-400" />
              <span>Clinical report</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 shadow-inner">
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span>Deidentified export</span>
            </span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl text-xs text-slate-300 font-semibold border border-white/5 max-w-2xl mx-auto relative z-10 leading-relaxed">
            ⚠️ Disclaimer: The form does not provide a final diagnosis or prescription. A qualified clinician must review the information.
          </div>
        </div>

        {/* The Unaltered Form Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl dark:shadow-none overflow-hidden">
          <BeatHeadacheNewPatientForm />
        </div>
      </div>
    </div>
  );
}
