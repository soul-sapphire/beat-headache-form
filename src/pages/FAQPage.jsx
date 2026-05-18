import React, { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CTA from "../components/CTA";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Is Beat Headache a diagnosis tool?",
      a: "No. Beat Headache is a clinical assessment assistant. It organizes your answers, reviews daily routines, and cross-references clinical criteria. It is designed to empower pediatricians, not to replace clinical diagnosis, medical care, or specialized assessments."
    },
    {
      q: "Who should complete the form?",
      a: "The form should be completed by a parent or guardian in partnership with their child. Pediatricians and clinical researchers can also complete the form during or after a patient consultation to capture structured, standardized headache data."
    },
    {
      q: "What is FRESSH?",
      a: "FRESSH is a pediatric holistic lifestyle framework focusing on key daily variables that can trigger child headaches: Food Intake Pattern, Relaxation time, Exercise habits, Sleep duration, Screen time exposure, and Hydration levels."
    },
    {
      q: "What are red flags?",
      a: "Red flags are warning indicators identified from scientific pediatric headache standards. They fall into three groups: Systemic (fever, persistent vomiting, weight loss), Neurological (gait issues, eye palsy, visual abnormalities), and Positional/onset features (headaches worse lying down, sudden 'thunderclap' onset, or onset under age 5). Any positive red flag requires clinician verification."
    },
    {
      q: "Can I download reports?",
      a: "Yes. Once you complete the guided form, you can instantly generate and download two custom-styled PDF reports: a simplified, parent-friendly Patient Report, and a highly technical, diagnostic-mapped Doctor Clinical Report."
    },
    {
      q: "Is my data saved online?",
      a: "Currently, no. Beat Headache values your absolute privacy. We do not store any identifying patient information or medical answers on our servers. Your active draft and final inputs are stored entirely inside your browser's local storage on your specific device."
    },
    {
      q: "Can the form be used for research?",
      a: "Yes. Beat Headache supports academic and epidemiological investigations. If parents provide explicit research consent, they can securely export deidentified JSON or CSV strings of their form metrics."
    },
    {
      q: "What if symptoms are severe?",
      a: "If symptoms are severe, sudden, or accompanied by critical warning signs (like high fever, a stiff neck, confusion, vomiting, or head trauma), do not wait. Seek urgent medical care or visit the nearest emergency room immediately."
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 space-y-16">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          tag="FAQ"
          title="Frequently Asked Questions"
          subtitle="Clear answers about our intake pathway, clinical standards, data privacy, and pediatric headache safety."
        />

        {/* FAQs Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:border-cyan-100"
              >
                <button
                  onClick={() => handleToggle(i)}
                  type="button"
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center space-x-3 pr-4">
                    <HelpCircle className="h-5 w-5 text-cyan-600 shrink-0" />
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{faq.q}</span>
                  </div>
                  <div className={`p-1.5 rounded-lg transition-colors duration-200 ${isOpen ? "bg-cyan-50 text-cyan-700" : "bg-slate-50 text-slate-500"}`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100 visible border-t border-slate-50" : "max-h-0 opacity-0 invisible overflow-hidden"
                  }`}
                >
                  <div className="px-6 py-5 bg-slate-50/50 text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
