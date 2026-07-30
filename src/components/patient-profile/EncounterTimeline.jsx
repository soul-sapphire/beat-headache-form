import React, { useState } from 'react';
import { Calendar, Activity, ChevronDown, ChevronUp, ClipboardList, UserCheck, ExternalLink, Stethoscope, Pill, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

function formatDisplayDate(val) {
  if (!val) return '';
  if (val?.seconds) return new Date(val.seconds * 1000).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  try {
    return new Date(val).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function EncounterTimeline({ encounters, onEncounterClick }) {
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sort encounters descending (newest first for timeline presentation)
  const displayEncounters = [...encounters].reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">
            Clinical Encounter Timeline ({encounters.length})
          </h3>
        </div>
        <span className="text-xs font-semibold text-gray-400">
          Chronological Progress (Newest First)
        </span>
      </div>

      {encounters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          No encounters recorded yet for this patient.
        </div>
      ) : (
        <div className="relative border-l-2 border-blue-100 ml-4 pl-6 space-y-6">
          {displayEncounters.map((enc, index) => {
            const encounterNumber = Number(enc.visitNumber) || (encounters.length - index);
            const isInitial = encounterNumber === 1 || enc.encounterType === 'initial' || enc.visitType === 'Initial Assessment';
            const visitTypeLabel = isInitial ? 'Initial Assessment' : 'Follow-up Visit';
            const encId = enc.id || `enc-${index}`;
            const isExpanded = expandedIds.includes(encId);

            return (
              <div 
                key={encId} 
                className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
              >
                {/* Timeline dot */}
                <span className="absolute -left-[31px] top-6 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-sm group-hover:scale-125 transition-transform"></span>
                
                {/* Collapsed Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-sm shadow-xs">
                      #{encounterNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          {visitTypeLabel}
                        </span>
                        <p className="font-bold text-gray-900 flex items-center gap-1 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDisplayDate(enc.visitDate || enc.createdAt)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-gray-400" /> Dr. {enc.doctorName || enc.doctor || 'Attending Doctor'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-black text-gray-800 shadow-xs">
                      <Activity className="w-4 h-4 text-blue-600" />
                      FRESSH: {enc.fresshScore || 0} / 60
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleExpand(encId, e)}
                      className="p-1.5 bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'Details'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEncounterClick(enc, index);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                    >
                      Report <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Card Overview */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> Diagnosis
                    </h4>
                    <p className="text-sm text-gray-900 font-bold">
                      {enc.diagnosisReviewSummary || enc.diagnosis || enc.patientSummaryReport || "No diagnosis recorded."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Management Summary
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {enc.managementPlan || enc.doctorClinicalReport || "No management plan recorded."}
                    </p>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (() => {
                  const baselineEnc = encounters[0];
                  const sortedAsc = [...encounters].sort((a, b) => (Number(a.visitNumber) || 0) - (Number(b.visitNumber) || 0));
                  const myIdx = sortedAsc.findIndex(e => (e.id && e.id === enc.id) || Number(e.visitNumber) === Number(enc.visitNumber));
                  const prevEnc = myIdx > 0 ? sortedAsc[myIdx - 1] : null;

                  const currScore = Number(enc.fresshScore) || 0;
                  const prevScore = prevEnc ? (Number(prevEnc.fresshScore) || 0) : null;
                  const baseScore = baselineEnc ? (Number(baselineEnc.fresshScore) || 0) : null;

                  const diffPrev = prevScore !== null ? currScore - prevScore : null;
                  const diffBase = baseScore !== null ? currScore - baseScore : null;

                  return (
                    <div className="bg-slate-50 border-t border-gray-200 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                      {/* Longitudinal Changes Summary Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl space-y-0.5">
                          <span className="font-bold text-blue-900 uppercase text-[10px]">Changes from Previous Visit (Visit {prevEnc?.visitNumber || 1})</span>
                          <p className="font-black text-blue-700 text-sm">
                            {diffPrev !== null ? (diffPrev >= 0 ? `+${diffPrev} FRESSH pts` : `${diffPrev} FRESSH pts`) : 'Baseline Encounter (No previous)'}
                          </p>
                        </div>

                        <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl space-y-0.5">
                          <span className="font-bold text-emerald-900 uppercase text-[10px]">Changes from Baseline (Visit 1)</span>
                          <p className="font-black text-emerald-700 text-sm">
                            {diffBase !== null ? (diffBase >= 0 ? `+${diffBase} FRESSH pts` : `${diffBase} FRESSH pts`) : 'Initial Assessment (Baseline)'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Symptoms */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 shadow-xs">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <Activity className="w-4 h-4 text-rose-500" /> Symptoms & Frequency
                          </span>
                          <p className="text-gray-700 leading-relaxed font-medium">
                            {enc.symptomsSummary || 'Symptoms recorded in initial intake.'}
                          </p>
                        </div>

                        {/* Medications */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 shadow-xs">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <Pill className="w-4 h-4 text-emerald-500" /> Medications & Changes
                          </span>
                          <p className="text-gray-700 leading-relaxed font-medium">
                            {enc.medications || enc.medicationChanges || 'No active medication changes recorded.'}
                          </p>
                        </div>

                        {/* Investigations */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 shadow-xs">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" /> Investigations
                          </span>
                          <p className="text-gray-700 leading-relaxed font-medium">
                            {enc.investigations || 'No new lab or imaging investigations ordered.'}
                          </p>
                        </div>
                      </div>

                      {/* Doctor Notes & Recommendations */}
                      {(enc.doctorNotes || enc.recommendations) && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-xs text-xs">
                          {enc.doctorNotes && (
                            <div className="space-y-1">
                              <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Doctor Clinical Notes:</span>
                              <p className="text-gray-700 whitespace-pre-line leading-relaxed font-medium">{enc.doctorNotes}</p>
                            </div>
                          )}
                          {enc.recommendations && (
                            <div className="space-y-1 pt-2 border-t border-gray-100">
                              <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">Recommendations:</span>
                              <p className="text-emerald-900 leading-relaxed font-medium">{enc.recommendations}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
