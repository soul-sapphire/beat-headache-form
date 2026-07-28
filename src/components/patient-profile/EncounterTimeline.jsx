import React from 'react';
import { Calendar, Activity, ChevronRight, ClipboardList, UserCheck, ExternalLink } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">
            Encounter History ({encounters.length})
          </h3>
        </div>
        <span className="text-xs font-semibold text-gray-400">
          Sorted Newest First
        </span>
      </div>

      {encounters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          No encounters recorded yet for this patient.
        </div>
      ) : (
        <div className="relative border-l-2 border-blue-100 ml-4 pl-6 space-y-6">
          {encounters.map((enc, index) => {
            const encounterNumber = encounters.length - index;
            const visitType = enc.visitType || (index === encounters.length - 1 ? 'Initial Assessment' : 'Follow-up');

            return (
              <div 
                key={enc.id || index} 
                className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                onClick={() => onEncounterClick(enc, index)}
              >
                {/* Timeline dot */}
                <span className="absolute -left-[31px] top-6 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-sm group-hover:scale-125 transition-transform"></span>
                
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 shadow-xs text-xs">
                      #{encounterNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          {visitType}
                        </span>
                        <p className="font-bold text-gray-900 flex items-center gap-1 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDisplayDate(enc.visitDate || enc.createdAt)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-gray-400" /> Dr. {enc.doctorName || 'Attending Doctor'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-xs">
                      <Activity className="w-4 h-4 text-blue-500" />
                      FRESSH: {enc.fresshScore || 0}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEncounterClick(enc, index);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      Open <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Summary / Diagnosis
                    </h4>
                    <p className="text-sm text-gray-800 font-semibold line-clamp-2">
                      {enc.diagnosisReviewSummary || enc.patientSummaryReport || "No diagnosis recorded."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Management & Plan
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {enc.doctorClinicalReport || enc.managementPlan || "No plan recorded."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
