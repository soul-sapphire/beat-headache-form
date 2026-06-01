import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus, Search, FileText, LogOut, CheckCircle, Stethoscope,
} from "lucide-react";

function DebugPanel({ userProfile }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div style={{
      position: "fixed", bottom: 8, right: 8, background: "rgba(15,23,42,0.92)",
      color: "#94a3b8", fontSize: 11, padding: "8px 12px", borderRadius: 8,
      zIndex: 9999, fontFamily: "monospace", maxWidth: 260, lineHeight: 1.6,
    }}>
      <div style={{ color: "#38bdf8", fontWeight: "bold", marginBottom: 2 }}>🔧 DEV Auth State</div>
      <div>uid: {userProfile?.uid?.slice(0, 10)}…</div>
      <div>email: {userProfile?.email || "—"}</div>
      <div>role: {userProfile?.role || "—"}</div>
      <div>approved: {String(userProfile?.approved ?? "—")}</div>
      <div>status: {userProfile?.status || "—"}</div>
    </div>
  );
}

export default function DoctorDashboardPage() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/doctor-login-private");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Welcome back, Dr. {userProfile?.displayName || "Doctor"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
              <CheckCircle className="w-4 h-4" />
              Approved
            </div>
            <button
              onClick={handleLogout}
              id="doctor-logout-btn"
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* New Patient */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">New Patient</h3>
            <p className="text-gray-500 text-sm mb-5 flex-grow">
              Register a new patient and generate their unique clinical ID (e.g. RU-NE-2004-001).
            </p>
            <Link
              to="/doctor/new-patient"
              id="new-patient-link"
              className="inline-flex items-center gap-1.5 text-blue-600 font-medium text-sm hover:underline mt-auto"
            >
              Start Registration →
            </Link>
          </div>

          {/* Patient Search */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center text-teal-600 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Patient Search</h3>
            <p className="text-gray-500 text-sm mb-5 flex-grow">
              Look up a patient by their unique Patient ID to view clinical history and reports.
            </p>
            <Link
              to="/doctor/patients"
              id="patient-search-link"
              className="inline-flex items-center gap-1.5 text-teal-600 font-medium text-sm hover:underline mt-auto"
            >
              Search Records →
            </Link>
          </div>

          {/* Recent Reports */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Patient Reports</h3>
            <p className="text-gray-500 text-sm mb-5 flex-grow">
              View saved encounter reports and clinical summaries for your linked patients.
            </p>
            <Link
              to="/doctor/patients"
              id="patient-reports-link"
              className="inline-flex items-center gap-1.5 text-purple-600 font-medium text-sm hover:underline mt-auto"
            >
              View Reports →
            </Link>
          </div>
        </div>

        {/* Info strip */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-700">
          <strong>How it works:</strong> Create a new patient to generate their clinical ID.
          Then start a clinical encounter to fill in the headache form.
          Reports are automatically saved to Firestore and retrievable by patient ID.
        </div>
      </div>

      <DebugPanel userProfile={userProfile} />
    </div>
  );
}
