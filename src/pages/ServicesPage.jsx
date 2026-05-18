import React from "react";
import { 
  FileText, 
  Download, 
  ShieldAlert, 
  Apple, 
  Heart,
  Stethoscope
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CTA from "../components/CTA";
import ReportPreviewSection from "../components/ReportPreviewSection";

export default function ServicesPage() {
  const services = [
    {
      title: "1. Structured Headache Intake",
      description: "Collects background, headache pattern, associated symptoms, red flags, and lifestyle data in a guided format.",
      icon: FileText,
      color: "cyan",
      tag: "For Parents & Doctors"
    },
    {
      title: "2. FRESSH Lifestyle Review",
      description: "Reviews Food, Relaxation, Exercise, Sleep, Screen time, and Hydration patterns linked to headache care discussions.",
      icon: Apple,
      color: "blue",
      tag: "For Parents"
    },
    {
      title: "3. Red Flag Review Support",
      description: "Highlights warning features entered in the form so they can be discussed with a clinician.",
      icon: ShieldAlert,
      color: "rose",
      tag: "Safety Check"
    },
    {
      title: "4. Patient Summary Report",
      description: "Creates a simple report for parents using plain language.",
      icon: Heart,
      color: "rose",
      tag: "For Parents"
    },
    {
      title: "5. Doctor Clinical Report",
      description: "Creates a structured report with clinical criteria reflections, red flags, examination prompts, and report notes.",
      icon: Stethoscope,
      color: "indigo",
      tag: "For Doctors"
    },
    {
      title: "6. Deidentified Research Export",
      description: "Exports structured non-identifiable data for research review where consent is provided.",
      icon: Download,
      color: "emerald",
      tag: "For Research"
    }
  ];

  return (
    <div className="py-16 space-y-20 transition-colors duration-300">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          tag="Our Services"
          title="Clinical assessment tools built around our intake form"
          subtitle="Helping families collect patient timelines, map diagnostic parameters, and compile pediatric dossiers with absolute precision."
        />

        {/* Intro Highlight Box */}
        <div className="p-6 sm:p-8 bg-sky-50/70 dark:bg-slate-900/40 border border-sky-100 dark:border-slate-800 rounded-3xl text-center max-w-4xl mx-auto mb-16 shadow-xs space-y-3">
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            All services are fully integrated directly within the <strong>Beat Headache New Patient Form</strong>. 
            Everything operates securely and dynamically inside your local browser tab.
          </p>
          <div className="p-3.5 bg-sky-100/50 dark:bg-sky-950/20 rounded-2xl text-xs font-bold text-sky-900 dark:text-cyan-400 border border-sky-200 dark:border-cyan-800/40">
            🔔 Note: These services support documentation and review. They do not replace clinical judgement.
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div 
                key={i} 
                className="group p-8 bg-gradient-to-br from-white to-sky-50/40 dark:from-slate-900/90 dark:to-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl hover:border-sky-300 dark:hover:border-cyan-550 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className={`inline-flex p-3 rounded-2xl ${
                      service.color === "cyan" ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400" :
                      service.color === "blue" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400" :
                      service.color === "rose" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455" :
                      service.color === "indigo" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" :
                      service.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455" :
                      "bg-amber-50 dark:bg-amber-955/40 text-amber-600"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-1 rounded-md shadow-2xs">
                      {service.tag}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-700 group-hover:dark:text-cyan-400 transition-colors duration-200">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-655 dark:text-slate-350 text-xs sm:text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Intake Outcomes & Report Previews section */}
      <ReportPreviewSection />

      {/* Safety / Compliance Callout */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white py-16 border-y border-slate-850 dark:border-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-cyan-400 mx-auto animate-pulse" />
          <h3 className="text-2xl font-bold">Clinical Data Security & Integrity</h3>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Beat Headache does not operate a cloud repository or store patient profiles online. 
            All form data, local reflection analysis, and PDF templates are rendered client-side. 
            This means you maintain 100% ownership and custody of your family's sensitive health histories at all times.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
