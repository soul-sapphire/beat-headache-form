import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";

export default function DoctorRegisterPrivatePage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleGoogleRegister = async () => {
    try {
      setError("");
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "doctor",
          approved: false,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        });
        setSuccess(true);
      } else {
        // User already exists
        navigate("/doctor-login-private");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Stethoscope className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Doctor Registration</h2>
        <p className="text-gray-500 text-center mb-8">Beat Headache Medical Portal</p>

        {success ? (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 text-center">
            <h3 className="font-semibold mb-2">Registration Submitted</h3>
            <p className="text-sm">Your doctor account is pending admin approval. You will be able to access the dashboard once approved.</p>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}
            
            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {loading ? "Registering..." : "Register with Google"}
            </button>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account? <a href="/doctor-login-private" className="text-blue-600 hover:underline">Log in here</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
