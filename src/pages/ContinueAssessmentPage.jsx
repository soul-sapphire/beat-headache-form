import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  QrCode,
  Key,
  Camera,
  ArrowRight,
  AlertCircle,
  Brain,
  RefreshCw,
  Sparkles,
  CameraOff,
  CheckCircle2
} from "lucide-react";
import { getPublicAssessment } from "../services/assessmentService";

export default function ContinueAssessmentPage() {
  const navigate = useNavigate();

  // State
  const [assessmentIdInput, setAssessmentIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);

  // Parse Assessment ID from QR payload or input
  const parseAssessmentId = (payload) => {
    if (!payload) return null;
    const str = payload.trim();

    // Check URL pattern: .../assessment/BH-HA-XXXXXX
    const matchUrl = str.match(/\/assessment\/(BH-HA-[A-Z0-9]{6})/i);
    if (matchUrl && matchUrl[1]) {
      return matchUrl[1].toUpperCase();
    }

    // Check Raw ID pattern: BH-HA-XXXXXX
    const matchId = str.match(/^(BH-HA-[A-Z0-9]{6})$/i);
    if (matchId && matchId[1]) {
      return matchId[1].toUpperCase();
    }

    return null;
  };

  // Start Live Camera QR Scanner
  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          console.log("[QR Scanner] Decoded:", decodedText);
          const parsedId = parseAssessmentId(decodedText);
          if (parsedId) {
            stopScanner();
            navigate(`/assessment/${parsedId}`);
          } else {
            setCameraError("Scanned QR code is not a valid Beat Headache Passport QR.");
          }
        },
        () => {
          // Frame scan error - ignore silent frame drops
        }
      );
    } catch (err) {
      console.error("[QR Scanner] Error starting camera:", err);
      setIsScanning(false);
      setCameraError("Unable to access device camera. Please check permissions or type your Assessment ID below.");
    }
  };

  // Stop Camera Scanner
  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("[QR Scanner] Error stopping camera:", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Handle Manual ID Submission
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setNotFound(false);

    const parsedId = parseAssessmentId(assessmentIdInput);
    if (!parsedId) {
      setErrorMsg("Invalid Assessment ID format. Please enter a valid ID (e.g. BH-HA-7X4P8Q).");
      return;
    }

    setLoading(true);
    try {
      const doc = await getPublicAssessment(parsedId);
      if (!doc) {
        setNotFound(true);
      } else {
        navigate(`/assessment/${parsedId}`);
      }
    } catch (err) {
      console.error("[ContinueAssessment] Lookup error:", err);
      setErrorMsg("Failed to verify Assessment ID. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto text-2xl shadow-sm">
            🔄
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Continue Your Headache Journey
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Scan your QR Digital Passport or enter your Assessment ID to view progress, track streaks, or start a reassessment.
          </p>
        </div>

        {/* NOT FOUND ALERT VIEW */}
        {notFound ? (
          <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-lg text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Passport Not Found</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              We couldn't find a Headache Passport matching Assessment ID <strong>{assessmentIdInput}</strong>.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setNotFound(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/self-assessment")}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Brain className="w-4 h-4" /> Start New Assessment
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* OPTION 1: LIVE QR CAMERA SCANNER */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-600" /> Option 1: Scan QR Passport
                </h3>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Instant Auto-Load
                </span>
              </div>

              {/* QR Reader Camera Viewport */}
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden min-h-[260px] flex items-center justify-center border border-slate-800">
                <div id="qr-reader" className="w-full max-w-sm overflow-hidden" />

                {!isScanning && (
                  <div className="text-center p-6 space-y-3">
                    <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">
                      Point camera at your Digital Passport QR Code
                    </p>
                    <button
                      onClick={startScanner}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 mx-auto shadow-md transition-transform active:scale-95"
                    >
                      <Camera className="w-4 h-4" /> Open Camera & Scan QR
                    </button>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={stopScanner}
                      className="px-3 py-1.5 bg-rose-600/90 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <CameraOff className="w-3.5 h-3.5" /> Stop Camera
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>

            {/* OPTION 2: MANUAL ASSESSMENT ID INPUT */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Key className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">Option 2: Enter Assessment ID</h3>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Assessment ID Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BH-HA-7X4P8Q"
                      value={assessmentIdInput}
                      onChange={(e) => setAssessmentIdInput(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={loading || !assessmentIdInput.trim()}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                    >
                      {loading ? "Checking..." : "Continue"} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                  </p>
                )}
              </form>
            </div>
          </>
        )}

        {/* Security & Privacy Footer Note */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed font-medium">
            🔒 <strong>Privacy First:</strong> Your QR code stores only your Assessment ID. Zero personal data or medical records are embedded in the QR matrix.
          </p>
        </div>
      </div>
    </div>
  );
}
