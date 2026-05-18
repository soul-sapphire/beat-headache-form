import React from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";

export default function CTA({ 
  title = "Start the Guided Intake Process", 
  description = "Organize your child's headache history, identify warning signs, and generate professional patient and clinical reports for doctor review.",
  buttonText = "Start New Patient Form"
}) {
  return (
    <section className="relative overflow-hidden py-16 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/70 via-blue-50/50 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 dark:bg-cyan-500/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-cyan-100/70 dark:border-slate-800 rounded-3xl shadow-xl shadow-cyan-100/50 dark:shadow-none text-center space-y-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-slate-900 border border-cyan-100 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 rounded-2xl">
            <FileText className="h-8 w-8" />
          </div>
          
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="text-slate-655 dark:text-slate-350 leading-relaxed text-sm sm:text-base">
              {description}
            </p>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/new-patient"
              className="flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md shadow-cyan-100 dark:shadow-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sky-300 dark:focus-visible:ring-cyan-800 focus-visible:outline-none"
            >
              <span>{buttonText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sky-300 dark:focus-visible:ring-cyan-800 focus-visible:outline-none"
            >
              Learn About the Process
            </Link>
          </div>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-lg mx-auto">
            Drafts are saved locally on your browser. No sensitive medical data is sent or stored on our servers.
          </p>
        </div>
      </div>
    </section>
  );
}
