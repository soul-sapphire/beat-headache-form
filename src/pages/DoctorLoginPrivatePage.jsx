import React, { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Stethoscope, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function isFirebaseConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

function getAuthErrorMessage(code) {
  switch (code) {
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completing. Please try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorised for Google sign-in. Please contact administration.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this application. Contact administration.";
    case "auth/api-key-not-valid":
      return "Firebase API key is invalid. Please contact administration.";
    case "auth/network-request-failed":
      return "A network error occurred. Please check your internet connection.";
    case "permission-denied":
      return "Permission denied loading your account. Contact administration.";
    case "unavailable":
      return "You appear to be offline. Please check your connection and try again.";
    default:
      return null;
  }
}

export default function DoctorLoginPrivatePage() {
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'error'|'pending'|'blocked', text }
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { firebaseUser, userProfile, loading: authLoading, refreshUserProfile } = useAuth();

  // If already logged in and approved, redirect immediately
  useEffect(() => {
    if (!authLoading && firebaseUser && userProfile) {
      if (userProfile.approved === true && userProfile.status === "approved") {
        if (userProfile.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/doctor/dashboard", { replace: true });
        }
      }
    }
  }, [authLoading, firebaseUser, userProfile, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setStatusMessage(null);
      setLoading(true);

      if (!isFirebaseConfigured()) {
        setStatusMessage({
          type: "error",
          text: "Firebase is not configured. Missing environment values — contact administration.",
        });
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (fetchErr) {
        const friendly = getAuthErrorMessage(fetchErr.code);
        setStatusMessage({
          type: "error",
          text: friendly || "Could not load your account profile. Please try again.",
        });
        return;
      }

      if (!userSnap.exists()) {
        // Sign out so AuthContext doesn't hold a user without a profile
        await auth.signOut();
        setStatusMessage({
          type: "error",
          text: "No doctor account found for this Google account. Please register first.",
        });
        return;
      }

      const userData = userSnap.data();

      // Update last login timestamp
      try {
        await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
      } catch (_) {
        // Non-critical — don't block login
      }

      if (userData.status === "rejected") {
        setStatusMessage({
          type: "blocked",
          text: "Your account registration has been rejected. Please contact administration.",
        });
        return;
      }

      if (userData.status === "suspended") {
        setStatusMessage({
          type: "blocked",
          text: "Your account has been suspended. Please contact administration.",
        });
        return;
      }

      if (userData.status === "pending" || userData.approved !== true) {
        setStatusMessage({
          type: "pending",
          text: "Your doctor account is pending admin approval.",
        });
        return;
      }

      if (userData.status !== "approved") {
        setStatusMessage({
          type: "blocked",
          text: "Your account is not approved for portal access. Please contact administration.",
        });
        return;
      }

      // Sync AuthContext profile before navigation so ProtectedRoute has data
      await refreshUserProfile(user);

      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/doctor/dashboard", { replace: true });
      }
    } catch (err) {
      const friendly = getAuthErrorMessage(err.code);
      if (err.code !== "auth/popup-closed-by-user") {
        console.error("[Login] Auth error:", err.code || err.message);
      }
      setStatusMessage({
        type: "error",
        text: friendly || "Failed to sign in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100 space-y-6">
        <div className="flex justify-center">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Stethoscope className="w-10 h-10" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Doctor Portal</h2>
          <p className="text-gray-500 mt-1">Secure login for medical professionals</p>
        </div>

        {statusMessage && statusMessage.type === "error" && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{statusMessage.text}</p>
          </div>
        )}

        {statusMessage && statusMessage.type === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex gap-3">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Account Pending Approval</p>
              <p className="text-sm mt-1 leading-relaxed">{statusMessage.text}</p>
            </div>
          </div>
        )}

        {statusMessage && statusMessage.type === "blocked" && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Account Blocked</p>
              <p className="text-sm mt-1 leading-relaxed">{statusMessage.text}</p>
            </div>
          </div>
        )}

        <button
          id="doctor-google-login-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          {loading ? "Signing in…" : "Sign in with Google"}
        </button>

        <div className="text-center text-sm text-gray-500">
          Not registered yet?{" "}
          <a href="/doctor-register-private" className="text-blue-600 hover:underline font-medium">
            Register here
          </a>
        </div>
      </div>
    </div>
  );
}
