import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  collection, query, where, getDocs, doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import {
  LogOut, ShieldAlert, Check, X, Slash, BarChart2, Users, Loader2, Mail, MessageSquare,
} from "lucide-react";

function DebugPanel({ userProfile }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div style={{
      position: "fixed", bottom: 8, right: 8, background: "rgba(15,23,42,0.92)",
      color: "#94a3b8", fontSize: 11, padding: "8px 12px", borderRadius: 8,
      zIndex: 9999, fontFamily: "monospace", maxWidth: 260, lineHeight: 1.6,
    }}>
      <div style={{ color: "#f87171", fontWeight: "bold", marginBottom: 2 }}>🛡 DEV Admin State</div>
      <div>uid: {userProfile?.uid?.slice(0, 10)}…</div>
      <div>email: {userProfile?.email || "—"}</div>
      <div>role: {userProfile?.role || "—"}</div>
      <div>approved: {String(userProfile?.approved ?? "—")}</div>
      <div>status: {userProfile?.status || "—"}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // doctorId currently being actioned

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const q = query(
        collection(db, "users"),
        where("role", "==", "doctor"),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      const docs = [];
      snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() }));
      setPendingDoctors(docs);
    } catch (error) {
      console.error("[Admin] Error fetching pending doctors:", error.code || error.message);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      setActionLoading(doctorId);
      await updateDoc(doc(db, "users", doctorId), {
        approved: true,
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      setPendingDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (error) {
      console.error("[Admin] Error approving doctor:", error.code || error.message);
      alert("Failed to approve doctor. Check console for details.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId) => {
    if (!window.confirm("Reject this doctor registration?")) return;
    try {
      setActionLoading(doctorId);
      await updateDoc(doc(db, "users", doctorId), {
        approved: false,
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
      setPendingDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (error) {
      console.error("[Admin] Error rejecting doctor:", error.code || error.message);
      alert("Failed to reject doctor. Check console for details.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/doctor-login-private");
  };

  const formatDate = (val) => {
    if (!val) return "—";
    // Handle Firestore Timestamp objects
    if (val?.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
    try { return new Date(val).toLocaleDateString(); } catch { return val; }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              System Administrator: {userProfile?.displayName}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap">
            <Link
              to="/admin/research-export"
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-indigo-100"
            >
              <BarChart2 className="w-4 h-4" />
              Research Export
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Pending Doctor Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Pending Doctor Approvals
            </h2>
            <button
              onClick={fetchPendingDoctors}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loadingDoctors ? (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              Loading pending registrations…
            </div>
          ) : pendingDoctors.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No pending doctor registrations at this time.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {doctor.photoURL ? (
                      <img
                        src={doctor.photoURL}
                        alt={doctor.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {doctor.displayName?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{doctor.displayName || "Unnamed"}</h3>
                      <p className="text-sm text-gray-500">{doctor.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Registered: {formatDate(doctor.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {actionLoading === doctor.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(doctor.id)}
                          className="flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-green-100"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(doctor.id)}
                          className="flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-red-100"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/research-export"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow flex items-start gap-4"
          >
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Research Export</h3>
              <p className="text-xs text-gray-500 mt-1">
                Download anonymised research CSV.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/contact-messages"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow flex items-start gap-4"
          >
            <div className="bg-sky-50 p-3 rounded-xl text-sky-600">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Contact Messages</h3>
              <p className="text-xs text-gray-500 mt-1">
                View inquiries from the contact form.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/feedback"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow flex items-start gap-4"
          >
            <div className="bg-cyan-50 p-3 rounded-xl text-cyan-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">User Feedback</h3>
              <p className="text-xs text-gray-500 mt-1">
                Review user feedback and suggestions.
              </p>
            </div>
          </Link>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 opacity-60">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Management</h3>
              <p className="text-xs text-gray-500 mt-1">
                Approve or reject doctor accounts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DebugPanel userProfile={userProfile} />
    </div>
  );
}
