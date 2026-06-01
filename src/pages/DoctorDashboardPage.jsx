import React from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { User, FileText, Search, Settings, LogOut, CheckCircle, Clock } from "lucide-react";

export default function DoctorDashboardPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/doctor-login-private");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
            <p className="text-gray-500">Welcome back, Dr. {userData?.displayName}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
              <CheckCircle className="w-4 h-4" />
              {userData?.status === 'approved' ? 'Approved' : 'Pending'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors px-3 py-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">New Patient</h3>
            <p className="text-gray-500 text-sm mb-4 flex-grow">Create a new patient shell and generate an ID.</p>
            <Link to="/doctor/new-patient" className="text-blue-600 font-medium text-sm hover:underline mt-auto">Start Registration &rarr;</Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Recent Patients</h3>
            <p className="text-gray-500 text-sm mb-4 flex-grow">View recently completed patient reports.</p>
            <Link to="/doctor/patients" className="text-purple-600 font-medium text-sm hover:underline mt-auto">View Reports &rarr;</Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center text-teal-600 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Patient Search</h3>
            <p className="text-gray-500 text-sm mb-4 flex-grow">Search through your existing patient records using Patient ID.</p>
            <Link to="/doctor/patients" className="text-teal-600 font-medium text-sm hover:underline mt-auto">Search Records &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
