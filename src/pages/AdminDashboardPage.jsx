import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { LogOut, ShieldAlert, Check, X } from "lucide-react";

export default function AdminDashboardPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "doctor"), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setPendingDoctors(docs);
    } catch (error) {
      console.error("Error fetching pending doctors", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      const userRef = doc(db, "users", doctorId);
      await updateDoc(userRef, {
        approved: true,
        status: "approved",
        updatedAt: new Date().toISOString()
      });
      setPendingDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (error) {
      console.error("Error approving doctor", error);
    }
  };

  const handleReject = async (doctorId) => {
    try {
      const userRef = doc(db, "users", doctorId);
      await updateDoc(userRef, {
        approved: false,
        status: "rejected",
        updatedAt: new Date().toISOString()
      });
      setPendingDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (error) {
      console.error("Error rejecting doctor", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/doctor-login-private");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-500">System Administrator: {userData?.displayName}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors px-3 py-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Pending Doctor Approvals</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading pending requests...</div>
          ) : pendingDoctors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending doctor registrations at this time.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingDoctors.map((doc) => (
                <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {doc.photoURL ? (
                      <img src={doc.photoURL} alt={doc.displayName} className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {doc.displayName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{doc.displayName}</h3>
                      <p className="text-sm text-gray-500">{doc.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Registered: {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(doc.id)}
                      className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(doc.id)}
                      className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
