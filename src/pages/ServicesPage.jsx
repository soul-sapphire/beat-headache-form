import React from "react";
import { 
  FileText, 
  Activity, 
  UserCheck, 
  FileCheck, 
  Download, 
  ShieldAlert, 
  Apple, 
  Heart,
  Stethoscope
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CTA from "../components/CTA";

export default function ServicesPage() {
  const services = [
    {
      title: "1. Structured Headache Intake",
      description: "A guided, step-by-step form collecting comprehensive patient history, headache duration patterns, development history, active medication logs, and neurological pain categories.",
      icon: FileText,
      color: "cyan"
    },
    {
      title: "2. FRESSH Lifestyle Review",
      description: "A holistic tracking rubric looking closely at: Food patterns, Relaxation time, Exercise habits, Sleep duration, Screen time exposure, and Hydration metrics to spotlight pediatric headache triggers.",
      icon: Apple,
      color: "blue"
    },
    {
      title: "3. Patient-Friendly Report",
      description: "Generates an easy-to-read, beautifully formatted summary for families to understand their child's timeline, lifestyle scores, and daily patterns in non-technical wording.",
      icon: Heart,
      color: "rose"
    },
    {
      title: "4. Doctor Clinical Report",
      description: "Compiles a high-density clinical report complete with ICHD-3 criteria matching, developmental red flags, physical exam checklists, and investigation guidance ready for pediatrician review.",
      icon: Stethoscope,
      color: "indigo"
    },
    {
      title: "5. Research Export",
      description: "Supports advanced research compliance with deidentified CSV/JSON export. Parents can securely save and email deidentified logs for clinical cohort studies where consent is given.",
      icon: Download,
      color: "emerald"
    },
    {
      title: "6. Clinical Review Support",
      description: "Organizes and pre-formats crucial health histories to optimize face-to-face physician time. Note: This provides structured support and does not replace medical diagnostics.",
      icon: UserCheck,
      color: "amber"
    }
  ];

  return (
    <div className="py-16 space-y-16">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          tag="Our Framework"
          title="Clinical assessment services built around our patient form"
          subtitle="Helping families collect patient timelines, map diagnostic parameters, and compile pediatric dossiers with absolute precision."
        />

        {/* Intro Highlight Box */}
        <div className="p-6 sm:p-8 bg-white border border-slate-100 rounded-3xl shadow-sm text-center max-w-4xl mx-auto mb-16">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            All services are fully integrated directly within the <strong>Beat Headache New Patient Form</strong>. 
            There are no separate fees, no cloud logins, and no external application requirements. 
            Everything operates securely and dynamically inside your local browser tab.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div 
                key={i} 
                className="group p-8 bg-white border border-slate-100 rounded-3xl hover:border-cyan-100 hover:shadow-lg hover:shadow-cyan-100/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`inline-flex p-3 rounded-2xl ${
                    service.color === "cyan" ? "bg-cyan-50 text-cyan-600" :
                    service.color === "blue" ? "bg-blue-50 text-blue-600" :
                    service.color === "rose" ? "bg-rose-50 text-rose-600" :
                    service.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                    service.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety / Compliance Callout */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-cyan-600 mx-auto" />
          <h3 className="text-2xl font-bold text-slate-950">Clinical Data Security & Integrity</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
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
