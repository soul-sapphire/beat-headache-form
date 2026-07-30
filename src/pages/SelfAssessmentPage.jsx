import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Send,
  QrCode,
  Calendar,
  Utensils,
  Moon,
  Dumbbell,
  Droplets,
  Tv,
  Smile,
  Activity,
  HeartPulse
} from "lucide-react";
import { createPublicAssessment } from "../services/assessmentService";

export default function SelfAssessmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdAssessment, setCreatedAssessment] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [consentMedical, setConsentMedical] = useState(false);
  const [consentStore, setConsentStore] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    age: "",
    gender: "Not specified",
    country: "India",
    email: "",
    wantsEmail: true,
    painSeverity: 5,
    frequencyDays: 4,
    durationHours: "1-4 hours",
    location: "Both sides",
    throbbing: true,
    pressure: false,
    symptoms: ["Nausea", "Light sensitivity"],
    triggers: ["Stress", "Screen Time"],
    foodScore: 6,
    sleepScore: 6,
    exerciseScore: 5,
    hydrationScore: 6,
    screenTimeScore: 5,
    relaxationScore: 5,
    worstHeadacheEver: false,
    suddenOnset: false,
    neurologicalDeficit: false,
    seizures: false,
    visionLoss: false,
    persistentVomiting: false,
    recentHeadInjury: false,
    feverStiffNeck: false,
    cancerHistory: false,
  });

  const toggleArrayItem = (field, value) => {
    setFormData((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
      };
    });
  };

  const handleNext = () => {
    if (step < 7) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmitAssessment = async () => {
    setLoading(true);
    try {
      const result = await createPublicAssessment(formData);
      setCreatedAssessment(result);
      setStep(7); // Jump to Results & Passport
    } catch (err) {
      console.error("Failed to save assessment:", err);
      alert("Failed to calculate assessment. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Has Red Flag
  const hasRedFlag =
    formData.worstHeadacheEver ||
    formData.suddenOnset ||
    formData.neurologicalDeficit ||
    formData.seizures ||
    formData.visionLoss ||
    formData.persistentVomiting ||
    formData.recentHeadInjury ||
    formData.feverStiffNeck ||
    formData.cancerHistory;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Header Progress Tracker */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-sm">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Headache Self-Assessment</h1>
                <p className="text-xs text-gray-500 font-medium">Free, Confidential & Interactive</p>
              </div>
            </div>
            {step <= 6 && (
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Step {step} of 6
              </span>
            )}
          </div>

          {step <= 6 && (
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(step / 6) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* STEP 1: WELCOME SCREEN */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8 text-center animate-in fade-in duration-300">
            <div className="w-24 h-24 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-5xl shadow-xs">
              🧠
            </div>

            <div className="space-y-3 max-w-lg mx-auto">
              <h2 className="text-3xl font-black text-gray-900">Check Your Headache</h2>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                Understand your headache burden and lifestyle impact in just a few minutes. Simple, friendly, and tailored for adults, teenagers, and parents.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-1">
                <span className="text-2xl">📊</span>
                <h4 className="text-xs font-bold text-blue-900">Burden Score</h4>
                <p className="text-[11px] text-blue-700">0–60 impact score</p>
              </div>
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-1">
                <span className="text-2xl">🍎</span>
                <h4 className="text-xs font-bold text-emerald-900">Mini FRESSH</h4>
                <p className="text-[11px] text-emerald-700">Lifestyle rating</p>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 space-y-1">
                <span className="text-2xl">💡</span>
                <h4 className="text-xs font-bold text-amber-900">Personal Advice</h4>
                <p className="text-[11px] text-amber-700">Actionable steps</p>
              </div>
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-1">
                <span className="text-2xl">📱</span>
                <h4 className="text-xs font-bold text-purple-900">QR Passport</h4>
                <p className="text-[11px] text-purple-700">Track over time</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mx-auto transition-transform active:scale-95"
              >
                🚀 Start Assessment <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BASIC DETAILS */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span>👋 Basic Details</span>
              </h2>
              <p className="text-xs text-gray-500">Help us personalize your self-assessment report.</p>
            </div>

            <div className="space-y-4 text-xs font-bold text-gray-700">
              <div>
                <label className="block mb-1">First Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Not specified">Not specified</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Email Address (Optional for Emailing Passport)</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.wantsEmail}
                  onChange={(e) => setFormData({ ...formData, wantsEmail: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-gray-600">Email me my results and QR Passport link</span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={handlePrev} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleNext} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: HEADACHE CHARACTERISTICS */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-gray-900">⚡ Headache Symptoms</h2>
              <p className="text-xs text-gray-500">Tell us about how your headaches feel.</p>
            </div>

            <div className="space-y-5 text-xs font-bold text-gray-700">
              {/* Pain Severity */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pain Severity Scale (0–10)</span>
                  <span className="text-blue-600 font-black">{formData.painSeverity} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.painSeverity}
                  onChange={(e) => setFormData({ ...formData, painSeverity: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Frequency (Days per month)</span>
                  <span className="text-blue-600 font-black">{formData.frequencyDays} days/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={formData.frequencyDays}
                  onChange={(e) => setFormData({ ...formData, frequencyDays: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Associated Symptoms */}
              <div className="space-y-2">
                <label className="block">Associated Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {["Nausea", "Vomiting", "Light sensitivity", "Sound sensitivity", "Blurred vision", "Dizziness", "Aura"].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleArrayItem("symptoms", sym)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.symptoms.includes(sym)
                          ? "bg-blue-500 text-white border-blue-500 shadow-xs"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Triggers */}
              <div className="space-y-2">
                <label className="block">Common Triggers</label>
                <div className="flex flex-wrap gap-2">
                  {["Stress", "Screen Time", "Skipped Meals", "Poor Sleep", "Dehydration", "Weather Changes"].map((trig) => (
                    <button
                      key={trig}
                      type="button"
                      onClick={() => toggleArrayItem("triggers", trig)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.triggers.includes(trig)
                          ? "bg-indigo-500 text-white border-indigo-500 shadow-xs"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {trig}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={handlePrev} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleNext} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: MINI FRESSH LIFESTYLE */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-gray-900">🌱 Mini FRESSH Lifestyle Assessment</h2>
              <p className="text-xs text-gray-500">Rate your daily habits on a scale of 0 (Poor) to 10 (Excellent).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
              {/* Food */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Utensils className="w-4 h-4 text-amber-500" /> 🍎 Food Pattern</span>
                  <span className="text-blue-600 font-black">{formData.foodScore}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.foodScore}
                  onChange={(e) => setFormData({ ...formData, foodScore: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Sleep */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Moon className="w-4 h-4 text-indigo-500" /> 😴 Sleep Hygiene</span>
                  <span className="text-blue-600 font-black">{formData.sleepScore}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.sleepScore}
                  onChange={(e) => setFormData({ ...formData, sleepScore: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Exercise */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Dumbbell className="w-4 h-4 text-emerald-500" /> 🏃 Exercise</span>
                  <span className="text-blue-600 font-black">{formData.exerciseScore}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.exerciseScore}
                  onChange={(e) => setFormData({ ...formData, exerciseScore: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Hydration */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-blue-500" /> 💧 Hydration</span>
                  <span className="text-blue-600 font-black">{formData.hydrationScore}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.hydrationScore}
                  onChange={(e) => setFormData({ ...formData, hydrationScore: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Screen Time */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Tv className="w-4 h-4 text-rose-500" /> 📱 Screen Limit</span>
                  <span className="text-blue-600 font-black">{formData.screenTimeScore}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.screenTimeScore}
                  onChange={(e) => setFormData({ ...formData, screenTimeScore: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Relaxation */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Smile className="w-4 h-4 text-purple-500" /> 🧘 Relaxation</span>
                  <span className="text-blue-600 font-black">{formData.relaxationScore}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.relaxationScore}
                  onChange={(e) => setFormData({ ...formData, relaxationScore: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={handlePrev} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleNext} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: RED FLAGS SCREENING */}
        {step === 5 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-rose-600 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Safety & Red Flag Screening
              </h2>
              <p className="text-xs text-gray-500">Check any high-priority medical symptoms below.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-gray-700">
              {[
                { key: "worstHeadacheEver", label: "Worst headache ever experienced" },
                { key: "suddenOnset", label: "Thunderclap / sudden onset (<1 min)" },
                { key: "neurologicalDeficit", label: "Weakness or numbness in arm/leg" },
                { key: "seizures", label: "New onset seizures or convulsions" },
                { key: "visionLoss", label: "Sudden vision loss or double vision" },
                { key: "persistentVomiting", label: "Persistent projectile vomiting" },
                { key: "recentHeadInjury", label: "Recent head trauma or injury" },
                { key: "feverStiffNeck", label: "High fever with neck stiffness" },
                { key: "cancerHistory", label: "History of cancer or low immunity" },
              ].map((rf) => (
                <label
                  key={rf.key}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    formData[rf.key]
                      ? "bg-rose-50 border-rose-300 text-rose-900 font-bold"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData[rf.key]}
                    onChange={(e) => setFormData({ ...formData, [rf.key]: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 mt-0.5"
                  />
                  <span>{rf.label}</span>
                </label>
              ))}
            </div>

            {hasRedFlag && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
                <h4 className="font-bold flex items-center gap-1 text-rose-700">
                  <AlertTriangle className="w-4 h-4" /> Emergency Guidance Triggered
                </h4>
                <p className="leading-relaxed">
                  Red flag symptoms require immediate medical evaluation. Please do not rely solely on online self-assessments.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={handlePrev} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleNext} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                Review & Calculate <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {step === 6 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-gray-900">✨ Review & Generate Digital Passport</h2>
              <p className="text-xs text-gray-500">Confirm details before generating your confidential score.</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl space-y-3 text-xs font-medium text-gray-700 border border-gray-200">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>User:</span> <strong className="text-gray-900">{formData.firstName || "Anonymous"} ({formData.age || "N/A"} yrs)</strong>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Pain Severity:</span> <strong className="text-blue-600 font-bold">{formData.painSeverity} / 10</strong>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Headache Frequency:</span> <strong className="text-gray-900">{formData.frequencyDays} days/mo</strong>
              </div>
              <div className="flex justify-between">
                <span>Red Flags Selected:</span>
                <strong className={hasRedFlag ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                  {hasRedFlag ? "YES (Emergency Guidance)" : "None"}
                </strong>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs font-bold text-gray-700">
              <span className="block text-gray-900 font-extrabold uppercase text-[11px]">Mandatory Medical Consent</span>
              
              <label className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentMedical}
                  onChange={(e) => setConsentMedical(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                />
                <span className="text-blue-900 leading-snug">I understand this self-assessment is NOT a formal medical diagnosis and does not replace clinical evaluation.</span>
              </label>

              <label className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentStore}
                  onChange={(e) => setConsentStore(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                />
                <span className="text-blue-900 leading-snug">I consent to securely storing my assessment and reassessments under my unique Digital Passport ID.</span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={handlePrev} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                disabled={loading || !consentMedical || !consentStore}
                onClick={handleSubmitAssessment}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Generating Passport..." : "🎉 Generate Digital Passport"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: RESULTS & DIGITAL PASSPORT */}
        {step === 7 && createdAssessment && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8 animate-in fade-in duration-500">
            {/* Results Header */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl shadow-xs">
                {createdAssessment.latestSeverity.includes("Red Flag") ? "⚠️" : createdAssessment.latestHeadacheScore >= 36 ? "🔴" : createdAssessment.latestHeadacheScore >= 24 ? "🟡" : "🟢"}
              </div>
              <h2 className="text-2xl font-black text-gray-900">Your Assessment Results</h2>
              <span className={`inline-block text-xs font-black px-4 py-1.5 rounded-full border ${
                createdAssessment.latestSeverity.includes("Red Flag") ? "bg-rose-50 text-rose-700 border-rose-200" :
                createdAssessment.latestHeadacheScore >= 36 ? "bg-orange-50 text-orange-700 border-orange-200" :
                "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                {createdAssessment.latestSeverity}
              </span>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl text-center space-y-1">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Headache Burden Score</span>
                <div className="text-4xl font-black text-blue-900">{createdAssessment.latestHeadacheScore} <span className="text-xs font-bold text-blue-500">/60</span></div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl text-center space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Mini FRESSH Score</span>
                <div className="text-4xl font-black text-emerald-900">{createdAssessment.latestFresshScore} <span className="text-xs font-bold text-emerald-500">/60</span></div>
              </div>
            </div>

            {/* QR Digital Passport */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-6 text-center">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Digital Headache Passport</span>
                <h3 className="text-xl font-black">ID: {createdAssessment.assessmentId}</h3>
              </div>

              <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto">
                <QRCodeCanvas
                  value={`${window.location.origin}/assessment/${createdAssessment.assessmentId}`}
                  size={160}
                />
              </div>

              <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium">
                Scan or save this QR Passport to track your reassessments over time. No personal data is embedded inside the QR code.
              </p>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate(`/assessment/${createdAssessment.assessmentId}`)}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" /> Open Passport View
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700"
                >
                  <Send className="w-4 h-4" /> Preview Email Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL PREVIEW MODAL */}
        {showEmailModal && createdAssessment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-gray-900 text-sm">HTML Email Summary Preview</h3>
                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 font-bold hover:text-gray-600">✕</button>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border text-xs text-gray-700 space-y-2">
                <p><strong>Subject:</strong> Your Beat Headache Assessment Results [{createdAssessment.assessmentId}]</p>
                <hr />
                <p>Hello {createdAssessment.firstName},</p>
                <p>Thank you for completing your Beat Headache Self-Assessment.</p>
                <p><strong>Burden Score:</strong> {createdAssessment.latestHeadacheScore} / 60 ({createdAssessment.latestSeverity})</p>
                <p><strong>Mini FRESSH Score:</strong> {createdAssessment.latestFresshScore} / 60</p>
                <p><strong>Passport ID:</strong> {createdAssessment.assessmentId}</p>
                <p className="text-[11px] text-gray-400 italic">This assessment is educational only and does not replace medical advice.</p>
              </div>

              <button
                onClick={() => setShowEmailModal(false)}
                className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer Footer */}
        <div className="text-center pt-4">
          <p className="text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed font-medium">
            ⚠️ <strong>Medical Disclaimer:</strong> This self-assessment is educational and informational only. It does not provide formal medical diagnosis or treatment plans. If you experience severe red flag symptoms, consult an emergency healthcare professional immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
