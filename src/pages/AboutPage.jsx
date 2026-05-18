import React from "react";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Clock, 
  Stethoscope, 
  Database, 
  ShieldAlert, 
  Sparkles,
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
      title: "Comprehensive Clinical History",
      description: "Gathering detailed duration, pain nature, triggering factors, and associated symptoms like visual issues or light sensitivity.",
      icon: Stethoscope
    },
    {
      title: "Red Flags & Safety Screening",
      description: "Automatically cross-referencing patient logs with systemic, neurological, and positional pediatric red flags for urgent notice.",
      icon: ShieldAlert
    },
    {
      title: "FRESSH Lifestyle Baseline",
      description: "Analyzing daily routines: Food intake, Relaxation time, Exercise duration, Sleep habits, Screen time exposure, and Hydration.",
      icon: TrendingUp
    },
    {
      title: "Doctor-Ready Dossiers",
      description: "Compiling formatted clinical PDF reports mapping symptoms to ICHD-3 diagnostics, so specialists can jump straight to treatment planning.",
      icon: ClipboardCheck
    }
  ];

  return (
    <div className="py-16 space-y-20">
      {/* 1. Hero / Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          tag="Our Mission"
          title="Translating observations into actionable clinical pathways"
          subtitle="Helping families navigate childhood headaches through structured historical intakes, lifestyle analysis, and secure reporting."
        />
        
        {/* Core Mission Banner */}
        <div className="mt-8 p-8 bg-gradient-to-br from-cyan-50 to-blue-50/70 border border-cyan-100 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">Why Beat Headache Exists</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Childhood headaches can be challenging for families to explain and complex for pediatricians to diagnose. Important details regarding frequency, pain quality, premonitory symptoms, and lifestyle indicators often get lost in high-stress clinic consultations.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Beat Headache provides a structured framework that parents can complete calmly in their own home. It bridges the gap between home-based observations and clinical diagnosis.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-cyan-600">
              <Heart className="h-6 w-6 shrink-0" />
              <span className="font-bold text-slate-900 text-base">Caregiver-Centered Support</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              We focus heavily on the parent and child experience. Our system features localized drafting, allowing you to pause, check details with your child, and return to the form anytime.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 font-medium italic">
              "Structured history collection is the single most critical diagnostic element in secondary and primary pediatric headache evaluation."
            </div>
          </div>
        </div>
      </div>

      {/* 2. Why child headache history matters */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">Clinical Context</span>
            <h3 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Why structured child headache history matters
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Unlike adults, young patients may struggle to characterize headache qualities, locations, or trigger interactions.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                <p className="text-slate-700 text-sm">
                  <strong>Eliminate Recall Bias:</strong> Tracks exact days, severity ratings, and medication usage over the past four weeks.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                <p className="text-slate-700 text-sm">
                  <strong>Identify Trigger Overlaps:</strong> Maps screen time peaks, skipped meals, and sleep deficiencies directly against headache episodes.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                <p className="text-slate-700 text-sm">
                  <strong>Safety First:</strong> Systematically triggers alerts when red flag combinations (systemic, neurological, positional) occur.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h4 className="font-bold text-slate-900 mb-2">No Diagnostic Substitutes</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We believe in providing the pediatrician with clean data, not replacing them. Beat Headache does not prescribe, nor does it deliver automated final diagnostic tags. It organizes data to empower medical clinicians.
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h4 className="font-bold text-slate-900 mb-2">No Guarantee Claims</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Headaches are multifactorial. We make no claims of cures, guaranteed clinical remedies, or instantaneous relief pathways. We focus entirely on helping you build a clear, clinical summary.
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h4 className="font-bold text-slate-900 mb-2">Research-Ready Architecture</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If families provide explicit consent, they can export their completed assessments as completely deidentified JSON or CSV strings. This helps academic partners investigate trends in pediatric head pain safely.
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h4 className="font-bold text-slate-900 mb-2">100% Local Confidentiality</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Privacy by design. No clinical inputs, patient names, birth dates, or contact logs are saved in an online database. All drafts remain saved in the local browser state on your current device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Holistic Approach: 4 pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-cyan-600 text-sm font-bold uppercase tracking-wider">Methodology</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Our Holistic Four-Pillar Structure
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            How we translate everyday observations into high-value pediatric assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                <div className="inline-flex p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{pillar.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Doctor Confirmation Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 bg-blue-950 text-white rounded-3xl space-y-4 shadow-xl text-center">
          <Brain className="h-10 w-10 text-cyan-400 mx-auto animate-pulse" />
          <h3 className="text-2xl font-bold">Important Clinical Confirmation Rule</h3>
          <p className="text-sm text-cyan-100 leading-relaxed max-w-2xl mx-auto">
            Our forward-reflection rules display mapping suggestions to specific primary headache categories (e.g., Migraine with/without Aura, Tension Type, Cluster Headaches) based on ICHD-3 criteria. 
            <strong> These are educational prompts only. A qualified pediatrician must verify and make the final diagnosis.</strong>
          </p>
          <div className="pt-2">
            <span className="inline-block text-xs font-semibold text-cyan-200 bg-blue-900/60 px-4 py-2 rounded-lg border border-blue-800">
              No cloud accounts required • No Google Login required
            </span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
