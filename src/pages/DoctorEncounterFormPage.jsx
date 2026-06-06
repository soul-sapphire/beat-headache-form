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
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

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
      const encounterData = {
        ...buildEncounterData(form, fresshTotal),
        consentAccepted: true,
        consentAcceptedAt: new Date().toISOString(),
        consentVersion: "beat-headache-consent-v1",
      };

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

  if (!consentAccepted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl max-w-3xl w-full p-6 md:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Consent for Child Headache Assessment</h2>
            <p className="text-sm text-slate-500 font-medium">Please review and confirm consent before starting the headache assessment form.</p>
          </div>

          {/* Core Content Box with specific styling scrollable or scrollable boxes */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 border-y border-slate-100 py-4 text-slate-600 text-xs sm:text-sm leading-relaxed">
            
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">1. Purpose of Data Collection</h3>
              <p>This form collects information about the child’s headache history, symptoms, lifestyle factors, medical background, family history, and related clinical details. The information is used to support clinical assessment, follow-up, report generation, and approved review/research workflows where identifying details are removed where possible.</p>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">2. Personal and Medical Information</h3>
              <p>The form may collect personal information such as patient identification code, age, gender, ethnicity, date of birth, phone number, WhatsApp number, email address, and medical history. Health and headache-related information is treated as sensitive clinical information and should be accessed only by approved doctors or authorized administrators.</p>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">3. Contact Details</h3>
              <p>Phone, WhatsApp, and email details are collected only for clinic communication, follow-up, and administrative purposes. These contact details are not included in the Patient Summary PDF, Doctor Clinical Report PDF, or admin research export unless specifically required by authorized clinical workflow.</p>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">4. Reports and Records</h3>
              <p>The system may generate patient summary reports and doctor clinical reports. Downloadable reports use the generated Patient ID as the main identifier and avoid direct contact details such as phone number, WhatsApp number, email, address, guardian contact, NIC/passport, and full patient name.</p>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">5. Research / Export Use</h3>
              <p>Approved administrators may access de-identified or reduced-identification research/export datasets for review and research purposes. These exports should avoid direct contact information and unnecessary personal identifiers.</p>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">6. Medical Disclaimer</h3>
              <p className="text-slate-700"><strong>Beat Headache is a structured documentation and report-support system. It does not replace consultation with a qualified medical professional. It does not provide emergency care, final diagnosis, or medication instructions by itself. If the child has severe sudden headache, neurological symptoms, fever with neck stiffness, repeated vomiting, seizure, or other emergency warning signs, urgent medical care should be sought immediately.</strong></p>
            </div>
            
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-3">
            <label className="flex gap-4 cursor-pointer p-4 bg-slate-50/30 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all duration-300 min-h-[48px]">
              <input 
                type="checkbox" 
                checked={checked1}
                onChange={(e) => setChecked1(e.target.checked)}
                className="h-5 w-5 mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 transition-transform active:scale-90 shrink-0 cursor-pointer"
              />
              <div className="space-y-1 select-none">
                <p className="text-sm font-bold text-slate-800">Confirm Parent/Guardian Consent</p>
                <p className="text-xs text-slate-500 leading-relaxed">I confirm that the parent/guardian has given consent to collect, store, and process the child’s personal and medical information for clinical assessment, follow-up, report generation, and approved review/research workflows as described above.</p>
              </div>
            </label>

            <label className="flex gap-4 cursor-pointer p-4 bg-slate-50/30 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all duration-300 min-h-[48px]">
              <input 
                type="checkbox" 
                checked={checked2}
                onChange={(e) => setChecked2(e.target.checked)}
                className="h-5 w-5 mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 transition-transform active:scale-90 shrink-0 cursor-pointer"
              />
              <div className="space-y-1 select-none">
                <p className="text-sm font-bold text-slate-800">Understand Emergency Disclaimer</p>
                <p className="text-xs text-slate-500 leading-relaxed">I understand that emergency symptoms require urgent medical care and that this system does not replace a qualified doctor’s clinical judgement.</p>
              </div>
            </label>
          </div>

          {/* Button & Links */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <Link to="/doctor/dashboard" className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all">
              Cancel Encounter
            </Link>
            <button
              onClick={() => setConsentAccepted(true)}
              disabled={!checked1 || !checked2}
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all text-white bg-sky-600 shadow-md shadow-sky-100 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Assessment
            </button>
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
