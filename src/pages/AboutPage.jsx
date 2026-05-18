import React from "react";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Stethoscope, 
  Database, 
  ShieldAlert, 
  ClipboardCheck,
  CheckCircle,
  TrendingUp,
  Brain
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CTA from "../components/CTA";

export default function AboutPage() {
  const pillars = [
    {
      title: "Clinical history",
      description: "Gathering timing, severity, pain characteristics, associated symptoms, and background context systematically.",
      icon: Stethoscope,
      badge: "Clinical Intake",
      color: "cyan"
    },
    {
      title: "Red flag screening",
      description: "Documenting systemic, neurological, and positional warning signs to support safety review.",
      icon: ShieldAlert,
      badge: "Safety Verification",
      color: "rose"
    },
    {
      title: "FRESSH lifestyle review",
      description: "Reviewing Food, Relaxation, Exercise, Sleep, Screen time, and Hydration metrics to help discuss trigger factors.",
      icon: TrendingUp,
      badge: "Lifestyle Medicine",
      color: "emerald"
    },
    {
      title: "Report generation",
      description: "Creating a parent-friendly summary and a structured clinical report for doctor review.",
      icon: ClipboardCheck,
      badge: "Actionable Outputs",
      color: "indigo"
    }
  ];

  return (
    <div className="py-16 space-y-24 transition-colors duration-300">
      {/* 1. Hero Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          tag="About Process"
          title="Clinical review support for child headache assessment"
          subtitle="Helping families organize historical data, lifestyle variables, and warning flags in one secure, structured dossier."
        />
        
        {/* Core Purpose Block in Dark Navy Panel */}
        <div className="mt-10 relative rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white shadow-2xl overflow-hidden px-8 py-12 sm:p-14 lg:p-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h3 className="text-3xl font-extrabold tracking-tight">Purpose</h3>
              <p className="text-slate-350 leading-relaxed text-sm sm:text-base">
                Beat Headache was created to make child headache history easier to collect, review, and report.
              </p>
              <p className="text-slate-350 leading-relaxed text-sm sm:text-base">
                Gathering detailed headache details can be challenging during short clinic visits. Beat Headache helps parents record comprehensive records calmly in their home, saving active clinic intake time and reducing detail gaps.
              </p>
            </div>
            
            <div className="lg:col-span-5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-white/10 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center space-x-3 text-cyan-400">
                <Heart className="h-6 w-6 shrink-0" />
                <span className="font-extrabold text-white text-base">Parent-Friendly Approach</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                We believe history intake should be clear and accessible. With local browser storage, you can complete the questions at your own pace, review active medicine counts, and resume where you left off.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Why child headache history matters - Layered Sky Panel */}
      <section className="bg-sky-50/50 dark:bg-slate-900/30 py-20 border-y border-sky-100/50 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-sky-700 dark:text-cyan-400 uppercase tracking-widest bg-sky-100/60 dark:bg-sky-950/40 px-3 py-1 rounded-md border border-sky-200 dark:border-cyan-800/40 w-fit block">
              Clinical Context
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Why structured history matters
            </h3>
            <p className="text-slate-655 dark:text-slate-350 leading-relaxed text-sm">
              Headache assessment often depends on the story: timing, severity, associated symptoms, warning signs, family history, lifestyle, and examination findings. A structured form helps reduce missed details.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                  <strong>Standardizes Terminology:</strong> Maps common child pain descriptions to professional baseline categories.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                  <strong>Tracks Lifestyle Factors:</strong> Highlights daily habits that can trigger pediatric headache attacks.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                  <strong>Supports Consultation:</strong> Organizes clinical variables so doctors can focus directly on diagnosis and plan care.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">No Diagnostic Claims</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Beat Headache does not diagnose, prescribe, treat, or replace the clinical judgment of a doctor. Its primary purpose is to help document structured history logs.
              </p>
            </div>
            
            <div className="p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">100% Client-Side Privacy</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                No health logs are uploaded to an online server. All drafts and finalized entries operate purely within your local browser storage on your current device.
              </p>
            </div>

            {/* Research Ready block */}
            <div className="p-6 bg-cyan-50/70 dark:bg-cyan-955/20 border border-cyan-100 dark:border-cyan-900/40 rounded-2xl sm:col-span-2 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-800 dark:text-cyan-455">
                <Database className="h-4.5 w-4.5" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Research-Ready Design</h4>
              </div>
              <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed">
                The system can support deidentified exports for research workflows where consent is given. Exported JSON or CSV documents compile structured non-identifiable data fields to support local headache studies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Approach: 4 pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-sky-600 dark:text-cyan-400 text-xs font-extrabold uppercase tracking-widest">Methodology</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Our Approach
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Four key pillars designed to organize pediatric headache history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className={`inline-flex p-3 rounded-2xl ${
                      p.color === "cyan" ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400" :
                      p.color === "rose" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455" :
                      p.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455" :
                      "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-850 uppercase tracking-wider">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.title}</h3>
                  <p className="text-xs text-slate-555 dark:text-slate-400 leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Important Limitation */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 bg-amber-50/60 dark:bg-amber-955/20 border border-amber-200/80 dark:border-amber-900/50 rounded-3xl space-y-4 text-center">
          <Brain className="h-9 w-9 text-amber-700 dark:text-amber-500 mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-slate-955 dark:text-white">Important Limitation</h3>
          <p className="text-xs sm:text-sm text-slate-755 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Beat Headache does not provide a final diagnosis, prescription, or emergency service. A qualified clinician must review the information. All criteria reflected in reports serve as educational templates to support medical consultation.
          </p>
          <div className="pt-2">
            <span className="inline-block text-[10px] font-bold text-amber-850 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-900/60 uppercase tracking-wider">
              100% Client-Side Flow • No Online Cloud Sync
            </span>
          </div>
        </div>
      </section>

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
