import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPatientByQrToken } from "../services/patientService";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, ChevronLeft, Loader2, AlertCircle } from "lucide-react";

export default function QRScannerPage() {
  const { userData, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const qrCodeInstanceRef = useRef(null);

  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    // Start scanner automatically on mount
    const html5QrCode = new Html5Qrcode("qr-reader");
    qrCodeInstanceRef.current = html5QrCode;
    setCameraActive(true);

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      async (decodedText) => {
        // Success callback
        if (!decodedText.startsWith("pt_")) {
          setError("Invalid QR code format. Must be a secure patient QR token.");
          return;
        }

        // Stop scanner immediately to avoid multiple scans
        try {
          await html5QrCode.stop();
          setCameraActive(false);
        } catch (err) {
          console.warn("Failed to stop scanner:", err);
        }

        // Fetch patient by QR token
        handleQrToken(decodedText);
      },
      (errorMessage) => {
        // Keep scanning, ignore errors
      }
    ).catch((err) => {
      console.error("Camera initialisation failed:", err);
      setError("Unable to access camera. Please ensure permissions are granted and no other app is using it.");
      setCameraActive(false);
    });

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err) => console.error("Error stopping scanner on cleanup:", err));
      }
    };
  }, []);

  const handleQrToken = async (token) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPatientByQrToken(
        token,
        userData.uid,
        userData.displayName || "Doctor",
        userData.email || "",
        isAdmin
      );

      if (!result) {
        setError("No patient record matches this secure QR token.");
        setLoading(false);
        // Restart scanner if not found
        restartScanner();
        return;
      }

      if (result.accessDenied) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // Success: Navigate to patient profile page
      navigate(`/patient/${result.data.patientCode}`);
    } catch (err) {
      console.error("Failed to query patient by QR token:", err);
      setError("An error occurred while fetching patient records.");
      setLoading(false);
      restartScanner();
    }
  };

  const restartScanner = () => {
    if (qrCodeInstanceRef.current && !qrCodeInstanceRef.current.isScanning) {
      setError(null);
      setCameraActive(true);
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      qrCodeInstanceRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          if (!decodedText.startsWith("pt_")) {
            setError("Invalid QR code format. Must be a secure patient QR token.");
            return;
          }
          try {
            await qrCodeInstanceRef.current.stop();
            setCameraActive(false);
          } catch (err) {
            console.warn("Failed to stop scanner:", err);
          }
          handleQrToken(decodedText);
        },
        () => {}
      ).catch((err) => {
        console.error("Camera restart failed:", err);
        setError("Failed to restart camera.");
        setCameraActive(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Secure Patient QR Scanner</h1>
              <p className="text-gray-500 text-xs">Scan the patient's secure QR card to fetch history.</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-black rounded-xl aspect-square flex items-center justify-center border border-gray-200">
            <div id="qr-reader" className="w-full h-full"></div>
            
            {!cameraActive && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 text-white text-center p-4 space-y-4">
                <p className="text-sm font-medium">Scanner inactive or failed to start</p>
                <button
                  onClick={restartScanner}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center text-center p-6 space-y-3 z-10">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-gray-800">Verifying access & loading patient data...</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
            <strong>Security Notice:</strong> The scanner only reads secure randomly-generated tokens. It does not read patient identifiers directly. All scans are logged for auditing purposes.
          </div>
        </div>
      </div>
    </div>
  );
}
