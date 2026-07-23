import React from 'react';
import { X, Calendar, Activity, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';

const FRESSH_CATEGORIES = [
  { key: 'Food Intake Pattern', label: 'Nutrition', max: 10, color: 'bg-orange-500' },
  { key: 'Relaxation', label: 'Relaxation', max: 10, color: 'bg-teal-500' },
  { key: 'Exercise', label: 'Exercise', max: 10, color: 'bg-green-500' },
  { key: 'Sleep', label: 'Sleep', max: 10, color: 'bg-indigo-500' },
  { key: 'Screen time', label: 'Screen Time', max: 10, color: 'bg-red-500' },
  { key: 'Hydration', label: 'Hydration', max: 10, color: 'bg-cyan-500' }
];

export default function EncounterAnalyticsModal({ 
  encounter, 
  index,
  totalEncounters,
  onClose, 
  onNext, 
  onPrev,
  previousEncounter
}) {
  if (!encounter) return null;

  const encounterNumber = totalEncounters - index;
  const currentScore = encounter.fresshScore || 0;
  const prevScore = previousEncounter ? previousEncounter.fresshScore || 0 : null;
  const diff = prevScore !== null ? currentScore - prevScore : 0;
  
  const fresshDetails = encounter.fresshDetails || {};
  const prevFresshDetails = previousEncounter?.fresshDetails || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              #{encounterNumber}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Encounter Analytics</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(encounter.visitDate || encounter.createdAt).toLocaleDateString()} • Dr. {encounter.doctorName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm mr-4">
              <button 
                onClick={onPrev} 
                disabled={!onPrev}
                className="p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
                title="Previous Encounter (Older)"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={onNext}
                disabled={!onNext}
                className="p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Encounter (Newer)"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: FRESSH Analytics */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm text-center relative overflow-hidden">
                <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500 opacity-5" />
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Total FRESSH Score</h3>
                <div className="text-5xl font-black text-blue-600 mb-2">{currentScore}</div>
                
                {prevScore !== null && (
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${diff >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {diff >= 0 ? '+' : ''}{diff} from previous
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {FRESSH_CATEGORIES.map(cat => {
                    const score = fresshDetails[cat.key] || 0;
                    const pScore = prevFresshDetails[cat.key] || 0;
                    const cDiff = prevScore !== null ? score - pScore : 0;
                    const pct = (score / cat.max) * 100;
                    
                    return (
                      <div key={cat.key}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-bold text-gray-600">{cat.label}</span>
                          <div className="flex items-center gap-2">
                            {prevScore !== null && cDiff !== 0 && (
                              <span className={`text-[10px] font-bold ${cDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {cDiff > 0 ? '+' : ''}{cDiff}
                              </span>
                            )}
                            <span className="text-sm font-bold text-gray-900">{score}/{cat.max}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className={`h-2 rounded-full ${cat.color} transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(fresshDetails).length === 0 && (
                    <div className="text-center text-sm text-gray-400 py-4 italic">
                      Detailed category scores not recorded for this encounter.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Clinical Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Diagnosis Summary</h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-800 whitespace-pre-wrap">{encounter.patientSummaryReport || encounter.diagnosisReviewSummary || 'No diagnosis summary recorded.'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Doctor's Clinical Plan & Medications</h3>
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-gray-800 whitespace-pre-wrap">{encounter.doctorClinicalReport || 'No clinical plan recorded.'}</p>
                  </div>
                </div>

                {encounter.redFlagsSummary && encounter.redFlagsSummary !== 'None' && (
                  <div>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Red Flags Identifed</h3>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-red-800 font-medium">{encounter.redFlagsSummary}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pseudo-Reports Section inside Modal */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Generated Reports</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors cursor-not-allowed opacity-60" title="PDF generation for legacy encounters is not currently available.">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Patient Summary PDF
                    <Download className="w-4 h-4 ml-auto text-gray-400" />
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors cursor-not-allowed opacity-60" title="PDF generation for legacy encounters is not currently available.">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    Clinical Report PDF
                    <Download className="w-4 h-4 ml-auto text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">Historical PDF generation requires the full original form context.</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
