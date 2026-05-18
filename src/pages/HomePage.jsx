import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  FileSpreadsheet, 
  UserCheck, 
  AlertTriangle,
  Database,
  Apple
} from "lucide-react";
import CTA from "../components/CTA";

export default function HomePage() {
  const trustCards = [
    {
      title: "Structured Assessment",
      description: "Uses a clinical pathway inspired by international headache standards (IHS/ICHD-3) to collect high-fidelity baseline data.",
      icon: ShieldCheck,
      color: "cyan",
      badge: "Clinical Standard"
    },
    {
      title: "Lifestyle Review with FRESSH",
      description: "Assess daily habits across Food, Relaxation, Exercise, Sleep, Screen time, and Hydration metrics to spot potential triggers.",
      icon: Apple,
      color: "blue",
      badge: "Holistic Review"
    },
    {
      title: "Patient & Doctor Reports",
      description: "Instantly compile patient-friendly summaries and technical clinician-ready clinical reports with investigation cues.",
      icon: FileSpreadsheet,
      color: "indigo",
      badge: "Immediate PDF"
    }
  ];

  const whoItSupports = [
    {
      title: "Parents and caregivers",
      description: "Organize the child’s headache story, symptoms, lifestyle factors, and warning signs before a consultation.",
      icon: Heart
    },
    {
      title: "Clinicians",
      description: "Review structured history, reflected criteria, red flags, examination prompts, and clinical report summaries.",
      icon: UserCheck
    },
    {
      title: "Researchers",
      description: "Use deidentified exports and consistent data fields to support structured headache research workflows where consent is given.",
      icon: Database
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Complete the guided intake",
      description: "Parents or clinicians enter headache history, background details, and lifestyle information."
    },
    {
      step: "02",
      title: "Review reflected clinical signals",
      description: "The system highlights possible red flags, headache features, and report-ready summaries for clinician confirmation."
    },
    {
      step: "03",
      title: "Generate reports",
      description: "Create a parent-friendly summary and a detailed clinical report for doctor review."
    },
    {
      step: "04",
      title: "Discuss with a qualified clinician",
      description: "Reports support consultation. Diagnosis and treatment decisions remain with the clinician."
    }
  ];

  return (
    <div className="space-y-24 pb-20 transition-colors duration-300">
      
      {/* A) Hero Section - Premium Navy to Teal Gradient Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white shadow-2xl overflow-hidden px-6 py-16 sm:px-12 sm:py-20 lg:py-24">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 backdrop-blur-md uppercase tracking-wider">
                🏥 Research-Ready Intake Assistant
              </span>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] sm:leading-tight">
                Structured child headache assessment for families and clinicians.
              </h1>
              
              <p className="text-sm sm:text-base text-slate-350 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Beat Headache helps collect child headache history, lifestyle factors, warning signs, and clinical review notes in one organized pathway. The generated reports support doctor review and research documentation, but do not replace medical assessment.
              </p>
              
              <p className="text-xs text-cyan-300 font-medium">
                Designed to help families prepare for consultation and help clinicians review headache patterns more efficiently.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  to="/new-patient"
                  className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-400 via-teal-400 to-sky-400 hover:from-cyan-500 hover:to-sky-500 text-slate-950 rounded-2xl font-bold shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
                >
                  <span>Start New Patient Form</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/about"
                  className="flex items-center justify-center px-6 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-2xl font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
                >
                  Learn How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-extrabold text-cyan-300">100%</p>
                  <p className="text-xs text-slate-400 font-medium">Local Browser Privacy</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-teal-300">ICHD-3</p>
                  <p className="text-xs text-slate-400 font-medium">Mapped Criteria</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-sky-300">PDF</p>
                  <p className="text-xs text-slate-400 font-medium">Doctor Ready Output</p>
                </div>
              </div>
            </div>

            {/* Right Side Panel: Layered Clinical Feature Cards */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="p-5 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-xl flex items-start space-x-4">
                <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-sky-400 rounded-xl text-slate-950 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Guided history</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    Step-by-step parent-friendly inputs with active local draft storage.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-xl flex items-start space-x-4">
                <div className="p-2.5 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl text-slate-950 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Red flag review</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    Automatically highlights potential warning criteria.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-xl flex items-start space-x-4">
                <div className="p-2.5 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-xl text-slate-950 shrink-0">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Patient & doctor reports</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    Compile summaries immediately upon form completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B) Trust Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-cyan-400 border border-sky-100 dark:border-cyan-800/40 uppercase tracking-wide">
            Holistic Clinical Framework
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for clinical depth and parent accessibility
          </h2>
          <p className="text-slate-655 dark:text-slate-350 text-sm leading-relaxed">
            We help families translate daily observations into structured history logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div 
                key={i} 
                className="group p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200/80 dark:border-slate-800 rounded-3xl hover:border-sky-300 dark:hover:border-cyan-500 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className={`inline-flex p-3 rounded-2xl ${
                      card.color === "cyan" 
                        ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400" 
                        : card.color === "blue" 
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400" 
                          : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-cyan-400 transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* C) Refined "Who Beat Headache Supports" Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-850 shadow-lg dark:shadow-none rounded-[2.5rem] space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-sky-600 dark:text-cyan-400 text-xs font-extrabold uppercase tracking-widest">Target Users</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Who Beat Headache Supports
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Supporting communication, analysis, and research in child headache care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whoItSupports.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-2xl space-y-3 shadow-xs">
                  <div className="p-2.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-cyan-400 rounded-xl w-fit">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-955 dark:text-white">{item.title}</h3>
                  <p className="text-slate-655 dark:text-slate-350 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* D) Refined "How It Works" Section */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white py-20 border-y border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#0284c7,transparent_25%)] opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Process Pathway</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              How Beat Headache Works
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              A structured sequence to organize baseline data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((item, idx) => (
              <div key={idx} className="p-6 bg-white/5 dark:bg-slate-900/40 border border-white/10 dark:border-slate-800/80 rounded-2xl space-y-3">
                <span className="text-3xl font-black text-cyan-400/80 block">{item.step}</span>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* E) Polished Safety Notice - Official Safety Statement */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 bg-amber-50/60 dark:bg-amber-955/20 border border-amber-200/80 dark:border-amber-900/50 rounded-3xl flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="p-3 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-250 rounded-2xl shrink-0">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Pediatric Headache Safety Notice</h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              This website does not provide emergency care. Seek urgent medical help if a child has sudden severe headache, confusion, seizure, weakness, vision changes, fever with neck stiffness, head injury, persistent vomiting, or rapidly worsening symptoms.
            </p>
          </div>
        </div>
      </section>

      {/* F) CTA Section */}
      <CTA />
    </div>
  );
}
