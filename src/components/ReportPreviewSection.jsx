import React, { useState } from "react";
import { 
  ShieldCheck, 
  Heart, 
  FileSpreadsheet, 
  UserCheck, 
  AlertTriangle,
  Database,
  Lock,
  Download,
  Printer
} from "lucide-react";

export default function ReportPreviewSection() {
  const [activeReportTab, setActiveReportTab] = useState("doctor");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-cyan-400 border border-sky-100 dark:border-cyan-800/40 uppercase tracking-wide">
          Intake Outcomes
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Intake Outcomes & Report Previews
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Review the clinical summaries, family summaries, and research export files compiled upon form completion.
        </p>
      </div>

      {/* Interactive Mockup Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-lg p-6 sm:p-8 lg:p-10">
        
        {/* Left Sidebar Tab selectors */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-2">Available Form Outputs</h4>
          
          <button
            onClick={() => setActiveReportTab("doctor")}
            type="button"
            className={`w-full flex items-start text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
              activeReportTab === "doctor"
                ? "bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-cyan-800 text-sky-900 dark:text-cyan-300 shadow-sm"
                : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
            }`}
          >
            <UserCheck className="h-5 w-5 shrink-0 mt-0.5 mr-3 text-sky-500 dark:text-cyan-400" />
            <div>
              <h5 className="font-bold text-xs sm:text-sm">Doctor Clinical Report</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Reflected IHS/ICHD-3 criteria checkpoints, red flags, and examination prompts.
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveReportTab("patient")}
            type="button"
            className={`w-full flex items-start text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
              activeReportTab === "patient"
                ? "bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-cyan-800 text-sky-900 dark:text-cyan-300 shadow-sm"
                : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
            }`}
          >
            <Heart className="h-5 w-5 shrink-0 mt-0.5 mr-3 text-teal-500 dark:text-teal-400" />
            <div>
              <h5 className="font-bold text-xs sm:text-sm">Patient Summary Report</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Family-friendly timeline summaries and integrated FRESSH lifestyle scores.
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveReportTab("export")}
            type="button"
            className={`w-full flex items-start text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
              activeReportTab === "export"
                ? "bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-cyan-800 text-sky-900 dark:text-cyan-300 shadow-sm"
                : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
            }`}
          >
            <Database className="h-5 w-5 shrink-0 mt-0.5 mr-3 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h5 className="font-bold text-xs sm:text-sm">Deidentified Research Export</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Structured CSV and JSON datasets stripped of personal identifiers (PII).
              </p>
            </div>
          </button>
        </div>

        {/* Right Display Panel mockup */}
        <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[360px] relative">
          <div className="space-y-4">
            
            {/* Tab Content: Doctor Report */}
            {activeReportTab === "doctor" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-cyan-400 rounded-md text-[10px] font-black uppercase tracking-wider">Clinician Ready</span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Doctor Clinical Summary</h5>
                  </div>
                  <Printer className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                    <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
                      <AlertTriangle className="h-4.5 w-4.5" />
                      <span>Red Flag Review Checklist</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      No focal deficits or secondary triggers identified. (Clinical Note: Seek urgent medical help immediately if emergency warning signs emerge).
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                      <span>Reflected Diagnostic Clues (IHS/ICHD-3 Guidelines)</span>
                      <span className="text-[10px] text-sky-600 dark:text-cyan-400">Reflected Only</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Intake criteria points match pediatric migraine features (recurrent episodes, photophobia, phonophobia). A qualified clinician must assess and confirm the formal diagnosis.
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Suggested Examination Checkpoints</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Verify height/weight tracking percentiles, measure blood pressure, perform optic disc examinations, and document gait pattern.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Patient Report */}
            {activeReportTab === "patient" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-md text-[10px] font-black uppercase tracking-wider">Family Friendly</span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Patient Summary Report</h5>
                  </div>
                  <Printer className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Child's Headache Pattern Overview</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      A simplified timeline mapping of headache duration, common triggers (e.g. fatigue, bright screens), and effective rest methods logged during intake.
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                      <span>FRESSH Lifestyle Metrics Summary</span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400">Holistic Score</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      • Screen Time: 4.5 hours logged (High indicator).<br />
                      • Hydration: Adequate water intake logged.<br />
                      • Sleep: Average 8 hours with noted bedtime inconsistency.
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-semibold text-sky-700 dark:text-cyan-400">
                      💡 Tip: Print this page to take directly to your child's pediatrician to help guide the consultation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Deidentified Export */}
            {activeReportTab === "export" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-md text-[10px] font-black uppercase tracking-wider">Research Ready</span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Structured Data Export</h5>
                  </div>
                  <Download className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-1">
                    <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                      <Lock className="h-4 w-4" />
                      <span>Strict Privacy Safeguards (Deidentification)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Names, full birthdates, emails, addresses, and phone numbers are automatically deleted. Only high-fidelity, clinical baseline headache details remain in the export schema.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] overflow-x-auto space-y-1 shadow-inner border border-slate-850">
                    <div>{`{`}</div>
                    <div className="pl-4">{`"demographics": { "age_group": "7-12", "gender": "female" },`}</div>
                    <div className="pl-4">{`"headache_profile": { "duration_min": 180, "location": "bilateral", "throbbing": true },`}</div>
                    <div className="pl-4">{`"associated_symptoms": { "photophobia": true, "phonophobia": true, "nausea": false },`}</div>
                    <div className="pl-4">{`"fressh_lifestyle": { "sleep_hours": 8, "screen_time_hours": 4.5 }`}</div>
                    <div>{`}`}</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Status note */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
            <span className="flex items-center"><ShieldCheck className="h-3.5 w-3.5 text-sky-500 mr-1.5" /> Mapped to clinical standards</span>
            <span>CSV & JSON Format available</span>
          </div>

        </div>

      </div>
    </section>
  );
}
