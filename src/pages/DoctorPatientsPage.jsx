import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPatientByCode, getEncountersForPatient } from "../services/patientService";
import { Search, FileText, User, Calendar, Activity, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";

export default function DoctorPatientsPage() {
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setPatient(null);
    setEncounters([]);

    try {
      const code = searchQuery.trim().toUpperCase();
      const isAdmin = userData?.role === 'admin';
      
      const result = await getPatientByCode(
        code, 
        userData.uid, 
        userData.displayName || "Doctor", 
        userData.email || "",
        isAdmin
      );

      if (!result) {
        setError("Patient not found. Please check the ID and try again.");
      } else if (result.accessDenied) {
        setError(result.message);
      } else {
        setPatient(result.data);
        const encs = await getEncountersForPatient(
          code,
          userData.uid,
          userData.displayName || "Doctor",
          userData.email || "",
          isAdmin
        );
        setEncounters(encs);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/doctor/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Patient Search</h1>
              <p className="text-gray-500 text-sm">Search by Patient ID (e.g. RU-NE-2004-001) to view clinical history.</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Patient ID..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all font-mono"
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {patient && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Patient Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{patient.patientCode}</span>
                    <span>•</span>
                    <span>Birth Year: {patient.birthYear}</span>
                  </div>
                </div>
              </div>
              
              <Link 
                to={`/doctor/encounter/new/${patient.patientCode}`}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors text-center"
              >
                + New Encounter
              </Link>
            </div>

            {/* Encounter History */}
            <h3 className="text-lg font-bold text-gray-800 px-2">Clinical History ({encounters.length})</h3>
            
            <div className="space-y-4">
              {encounters.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
                  No encounters recorded yet for this patient.
                </div>
              ) : (
                encounters.map(enc => (
                  <div key={enc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-800">{new Date(enc.createdAt?.seconds * 1000 || enc.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">Dr. {enc.doctorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                        <Activity className="w-4 h-4 text-blue-500" />
                        FRESSH Score: {enc.fresshScore || 0}
                      </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Suggested Diagnosis Summary</h4>
                          <p className="text-sm text-gray-700 font-medium">{enc.diagnosisReviewSummary || "None"}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Clinical Report / Plan</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{enc.doctorClinicalReport || "No plan recorded."}</p>
                        </div>
                      </div>
                      <div className="space-y-4 md:border-l md:border-gray-100 md:pl-6">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Red Flags Summary</h4>
                          <p className="text-sm text-gray-700">{enc.redFlagsSummary || "None identified."}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Patient Summary Notes</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{enc.patientSummaryReport || "No notes."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
