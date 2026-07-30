import React from "react";
import { Activity, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function PreClinicComparisonCard({ publicAssessment, firstClinicEncounter }) {
  if (!publicAssessment || !firstClinicEncounter) return null;

  const history = publicAssessment.assessmentHistory || [];
  const lastHomeAssmt = history[history.length - 1] || {};

  const homeBurden = lastHomeAssmt.headacheScore || 0;
  const homeFressh = lastHomeAssmt.fresshScore || 0;
  const homePain = lastHomeAssmt.painSeverity || 5;

  const clinicFressh = Number(firstClinicEncounter.fresshScore) || 0;

  const fresshDiff = clinicFressh - homeFressh;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Clinical Comparison: Last Home Assessment vs Clinic Visit 1
        </h3>
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
          Passport: {publicAssessment.assessmentId}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
        {/* Home Assessment */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold text-slate-800">
            <span>🏠 Last Home Self-Assessment</span>
            <span>{new Date(lastHomeAssmt.assessmentDate || publicAssessment.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between"><span>Headache Burden:</span><strong className="text-blue-700">{homeBurden} / 60</strong></div>
            <div className="flex justify-between"><span>Mini FRESSH Score:</span><strong className="text-emerald-700">{homeFressh} / 60</strong></div>
            <div className="flex justify-between"><span>Pain Severity:</span><strong>{homePain} / 10</strong></div>
            <div className="flex justify-between"><span>Severity Level:</span><strong className="text-slate-900">{lastHomeAssmt.severity || "Standard"}</strong></div>
          </div>
        </div>

        {/* Clinic Visit 1 */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex justify-between border-b border-blue-200 pb-1.5 font-bold text-blue-900">
            <span>🏥 Clinic Visit 1 (Official EMR)</span>
            <span>{new Date(firstClinicEncounter.visitDate || firstClinicEncounter.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="space-y-1 text-blue-950">
            <div className="flex justify-between"><span>Diagnosis:</span><strong>{firstClinicEncounter.diagnosis || "Initial Assessment"}</strong></div>
            <div className="flex justify-between"><span>Official FRESSH Score:</span><strong className="text-blue-700">{clinicFressh} / 60</strong></div>
            <div className="flex justify-between">
              <span>FRESSH Trajectory Delta:</span>
              <strong className={fresshDiff >= 0 ? "text-emerald-700" : "text-amber-700"}>
                {fresshDiff >= 0 ? `+${fresshDiff} pts (Improved)` : `${fresshDiff} pts (Declined)`}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
