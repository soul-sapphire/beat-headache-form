import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getResearchRows,
  buildResearchCsv,
  downloadResearchCsv,
  logAdminAuditAction,
} from "../services/patientService";
import {
  BarChart2,
  ChevronLeft,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

function formatTs(val) {
  if (!val) return "—";
  if (val?.seconds) return new Date(val.seconds * 1000).toLocaleString();
  try {
    return new Date(val).toLocaleString();
  } catch {
    return "—";
  }
}

export default function AdminResearchExportPage() {
  const { userProfile } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadRows = async (startDate = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResearchRows(200, startDate || null);
      setRows(data);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[AdminResearchExport] load error:", err.code || err.message);
      }
      setError("Could not load research dataset. Check permissions and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    loadRows(filterDate || null);
  };

  const handleDownloadCsv = async () => {
    try {
      setExporting(true);
      const exportRows = filterDate
        ? await getResearchRows(5000, filterDate)
        : await getResearchRows(5000);
      const csv = buildResearchCsv(exportRows);
      const datePart = new Date().toISOString().slice(0, 10);
      downloadResearchCsv(csv, `beat-headache-research-dataset-${datePart}.csv`);
      await logAdminAuditAction(
        userProfile?.uid,
        userProfile?.displayName || "Admin",
        userProfile?.email || "",
        "research_csv_exported"
      );
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[AdminResearchExport] export error:", err.code || err.message);
      }
      alert("Failed to export CSV. Check console for details.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Admin Dashboard
        </Link>

        <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
              Research Dataset Export
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Admin-only anonymised research rows. No patient names or contact details.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={exporting || loading}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download combined CSV
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total rows (loaded)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{rows.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:col-span-2">
            <form onSubmit={handleApplyFilter} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Filter from date (optional)
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                Apply filter
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterDate("");
                  loadRows();
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Latest research rows</h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              Loading research dataset…
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No research rows yet. Rows are created when doctors save encounters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Patient ref</th>
                    <th className="px-4 py-3">FRESSH</th>
                    <th className="px-4 py-3">Red flags</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id || row.rowId} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs">{row.patientCode || row.researchPatientRef}</td>
                      <td className="px-4 py-3">{row.fresshScore ?? "—"}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{row.redFlagsSummary || "—"}</td>
                      <td className="px-4 py-3">{row.doctorName || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatTs(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {import.meta.env.DEV && userProfile && (
          <div className="text-xs text-gray-400 font-mono">
            DEV: admin {userProfile.uid?.slice(0, 10)}… | role {userProfile.role} | status {userProfile.status}
          </div>
        )}
      </div>
    </div>
  );
}
