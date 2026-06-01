import React, { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Stethoscope, AlertCircle, Clock, CheckCircle, ShieldAlert } from "lucide-react";
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
      return "The sign-in popup was closed. Please try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorised for Google sign-in. Contact administration.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this application. Contact administration.";
    case "auth/api-key-not-valid":
      return "Firebase API key is invalid. Contact administration.";
    case "auth/network-request-failed":
      return "A network error occurred. Check your internet connection.";
    default:
      return null;
  }
}

export default function DoctorRegisterPrivatePage() {
  const [statusMessage, setStatusMessage] = useState(null); // { type, text }
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { firebaseUser, userProfile, loading: authLoading, refreshUserProfile } = useAuth();

  // If already approved, redirect immediately
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

  const handleGoogleRegister = async () => {
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
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // New registration — create pending doctor document
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          role: "doctor",
          approved: false,
          status: "pending",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
        await refreshUserProfile(user);
        setStatusMessage({
          type: "pending",
          text: "Registration submitted! Your account is pending admin approval. You will gain access once approved.",
        });
        return;
      }

      // User already exists — do NOT overwrite role/approved/status
      const existingData = userSnap.data();

      if (existingData.status === "pending" || existingData.approved !== true) {
        setStatusMessage({ type: "pending", text: "Your account is already registered and is pending admin approval." });
        return;
      }

      if (existingData.status === "rejected") {
        setStatusMessage({ type: "blocked", text: "Your account registration was previously rejected. Please contact administration." });
        return;
      }

      if (existingData.status === "suspended") {
        setStatusMessage({ type: "blocked", text: "Your account has been suspended. Please contact administration." });
        return;
      }

      // Already approved — sync profile then navigate
      await refreshUserProfile(user);
      if (existingData.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/doctor/dashboard", { replace: true });
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        console.error("[Register] Auth error:", err.code || err.message);
      }
      const friendly = getAuthErrorMessage(err.code);
      setStatusMessage({
        type: "error",
        text: friendly || "Registration failed. Please try again.",
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
          <h2 className="text-2xl font-bold text-gray-800">Doctor Registration</h2>
          <p className="text-gray-500 mt-1">Beat Headache Medical Portal</p>
        </div>

        {statusMessage && statusMessage.type === "error" && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{statusMessage.text}</p>
          </div>
        )}

        {statusMessage && statusMessage.type === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-5 rounded-xl text-center space-y-2">
            <div className="flex justify-center">
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="font-semibold">Registration Submitted</h3>
            <p className="text-sm leading-relaxed">{statusMessage.text}</p>
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

        {!statusMessage && (
          <>
            <button
              id="doctor-google-register-btn"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {loading ? "Registering…" : "Register with Google"}
            </button>

            <div className="text-center text-sm text-gray-500">
              Already registered?{" "}
              <a href="/doctor-login-private" className="text-blue-600 hover:underline font-medium">
                Log in here
              </a>
            </div>
          </>
        )}

        {statusMessage && statusMessage.type === "pending" && (
          <div className="text-center">
            <a
              href="/doctor-login-private"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Try logging in →
            </a>
          </div>
        )}

        {!authLoading && firebaseUser && userProfile?.approved === true && userProfile?.status === "approved" && (
          <div className="text-center space-y-3 pt-2">
            {userProfile.role === "admin" ? (
              <a
                href="/admin"
                className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium text-sm transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Go to Admin Dashboard
              </a>
            ) : (
              <a
                href="/doctor/dashboard"
                className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium text-sm transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Go to Doctor Dashboard
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
