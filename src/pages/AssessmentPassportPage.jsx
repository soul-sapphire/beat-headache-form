import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Brain,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  QrCode,
  ArrowRight,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Clock,
  Download,
  ShieldAlert,
  Sliders,
  Send
} from "lucide-react";
import { getPublicAssessment, appendReassessment } from "../services/assessmentService";
import TrafficLightCard from "../components/assessment/TrafficLightCard";
import AchievementBadgeCard from "../components/assessment/AchievementBadgeCard";
import PassportWalletCard from "../components/assessment/PassportWalletCard";
import { generatePassportPdf } from "../reports/passportPdfGenerator";
import { sendAssessmentEmail } from "../services/emailService";

import PatientGoalsCard from "../components/assessment/PatientGoalsCard";
import RiskForecastCard from "../components/assessment/RiskForecastCard";

export default function AssessmentPassportPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessmentDoc, setAssessmentDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReassessModal, setShowReassessModal] = useState(false);
  const [reassessLoading, setReassessLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Reassessment Form State
  const [reassessForm, setReassessForm] = useState({
    painSeverity: 5,
    frequencyDays: 4,
    foodScore: 6,
    sleepScore: 6,
    exerciseScore: 6,
    hydrationScore: 6,
    screenTimeScore: 5,
    relaxationScore: 5,
    worstHeadacheEver: false,
    suddenOnset: false,
    symptoms: ["Nausea"],
    triggers: ["Stress"],
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicAssessment(assessmentId);
      if (!data) {
        setError("Digital Passport not found. Please check your Assessment ID.");
      } else {
        setAssessmentDoc(data);
      }
    } catch (err) {
      console.error("Failed to load passport:", err);
      setError("Failed to load Digital Passport. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  const handleReassessSubmit = async (e) => {
    e.preventDefault();
    setReassessLoading(true);
    try {
      await appendReassessment(assessmentId, reassessForm);
      setShowReassessModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to append reassessment:", err);
      alert("Failed to submit reassessment.");
    } finally {
      setReassessLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!assessmentDoc?.email) {
      alert("No email address associated with this passport.");
      return;
    }
    try {
      await sendAssessmentEmail(assessmentDoc);
      setEmailStatus("Email summary sent successfully to " + assessmentDoc.email);
    } catch (err) {
      console.error("Failed to send email:", err);
      alert("Failed to send email summary.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border text-center space-y-3">
          <Brain className="w-8 h-8 text-blue-500 animate-bounce mx-auto" />
          <p className="text-xs font-bold text-gray-600">Loading Digital Passport...</p>
        </div>
      </div>
    );
  }

  if (error || !assessmentDoc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-gray-900">Passport Not Found</h2>
          <p className="text-xs text-gray-500">{error || "No passport details available."}</p>
          <button
            onClick={() => navigate("/self-assessment")}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  const history = assessmentDoc.assessmentHistory || [];
  const latestEntry = history[history.length - 1] || {};
  const firstEntry = history[0] || {};

  // Days since last assessment
  const lastDate = new Date(latestEntry.assessmentDate || assessmentDoc.updatedAt || Date.now());
  const daysAgo = Math.max(0, Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24)));

  // PART 4 — SMART REASSESSMENT ENGINE (Recommended Interval)
  let intervalDays = 30; // Low burden default
  if (latestEntry.severity?.includes("Red Flag")) intervalDays = 0;
  else if (latestEntry.headacheScore >= 48) intervalDays = 3;
  else if (latestEntry.headacheScore >= 36) intervalDays = 7;
  else if (latestEntry.headacheScore >= 24) intervalDays = 14;

  const nextDueDate = new Date(lastDate);
  nextDueDate.setDate(nextDueDate.getDate() + intervalDays);
  const daysRemaining = Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining <= 0;

  // Trajectory Trend Calculation
  let trend = "Stable";
  if (history.length > 1) {
    const prevEntry = history[history.length - 2];
    const diff = latestEntry.headacheScore - prevEntry.headacheScore;
    if (diff < 0) trend = "Improving";
    else if (diff > 0) trend = "Worsening";
  }

  // PART 7 — MULTI-VISIT DETERMINISTIC TREND ANALYSIS (NO AI)
  const trendInsights = [];
  if (history.length === 1) {
    trendInsights.push(`Baseline assessment recorded on ${lastDate.toLocaleDateString()}.`);
    trendInsights.push(`Current Headache Burden: ${latestEntry.headacheScore}/60 (${latestEntry.severity}).`);
  } else {
    const scoreDiff = latestEntry.headacheScore - firstEntry.headacheScore;
    const fresshDiff = latestEntry.fresshScore - firstEntry.fresshScore;

    if (scoreDiff < 0) trendInsights.push(`Headache burden has reduced by ${Math.abs(scoreDiff)} points since initial baseline.`);
    else if (scoreDiff > 0) trendInsights.push(`Headache burden has increased by ${scoreDiff} points since initial baseline.`);
    else trendInsights.push(`Headache burden remains stable compared to baseline.`);

    if (fresshDiff > 0) trendInsights.push(`Mini FRESSH lifestyle score improved by +${fresshDiff} points.`);
    else if (fresshDiff < 0) trendInsights.push(`Mini FRESSH lifestyle score declined by ${fresshDiff} points.`);
  }

  // Chart Data Processing
  const chartData = history.map((entry, idx) => ({
    label: `Assmt ${idx + 1}`,
    headacheScore: entry.headacheScore || 0,
    fresshScore: entry.fresshScore || 0,
    date: new Date(entry.assessmentDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Digital Passport Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                Beat Headache Digital Passport (V2)
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">
                ID: {assessmentDoc.assessmentId}
              </h1>
              <p className="text-xs text-slate-300">
                Owner: <strong>{assessmentDoc.firstName || "Anonymous"}</strong> | Recorded: {history.length} {history.length === 1 ? "Assessment" : "Reassessments"}
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-2xl shrink-0 shadow-md">
              <QRCodeCanvas
                value={`${window.location.origin}/assessment/${assessmentDoc.assessmentId}`}
                size={80}
              />
            </div>
          </div>

          {/* PART 5 — Welcome Back Experience & PART 4 — Reassessment Countdown */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👋</span>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-100">Welcome Back!</p>
                <p className="text-slate-300">
                  Last assessment was {daysAgo === 0 ? "today" : `${daysAgo} days ago`}. Next recommended check:{" "}
                  <strong className={isOverdue ? "text-rose-400 font-black" : "text-emerald-400"}>
                    {nextDueDate.toLocaleDateString()} ({isOverdue ? "OVERDUE" : `${daysRemaining} days remaining`})
                  </strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowReassessModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 shrink-0"
            >
              <RefreshCw className="w-4 h-4" /> Start Reassessment
            </button>
          </div>
        </div>

        {/* Email Alert Banner if dispatched */}
        {emailStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailStatus}</span>
          </div>
        )}

        {/* PART 13 — Traffic Light Dashboard */}
        <TrafficLightCard latestEntry={latestEntry} />

        {/* Status & Scores Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Headache Burden</span>
            <div className="text-3xl font-black text-blue-600">{latestEntry.headacheScore || 0} <span className="text-xs font-bold text-blue-400">/60</span></div>
            <span className="text-xs font-bold text-gray-500">{latestEntry.severity || "Low"}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mini FRESSH</span>
            <div className="text-3xl font-black text-emerald-600">{latestEntry.fresshScore || 0} <span className="text-xs font-bold text-emerald-400">/60</span></div>
            <span className="text-xs font-bold text-gray-500">Lifestyle Score</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Progress Trajectory</span>
            <div className="flex items-center gap-2 pt-1">
              <span className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 ${
                trend === "Improving" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                trend === "Worsening" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                "bg-gray-100 text-gray-700 border border-gray-200"
              }`}>
                {trend === "Improving" && "🎉 Improving"}
                {trend === "Worsening" && "⚠️ Worsening"}
                {trend === "Stable" && "🙂 Stable"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 pt-1">Based on {history.length} entries</p>
          </div>
        </div>

        {/* PART 9 — Lifestyle Achievements */}
        <AchievementBadgeCard history={history} />

        {/* PART 6 — Risk Forecast Engine */}
        <RiskForecastCard history={history} />

        {/* PART 7 & 8 — Patient Goals & Weekly Streaks */}
        <PatientGoalsCard history={history} />

        {/* PART 6 & PART 7 — Longitudinal Dashboard & Trend Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Longitudinal Score Trajectory
              </h3>
              <span className="text-xs text-gray-400 font-semibold">{history.length} Points</span>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis domain={[0, 60]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="headacheScore" name="Headache Burden" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="fresshScore" name="Mini FRESSH" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Analysis Box */}
          <div className="bg-blue-50/60 border border-blue-100 p-6 rounded-3xl space-y-3 text-xs font-medium text-blue-900">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-blue-950">
              <Sparkles className="w-4 h-4 text-blue-600" /> Deterministic Trend Analysis
            </h3>
            <ul className="space-y-2 leading-relaxed">
              {trendInsights.map((ti, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{ti}</span>
                </li>
              ))}
            </ul>
            {assessmentDoc.email && (
              <div className="pt-2 border-t border-blue-200/60">
                <button
                  onClick={handleSendEmail}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Email Summary PDF Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PART 10 — Printable Wallet Passport Card */}
        <PassportWalletCard assessmentDoc={assessmentDoc} />

        {/* REASSESSMENT MODAL */}
        {showReassessModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-gray-900 text-sm">📝 Start Reassessment</h3>
                <button onClick={() => setShowReassessModal(false)} className="text-gray-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleReassessSubmit} className="space-y-4 text-xs font-bold text-gray-700">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Current Pain Severity (0-10)</span>
                    <span className="text-blue-600">{reassessForm.painSeverity}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={reassessForm.painSeverity}
                    onChange={(e) => setReassessForm({ ...reassessForm, painSeverity: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Headache Frequency (Days/month)</span>
                    <span className="text-blue-600">{reassessForm.frequencyDays} days/mo</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={reassessForm.frequencyDays}
                    onChange={(e) => setReassessForm({ ...reassessForm, frequencyDays: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block mb-1">Hydration Score (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={reassessForm.hydrationScore}
                      onChange={(e) => setReassessForm({ ...reassessForm, hydrationScore: Number(e.target.value) })}
                      className="w-full p-2 bg-gray-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Sleep Score (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={reassessForm.sleepScore}
                      onChange={(e) => setReassessForm({ ...reassessForm, sleepScore: Number(e.target.value) })}
                      className="w-full p-2 bg-gray-50 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReassessModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reassessLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl"
                  >
                    {reassessLoading ? "Saving..." : "Submit Reassessment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Disclaimer Footer */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed font-medium">
            ⚠️ <strong>Medical Disclaimer:</strong> This digital passport and self-assessment history are for educational tracking only and do not replace formal clinical consultation.
          </p>
        </div>
      </div>
    </div>
  );
}
