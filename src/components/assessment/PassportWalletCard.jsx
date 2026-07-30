import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, Download, Printer } from "lucide-react";
import { generatePassportPdf } from "../../reports/passportPdfGenerator";

export default function PassportWalletCard({ assessmentDoc }) {
  if (!assessmentDoc) return null;

  const history = assessmentDoc.assessmentHistory || [];
  const latestEntry = history[history.length - 1] || {};
  const assessmentId = assessmentDoc.assessmentId || "BH-HA-PASSPORT";
  const passportUrl = `${window.location.origin}/assessment/${assessmentId}`;

  const handleDownloadPdf = () => {
    try {
      const pdf = generatePassportPdf(assessmentDoc);
      pdf.save(`BeatHeadache_Passport_${assessmentId}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-blue-600" /> Printable Wallet Passport Card
        </h3>
        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <Download className="w-3.5 h-3.5" /> Download Passport PDF
        </button>
      </div>

      {/* Wallet Card Mockup */}
      <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-4 text-xs">
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">BEAT HEADACHE CLINIC</span>
            <h4 className="text-base font-black">Digital Headache Passport</h4>
          </div>
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-mono font-bold border border-blue-400/30">
            {assessmentId}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
            <QRCodeCanvas value={passportUrl} size={72} />
          </div>

          <div className="space-y-1 font-medium text-slate-300">
            <p><strong>Owner:</strong> {assessmentDoc.firstName || "Anonymous"}</p>
            <p><strong>Headache Burden:</strong> <span className="text-blue-400 font-bold">{latestEntry.headacheScore || 0}/60</span></p>
            <p><strong>Mini FRESSH:</strong> <span className="text-emerald-400 font-bold">{latestEntry.fresshScore || 0}/60</span></p>
            <p><strong>Status:</strong> {latestEntry.severity || "Standard"}</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-2 text-[9px] text-slate-400 flex justify-between">
          <span>Official Pre-Clinic Passport</span>
          <span>Educational Tracking Tool</span>
        </div>
      </div>
    </div>
  );
}
