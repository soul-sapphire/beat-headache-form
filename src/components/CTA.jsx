import React from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";

export default function CTA({ 
  title = "Start the Guided Intake Process", 
  description = "Organize your child's headache history, identify warning signs, and generate professional patient and clinical reports for doctor review.",
  buttonText = "Start New Patient Form"
}) {
  return (
    <section className="relative overflow-hidden py-16 bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/70 via-blue-50/50 to-white -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 bg-white/80 backdrop-blur-md border border-cyan-100/70 rounded-3xl shadow-xl shadow-cyan-100/50 text-center space-y-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 text-cyan-600">
            <FileText className="h-8 w-8 animate-bounce" />
          </div>
          
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {description}
            </p>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/new-patient"
              className="flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md shadow-cyan-100 hover:shadow-lg hover:shadow-cyan-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>{buttonText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              Learn About the Process
            </Link>
          </div>
          
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Drafts are saved locally on your browser. No sensitive medical data is sent or stored on our servers.
          </p>
        </div>
      </div>
    </section>
  );
}
