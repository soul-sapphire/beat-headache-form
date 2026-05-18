import React from "react";
import { 
  ArrowRight, 
  Activity, 
  BookOpen, 
  Lock, 
  ShieldAlert
} from "lucide-react";

export default function MeetLumiSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border border-slate-800 shadow-2xl rounded-[2.5rem] relative overflow-hidden">
        {/* Subtle glowing elements */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Glowing Chat Box Mockup */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-cyan-500/25 rounded-md">
                  <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-white tracking-wide">Lumi Assistant</h5>
                  <p className="text-[9px] text-slate-400 font-semibold">Safe, Local Intake Helper</p>
                </div>
              </div>
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 min-h-[180px] flex flex-col justify-end text-[11px] sm:text-xs">
              
              {/* Message 1 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-2.5 max-w-[90%] text-slate-300 self-start leading-normal">
                Hi! I'm Lumi. I can explain form pages, red flags, aura features, reports, and privacy safeguards. How can I help you?
              </div>

              {/* Message 2 */}
              <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl rounded-tr-none p-2.5 max-w-[85%] self-end leading-normal">
                What is FRESSH?
              </div>

              {/* Message 3 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-2.5 max-w-[90%] text-slate-300 self-start leading-normal">
                FRESSH stands for Food, Relaxation, Exercise, Sleep, Screen time, and Hydration. It organizes lifestyle details to discuss during your doctor visit.
              </div>

            </div>

            {/* Chat Input Sim */}
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
              <div className="flex-grow px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-500 font-medium">
                Ask Lumi a question about the form...
              </div>
              <div className="p-2 bg-cyan-500 rounded-xl text-slate-950 cursor-pointer shadow-md">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

          </div>

          {/* Right Column: Meet Lumi Text & Safeguards */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 uppercase tracking-wide">
              Meet Lumi intake Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Your Personal local Help Assistant
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Lumi is our built-in offline-first assistant designed to explain the website pages, form metrics, and report terms in straightforward, patient-friendly language.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold">
                  <Lock className="h-4 w-4" />
                  <span>In-Browser Privacy</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Lumi runs locally in your browser. Absolutely no chat inputs or text descriptions are uploaded, saved, or shared online.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold">
                  <BookOpen className="h-4 w-4" />
                  <span>Form Walkthroughs</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Get quick instructions on Page 1 (details) through Page 7 (reports) so you know exactly what is requested.
                </p>
              </div>
            </div>

            {/* Strict Medical Boundary Warning */}
            <div className="p-4.5 bg-rose-500/15 border border-rose-500/35 rounded-2xl flex items-start space-x-3.5">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <h5 className="text-xs font-black text-rose-300 uppercase tracking-wide">Strict Clinical Boundaries</h5>
                <p className="text-[11px] text-rose-200 leading-relaxed font-semibold">
                  Lumi does not diagnose medical conditions, recommend specific painkillers/medications (e.g. Paracetamol, Panadol, Ibuprofen), or replace a clinician. Emergency warning signs require immediate medical attention.
                </p>
              </div>
            </div>

            {/* Interactive prompt pointer */}
            <p className="text-xs text-slate-400 font-medium italic">
              👉 Look for the "Ask Lumi" bubble in the bottom right corner of the website to start chatting locally at any time!
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}
