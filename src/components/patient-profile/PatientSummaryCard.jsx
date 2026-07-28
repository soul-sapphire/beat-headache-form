import React from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Hash, Calendar, User as UserIcon, Activity, Stethoscope, PlusCircle } from 'lucide-react';

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

  const ageDisplay = patient.age
    ? `${patient.age} yrs`
    : patient.birthYear
    ? `${new Date().getFullYear() - parseInt(patient.birthYear, 10)} yrs`
    : 'N/A';

  const latestDiag = latestEncounter?.diagnosisReviewSummary || patient.latestDiagnosis || 'Initial Assessment Pending';
  const fresshScore = latestEncounter?.fresshScore ?? patient.latestFresshScore ?? 'N/A';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      {/* Patient Info & Identification */}
      <div className="flex items-start gap-4 flex-1">
        <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-xs shrink-0">
          <QRCodeCanvas value={patient.qrToken || 'BEAT-HEADACHE'} size={68} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              ID: {patient.patientCode}
            </span>
            {formatDisplayDate(patient.lastVisitAt) && (
              <span className="text-xs font-medium text-gray-400">
                Last Visit: {formatDisplayDate(patient.lastVisitAt)}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {patient.firstName || 'Patient'} {patient.lastName || ''}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> Age: {ageDisplay}
            </span>
            <span className="flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" /> Gender: {patient.gender || 'Not specified'}
            </span>
            <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
              <strong>Latest Diagnosis:</strong> {latestDiag}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics & Action Button */}
      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex flex-col items-center min-w-[110px]">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Latest FRESSH</span>
          <div className="flex items-center justify-center gap-1 text-blue-700">
            <Activity className="w-4 h-4" />
            <span className="text-2xl font-black">{fresshScore}</span>
            {typeof fresshScore === 'number' && <span className="text-xs font-bold text-blue-400">/60</span>}
          </div>
        </div>

        <Link
          to={`/doctor/followup/${patient.patientCode}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          + New Follow-up
        </Link>
      </div>
    </div>
  );
}
