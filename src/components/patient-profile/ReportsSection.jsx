import React from 'react';
import { FileText, Download, Eye, Calendar, AlertCircle } from 'lucide-react';

export default function ReportsSection({ encounters }) {
  if (!encounters || encounters.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-bold text-gray-900">Patient Reports</h3>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-orange-800">Historical PDF Generation Limited</p>
          <p className="text-xs text-orange-700 mt-1">
            Because the original raw form data is not saved to the cloud for privacy and storage reasons (only clinical summaries are saved), exact historical PDFs cannot be regenerated. View the encounter analytics for the clinical summary.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {encounters.slice(0, 5).map((enc, idx) => {
          const encounterNumber = encounters.length - idx;
          return (
            <div key={enc.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Clinical Summary Report</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">Encounter #{encounterNumber}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(enc.visitDate || enc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  disabled
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
                <button 
                  disabled
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
