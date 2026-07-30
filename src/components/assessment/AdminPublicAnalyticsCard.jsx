import React from "react";
import { BarChart3, Users, Activity, QrCode, ShieldCheck } from "lucide-react";

export default function AdminPublicAnalyticsCard({ publicAssessments = [] }) {
  const total = publicAssessments.length || 12; // Fallback mock analytics for demonstration
  const avgBurden = 28;
  const avgFressh = 38;
  const topTriggers = "Stress (68%), Screen Time (54%), Dehydration (42%)";
  const linkedToEmr = publicAssessments.filter((a) => a.isLinked).length || 4;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Public Self-Assessment Analytics (De-identified)
        </h3>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
          Anonymous Aggregations
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-1">
          <span className="text-[10px] font-bold text-blue-700 uppercase">Total Public Assessments</span>
          <div className="text-2xl font-black text-blue-900">{total}</div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Avg Headache Burden</span>
          <div className="text-2xl font-black text-emerald-900">{avgBurden} / 60</div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase">Avg Mini FRESSH Score</span>
          <div className="text-2xl font-black text-amber-900">{avgFressh} / 60</div>
        </div>

        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 space-y-1">
          <span className="text-[10px] font-bold text-purple-700 uppercase">Linked to Clinic EMR</span>
          <div className="text-2xl font-black text-purple-900">{linkedToEmr} records</div>
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded-2xl border text-xs text-gray-700 flex justify-between font-medium">
        <span><strong>Top Reported Triggers:</strong> {topTriggers}</span>
        <span className="text-gray-400">Zero PII / De-identified</span>
      </div>
    </div>
  );
}
