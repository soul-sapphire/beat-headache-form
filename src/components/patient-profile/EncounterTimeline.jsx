import React from 'react';
import { Calendar, Activity, ChevronRight, ClipboardList } from 'lucide-react';

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
      <div className="flex items-center gap-2 px-2">
        <ClipboardList className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-bold text-gray-800">
          Encounter Timeline ({encounters.length})
        </h3>
      </div>

      {encounters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          No encounters recorded yet for this patient.
        </div>
      ) : (
        <div className="relative border-l-2 border-blue-100 ml-4 pl-6 space-y-6">
          {encounters.map((enc, index) => {
            const encounterNumber = encounters.length - index; // Assuming newest first
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
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 shadow-sm">
                      #{encounterNumber}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDisplayDate(enc.visitDate || enc.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Dr. {enc.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                      <Activity className="w-4 h-4 text-blue-500" />
                      FRESSH: {enc.fresshScore || 0}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Diagnosis / Summary
                    </h4>
                    <p className="text-sm text-gray-700 font-medium line-clamp-2">
                      {enc.patientSummaryReport || enc.diagnosisReviewSummary || "No diagnosis recorded."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Clinical Plan
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {enc.doctorClinicalReport || "No plan recorded."}
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
