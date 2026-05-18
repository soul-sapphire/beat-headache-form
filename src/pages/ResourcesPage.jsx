import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  HelpCircle, 
  Calendar, 
  Eye, 
  Apple, 
  AlertTriangle,
  FileText
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CTA from "../components/CTA";

export default function ResourcesPage() {
  const resourceCards = [
    {
      title: "Keeping a headache diary",
      description: "Track date, time, duration, severity, triggers, medicine use, and school impact.",
      icon: BookOpen,
      color: "cyan",
      category: "Clinical Practice"
    },
    {
      title: "Common triggers to discuss",
      description: "Meals, sleep, hydration, stress, screen time, activity, and environmental factors.",
      icon: HelpCircle,
      color: "blue",
      category: "Trigger Management"
    },
    {
      title: "When to seek urgent help",
      description: "Sudden severe headache, neurological symptoms, fever with neck stiffness, head injury, persistent vomiting, or confusion.",
      icon: AlertTriangle,
      color: "amber",
      category: "Emergency Check"
    },
    {
      title: "Preparing for a doctor visit",
      description: "Bring headache pattern, medicine use, family history, red flags, and lifestyle information.",
      icon: Calendar,
      color: "indigo",
      category: "Intake Prep"
    },
    {
      title: "Understanding aura",
      description: "Aura can include visual, sensory, speech, motor, brainstem, or retinal symptoms. A doctor should confirm whether symptoms fit migraine aura criteria.",
      icon: Eye,
      color: "purple",
      category: "Neurology Guide"
    },
    {
      title: "FRESSH habits",
      description: "Food, Relaxation, Exercise, Sleep, Screen time, and Hydration help organize lifestyle discussion.",
      icon: Apple,
      color: "emerald",
      category: "Lifestyle Medicine"
    }
  ];

  return (
    <div className="py-16 space-y-20 transition-colors duration-300">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          tag="Patient Library"
          title="Parent-friendly guides and headache resources"
          subtitle="Simple, science-backed guidance to help you understand pediatric headaches, prepare for clinic visits, and optimize daily habits."
        />

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resourceCards.map((res, i) => {
            const Icon = res.icon;
            return (
              <div 
                key={i} 
                className="group p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl hover:border-cyan-300 dark:hover:border-cyan-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className={`inline-flex p-3 rounded-2xl ${
                      res.color === "cyan" ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400" :
                      res.color === "blue" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400" :
                      res.color === "amber" ? "bg-amber-50 dark:bg-amber-955/40 text-amber-600" :
                      res.color === "indigo" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" :
                      res.color === "purple" ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" :
                      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-md">
                      {res.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 group-hover:dark:text-cyan-400 transition-colors duration-200">
                    {res.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-350 text-xs sm:text-sm leading-relaxed font-normal">
                    {res.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Library Callout - Dark Navy/Sky Gradient Card Block */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white shadow-xl overflow-hidden p-8 sm:p-12 text-center space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Empower Your Clinical Visit</h3>
            <p className="text-slate-355 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-normal">
              By filling out the guided intake form, you can organize your observations into a neat, formatted timeline. 
              This makes it exceptionally easy to discuss symptoms, rule out red flags, and establish a clear plan with your child's pediatrician.
            </p>
          </div>
          
          <div className="relative z-10 pt-2">
            <Link
              to="/new-patient"
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-500 hover:to-sky-500 text-slate-950 rounded-xl font-bold shadow-md shadow-cyan-400/10 transition-all duration-200 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
            >
              <FileText className="h-4.5 w-4.5 text-slate-950" />
              <span>Use the New Patient Form to organize your child’s headache info</span>
            </Link>
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
