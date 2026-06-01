import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPatientByCode, saveEncounterReport } from "../services/patientService";
import BeatHeadacheNewPatientForm from "../BeatHeadacheNewPatientForm";
import { getSuggestedDiagnosisSummary, getRedFlagSummary } from "../reportUtils";
import { AlertCircle, ChevronLeft, Loader2 } from "lucide-react";

function normalizeSummaryList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (value && typeof value === "object") {
    return Object.values(value)
      .flat()
      .filter(Boolean)
      .map((item) => String(item));
  }
  return [];
}

function formatRedFlagsSummary(form) {
  const items = normalizeSummaryList(getRedFlagSummary(form)).map((f) =>
    typeof f === "object" && f?.text != null ? String(f.text) : String(f)
  ).filter(Boolean);
  return items.length ? items.join("; ") : "None";
}

function formatDiagnosisReviewSummary(form) {
  const raw = getSuggestedDiagnosisSummary(form);
  if (raw && typeof raw === "object" && !Array.isArray(raw) && raw.likelyType) {
    return String(raw.likelyType);
  }
  const items = normalizeSummaryList(raw).map((d) =>
    typeof d === "object" && d?.name != null ? String(d.name) : String(d)
  ).filter(Boolean);
  return items.length ? items.join(", ") : "No structured diagnosis";
}

function buildEncounterData(form, fresshTotal) {
  return {
    patientSummaryReport: String(form?.final?.diagnosis ?? ""),
    doctorClinicalReport: String(form?.final?.medicationPlan ?? ""),
    redFlagsSummary: formatRedFlagsSummary(form),
    diagnosisReviewSummary: formatDiagnosisReviewSummary(form),
    fresshScore: Number(fresshTotal) || 0,
  };
}

export default function DoctorEncounterFormPage() {
  const { patientCode } = useParams();
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPatient() {
      try {
        const isAdmin = userData?.role === 'admin';
        const result = await getPatientByCode(
          patientCode, 
          userData.uid, 
          userData.displayName || "Doctor", 
          userData.email || "",
          isAdmin
        );
        
        if (!result) {
          setError("Patient not found.");
        } else if (result.accessDenied) {
          setError(result.message);
        } else {
          setPatient(result.data);
        }
      } catch (err) {
        console.error("Error loading patient:", err);
        setError("An error occurred while loading the patient.");
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [patientCode, userData]);

  const handleSaveEncounter = async (form, fresshTotal) => {
    try {
      const encounterData = buildEncounterData(form, fresshTotal);

      await saveEncounterReport(
        patientCode,
        userData.uid,
        userData.displayName || "Doctor",
        userData.email || "",
        encounterData
      );

      alert("Encounter saved successfully to patient record.");
      navigate("/doctor/patients");
    } catch (err) {
      console.error("Encounter save failed:", err);
      const detail = err?.message ? `\n\n${err.message}` : "";
      alert(
        import.meta.env.DEV
          ? `Failed to save encounter.${detail}`
          : "Failed to save encounter. Check console for details."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-lg text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Access Restricted</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{error}</p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link to="/doctor/dashboard" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <Link to="/doctor/dashboard" className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Patient Encounter</h2>
              <p className="text-xs text-gray-500">
                Patient ID: <span className="font-mono bg-gray-100 px-1 rounded text-gray-700">{patientCode}</span> | Name: {patient.firstName} {patient.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <BeatHeadacheNewPatientForm
        patientContext={patient}
        onSaveEncounter={handleSaveEncounter}
        hideResearchExport
      />
    </div>
  );
}
