import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createPatientShell } from "../services/patientService";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, ArrowRight, Copy, CheckCircle, ChevronLeft } from "lucide-react";

export default function DoctorNewPatientPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedPatientCode, setGeneratedPatientCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !birthYear) return;
    
    setLoading(true);
    try {
      const code = await createPatientShell(
        firstName.trim(),
        lastName.trim(),
        birthYear.trim(),
        userData.uid,
        userData.displayName || "Doctor",
        userData.email || ""
      );
      setGeneratedPatientCode(code);
    } catch (error) {
      console.error("Error creating patient shell:", error);
      alert("Failed to create patient record. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPatientCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEncounter = () => {
    navigate(`/doctor/encounter/new/${generatedPatientCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link to="/doctor/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">New Patient Record</h1>
              <p className="text-gray-500 text-sm">Generate a secure patient ID for a new patient.</p>
            </div>
          </div>

          {!generatedPatientCode ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="e.g. Rumeth"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="e.g. Nejitha"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Year</label>
                <input
                  type="text"
                  required
                  pattern="\d{4}"
                  title="Four digit year (e.g., 2004)"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="e.g. 2004"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? "Generating..." : "Generate Patient ID"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-green-800 font-semibold text-lg">Patient Shell Created</h3>
                <p className="text-green-700 text-sm">Please provide this ID to the patient for their records.</p>
                
                <div className="mt-4 flex items-center justify-center gap-2">
                  <code className="text-2xl font-bold text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-green-100 tracking-wider">
                    {generatedPatientCode}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-lg shadow-sm border border-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="Copy Patient ID"
                  >
                    {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartEncounter}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
              >
                Start Clinical Encounter <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
