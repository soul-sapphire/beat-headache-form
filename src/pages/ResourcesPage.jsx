import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  HelpCircle, 
  Calendar, 
  Eye, 
  Apple, 
  AlertTriangle,
  FileText,
  Activity
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import CTA from "../components/CTA";

export default function ResourcesPage() {
  const resourceCards = [
    {
      title: "Headache Diary Basics",
      description: "Learn how keeping a simple log of attack dates, peak severity, durations, and relief measures helps identify long-term patterns and seasonal variations.",
      icon: BookOpen,
      color: "cyan"
    },
    {
      title: "Common Headache Triggers",
      description: "Discover primary pediatric headache triggers, including sensory overstimulation, emotional stress, irregular meal schedules, and changes in local weather.",
      icon: HelpCircle,
      color: "blue"
    },
    {
      title: "When to Seek Urgent Care",
      description: "Keep this list handy: Sudden severe pain, concurrent high fever, neck stiffness, severe vomiting, waking up from sleep, or post-injury symptoms require rapid evaluation.",
      icon: AlertTriangle,
      color: "amber"
    },
    {
      title: "Preparing for a Doctor Visit",
      description: "Arrive prepared. Gather family histories, summarize past treatments, list all active over-the-counter painkillers, and bring your Beat Headache PDF report.",
      icon: Calendar,
      color: "indigo"
    },
    {
      title: "Understanding Aura",
      description: "Learn to recognize the reversible visual distortions (e.g., zigzag lines, blind spots), numbness, or motor speech changes that can precede migraine attacks.",
      icon: Eye,
      color: "purple"
    },
    {
      title: "FRESSH Lifestyle Habits",
      description: "Explore the FRESSH rubric: Focus on consistent meals (Food), relaxation gaps, outdoor play (Exercise), stable sleep hours, minimal screen time, and hydration.",
      icon: Apple,
      color: "emerald"
    }
  ];

  return (
    <div className="py-16 space-y-16">
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
                className="group p-8 bg-white border border-slate-100 rounded-3xl hover:border-cyan-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`inline-flex p-3 rounded-2xl ${
                    res.color === "cyan" ? "bg-cyan-50 text-cyan-600" :
                    res.color === "blue" ? "bg-blue-50 text-blue-600" :
                    res.color === "amber" ? "bg-amber-50 text-amber-600" :
                    res.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                    res.color === "purple" ? "bg-purple-50 text-purple-600" :
                    "bg-emerald-50 text-emerald-600"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    {res.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {res.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Library Callout */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h3 className="text-2xl font-bold text-slate-950">Empower Your Clinical Visit</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            By filling out the guided intake form, you can organize your observations into a neat, formatted timeline. 
            This makes it exceptionally easy to discuss symptoms, rule out red flags, and establish a clear plan with your child's pediatrician.
          </p>
          <div className="pt-2">
            <Link
              to="/new-patient"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md shadow-cyan-100 transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              <span>Use the New Patient Form to organize your child’s headache info</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
