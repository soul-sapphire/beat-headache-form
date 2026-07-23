import React from 'react';
import { Hash, Calendar, User as UserIcon, Activity } from 'lucide-react';

function formatDisplayDate(val) {
  if (!val) return null;
  if (val?.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
  try {
    return new Date(val).toLocaleDateString();
  } catch {
    return null;
  }
}

export default function PatientSummaryCard({ patient, latestEncounter }) {
  if (!patient) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <Hash className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-mono">
            {patient.patientCode}
          </h2>
          <h3 className="text-lg font-semibold text-gray-700">
            {patient.firstName} {patient.lastName}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
            {patient.birthYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {patient.birthYear}
              </span>
            )}
            <span className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" /> {patient.gender || 'Not specified'}
            </span>
            {formatDisplayDate(patient.lastVisitAt) && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                Last visit: {formatDisplayDate(patient.lastVisitAt)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {latestEncounter && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center min-w-[140px]">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Latest FRESSH</span>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Activity className="w-6 h-6" />
            <span className="text-3xl font-black">{latestEncounter.fresshScore || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}
