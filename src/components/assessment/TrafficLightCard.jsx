import React from "react";
import { Activity, ShieldCheck, AlertTriangle } from "lucide-react";

export default function TrafficLightCard({ latestEntry }) {
  if (!latestEntry) return null;

  const lifestyle = latestEntry.lifestyleDetails || {};
  const headacheScore = latestEntry.headacheScore || 0;
  const painSeverity = latestEntry.painSeverity || 5;

  const getStatus = (score, isLowerBetter = false) => {
    if (isLowerBetter) {
      if (score <= 24) return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "🟢", label: "Low Impact" };
      if (score <= 40) return { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "🟡", label: "Moderate Impact" };
      return { color: "bg-rose-50 text-rose-700 border-rose-200", dot: "🔴", label: "High Impact" };
    } else {
      if (score >= 8) return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "🟢", label: "Optimal" };
      if (score >= 5) return { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "🟡", label: "Moderate" };
      return { color: "bg-rose-50 text-rose-700 border-rose-200", dot: "🔴", label: "Needs Attention" };
    }
  };

  const domainList = [
    { label: "Overall Burden", status: getStatus(headacheScore, true) },
    { label: "Food Pattern", status: getStatus(lifestyle.foodScore || 5) },
    { label: "Sleep Hygiene", status: getStatus(lifestyle.sleepScore || 5) },
    { label: "Physical Exercise", status: getStatus(lifestyle.exerciseScore || 5) },
    { label: "Hydration Intake", status: getStatus(lifestyle.hydrationScore || 5) },
    { label: "Screen Limit", status: getStatus(lifestyle.screenTimeScore || 5) },
    { label: "Relaxation", status: getStatus(lifestyle.relaxationScore || 5) },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Traffic Light Status Dashboard (V2)
        </h3>
        <span className="text-[11px] font-semibold text-gray-400">Automated Domain Ratings</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {domainList.map((d, i) => (
          <div key={i} className={`p-3 rounded-2xl border flex flex-col justify-between space-y-1 text-center ${d.status.color}`}>
            <span className="text-lg">{d.status.dot}</span>
            <span className="text-[11px] font-bold truncate">{d.label}</span>
            <span className="text-[10px] font-semibold opacity-80">{d.status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
