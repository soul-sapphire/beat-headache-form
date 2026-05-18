import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Clock, 
  ListTodo, 
  Users, 
  FileSpreadsheet, 
  UserCheck, 
  AlertTriangle,
  Flame,
  BrainCircuit,
  Apple
} from "lucide-react";
import CTA from "../components/CTA";

export default function HomePage() {
  const trustCards = [
    {
      title: "Structured Assessment",
      description: "Uses a clinical pathway inspired by international headache standards (IHS/ICHD-3) to collect high-fidelity baseline data.",
      icon: ShieldCheck,
      color: "cyan"
    },
    {
      title: "Lifestyle Review with FRESSH",
      description: "Assess daily habits across Food, Relaxation, Exercise, Sleep, Screen time, and Hydration metrics to spot potential triggers.",
      icon: Apple,
      color: "blue"
    },
    {
      title: "Patient & Doctor Reports",
      description: "Instantly compile patient-friendly summaries and technical clinician-ready clinical reports with investigation cues.",
      icon: FileSpreadsheet,
      color: "indigo"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Complete guided form",
      description: "Fill in child development, birth history, headache symptoms, and FRESSH lifestyle habits at your own pace."
    },
    {
      step: "02",
      title: "Spot patterns & warning signs",
      description: "Our forward-reflection logic automatically identifies potential clinical criteria and flags pediatric red flags."
    },
    {
      step: "03",
      title: "Generate PDF reports",
      description: "Instantly create deidentified research exports and comprehensive PDF reports for patients and pediatricians."
    },
    {
      step: "04",
      title: "Consult with a clinician",
      description: "Share the structured reports directly with your child's pediatrician or doctor to accelerate diagnosis and plan care."
    }
  ];

  const whoItHelps = [
    {
      title: "Parents & Caregivers",
      subtitle: "Preparing for a Consultation",
      description: "No more forgetting key details during high-stress clinic visits. Walk in equipped with a comprehensive timeline and structured lifestyle patterns.",
      icon: Heart
    },
    {
      title: "Pediatricians & Doctors",
      subtitle: "Reviewing Headache History",
      description: "Save up to 20 minutes of active clinical intake time. Review clinical criteria mappings, red flags, and physical examination logs in seconds.",
      icon: UserCheck
    },
    {
      title: "Clinical Researchers",
      subtitle: "Structured Deidentified Data",
      description: "Extract high-integrity, structured headache logs with consent in CSV/JSON formats to advance local epidemiological understanding.",
      icon: BrainCircuit
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* A) Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pb-24 lg:pt-20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                ⭐ Premium Clinical Intake Assistant
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] sm:leading-tight">
                Understand your child’s headaches with a{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  structured clinical pathway
                </span>.
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Beat Headache helps parents and clinicians collect headache history, identify warning signs, review lifestyle factors, and generate clear reports for doctor review.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  to="/new-patient"
                  className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-100 hover:shadow-xl hover:shadow-cyan-200 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span>Start New Patient Form</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/about"
                  className="flex items-center justify-center px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  Learn About the Process
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-bold text-slate-900">100%</p>
                  <p className="text-xs text-slate-500">Local Privacy (No Cloud Sync)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">ICHD-3</p>
                  <p className="text-xs text-slate-500">Diagnostic Guideline Mapped</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">PDF</p>
                  <p className="text-xs text-slate-500">Doctor-Ready Reports</p>
                </div>
              </div>
            </div>

            {/* Right Graphic/Illustration Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md p-6 bg-white/70 backdrop-blur-md border border-cyan-100 rounded-3xl shadow-xl shadow-cyan-100/40 space-y-6">
                <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100/50 flex items-center space-x-4">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Active Patient Assessment</h4>
                    <p className="text-xs text-slate-500">Draft saved automatically to browser storage</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>Intake Progress</span>
                    <span className="text-cyan-600">7 Sections Complete</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full w-4/5" />
                  </div>
                </div>

                {/* Simulated Diagnostic Feedback */}
                <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                    Reflection Insights
                  </span>
                  <p className="text-xs text-slate-600 font-medium">
                    "FRESSH scores suggest screen time exceeds recommended levels. Headache severity is categorized as moderate-to-severe."
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>✓ 100% Secure</span>
                  <span>✓ PDF Export Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B) Trust Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-cyan-600 text-sm font-bold uppercase tracking-wider">Holistic Clinical Framework</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Designed for clinical depth and parent accessibility
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            No shortcuts. We help translate subjective, stress-filled headache history into objective, medical-grade observations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div 
                key={i} 
                className="group p-8 bg-white border border-slate-100 rounded-3xl hover:border-cyan-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`inline-flex p-3 rounded-2xl ${
                    card.color === "cyan" 
                      ? "bg-cyan-50 text-cyan-600" 
                      : card.color === "blue" 
                        ? "bg-blue-50 text-blue-600" 
                        : "bg-indigo-50 text-indigo-600"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* C) How It Works Section */}
      <section className="bg-slate-50 py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-cyan-600 text-sm font-bold uppercase tracking-wider">Simple Structured Steps</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              The Path to a Comprehensive Headache Report
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Follow our sequential clinical helper to transform your observations into a doctor-ready intake dossier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative space-y-4 p-4">
                <span className="text-5xl font-black text-cyan-100 block tracking-tight">{step.step}</span>
                <h3 className="text-lg font-bold text-slate-950">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-4 text-cyan-200">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* D) Who It Helps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-cyan-600 text-sm font-bold uppercase tracking-wider">Built for the Care Team</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Streamlining communication across the clinical care circle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whoItHelps.map((audience, i) => {
            const Icon = audience.icon;
            return (
              <div key={i} className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <div className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{audience.title}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{audience.subtitle}</p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {audience.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* E) Safety Notice (Visible but Calm Alert) */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-6 sm:p-8 bg-amber-50/70 border border-amber-100 rounded-3xl flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-slate-900">Pediatric Headache Safety Notice</h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              While pediatric headaches are common, some require rapid clinical intervention. 
              <strong> Seek urgent medical care or visit the nearest emergency room if your child has:</strong>
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 font-medium pt-1 list-disc pl-4">
              <li>Severe, sudden-onset headache ("thunderclap")</li>
              <li>New neurological symptoms (unsteady gait, weakness, slurred speech)</li>
              <li>Fever, acute rash, or stiffness in the neck</li>
              <li>Headache following a recent head injury</li>
              <li>Persistent vomiting not explained by other reasons</li>
              <li>Confusion, lethargy, or sudden personality changes</li>
              <li>Headache that steadily worsens over days/weeks</li>
            </ul>
          </div>
        </div>
      </section>

      {/* F) CTA Section */}
      <CTA />
    </div>
  );
}
