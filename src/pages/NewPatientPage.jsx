import React from "react";
import BeatHeadacheNewPatientForm from "../BeatHeadacheNewPatientForm";

export default function NewPatientPage() {
  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 via-cyan-50/10 to-blue-50/20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simple Page Header Wrapper */}
        <div className="mb-10 p-6 sm:p-8 bg-white border border-slate-100/80 rounded-3xl shadow-sm text-center max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            New Patient Headache Form
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Complete the structured form below. You can save drafts locally, generate reports, and export deidentified research data where consent is given.
          </p>
        </div>

        {/* The Unaltered Form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
          <BeatHeadacheNewPatientForm />
        </div>
      </div>
    </div>
  );
}
