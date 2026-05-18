import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, HelpCircle, FileText, ArrowRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CTA from "../components/CTA";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Does Beat Headache diagnose my child?",
      a: "No. It organizes form answers and generates reports for clinician review. A qualified clinician must confirm diagnosis and treatment."
    },
    {
      q: "Is this an emergency service?",
      a: "No. Seek urgent medical care for severe or worrying symptoms."
    },
    {
      q: "Who should complete the form?",
      a: "A parent/guardian, the child where appropriate, or a clinician during consultation."
    },
    {
      q: "What is FRESSH?",
      a: "Food, Relaxation, Exercise, Sleep, Screen time, and Hydration."
    },
    {
      q: "Are reports final medical documents?",
      a: "No. Reports summarize entered information and reflected criteria. They require clinical review."
    },
    {
      q: "Is data saved online?",
      a: "No online account/database is currently used. Drafts are saved locally on the same browser/device."
    },
    {
      q: "Can this support research?",
      a: "Yes, deidentified CSV/JSON exports can support structured research workflows where consent is given."
    },
    {
      q: "Can I send private medical information through Contact?",
      a: "No. The contact form is not for urgent or sensitive medical details."
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 space-y-20 transition-colors duration-300">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          tag="FAQ"
          title="Frequently Asked Questions"
          subtitle="Clear answers about our intake pathway, clinical standards, data privacy, and pediatric headache safety."
        />

        {/* Two-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-10">
          
          {/* Left Column (8 cols): FAQ Accordion */}
          <div className="lg:col-span-8 space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div 
                  key={i} 
                  className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xs transition-all duration-300 ${
                    isOpen 
                      ? "border-sky-350 dark:border-cyan-800 bg-sky-50/30 dark:bg-sky-950/20 shadow-xs" 
                      : "border-slate-200/80 dark:border-slate-800 hover:border-sky-200 dark:hover:border-slate-700"
                  }`}
                >
                  <button
                    onClick={() => handleToggle(i)}
                    type="button"
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 dark:focus-visible:ring-cyan-850 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center space-x-3 pr-4">
                      <HelpCircle className={`h-5 w-5 shrink-0 ${isOpen ? "text-sky-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500"}`} />
                      <span className={`font-bold text-sm sm:text-base ${isOpen ? "text-sky-900 dark:text-white" : "text-slate-900 dark:text-slate-100"}`}>{faq.q}</span>
                    </div>
                    <div className={`p-1.5 rounded-lg transition-colors duration-200 ${isOpen ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-cyan-455" : "bg-slate-50 dark:bg-slate-950 text-slate-500"}`}>
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>
                  
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100 visible border-t border-sky-100/50 dark:border-slate-800/80" : "max-h-0 opacity-0 invisible overflow-hidden"
                    }`}
                  >
                    <div className="px-6 py-5 bg-white/40 dark:bg-slate-900/40 text-xs sm:text-sm text-slate-655 dark:text-slate-350 leading-relaxed font-normal">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (4 cols): Side Invitation Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="p-2.5 bg-white/10 rounded-xl w-fit text-cyan-400">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Need to prepare for a visit?</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Use our structured, deidentified New Patient Intake Form to systematically organize symptoms, track active medications, and generate technical PDF dossiers for your pediatrician.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/new-patient"
                className="flex items-center justify-center space-x-2 w-full px-5 py-3.5 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all duration-200 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
              >
                <span>Start New Patient Form</span>
                <ArrowRight className="h-4 w-4 text-slate-950" />
              </Link>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center font-normal">
              No login required • Free clinical PDFs
            </p>
          </div>

        </div>
      </div>

      {/* Subtle Last Updated Tag */}
      <div className="text-center pt-4">
        <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">
          Last updated: May 2026
        </span>
      </div>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
