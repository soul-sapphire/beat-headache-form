import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, CalendarPlus } from "lucide-react";

export default function NewPatientPublicPage() {
  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 via-cyan-50/10 to-blue-50/20 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 md:p-12 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
          <CalendarPlus className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Patient Intake</h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
          The new patient headache intake form is now integrated directly with our clinical system. 
          Please consult with an approved doctor to start your structured assessment and receive your unique Patient ID.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Return Home
          </Link>
          <Link to="/doctor-login-private" className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors gap-2">
            <ShieldCheck className="w-4 h-4" />
            Doctor Login
          </Link>
        </div>
      </div>
    </div>
  );
}
