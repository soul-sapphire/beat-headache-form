import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getPatientByCode,
  getEncountersForPatient,
  searchPatientSuggestions,
  normalizePatientCodeInput,
  isPatientSearchPermissionError,
} from "../services/patientService";
import {
  Search,
  Calendar,
  Activity,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Hash,
} from "lucide-react";

const DEBOUNCE_MS = 300;
const MIN_SUGGEST_PREFIX = 1;

function formatSearchError(err, context = "search") {
  if (isPatientSearchPermissionError(err)) {
    const deployHint =
      " Ask an administrator to deploy Firestore rules (firebase deploy --only firestore:rules).";
    return import.meta.env.DEV
      ? `Missing or insufficient permissions while ${context}.${deployHint} (${err.message})`
      : `Missing or insufficient permissions while ${context}. Contact administration.`;
  }
  if (import.meta.env.DEV && err?.message) {
    return `An error occurred while searching. ${err.message}`;
  }
  return "An error occurred while searching.";
}

function formatFirestoreDate(val) {
  if (!val) return null;
  if (val?.seconds) return new Date(val.seconds * 1000);
  try {
    return new Date(val);
  } catch {
    return null;
  }
}

function formatDisplayDate(val) {
  const d = formatFirestoreDate(val);
  return d ? d.toLocaleDateString() : null;
}

export default function DoctorPatientsPage() {
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchContainerRef = useRef(null);
  const debounceRef = useRef(null);

  const isAdmin = userData?.role === "admin";

  const loadPatientByCode = useCallback(
    async (code) => {
      const normalized = normalizePatientCodeInput(code);
      if (!normalized) return { ok: false, reason: "empty" };

      setLoading(true);
      setError(null);
      setSelectedPatient(null);
      setEncounters([]);
      setShowSuggestions(false);

      try {
        const result = await getPatientByCode(
          normalized,
          userData.uid,
          userData.displayName || "Doctor",
          userData.email || "",
          isAdmin
        );

        if (!result) {
          setError("No matching patient records found.");
          return { ok: false, reason: "notFound" };
        }
        if (result.accessDenied) {
          setError(result.message);
          return { ok: false, reason: "accessDenied" };
        }

        setSelectedPatient(result.data);
        setSearchTerm(normalized);
        const encs = await getEncountersForPatient(
          normalized,
          userData.uid,
          userData.displayName || "Doctor",
          userData.email || "",
          isAdmin
        );
        setEncounters(encs);
        return { ok: true };
      } catch (err) {
        console.error("Patient search failed:", err);
        setError(formatSearchError(err, "loading patient record"));
        return { ok: false, reason: "error" };
      } finally {
        setLoading(false);
      }
    },
    [userData, isAdmin]
  );

  const fetchSuggestions = useCallback(
    async (term) => {
      const normalized = normalizePatientCodeInput(term);
      if (!normalized || normalized.length < MIN_SUGGEST_PREFIX) {
        setSuggestions([]);
        setSuggestionsLoading(false);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const results = await searchPatientSuggestions(term, userData.uid, userData);
        setSuggestions(results);
        setShowSuggestions(true);
        setError(null);
      } catch (err) {
        console.error("Patient search failed:", err);
        setSuggestions([]);
        if (isPatientSearchPermissionError(err)) {
          setError(formatSearchError(err, "loading suggestions"));
        }
      } finally {
        setSuggestionsLoading(false);
      }
    },
    [userData]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const normalized = normalizePatientCodeInput(searchTerm);
    if (!normalized) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.patientCode);
    setSuggestions([]);
    setShowSuggestions(false);
    loadPatientByCode(suggestion.patientCode);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const normalized = normalizePatientCodeInput(searchTerm);
    if (!normalized) return;

    const outcome = await loadPatientByCode(normalized);

    if (outcome?.ok || outcome?.reason === "accessDenied" || outcome?.reason === "error") {
      return;
    }

    if (outcome?.reason === "notFound") {
      try {
        const results = await searchPatientSuggestions(searchTerm, userData.uid, userData);
        if (results.length > 0) {
          setSuggestions(results);
          setShowSuggestions(true);
          setError(null);
        } else {
          setError("No matching patient records found.");
        }
      } catch (err) {
        console.error("Patient search failed:", err);
        setError(formatSearchError(err, "searching patients"));
      }
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setError(null);
    if (e.target.value.trim()) {
      setShowSuggestions(true);
    }
  };

  const showDropdown =
    showSuggestions &&
    searchTerm.trim() &&
    (suggestionsLoading || suggestions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Patient Search</h1>
              <p className="text-gray-500 text-sm">
                Start typing a Patient ID (e.g. RU-NE-2004) — matching records appear as you type.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative" ref={searchContainerRef}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => {
                  if (searchTerm.trim() && suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Enter Patient ID..."
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all font-mono"
              />

              {showDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                  {suggestionsLoading && (
                    <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                      Searching patient IDs…
                    </div>
                  )}

                  {!suggestionsLoading && suggestions.length === 0 && (
                    <p className="px-4 py-3 text-sm text-gray-500">
                      No matching patient records found.
                    </p>
                  )}

                  {!suggestionsLoading &&
                    suggestions.map((s) => (
                      <button
                        key={s.patientCode}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-gray-50 last:border-b-0 transition-colors"
                      >
                        <p className="font-mono font-semibold text-gray-900">{s.patientCode}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3">
                          {s.birthYear && <span>Birth year: {s.birthYear}</span>}
                          {formatDisplayDate(s.lastVisitAt) && (
                            <span>Last visit: {formatDisplayDate(s.lastVisitAt)}</span>
                          )}
                          {!s.lastVisitAt && formatDisplayDate(s.createdAt) && (
                            <span>Created: {formatDisplayDate(s.createdAt)}</span>
                          )}
                        </p>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2 shrink-0"
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

        {selectedPatient && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Hash className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 font-mono">
                    {selectedPatient.patientCode}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    {selectedPatient.birthYear && (
                      <span>Birth year: {selectedPatient.birthYear}</span>
                    )}
                    {formatDisplayDate(selectedPatient.lastVisitAt) && (
                      <>
                        <span>•</span>
                        <span>Last visit: {formatDisplayDate(selectedPatient.lastVisitAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to={`/doctor/encounter/new/${selectedPatient.patientCode}`}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors text-center"
              >
                + New Encounter
              </Link>
            </div>

            <h3 className="text-lg font-bold text-gray-800 px-2">
              Clinical History ({encounters.length})
            </h3>

            <div className="space-y-4">
              {encounters.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
                  No encounters recorded yet for this patient.
                </div>
              ) : (
                encounters.map((enc) => (
                  <div
                    key={enc.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {new Date(
                              enc.createdAt?.seconds * 1000 || enc.createdAt
                            ).toLocaleDateString()}
                          </p>
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
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Suggested Diagnosis Summary
                          </h4>
                          <p className="text-sm text-gray-700 font-medium">
                            {enc.diagnosisReviewSummary || "None"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Clinical Report / Plan
                          </h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {enc.doctorClinicalReport || "No plan recorded."}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4 md:border-l md:border-gray-100 md:pl-6">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                            Red Flags Summary
                          </h4>
                          <p className="text-sm text-gray-700">
                            {enc.redFlagsSummary || "None identified."}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Patient Summary Notes
                          </h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {enc.patientSummaryReport || "No notes."}
                          </p>
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
