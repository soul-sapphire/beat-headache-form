/**
 * passportPdfGenerator.js
 * -----------------------
 * Generates the Beat Headache Digital Passport PDF (A4 format).
 * Features clinic branding, QR code, score cards, Mini FRESSH breakdown,
 * recommendations, and educational disclaimer.
 */

import jsPDFPackage from "jspdf";
const jsPDF = jsPDFPackage.jsPDF || jsPDFPackage;
import { renderQrCode } from "./qrRenderer.js";

export function generatePassportPdf(assessmentDoc) {
  const doc = new jsPDF({ format: "a4" });
  const PW = 210;
  const PH = 297;
  const M = 15;
  const UW = PW - M * 2;
  let cy = M;

  const history = assessmentDoc.assessmentHistory || [];
  const latestEntry = history[history.length - 1] || {};
  const assessmentId = assessmentDoc.assessmentId || "BH-HA-PASSPORT";
  const userName = assessmentDoc.firstName || "Anonymous User";
  const dateStr = new Date(latestEntry.assessmentDate || assessmentDoc.updatedAt || Date.now()).toLocaleDateString();

  // --- Header ---
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.roundedRect(M, cy, 12, 12, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("BH", M + 6, cy + 8, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text("Beat Headache Digital Passport", M + 16, cy + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Passport ID: ${assessmentId} | Date: ${dateStr}`, M + 16, cy + 11);

  // QR Code on Header Top Right
  const passportUrl = `${window.location.origin}/assessment/${assessmentId}`;
  renderQrCode(doc, passportUrl, PW - M - 16, cy, 16);

  cy += 20;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(M, cy, PW - M, cy);
  cy += 8;

  // --- Patient & Overview Card ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, cy, UW, 18, 4, 4, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Patient / User: ${userName}`, M + 6, cy + 7);
  doc.text(`Age/Gender: ${assessmentDoc.age || "N/A"} yrs | ${assessmentDoc.gender || "Not specified"}`, M + 6, cy + 13);
  doc.text(`Total Reassessments: ${history.length}`, M + 110, cy + 7);
  doc.text(`Severity: ${latestEntry.severity || "Standard"}`, M + 110, cy + 13);

  cy += 24;

  // --- Score Cards ---
  const boxW = (UW - 6) / 2;

  // Burden Card
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(M, cy, boxW, 25, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216);
  doc.text("HEADACHE BURDEN SCORE", M + 6, cy + 7);
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138);
  doc.text(`${latestEntry.headacheScore || 0} / 60`, M + 6, cy + 18);

  // Mini FRESSH Card
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(M + boxW + 6, cy, boxW, 25, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text("MINI FRESSH LIFESTYLE SCORE", M + boxW + 12, cy + 7);
  doc.setFontSize(20);
  doc.setTextColor(6, 78, 59);
  doc.text(`${latestEntry.fresshScore || 0} / 60`, M + boxW + 12, cy + 18);

  cy += 32;

  // --- Mini FRESSH Domain Breakdown ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Lifestyle Domain Rating (0-10)", M, cy);
  cy += 5;

  const lifestyle = latestEntry.lifestyleDetails || {};
  const domains = [
    { label: "Food Pattern", val: lifestyle.foodScore || 5 },
    { label: "Sleep Hygiene", val: lifestyle.sleepScore || 5 },
    { label: "Physical Exercise", val: lifestyle.exerciseScore || 5 },
    { label: "Hydration Intake", val: lifestyle.hydrationScore || 5 },
    { label: "Screen Time Limit", val: lifestyle.screenTimeScore || 5 },
    { label: "Relaxation / Stress", val: lifestyle.relaxationScore || 5 },
  ];

  const colW = (UW - 4) / 2;
  domains.forEach((d, i) => {
    const rx = i % 2 === 0 ? M : M + colW + 4;
    const ry = cy + Math.floor(i / 2) * 10;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(rx, ry, colW, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(d.label, rx + 4, ry + 5.5);
    doc.setTextColor(37, 99, 235);
    doc.text(`${d.val}/10`, rx + colW - 12, ry + 5.5);
  });

  cy += 36;

  // --- Recommendations Section ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Personalized Action Recommendations", M, cy);
  cy += 6;

  const recs = latestEntry.recommendations || ["Maintain steady lifestyle habits."];
  recs.forEach((rec) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(M, cy, UW, 9, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`• ${rec}`, M + 4, cy + 6);
    cy += 11;
  });

  cy += 6;

  // --- Educational Disclaimer ---
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(M, cy, UW, 16, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text("EDUCATIONAL MEDICAL DISCLAIMER", M + 4, cy + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(185, 28, 28);
  doc.text("This Digital Passport is for self-tracking and educational purposes only. It does not replace professional medical diagnosis.", M + 4, cy + 9);
  doc.text("If you experience sudden severe headaches, fever with stiff neck, or weakness, seek immediate emergency medical care.", M + 4, cy + 13);

  // Footer Page Number & Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(37, 99, 235);
  doc.text("Already have this QR? Simply scan it anytime to continue your headache journey.", M, PH - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Beat Headache EMR Platform | Confidential Passport Record ID: ${assessmentId}`, M, PH - 6);
  doc.text("Page 1 of 1", PW - M - 12, PH - 6);

  return doc;
}
