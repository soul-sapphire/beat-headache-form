import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPatientByCode, getEncountersForPatient } from "../services/patientService";
import { ChevronLeft, AlertCircle, Loader2 } from "lucide-react";

import PatientSummaryCard from "../components/patient-profile/PatientSummaryCard";
import PatientAnalyticsCards from "../components/patient-profile/PatientAnalyticsCards";
import EncounterTrendChart from "../components/patient-profile/EncounterTrendChart";
import EncounterTimeline from "../components/patient-profile/EncounterTimeline";
import EncounterAnalyticsModal from "../components/patient-profile/EncounterAnalyticsModal";
import ReportsSection from "../components/patient-profile/ReportsSection";

export default function PatientProfilePage() {
  const { id } = useParams();
  const { userData, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedEncounterIndex, setSelectedEncounterIndex] = useState(null);

  const isAdmin = userProfile?.role === "admin";

  const loadData = useCallback(async () => {
    if (!id) return;
    const activeUser = userData || userProfile;
    const uid = activeUser?.uid || "unknown";
    const name = activeUser?.displayName || "Doctor";
    const email = activeUser?.email || "";

    setLoading(true);
    setError(null);

    try {
      // Parallel loading of all patient-related data as requested for EMR
      const [patientResult, encountersResult] = await Promise.all([
        getPatientByCode(
          id,
          uid,
          name,
          email,
          isAdmin
        ),
        getEncountersForPatient(
          id,
          uid,
          name,
          email,
          isAdmin
        )
      ]);

      if (!patientResult) {
        setError("Patient record not found.");
        return;
      }

      if (patientResult.accessDenied) {
        setError(patientResult.message);
        return;
      }

      setPatient(patientResult.data);
      setEncounters(encountersResult || []);
    } catch (err) {
      console.error("Failed to load patient profile data:", err);
      setError("An error occurred while loading patient records.");
    } finally {
      setLoading(false);
    }
  }, [id, userData, userProfile, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modal Handlers
  const handleEncounterClick = (encounter, index) => {
    setSelectedEncounterIndex(index);
  };

  const closeModal = () => {
    setSelectedEncounterIndex(null);
  };

  const handleNextEncounter = () => {
    // Next means newer, which means a lower index since sorted newest first
    if (selectedEncounterIndex !== null && selectedEncounterIndex > 0) {
      setSelectedEncounterIndex(selectedEncounterIndex - 1);
    }
  };

  const handlePrevEncounter = () => {
    // Prev means older, which means a higher index
    if (selectedEncounterIndex !== null && selectedEncounterIndex < encounters.length - 1) {
      setSelectedEncounterIndex(selectedEncounterIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm font-medium">Loading Complete Patient EMR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation */}
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>

        {error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Unable to Access Record</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">{error}</p>
          </div>
        )}

        {patient && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Patient Summary */}
            <PatientSummaryCard 
              patient={patient} 
              latestEncounter={encounters.length > 0 ? encounters[0] : null} 
            />

            {/* Quick Actions */}
            <div className="flex justify-end">
              <Link
                to={`/doctor/encounter/new/${patient.patientCode}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-md shadow-blue-200 transition-all text-center flex items-center gap-2 hover:scale-[1.02]"
              >
                + Start New Encounter
              </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Analytics & Timeline */}
              <div className="lg:col-span-2 space-y-8">
                {encounters.length > 0 && (
                  <>
                    <PatientAnalyticsCards encounters={encounters} />
                    <EncounterTrendChart 
                      encounters={encounters} 
                      onPointClick={(data) => {
                        // Find the index of the clicked encounter based on encounterNumber
                        // Since chartData reverses it and does encounterNumber = idx + 1
                        const idx = encounters.length - data.encounterNumber;
                        if (idx >= 0 && idx < encounters.length) {
                          handleEncounterClick(encounters[idx], idx);
                        }
                      }} 
                    />
                  </>
                )}
                
                <EncounterTimeline 
                  encounters={encounters} 
                  onEncounterClick={handleEncounterClick} 
                />
              </div>

              {/* Right Column: Reports */}
              <div className="lg:col-span-1 space-y-8">
                <ReportsSection encounters={encounters} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Encounter Analytics Modal */}
      {selectedEncounterIndex !== null && (
        <EncounterAnalyticsModal
          encounter={encounters[selectedEncounterIndex]}
          index={selectedEncounterIndex}
          totalEncounters={encounters.length}
          onClose={closeModal}
          onNext={selectedEncounterIndex > 0 ? handleNextEncounter : null}
          onPrev={selectedEncounterIndex < encounters.length - 1 ? handlePrevEncounter : null}
          previousEncounter={selectedEncounterIndex < encounters.length - 1 ? encounters[selectedEncounterIndex + 1] : null}
        />
      )}
    </div>
  );
}
