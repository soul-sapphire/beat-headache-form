import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, AlertCircle, RefreshCw, ShieldAlert, Clock } from "lucide-react";

function DebugPanel({ userProfile }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        background: "rgba(15,23,42,0.92)",
        color: "#94a3b8",
        fontSize: 11,
        padding: "8px 12px",
        borderRadius: 8,
        zIndex: 9999,
        fontFamily: "monospace",
        maxWidth: 260,
        lineHeight: 1.6,
      }}
    >
      <div style={{ color: "#38bdf8", fontWeight: "bold", marginBottom: 2 }}>
        🔧 DEV Auth State
      </div>
      <div>email: {userProfile?.email || "—"}</div>
      <div>role: {userProfile?.role || "—"}</div>
      <div>
        approved:{" "}
        {userProfile?.approved === true
          ? "✅ true"
          : userProfile?.approved === false
          ? "❌ false"
          : String(userProfile?.approved ?? "—")}
      </div>
      <div>status: {userProfile?.status || "—"}</div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { firebaseUser, userProfile, loading, authError } = useAuth();

  // 1. Wait while the initial auth check is in progress
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Verifying your session…</p>
        </div>
      </div>
    );
  }

  // 2. No Firebase user → send to login
  if (!firebaseUser) {
    return <Navigate to="/doctor-login-private" replace />;
  }

  // 3. Firebase user exists but Firestore failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-orange-400 space-y-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Profile Load Error</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // 4. Firebase user present but no Firestore profile doc
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-gray-400 space-y-4">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">No Account Found</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            No doctor account was found for this Google account. Please register
            first or contact administration.
          </p>
          <div className="flex gap-3 justify-center pt-1">
            <a
              href="/doctor-register-private"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Register
            </a>
            <a
              href="/doctor-login-private"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 5. Blocked / rejected / suspended
  if (userProfile.status === "rejected" || userProfile.status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-red-500 space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Account Blocked</h2>
          <p className="text-gray-600 text-sm">
            Your account has been{" "}
            <strong>{userProfile.status}</strong>. Please contact
            administration for further information.
          </p>
        </div>
        <DebugPanel userProfile={userProfile} />
      </div>
    );
  }

  // 6. Pending approval
  if (userProfile.status === "pending" || userProfile.approved !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-yellow-400 space-y-4">
          <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Approval Pending</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your doctor account registration is under review. You will gain
            access to the portal once an administrator approves your account.
          </p>
          <p className="text-xs text-gray-400">
            Signed in as: {userProfile.email}
          </p>
        </div>
        <DebugPanel userProfile={userProfile} />
      </div>
    );
  }

  // 7. Role check
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-red-500 space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 text-sm">
            Your role (<strong>{userProfile.role}</strong>) does not have
            permission to view this page.
          </p>
        </div>
        <DebugPanel userProfile={userProfile} />
      </div>
    );
  }

  // 8. All checks passed — render the protected content
  return (
    <>
      {children}
      <DebugPanel userProfile={userProfile} />
    </>
  );
}
