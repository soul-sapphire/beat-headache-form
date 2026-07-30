import React from "react";
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck } from "lucide-react";

export default function RiskForecastCard({ history }) {
  if (!history || history.length === 0) return null;

  const latest = history[history.length - 1] || {};
  const first = history[0] || {};

  const scoreDiff = history.length > 1 ? (latest.headacheScore || 0) - (first.headacheScore || 0) : 0;

  let forecastText = "";
  let forecastType = "stable"; // 'improving' | 'worsening' | 'stable'

  if (scoreDiff < 0) {
    forecastType = "improving";
    forecastText = "Your headaches have steadily improved over recent check-ins. If your current lifestyle habits continue, your headache burden is likely to remain low and stable.";
  } else if (scoreDiff > 0) {
    forecastType = "worsening";
    forecastText = "Your headache burden has shown an upward trajectory over recent check-ins. We strongly recommend scheduling a clinical evaluation at the Beat Headache Clinic.";
  } else {
    forecastType = "stable";
    forecastText = "Your headache pattern is currently stable. Maintain consistent hydration and sleep habits, and check in again in 2–4 weeks.";
  }

  return (
    <div className={`p-6 rounded-3xl border space-y-3 shadow-xs text-xs ${
      forecastType === "improving" ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" :
      forecastType === "worsening" ? "bg-amber-50/80 border-amber-200 text-amber-950" :
      "bg-blue-50/80 border-blue-200 text-blue-950"
    }`}>
      <div className="flex items-center gap-2 font-black text-sm">
        {forecastType === "improving" && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
        {forecastType === "worsening" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
        {forecastType === "stable" && <TrendingUp className="w-5 h-5 text-blue-600" />}
        <h3>Trajectory Risk Forecast (Educational Estimate)</h3>
      </div>

      <p className="leading-relaxed font-medium">
        {forecastText}
      </p>

      <p className="text-[10px] opacity-75 italic">
        * Estimates expected trajectory based strictly on historical self-assessment trends. Not a clinical prognosis.
      </p>
    </div>
  );
}
