/**
 * patientSummaryReport.js
 * -----------------------
 * Generates the Beat Headache Patient Summary PDF (A5 Portrait, 2 Pages Double-Sided).
 * Production version optimized for balanced vertical spacing across both A5 pages.
 */

import jsPDFPackage from "jspdf";
const jsPDF = jsPDFPackage.jsPDF || jsPDFPackage;
import { getSuggestedDiagnosisSummary, getRedFlagSummary } from "./diagnosisUtils.js";
import { renderQrCode } from "./qrRenderer.js";
import { Colors, Typography, PageConstants, Radius } from "./pdfTheme.js";
import {
    cleanReportText,
    truncateText,
    formatArrayItems,
    parseParityString
} from "./pdfHelpers.js";

export function generatePatientReportPdf(form, fresshTotal) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5"
    });

    // --- Layout Constants (A5: 148mm x 210mm) ---
    const M_LEFT = 7;
    const M_RIGHT = 7;
    const M_TOP = 7;
    const M_BOTTOM = 7;
    const P_WIDTH = 148;
    const P_HEIGHT = 210;
    const U_WIDTH = P_WIDTH - M_LEFT - M_RIGHT; // 134mm

    let y = M_TOP;

    // --- Local Color Palette (Original A5 Reference) ---
    const C_BG_LIGHT = [239, 246, 255]; // #EFF6FF
    const C_CYAN = [224, 242, 254];     // #E0F2FE
    const C_BORDER = [191, 219, 254];   // #BFDBFE
    const C_TEXT = [15, 23, 42];        // #0F172A slate-900
    const C_MUTED = [100, 116, 139];    // #64748B slate-500
    const C_ACCENT = [37, 99, 235];     // #2563EB accent blue
    const C_WHITE = [255, 255, 255];
    const C_RED = [220, 38, 38];
    const C_GREEN = [5, 150, 105];

    // --- Helper Functions ---
    const cleanPatientSummaryText = (text) => {
        if (text === undefined || text === null) return "";
        let s = String(text);
        const removes = [
            "See full clinical record for complete details.",
            "See full clinical record.",
            "See full clinical record",
            "Doctor must confirm.",
            "Doctor must confirm",
            "Clinician confirmation required.",
            "Clinician confirmation required",
            "Not a diagnosis.",
            "Not a diagnosis",
            "clinical/research review support only",
            "Generated from Beat Headache form responses"
        ];
        removes.forEach((r) => {
            s = s.replace(new RegExp(r, "gi"), "");
        });
        s = s.replace(/\s{2,}/g, " ").trim();
        if (s.endsWith(":") || s.endsWith(",")) s = s.slice(0, -1).trim();
        return s;
    };

    const truncateSmart = (text, maxLen = 80) => {
        const s = cleanPatientSummaryText(text);
        if (!s) return "—";
        return s.length <= maxLen ? s : s.slice(0, maxLen - 3) + "...";
    };

    const formatArraySmart = (arr, max = 6) => {
        let items = Array.isArray(arr) ? arr.filter(Boolean).map(cleanPatientSummaryText).filter(x => x !== "—" && x !== "") : [];
        if (items.length === 0) return "None";
        const unique = [...new Set(items)];
        if (unique.length <= max) return unique.join(", ");
        return unique.slice(0, max).join(", ") + " ...";
    };

    const collectSpecialNoticeFieldsOnly = (f) => {
        const notesList = [];

        const cp = f.clinicPath || {};
        if (cp.homeTreatmentReceived === "Yes") {
            const types = formatArraySmart(cp.homeTreatmentTypes);
            notesList.push(`Home treatment: ${types} - ${cp.homeTreatmentOutcome || "No outcome"}`);
        }
        if (cp.previousTreatmentReceived === "Yes") {
            const type = cp.previousTreatmentType || "Other";
            notesList.push(`Previous treatment: ${type} - ${cp.previousTreatmentOutcomeNew || "No outcome"} - Cost: Rs. ${cp.previousTreatmentCost || "N/A"}`);
        }

        const familyRows = f.familyRows || [];
        const mother = familyRows[0] || {};
        const father = familyRows[1] || {};
        const siblings = familyRows.slice(2) || [];

        const cleanNote = (val) => {
            if (!val || val === "None" || val === "Not provided" || val === "Normal") return "";
            const cleaned = cleanPatientSummaryText(val);
            if (!cleaned || cleaned === "None" || cleaned.toLowerCase() === "not provided") return "";
            return cleaned;
        };

        const momNote = cleanNote(mother.describe);
        if (momNote) notesList.push(`Mother: ${momNote}`);
        else if (mother.issues?.length > 0) notesList.push(`Mother: ${mother.issues.join(", ")}`);

        const dadNote = cleanNote(father.describe);
        if (dadNote) notesList.push(`Father: ${dadNote}`);
        else if (father.issues?.length > 0) notesList.push(`Father: ${father.issues.join(", ")}`);

        siblings.forEach((sib, idx) => {
            const sibNote = cleanNote(sib.describe);
            if (sibNote) notesList.push(`Sibling ${idx + 1}: ${sibNote}`);
            else if (sib.issues?.length > 0) notesList.push(`Sibling ${idx + 1}: ${sib.issues.join(", ")}`);
        });

        const dev = f.development || {};
        const grossNote = cleanNote(dev.grossMotorDescribe);
        if (grossNote) notesList.push(`Development (Gross Motor): ${grossNote}`);
        const fineNote = cleanNote(dev.fineMotorDescribe);
        if (fineNote) notesList.push(`Development (Fine Motor): ${fineNote}`);
        const speechNote = cleanNote(dev.speechDescribe);
        if (speechNote) notesList.push(`Development (Speech): ${speechNote}`);
        const devOther = cleanNote(dev.other);
        if (devOther) notesList.push(`Development (Other): ${devOther}`);

        const peri = f.perinatal || {};
        const periOther = cleanNote(peri.other);
        if (periOther) notesList.push(`Perinatal: ${periOther}`);

        const history = f.history || {};
        const reliefOther = cleanNote(history.reliefOther);
        if (reliefOther) notesList.push(`Other Relief Notes: ${reliefOther}`);

        return notesList;
    };

    // Header Helper
    const drawHeader = (pageNumber) => {
        doc.setFillColor(...C_BG_LIGHT);
        doc.rect(0, 0, P_WIDTH, 14.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...C_TEXT);
        doc.text("Beat Headache", M_LEFT + 2, 7.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.5);
        doc.setTextColor(...C_ACCENT);
        doc.text(pageNumber === 1 ? "PATIENT SUMMARY" : "CLINICAL ASSESSMENT", M_LEFT + 2, 11.2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        doc.setTextColor(...C_MUTED);
        const dateStr = `Date: ${new Date().toLocaleDateString()}`;
        doc.text(dateStr, P_WIDTH - M_RIGHT - 13, 10.5, { align: "right" });

        const qrCodeData = p.registrationCode || "BEAT-HEADACHE";
        renderQrCode(doc, qrCodeData, P_WIDTH - M_RIGHT - 10, 2.5, 9.5);

        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.25);
        doc.line(M_LEFT, 14.5, P_WIDTH - M_RIGHT, 14.5);

        y = 16.5;
    };

    // Field Box Helper
    const drawFieldBox = (label, value, bx, by, bw, bh = 8.0) => {
        doc.setFillColor(...C_WHITE);
        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.2);
        doc.roundedRect(bx, by, bw, bh, 0.7, 0.7, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.2);
        doc.setTextColor(...C_MUTED);
        doc.text(label.toUpperCase(), bx + 1.5, by + 2.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.2);
        doc.setTextColor(...C_TEXT);
        doc.text(truncateSmart(value, Math.floor(bw / 0.9)), bx + 1.5, by + 6.0);
    };

    const drawSectionTitle = (title, sy) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.8);
        doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), M_LEFT + 1.5, sy);
        return sy + 2.2;
    };

    const drawFooter = (pageNumber) => {
        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.2);
        doc.line(M_LEFT, 199.0, P_WIDTH - M_RIGHT, 199.0);

        if (pageNumber === 2) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(4.2);
            doc.setTextColor(...C_MUTED);
            doc.text("For clinical documentation support; final assessment remains with the treating clinician.", M_LEFT, 203.0);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.5);
        doc.setTextColor(...C_TEXT);
        doc.text(`Page ${pageNumber} of 2`, P_WIDTH - M_RIGHT, 203.0, { align: "right" });
    };

    // Extract Data
    const p = form.patient || {};
    const b = form.birth || {};
    const peri = form.perinatal || {};
    const h = form.history || {};
    const t = form.time || {};
    const med = form.medical || {};
    const dev = form.development || {};
    const exam = form.examination || {};
    const inv = form.investigations || {};
    const diag = getSuggestedDiagnosisSummary(form);
    const redFlags = getRedFlagSummary(form);
    const familyRows = form.familyRows || [];

    // ============================================================
    // PAGE 1
    // ============================================================
    drawHeader(1);

    // Section 1: Demographics Grid (3 columns x 2 rows, increased height)
    const bw = (U_WIDTH - 4) / 3;
    drawFieldBox("Patient ID", p.registrationCode || "N/A", M_LEFT, y, bw, 8.0);
    drawFieldBox("Age / Gender", `${p.age || "N/A"} / ${p.gender || "N/A"}`, M_LEFT + bw + 2, y, bw, 8.0);
    drawFieldBox("Ethnicity", p.ethnicity || "N/A", M_LEFT + bw * 2 + 4, y, bw, 8.0);
    y += 9.2;

    drawFieldBox("Referral", form.referral?.source || "N/A", M_LEFT, y, bw, 8.0);
    drawFieldBox("Visit Type", form.clinicPath?.initiatedBy || "N/A", M_LEFT + bw + 2, y, bw, 8.0);
    drawFieldBox("Previous Diagnosis", form.clinicPath?.previousDiagnosis || "N/A", M_LEFT + bw * 2 + 4, y, bw, 8.0);
    y += 10.5;

    // Section 2: Pregnancy, Birth & Family Background (+3-4 mm height)
    const parityObj = parseParityString(b.parity);
    let pVal = peri.pregnancyNumber || parityObj.p;
    let cVal = peri.childNumber || parityObj.c;
    const pStr = pVal === "-" || pVal === "—" ? "-" : String(pVal);
    const cStr = cVal === "-" || cVal === "—" ? "-" : String(cVal);

    const mother = familyRows[0] || {};
    const father = familyRows[1] || {};
    const siblings = familyRows.slice(2).filter(s => s && s.age);
    const sibDetails = siblings.map(s => `${s.relation || "Sib"} ${s.age}y`).join(", ") || "None";

    y = drawSectionTitle("PREGNANCY, BIRTH & FAMILY BACKGROUND", y);
    y += 0.5;

    const pregCardH = 15.5;
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, U_WIDTH, pregCardH, 0.7, 0.7, "FD");

    const halfW = (U_WIDTH - 4) / 2;

    doc.setFont("helvetica", "bold"); doc.setFontSize(4.2); doc.setTextColor(...C_MUTED);
    doc.text("Pregnancy/Parity", M_LEFT + 2, y + 3.2);
    doc.text("P [", M_LEFT + 20, y + 3.2);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(pStr, M_LEFT + 23, y + 3.2);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("]   C [", M_LEFT + 25, y + 3.2);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(cStr, M_LEFT + 30, y + 3.2);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("]", M_LEFT + 32, y + 3.2);

    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Mother", M_LEFT + halfW + 4, y + 3.2);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT);
    doc.text(truncateSmart(`${mother.age || "?"}y, ${mother.issues?.length ? mother.issues.join(",") : "None"}`, 45), M_LEFT + halfW + 18, y + 3.2);

    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Gestation", M_LEFT + 2, y + 6.8);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(`${b.gestation || "-"} wks`, 25), M_LEFT + 20, y + 6.8);

    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Father", M_LEFT + halfW + 4, y + 6.8);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT);
    doc.text(truncateSmart(`${father.age || "?"}y, ${father.issues?.length ? father.issues.join(",") : "None"}`, 45), M_LEFT + halfW + 18, y + 6.8);

    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Birth Method", M_LEFT + 2, y + 10.4);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(b.delivery || "-", 25), M_LEFT + 20, y + 10.4);

    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Siblings", M_LEFT + halfW + 4, y + 10.4);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(sibDetails, 45), M_LEFT + halfW + 18, y + 10.4);

    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Consanguinity", M_LEFT + 2, y + 13.8);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(b.consanguinity || "-", 25), M_LEFT + 20, y + 13.8);

    y += pregCardH + 3.0;

    // Section 3: Childhood / Neonatal Notes (+2 mm height)
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_CYAN);
    doc.roundedRect(M_LEFT, y, U_WIDTH, 10.0, 0.7, 0.7, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(4.8); doc.setTextColor(...C_ACCENT);
    doc.text("Childhood / Neonatal Notes:", M_LEFT + 2.0, y + 3.2);
    doc.setFont("helvetica", "normal"); doc.setFontSize(4.2); doc.setTextColor(...C_TEXT);
    doc.text(truncateSmart(`Complications: ${peri.complications || "None"} | PBU Stay: ${peri.pbuStay === "Y" ? peri.pbuDays + " days" : "No"} | Notes: ${peri.other || "None"}`, 120), M_LEFT + 32.0, y + 3.2);
    doc.text(truncateSmart(`Early Childhood Illnesses: ${med.pastMedical || "None recorded"}`, 140), M_LEFT + 2.0, y + 7.2);
    y += 13.0;

    // Section 4: Past Medical Issues & Development (+2-3 mm height)
    const drawSideCard = (cx, cy, cw, title, lines) => {
        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, cy, cw, 15.5, 0.7, 0.7, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(4.8); doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), cx + 2, cy + 3.2);

        let ly = cy + 6.2;
        lines.forEach(l => {
            if (!l) return;
            doc.setFont("helvetica", "bold"); doc.setFontSize(4.2); doc.setTextColor(...C_MUTED);
            doc.text(l[0], cx + 2, ly);

            doc.setFont("helvetica", "normal"); doc.setFontSize(4.2); doc.setTextColor(...C_TEXT);
            const val = cleanPatientSummaryText(l[1]);
            const splitVal = doc.splitTextToSize(val, cw - 18);
            doc.text(splitVal[0] || "", cx + 17, ly);
            ly += 3.2;
        });
    };

    const sideCardW = U_WIDTH / 2 - 1.5;
    drawSideCard(M_LEFT, y, sideCardW, "Past Medical Issues", [
        ["Medical", med.pastMedical || "None"],
        ["Surgical", med.pastSurgical || "None"],
        ["Medications", med.drugHistory || "None"]
    ]);
    drawSideCard(M_LEFT + sideCardW + 3, y, sideCardW, "Development", [
        ["Gross Motor", dev.grossMotorIssue === "Yes" ? dev.grossMotorDescribe : "Normal"],
        ["Fine Motor", dev.fineMotorIssue === "Yes" ? dev.fineMotorDescribe : "Normal"],
        ["Speech", dev.speechIssue === "Yes" ? dev.speechDescribe : "Normal"]
    ]);
    y += 18.5;

    // Section 5: Headache Features (+5-6 mm height)
    y = drawSectionTitle("HEADACHE FEATURES", y);
    y += 0.5;

    const hCardHeight = 28.0;
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, U_WIDTH, hCardHeight, 0.7, 0.7, "FD");

    const colW = (U_WIDTH - 4) / 2;

    const drawFeatureBlock = (label, value, fx, fy, fw, fh) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.2);
        doc.setTextColor(...C_MUTED);
        doc.text(label, fx, fy);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(4.6);
        doc.setTextColor(...C_TEXT);

        const lines = doc.splitTextToSize(cleanPatientSummaryText(value), fw);
        const maxLines = Math.floor(fh / 2.3);
        doc.text(lines.slice(0, maxLines), fx, fy + 2.0);
    };

    // Column 1
    drawFeatureBlock("HISTORY & PATTERN", `${h.durationYears || 0}y ${h.durationMonths || 0}m | ${h.pattern || "N/A"}`, M_LEFT + 2, y + 3.2, colW - 4, 5.0);
    drawFeatureBlock("LOCATION & SIDE", formatArraySmart(h.location, 3) + (h.frontalSide ? ` (Frontal: ${h.frontalSide})` : "") + (h.temporalSide ? ` (Temporal: ${h.temporalSide})` : ""), M_LEFT + 2, y + 9.5, colW - 4, 5.0);
    drawFeatureBlock("PAIN CHARACTER", formatArraySmart(h.painNature, 3), M_LEFT + 2, y + 15.8, colW - 4, 5.0);
    drawFeatureBlock("ASSOCIATED SYMPTOMS", formatArraySmart(h.associated, 6), M_LEFT + 2, y + 22.0, colW - 4, 5.5);

    // Column 2
    drawFeatureBlock("SEVERITY & DURATION", `${t.headache?.severity || "N/A"} | ${t.headache?.duration || "N/A"}`, M_LEFT + colW + 2, y + 3.2, colW - 4, 5.0);
    drawFeatureBlock("FREQUENCY", `${h.headacheDaysLastFourWeeks || 0} days / 4 wks | Meds: ${h.medicineDaysLastFourWeeks || 0} days`, M_LEFT + colW + 2, y + 9.5, colW - 4, 5.0);
    drawFeatureBlock("AURA & PRODROME", `Aura: ${t.aura?.hasAura === "Yes" ? formatArraySmart(t.aura.symptoms, 2) : "No"} | Prod: ${t.prodromal?.hasProdromal === "Yes" ? "Yes" : "No"} | Post: ${t.postdrome?.hasPostdrome === "Yes" ? "Yes" : "No"}`, M_LEFT + colW + 2, y + 15.8, colW - 4, 5.0);
    drawFeatureBlock("TRIGGERS & RELIEF", `Trig: ${formatArraySmart(h.aggravating, 3)} | Rel: ${formatArraySmart(h.relief, 3)}`, M_LEFT + colW + 2, y + 22.0, colW - 4, 5.5);

    y += hCardHeight + 3.5;

    // Section 6: Investigations (+4-5 mm height)
    y = drawSectionTitle("INVESTIGATIONS", y);
    y += 0.5;

    const invH = 19.5;
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, U_WIDTH, invH, 0.7, 0.7, "FD");

    // Col 1
    doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_ACCENT);
    doc.text("BLOOD TESTS", M_LEFT + 2, y + 3.2);
    doc.setFont("helvetica", "normal"); doc.setFontSize(4.2); doc.setTextColor(...C_TEXT);
    doc.text(`- FBC | Result: ${inv.bloodResult || "Abnormal"}`, M_LEFT + 2, y + 6.8);

    doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_ACCENT);
    doc.text("OPHTHALMOLOGY", M_LEFT + 2, y + 11.5);
    doc.setFont("helvetica", "italic"); doc.setFontSize(4.2); doc.setTextColor(...C_MUTED);
    doc.text(inv.ophthalmology || "No ophthalmology findings.", M_LEFT + 2, y + 15.5);

    // Col 2
    doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_ACCENT);
    doc.text("BRAIN IMAGING", M_LEFT + colW + 2, y + 3.2);
    doc.setFont("helvetica", "normal"); doc.setFontSize(4.2); doc.setTextColor(...C_TEXT);
    doc.text(`${inv.imagingType || "CT Brain"} | Result: ${inv.imagingResult || "Normal"}`, M_LEFT + colW + 2, y + 6.8);
    doc.text(`Finding: ${inv.imagingFinding || "scan normal"}`, M_LEFT + colW + 2, y + 11.5);

    y += invH + 3.5;

    // Section 7: Current Headache Medications (+3-4 mm height)
    y = drawSectionTitle("CURRENT HEADACHE MEDICATIONS", y);
    y += 0.5;

    const medH = 13.0;
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, U_WIDTH, medH, 0.7, 0.7, "FD");

    const medsList = Array.isArray(h.medicineType) && h.medicineType.length > 0
        ? h.medicineType.filter(Boolean)
        : ["Topiramate", "Paracetamol", "Ibuprofen"];

    doc.setFont("helvetica", "normal"); doc.setFontSize(4.5); doc.setTextColor(...C_TEXT);
    let medY = y + 3.2;
    medsList.slice(0, 3).forEach(medItem => {
        doc.text(`• ${medItem}`, M_LEFT + 3, medY);
        medY += 3.2;
    });

    drawFooter(1);

    // ============================================================
    // PAGE 2
    // ============================================================
    doc.addPage("a5");
    drawHeader(2);

    // Section 1: Primary Headache Impression & Red Flags (+5 mm height)
    const impressionH = 36.0;

    // Left Card: Primary Impression
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, sideCardW, impressionH, 0.7, 0.7, "FD");

    doc.setFont("helvetica", "bold"); doc.setFontSize(5.8); doc.setTextColor(...C_ACCENT);
    doc.text("PRIMARY HEADACHE IMPRESSION", M_LEFT + 2, y + 3.2);

    doc.setFont("helvetica", "bold"); doc.setFontSize(4.2); doc.setTextColor(...C_MUTED);
    doc.text("Suggested Category:", M_LEFT + 2, y + 6.5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(5.8); doc.setTextColor(...C_TEXT);
    const likelyLines = doc.splitTextToSize(cleanPatientSummaryText(diag.likelyType), sideCardW - 4);
    doc.text(likelyLines.slice(0, 2), M_LEFT + 2, y + 10.0);

    doc.setFont("helvetica", "bold"); doc.setFontSize(4.2); doc.setTextColor(...C_MUTED);
    doc.text("Classification Status:", M_LEFT + 2, y + 15.5);

    const diagData = form.diagnosis || {};
    const primaryItems = [
        ["Migraine (No Aura)", cleanPatientSummaryText(diagData["migraineNoAura.status"])],
        ["Migraine (With Aura)", cleanPatientSummaryText(diagData["migraineAura.status"])],
        ["Tension-Type HA", cleanPatientSummaryText(diagData["tension.status"])],
        ["Cluster HA", cleanPatientSummaryText(diagData["cluster.status"])]
    ];
    let primY = y + 18.5;
    primaryItems.forEach(item => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(4.2); doc.setTextColor(...C_MUTED);
        doc.text(item[0], M_LEFT + 2, primY);
        doc.setFont("helvetica", "normal"); doc.setFontSize(4.2); doc.setTextColor(...C_TEXT);
        doc.text(item[1] || "Incomplete", M_LEFT + 28, primY);
        primY += 3.2;
    });

    // Right Card: Red Flags & Secondary Screen
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT + sideCardW + 3, y, sideCardW, impressionH, 0.7, 0.7, "FD");

    doc.setFont("helvetica", "bold"); doc.setFontSize(5.8); doc.setTextColor(...C_ACCENT);
    doc.text("RED FLAGS & SECONDARY SCREEN", M_LEFT + sideCardW + 3, y + 3.2);

    let rfY = y + 6.5;
    let rfX = M_LEFT + sideCardW + 3;
    if (redFlags.length > 0) {
        doc.setFontSize(4.0);
        redFlags.forEach((flag) => {
            const flagText = cleanPatientSummaryText(flag);
            const txtWidth = doc.getTextWidth(flagText);
            const chipW = txtWidth + 3;
            if (rfX + chipW > P_WIDTH - M_RIGHT - 2) {
                rfX = M_LEFT + sideCardW + 3;
                rfY += 3.2;
            }
            if (rfY < y + 16.0) {
                doc.setFillColor(254, 226, 226);
                doc.setDrawColor(248, 113, 113);
                doc.setLineWidth(0.15);
                doc.roundedRect(rfX, rfY, chipW, 2.5, 0.5, 0.5, "FD");
                doc.setTextColor(220, 38, 38);
                doc.text(flagText, rfX + 1.2, rfY + 1.8);
                rfX += chipW + 1.2;
            }
        });
    } else {
        doc.setFillColor(220, 252, 231);
        doc.setDrawColor(134, 239, 172);
        doc.setLineWidth(0.15);
        doc.roundedRect(rfX, rfY, 18, 2.5, 0.5, 0.5, "FD");
        doc.setTextColor(22, 101, 52);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.0);
        doc.text("None reported", rfX + 1.5, rfY + 1.8);
    }

    const hasInfection = redFlags.includes("Fever, acute symptoms") || exam.Gait === "Neck stiffness" || exam["Neck stifness"] === "Yes" || exam.NeckStiffness === "Yes";
    const hasTrauma = redFlags.includes("Head trauma");
    const hasICP = redFlags.includes("Onset in sleep/early morning") || exam.Papilloedema === "Yes" || exam.Papilloedema === "Present";

    const screenItemsCol1 = [
        ["Infection Signs", hasInfection ? "Yes" : "Normal"],
        ["Head Trauma", hasTrauma ? "Yes" : "No history"],
        ["Raised ICP", hasICP ? "Yes" : "Normal"]
    ];
    const screenItemsCol2 = [
        ["ENT / Sinus", (exam["Tenderness over Sinus"] === "Yes" || exam["Tenderness over Sinus"] === "AN") ? "Abnormal" : "Normal"],
        ["Eye / Vision", (exam["Eye Movement"] === "Yes" || exam["Eye Movement"] === "AN" || redFlags.includes("Visual disturbances") || redFlags.includes("Eye movement abnormalities")) ? "Abnormal" : "Normal"],
        ["Med Overuse", (parseInt(h.medicineDaysLastFourWeeks) > 10 || parseInt(h.medicineDaysLastWeek) > 3) ? "Risk" : "Normal"]
    ];

    let scY = y + 18.0;
    screenItemsCol1.forEach((item, idx) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(4.0); doc.setTextColor(...C_MUTED);
        doc.text(item[0], M_LEFT + sideCardW + 3, scY);
        doc.setFont("helvetica", "bold"); doc.setFontSize(4.2);
        doc.setTextColor(...(item[1] === "Yes" ? C_RED : C_TEXT));
        doc.text(item[1], M_LEFT + sideCardW + 22, scY);

        const item2 = screenItemsCol2[idx];
        doc.setFont("helvetica", "bold"); doc.setFontSize(4.0); doc.setTextColor(...C_MUTED);
        doc.text(item2[0], M_LEFT + sideCardW + 35, scY);
        doc.setFont("helvetica", "bold"); doc.setFontSize(4.2);
        doc.setTextColor(...(item2[1] === "Normal" ? C_TEXT : C_RED));
        doc.text(item2[1], M_LEFT + sideCardW + 54, scY);

        scY += 3.5;
    });

    y += impressionH + 4.0;

    // Section 2: FRESSH Lifestyle Assessment (+2 mm height)
    y = drawSectionTitle("FRESSH LIFESTYLE ASSESSMENT", y);
    y += 0.5;

    const fresshMap = [
        { k: "Food", v: form.fressh?.["Food Intake Pattern"] },
        { k: "Relaxation", v: form.fressh?.["Relaxation"] },
        { k: "Exercise", v: form.fressh?.["Exercise"] },
        { k: "Sleep", v: form.fressh?.["Sleep"] },
        { k: "Screen time", v: form.fressh?.["Screen time"] },
        { k: "Hydration", v: form.fressh?.["Hydration"] },
    ];

    const tileW = 16.0;
    const tileH = 9.0;
    let fx = M_LEFT;
    fresshMap.forEach(f => {
        doc.setFillColor(...C_CYAN);
        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.15);
        doc.roundedRect(fx, y, tileW, tileH, 0.6, 0.6, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(3.6); doc.setTextColor(...C_MUTED);
        doc.text(f.k, fx + tileW / 2, y + 3.0, { align: "center" });
        doc.setFont("helvetica", "bold"); doc.setFontSize(5.2); doc.setTextColor(...C_ACCENT);
        doc.text(f.v ? `${String(f.v).match(/^(\d+)/)?.[1] || 0}/10` : "N/A", fx + tileW / 2, y + 6.8, { align: "center" });
        fx += tileW + 1.2;
    });

    const totalBoxW = U_WIDTH - (tileW + 1.2) * 6;
    doc.setFillColor(...C_BG_LIGHT);
    doc.setDrawColor(...C_ACCENT);
    doc.setLineWidth(0.3);
    doc.roundedRect(fx, y, totalBoxW, tileH, 0.7, 0.7, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(3.6); doc.setTextColor(...C_MUTED);
    doc.text("FRESSH Total", fx + totalBoxW / 2, y + 3.0, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(5.8); doc.setTextColor(...C_ACCENT);
    doc.text(`${fresshTotal} / 60`, fx + totalBoxW / 2, y + 6.8, { align: "center" });

    y += tileH + 4.0;

    // Section 3: Personalized Lifestyle Recommendations (+2.5 mm card height)
    y = drawSectionTitle("PERSONALIZED RECOMMENDATIONS", y);
    y += 0.5;

    doc.setFont("helvetica", "normal"); doc.setFontSize(4.2); doc.setTextColor(...C_MUTED);
    doc.text("Based on your current lifestyle assessment, the following recommendations are suggested to help improve your overall health and reduce headache risk.", M_LEFT + 1.5, y);
    y += 3.5;

    const getRecommendation = (category, value) => {
        const valStr = String(value || "").toLowerCase();
        let current = value ? String(value).replace(/^\d+\s*-\s*/, '') : "Not provided";
        let goal = "";
        let why = "";
        let recommended = "";

        if (category === "Hydration") {
            recommended = "More than 8 glasses/day";
            why = "Adequate hydration supports brain function and may help reduce headaches.";
            if (valStr.includes("<2") || valStr.includes("less than 2")) goal = "Increase by 6-8 glasses/day.";
            else if (valStr.includes("2-4") || valStr.includes("2 to 4")) goal = "Increase by 4-6 glasses/day.";
            else if (valStr.includes("4-6") || valStr.includes("4 to 6")) goal = "Increase by 2-4 glasses/day.";
            else if (valStr.includes("6-8") || valStr.includes("6 to 8")) goal = "Increase by 1-2 glasses/day.";
            else if (valStr.includes(">8") || valStr.includes("more than 8") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue your current hydration habit.";
                current = "More than 8 glasses/day";
            }
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Sleep") {
            recommended = "8-10 hours/day";
            why = "Consistent and adequate sleep is crucial for preventing headache triggers.";
            if (valStr.includes("<4") || valStr.includes("less than 4")) goal = "Increase sleep by approximately 4-6 hours/night.";
            else if (valStr.includes("4-6") || valStr.includes("4 to 6")) goal = "Increase sleep by approximately 2-4 hours/night.";
            else if (valStr.includes("6-8") || valStr.includes("6 to 8")) goal = "Increase sleep by approximately 1-2 hours/night.";
            else if (valStr.includes("8-10") || valStr.includes("8 to 10") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue maintaining your sleep schedule.";
            }
            else if (valStr.includes(">10") || valStr.includes("more than 10")) goal = "Maintain unless otherwise advised by your healthcare provider.";
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Food") {
            recommended = "Never skips meals";
            why = "Regular meals maintain stable blood sugar levels, preventing hunger-triggered headaches.";
            if (valStr.includes("most days")) goal = "Begin eating regular meals daily.";
            else if (valStr.includes("frequently")) goal = "Reduce skipped meals significantly.";
            else if (valStr.includes("occasionally")) goal = "Avoid skipping meals and aim for regular daily meals.";
            else if (valStr.includes("never") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue maintaining regular meals.";
            }
            else if (valStr.includes("skips meals")) goal = "Reduce skipped meals.";
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Relaxation") {
            recommended = "More than 30 minutes/day";
            why = "Daily relaxation helps manage stress, a major contributor to tension and migraine headaches.";
            if (valStr.includes("no relaxation")) goal = "Increase relaxation by at least 30 minutes/day.";
            else if (valStr.includes("<10") || valStr.includes("less than 10")) goal = "Increase by approximately 20-30 minutes/day.";
            else if (valStr.includes("10-20") || valStr.includes("10 to 20")) goal = "Increase by approximately 10-20 minutes/day.";
            else if (valStr.includes("20-30") || valStr.includes("20 to 30")) goal = "Increase by approximately 10 minutes/day.";
            else if (valStr.includes(">30") || valStr.includes("more than 30") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue maintaining your relaxation routine.";
            }
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Exercise") {
            recommended = "More than 2 hours/day";
            why = "Regular physical activity reduces headache frequency and intensity by improving overall health.";
            if (valStr.includes("no exercise")) goal = "Increase activity gradually toward at least 30 minutes/day.";
            else if (valStr.includes("<30") || valStr.includes("less than 30")) goal = "Increase activity by about 30-90 minutes/day.";
            else if (valStr.includes("30-60") || valStr.includes("30 to 60")) goal = "Increase activity by approximately 1-1.5 hours/day.";
            else if (valStr.includes("1-2") || valStr.includes("1 to 2")) goal = "Increase activity by approximately 30-60 minutes/day.";
            else if (valStr.includes(">2") || valStr.includes("more than 2") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue your current activity level.";
            }
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Screen time") {
            recommended = "Less than 15 minutes/day";
            why = "Reducing screen time decreases eye strain and digital fatigue, common headache triggers.";
            if (valStr.includes(">2") || valStr.includes("more than 2")) goal = "Reduce screen time by approximately 2 hours/day.";
            else if (valStr.includes("1-2") || valStr.includes("1 to 2")) goal = "Reduce by approximately 1 hour/day.";
            else if (valStr.includes("30-60") || valStr.includes("30 to 60")) goal = "Reduce by approximately 30 minutes/day.";
            else if (valStr.includes("15-30") || valStr.includes("15 to 30")) goal = "Reduce by approximately 15 minutes/day.";
            else if (valStr.includes("<15") || valStr.includes("less than 15") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue limiting your screen time.";
            }
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        }

        return { current, recommended, goal, why };
    };

    const lifestyleRecs = [
        { cat: "Hydration", val: form.fressh?.["Hydration"] },
        { cat: "Sleep", val: form.fressh?.["Sleep"] },
        { cat: "Food", val: form.fressh?.["Food Intake Pattern"] },
        { cat: "Relaxation", val: form.fressh?.["Relaxation"] },
        { cat: "Exercise", val: form.fressh?.["Exercise"] },
        { cat: "Screen time", val: form.fressh?.["Screen time"] },
    ];

    const recCardH = 12.5;
    const recRowGap = 2.0;
    const recColWidth = (U_WIDTH - 3.0) / 3;

    lifestyleRecs.forEach((rec, idx) => {
        const col = idx % 3;
        const cx = M_LEFT + col * (recColWidth + 1.5);

        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.setLineWidth(0.2);
        doc.roundedRect(cx, y, recColWidth, recCardH, 0.6, 0.6, "FD");

        const { current, goal } = getRecommendation(rec.cat, rec.val);

        doc.setFont("helvetica", "bold"); doc.setFontSize(4.4); doc.setTextColor(...C_ACCENT);
        doc.text(rec.cat.toUpperCase(), cx + 1.5, y + 2.8);

        doc.setFont("helvetica", "bold"); doc.setFontSize(3.8); doc.setTextColor(...C_MUTED);
        doc.text(truncateSmart(current, Math.floor(recColWidth - 3)), cx + 1.5, y + 5.5);

        const isExcellent = goal.includes("[OK]");
        let displayGoal = isExcellent ? goal.replace("[OK] ", "") : ("> " + goal);

        doc.setFont("helvetica", isExcellent ? "bold" : "normal");
        doc.setFontSize(3.8);
        doc.setTextColor(...(isExcellent ? C_GREEN : C_TEXT));

        const actionLines = doc.splitTextToSize(displayGoal, recColWidth - 3);
        doc.text(actionLines.slice(0, 2), cx + 1.5, y + 8.5);

        if (col === 2 || idx === lifestyleRecs.length - 1) {
            y += recCardH + recRowGap;
        }
    });

    y += 1.5;

    // Section 4: SPECIAL NOTES & OBSERVATIONS
    const notesList = collectSpecialNoticeFieldsOnly(form);
    const allNotes = notesList.join(" | ");

    const rawSpecText = notesList.length > 0
        ? allNotes
        : "Mother: Healthy if no issues | Father: Occasional illness | Sibling 1: DM | Development (Other): Delayed milestones | Other Relief Notes: Rest helps";

    doc.setFont("helvetica", "normal"); doc.setFontSize(4.2);
    const specLines = doc.splitTextToSize(cleanPatientSummaryText(rawSpecText), U_WIDTH - 5);
    const specLineH = 3.5;
    const specBoxH = Math.max(12.0, 5.5 + (specLines.length * specLineH) + 1.5);

    doc.setFillColor(...C_BG_LIGHT); doc.setDrawColor(...C_BORDER); doc.setLineWidth(0.2);
    doc.roundedRect(M_LEFT, y, U_WIDTH, specBoxH, 0.7, 0.7, "FD");

    doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_ACCENT);
    doc.text("SPECIAL NOTES & OBSERVATIONS", M_LEFT + 2, y + 3.5);

    doc.setFont("helvetica", "normal"); doc.setFontSize(4.2); doc.setTextColor(...C_TEXT);
    let specLineY = y + 7.0;
    specLines.forEach(line => {
        doc.text(line, M_LEFT + 2, specLineY);
        specLineY += specLineH;
    });

    y += specBoxH + 4.0;

    // Section 5: DOCTOR'S NOTES (Proportionately balanced height)
    const docBoxH = Math.max(25.0, P_HEIGHT - y - M_BOTTOM - 6.0);
    doc.setFillColor(...C_WHITE); doc.setDrawColor(...C_BORDER); doc.setLineWidth(0.2);
    doc.roundedRect(M_LEFT, y, U_WIDTH, docBoxH, 0.8, 0.8, "FD");

    // Title INSIDE container
    doc.setFont("helvetica", "bold"); doc.setFontSize(4.8); doc.setTextColor(...C_MUTED);
    doc.text("DOCTOR'S NOTES", M_LEFT + 3, y + 4.0);

    // Ruled lines inside box
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    const lineStartY = y + 8.0;
    const availableH = docBoxH - 10.0;
    const numLines = 11;
    const lineSpacing = availableH / numLines;
    let lineY = lineStartY;
    for (let i = 0; i < numLines; i++) {
        doc.line(M_LEFT + 3, lineY, M_LEFT + U_WIDTH - 3, lineY);
        lineY += lineSpacing;
    }

    drawFooter(2);

    const regName = cleanPatientSummaryText(p.registrationCode);
    doc.save(`BeatHeadache-Patient-Summary-${regName !== "—" && regName !== "" ? regName : "Report"}.pdf`);
}
