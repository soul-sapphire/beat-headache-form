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
  const totalVisits = latestEncounter?.visitNumber ?? patient.latestVisitNumber ?? 1;
  const doctorName = latestEncounter?.doctorName || latestEncounter?.doctor || 'Attending Doctor';
  const lastVisitDate = formatDisplayDate(latestEncounter?.visitDate || patient.lastVisitAt) || 'Today';

  const numScore = typeof fresshScore === 'number' ? fresshScore : 0;
  let recoveryStatus = 'Needs Attention';
  if (numScore >= 50) recoveryStatus = 'Excellent';
  else if (numScore >= 40) recoveryStatus = 'Good';
  else if (numScore >= 30) recoveryStatus = 'Stable';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      {/* Patient Info & Identification */}
      <div className="flex items-start gap-4 flex-1">
        <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-xs shrink-0">
          <QRCodeCanvas value={patient.qrToken || 'BEAT-HEADACHE'} size={72} />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              ID: {patient.patientCode}
            </span>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
              {totalVisits} {totalVisits === 1 ? 'Visit' : 'Visits Recorded'}
            </span>
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> Last Visit: {lastVisitDate}
            </span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <span>{patient.firstName || 'Patient'} {patient.lastName || ''}</span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
              recoveryStatus === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              recoveryStatus === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              recoveryStatus === 'Stable' ? 'bg-gray-100 text-gray-700 border-gray-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {recoveryStatus} Recovery
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600 pt-0.5">
            <span className="flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" /> Gender: {patient.gender || 'Not specified'} | Age: {ageDisplay}
            </span>
            <span className="flex items-center gap-1 text-gray-700 bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100 font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>Diagnosis:</span> <strong className="text-blue-900">{latestDiag}</strong>
            </span>
            <span className="text-gray-500 font-medium">
              Doctor: <strong>Dr. {doctorName}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex flex-col items-center min-w-[120px] shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Latest FRESSH</span>
          <div className="flex items-center justify-center gap-1 text-blue-700">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-3xl font-black">{fresshScore}</span>
            {typeof fresshScore === 'number' && <span className="text-xs font-bold text-blue-400">/60</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
