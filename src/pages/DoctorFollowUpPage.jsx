import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPatientByCode, saveEncounterReport } from '../services/patientService';
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Stethoscope,
  Activity,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  ShieldCheck,
  FileText,
  Pill,
  BrainCircuit,
  Eye,
  Save,
} from 'lucide-react';

export default function DoctorFollowUpPage() {
  const { patientCode } = useParams();
  const { userData } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form State for Follow-up Encounter (Dynamic visit fields only)
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [severity, setSeverity] = useState('Moderate');
  const [duration, setDuration] = useState('1–2 hours');
  const [headacheDays, setHeadacheDays] = useState('4');
  const [medicineDays, setMedicineDays] = useState('2');
  const [locations, setLocations] = useState(['Frontal']);
  const [painNature, setPainNature] = useState(['Tightening / Pressure']);
  const [associated, setAssociated] = useState([]);
  const [hasAura, setHasAura] = useState('No');

  // Medication Changes
  const [currentMeds, setCurrentMeds] = useState('Paracetamol as needed');
  const [medChanges, setMedChanges] = useState('No changes');

  // New Investigations
  const [bloodResult, setBloodResult] = useState('Normal');
  const [imagingResult, setImagingResult] = useState('Not done');
  const [imagingFinding, setImagingFinding] = useState('');
  const [ophthalmology, setOphthalmology] = useState('Normal');

  // FRESSH Lifestyle Scores (1-10)
  const [fressh, setFressh] = useState({
    Food: 7,
    Relaxation: 6,
    Exercise: 5,
    Sleep: 7,
    ScreenTime: 6,
    Hydration: 8,
  });

  // Diagnosis & Doctor Notes
  const [diagnosisCategory, setDiagnosisCategory] = useState('Tension-type headache features');
  const [doctorNotes, setDoctorNotes] = useState('Patient reports stable symptom frequency. Continue current lifestyle advice.');
  const [managementPlan, setManagementPlan] = useState('1. Maintain regular hydration.\n2. Follow-up in 4 weeks.');

  useEffect(() => {
    async function loadPatient() {
      if (!patientCode || !userData) return;
      try {
        const isAdmin = userData?.role === 'admin';
        const result = await getPatientByCode(
          patientCode,
          userData.uid,
          userData.displayName || 'Doctor',
          userData.email || '',
          isAdmin
        );

        if (!result) {
          setError('Patient record not found.');
        } else if (result.accessDenied) {
          setError(result.message);
        } else {
          setPatient(result.data);
          if (result.data?.latestDiagnosis) {
            setDiagnosisCategory(result.data.latestDiagnosis);
          }
        }
      } catch (err) {
        console.error('Error loading patient for follow-up:', err);
        setError('An error occurred while loading patient information.');
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [patientCode, userData]);

  const calculateFresshTotal = () => {
    return Object.values(fressh).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  };

  const handleLocationToggle = (item) => {
    setLocations((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleNatureToggle = (item) => {
    setPainNature((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAssociatedToggle = (item) => {
    setAssociated((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSaveFollowUp = async (e) => {
    e.preventDefault();
    if (!patient) return;

    setSaving(true);
    try {
      const fresshTotal = calculateFresshTotal();
      const encounterData = {
        visitDate,
        visitType: 'Follow-up',
        patientSummaryReport: `Follow-up Visit (${visitDate}): ${diagnosisCategory}. FRESSH Score: ${fresshTotal}/60. ${doctorNotes}`,
        doctorClinicalReport: `Diagnosis: ${diagnosisCategory}\nSeverity: ${severity}\nDays/4wks: ${headacheDays}\nMedications: ${currentMeds}\nManagement Plan:\n${managementPlan}`,
        redFlagsSummary: 'None',
        diagnosisReviewSummary: diagnosisCategory,
        fresshScore: fresshTotal,
        fresshDetails: {
          'Food Intake Pattern': `${fressh.Food}/10`,
          Relaxation: `${fressh.Relaxation}/10`,
          Exercise: `${fressh.Exercise}/10`,
          Sleep: `${fressh.Sleep}/10`,
          'Screen time': `${fressh.ScreenTime}/10`,
          Hydration: `${fressh.Hydration}/10`,
        },
        symptomsSummary: `Location: ${locations.join(', ')} | Severity: ${severity} | Duration: ${duration}`,
        managementPlan,
        doctorNotes,
      };

      await saveEncounterReport(
        patientCode,
        userData.uid,
        userData.displayName || 'Doctor',
        userData.email || '',
        encounterData
      );

      alert('Follow-up encounter saved successfully.');
      navigate(`/patient/${patientCode}`);
    } catch (err) {
      console.error('Failed to save follow-up encounter:', err);
      alert('Failed to save follow-up encounter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm font-medium">Loading Preloaded Patient Data...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-lg text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Unable to Start Follow-up</h2>
          <p className="text-gray-600 text-sm">{error || 'Patient record not found.'}</p>
          <Link
            to="/doctor/dashboard"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ageDisplay = patient.age
    ? `${patient.age} yrs`
    : patient.birthYear
    ? `${new Date().getFullYear() - parseInt(patient.birthYear, 10)} yrs`
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/patient/${patientCode}`}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Follow-up Encounter
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">{patientCode}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
            </div>
          </div>

          <button
            onClick={handleSaveFollowUp}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Encounter
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Preloaded Static Info Notice */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-emerald-900">
              Preloaded Patient Record ({patientCode})
            </h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Static medical background (birth history, pregnancy, childhood illnesses, development milestones, and family history) is permanently linked and preloaded. Only enter updated metrics for this visit.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-800 pt-1">
              <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> Gender: {patient.gender || 'Not specified'}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Age: {ageDisplay}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveFollowUp} className="space-y-6">
          {/* Section 1: Visit & Symptoms */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">1. Current Visit & Symptoms</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Visit Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Pain Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option>Mild</option>
                  <option>Moderate</option>
                  <option>Severe</option>
                  <option>Very bad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Episode Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option>Less than 1 hour</option>
                  <option>1–2 hours</option>
                  <option>2–4 hours</option>
                  <option>More than 4 hours</option>
                  <option>Constant</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">Headache Location</label>
              <div className="flex flex-wrap gap-2">
                {['Frontal', 'Temporal', 'Occipital', 'Vertex', 'Bilateral', 'Unilateral'].map((loc) => (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => handleLocationToggle(loc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      locations.includes(loc)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Pain Nature */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">Pain Character / Nature</label>
              <div className="flex flex-wrap gap-2">
                {['Pulsating / Throbbing', 'Tightening / Pressure', 'Stabbing', 'Dull ache', 'Thunderclap'].map((nat) => (
                  <button
                    type="button"
                    key={nat}
                    onClick={() => handleNatureToggle(nat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      painNature.includes(nat)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {nat}
                  </button>
                ))}
              </div>
            </div>

            {/* Associated Symptoms */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">Associated Symptoms</label>
              <div className="flex flex-wrap gap-2">
                {['Nausea / Vomiting', 'Photophobia (Light sensitivity)', 'Phonophobia (Sound sensitivity)', 'Neck stiffness', 'Visual disturbances', 'Dizziness'].map((assoc) => (
                  <button
                    type="button"
                    key={assoc}
                    onClick={() => handleAssociatedToggle(assoc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      associated.includes(assoc)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {assoc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Frequency & Medication Changes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Pill className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">2. Frequency & Medication Changes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Headache Days (Last 4 Weeks)</label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={headacheDays}
                  onChange={(e) => setHeadacheDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Medicine Days (Last 4 Weeks)</label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={medicineDays}
                  onChange={(e) => setMedicineDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Current Medications</label>
                <textarea
                  rows={2}
                  value={currentMeds}
                  onChange={(e) => setCurrentMeds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Medication Changes / Dose Adjustments</label>
                <textarea
                  rows={2}
                  value={medChanges}
                  onChange={(e) => setMedChanges(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: New Investigations */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <BrainCircuit className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">3. New Investigations (Since Last Visit)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Blood Tests Result</label>
                <select
                  value={bloodResult}
                  onChange={(e) => setBloodResult(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option>Normal</option>
                  <option>Abnormal</option>
                  <option>Not done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Brain Imaging Result</label>
                <select
                  value={imagingResult}
                  onChange={(e) => setImagingResult(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option>Not done</option>
                  <option>Normal</option>
                  <option>Abnormal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Ophthalmology</label>
                <select
                  value={ophthalmology}
                  onChange={(e) => setOphthalmology(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option>Normal</option>
                  <option>Abnormal</option>
                  <option>Not done</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Updated FRESSH Lifestyle Assessment */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">4. Updated FRESSH Assessment</h2>
              </div>
              <div className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl text-xs font-bold text-blue-700">
                Score: {calculateFresshTotal()} / 60
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Food Intake', key: 'Food' },
                { label: 'Relaxation', key: 'Relaxation' },
                { label: 'Exercise', key: 'Exercise' },
                { label: 'Sleep Quality', key: 'Sleep' },
                { label: 'Screen Time', key: 'ScreenTime' },
                { label: 'Hydration', key: 'Hydration' },
              ].map((item) => (
                <div key={item.key} className="bg-gray-50 border border-gray-200 p-3 rounded-xl space-y-1">
                  <label className="block text-xs font-bold text-gray-700">{item.label} (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={fressh[item.key]}
                    onChange={(e) =>
                      setFressh({ ...fressh, [item.key]: Math.min(10, Math.max(1, parseInt(e.target.value) || 0)) })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-center text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Diagnosis Review & Management Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">5. Clinical Diagnosis & Management Plan</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Diagnosis Category</label>
              <select
                value={diagnosisCategory}
                onChange={(e) => setDiagnosisCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option>Tension-type headache features</option>
                <option>Migraine-type headache features</option>
                <option>Migraine with aura features</option>
                <option>Cluster headache features</option>
                <option>Secondary headache features</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Doctor Assessment Notes</label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Management Plan & Advice</label>
              <textarea
                rows={3}
                value={managementPlan}
                onChange={(e) => setManagementPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-4 pt-4">
            <Link
              to={`/patient/${patientCode}`}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Follow-up Encounter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
