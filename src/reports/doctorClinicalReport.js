/**
 * doctorClinicalReport.js
 * -----------------------
 * Generates the Beat Headache Doctor Clinical Report PDF (A4, 2 pages).
 * Production hardened in Phase 6 with shared pdfTheme and pdfHelpers.
 */

import jsPDFPackage from "jspdf";
const jsPDF = jsPDFPackage.jsPDF || jsPDFPackage;
import { getSuggestedDiagnosisSummary, getRedFlagSummary } from "./diagnosisUtils.js";
import { renderQrCode } from "./qrRenderer.js";
import { Colors, Typography, Spacing, Radius, PageConstants } from "./pdfTheme.js";
import {
    cleanReportText,
    truncateText,
    formatArrayItems,
    parseParityString,
    dedupeTextLines,
    drawSectionTitle,
    drawRoundedCard,
    drawLabelValue,
    drawInfoRow,
    drawFooter,
    drawDivider
} from "./pdfHelpers.js";

export function generateDoctorReportPdf(form, fresshTotal) {
    const doc = new jsPDF({ format: "a4" });
    const theme = { Colors, Typography, Spacing, Radius, PageConstants };
    const { Margin: M, DefaultCardPadding: P } = PageConstants;
    const PW = 210;
    const PH = 297;
    const UW = PW - M * 2;
    let cy = M;
    let pageNum = 1;

    // --- Data Extraction ---
    const p = form.patient || {};
    const b = form.birth || {};
    const peri = form.perinatal || {};
    const h = form.history || {};
    const t = form.time || {};
    const med = form.medical || {};
    const diagRaw = form.diagnosis || {};
    const exam = form.examination || {};
    const dev = form.development || {};
    const impact = form.impact || {};
    const yesterday = form.yesterday || {};
    const fresshObj = form.fressh || {};
    const diagSummary = getSuggestedDiagnosisSummary(form);
    const redFlags = getRedFlagSummary(form);
    const familyRows = form.familyRows || [];

    const safeDay = (val) => {
        const n = parseInt(val);
        if (isNaN(n) || n < 0) return "Not recorded";
        return `${n} d`;
    };

    const drawLocalHeader = () => {
        // Logo
        doc.setFillColor(...Colors.Accent);
        doc.roundedRect(M, M, 10, 10, Radius.Medium, Radius.Medium, "F");
        doc.setFont(Typography.Family, "bold");
        doc.setFontSize(7);
        doc.setTextColor(...Colors.White);
        doc.text("BH", M + 5, M + 6.5, { align: "center" });

        // Title
        doc.setFont(Typography.Family, "bold");
        doc.setFontSize(14);
        doc.setTextColor(...Colors.Text);
        doc.text("Doctor Clinical Report", M + 14, M + 5);

        // Subtitle
        doc.setFont(Typography.Family, "normal");
        doc.setFontSize(Typography.Subtitle.size);
        doc.setTextColor(...Colors.Muted);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, M + 14, M + 9.5);

        // QR Code
        const qrData = p.qrToken || p.registrationCode || "BEAT-HEADACHE";
        renderQrCode(doc, qrData, PW - M - 14, M, 14);

        cy = M + 16;
        drawDivider(doc, M, cy, UW, theme);
        cy += Spacing.LG;
    };

    // ============================================================
    // PAGE 1
    // ============================================================
    drawLocalHeader();

    // --- Demographics ---
    const bw = (UW - (Spacing.MD * 3)) / 4;
    drawLabelValue(doc, "Patient ID", p.registrationCode, M, cy, bw, theme);
    drawLabelValue(doc, "Age", p.age, M + bw + Spacing.MD, cy, bw, theme);
    drawLabelValue(doc, "Gender", p.gender, M + (bw + Spacing.MD) * 2, cy, bw, theme);
    drawLabelValue(doc, "Ethnicity", p.ethnicity, M + (bw + Spacing.MD) * 3, cy, bw, theme);
    cy += 9 + Spacing.LG;

    // --- Encounter Information ---
    drawSectionTitle(doc, "Encounter Information", M, cy, theme); cy += Spacing.MD;

    drawRoundedCard(doc, M, cy, UW, 16, theme, Colors.BackgroundCyan, Colors.Border);
    doc.setFont(Typography.Family, "bold"); doc.setFontSize(Typography.Label.size); doc.setTextColor(...Colors.Accent);
    doc.text("WORKING IMPRESSION:", M + P, cy + 4.5);
    doc.setFont(Typography.Family, "normal"); doc.setFontSize(Typography.Value.size); doc.setTextColor(...Colors.Text);
    const impTxt = cleanReportText(diagSummary.likelyType) + " — " + cleanReportText(diagSummary.explanation);
    const impLines = doc.splitTextToSize(impTxt, UW - 40);
    doc.text(impLines.slice(0, 2), M + 35, cy + 4.5);

    drawDivider(doc, M, cy + 8, UW, theme);
    doc.setFont(Typography.Family, "bold"); doc.setFontSize(Typography.Label.size); doc.setTextColor(...Colors.Muted);
    doc.text("Visit Type:", M + P, cy + 12);
    doc.setFont(Typography.Family, "normal"); doc.setFontSize(Typography.Value.size); doc.setTextColor(...Colors.Text);
    doc.text(cleanReportText(form.clinicPath?.initiatedBy), M + 18, cy + 12);

    doc.setFont(Typography.Family, "bold"); doc.setFontSize(Typography.Label.size); doc.setTextColor(...Colors.Muted);
    doc.text("Referral:", M + UW/3, cy + 12);
    doc.setFont(Typography.Family, "normal"); doc.setFontSize(Typography.Value.size); doc.setTextColor(...Colors.Text);
    doc.text(cleanReportText(form.referral?.source), M + UW/3 + 12, cy + 12);

    doc.setFont(Typography.Family, "bold"); doc.setFontSize(Typography.Label.size); doc.setTextColor(...Colors.Muted);
    doc.text("Prev. Diagnosis:", M + (UW/3)*2, cy + 12);
    doc.setFont(Typography.Family, "normal"); doc.setFontSize(Typography.Value.size); doc.setTextColor(...Colors.Text);
    doc.text(truncateText(dedupeTextLines(form.clinicPath?.previousDiagnosis), 40), M + (UW/3)*2 + 20, cy + 12);

    cy += 16 + Spacing.LG;

    // --- Clinical History ---
    drawSectionTitle(doc, "Clinical History", M, cy, theme); cy += Spacing.MD;
    const chHeight = 31;
    drawRoundedCard(doc, M, cy, UW, chHeight, theme);

    const parityObj = parseParityString(b.parity);
    let pVal = peri.pregnancyNumber || parityObj.p;
    let cVal = peri.childNumber || parityObj.c;
    const mother = familyRows[0] || {};
    const father = familyRows[1] || {};
    const siblings = familyRows.slice(2).filter(s => s && s.age);
    const sibDetails = siblings.map(s => `${s.relation || "Sib"} ${s.age}y`).join(", ") || "None";

    drawInfoRow(doc, "Pregnancy/Parity", `P [${pVal}]  C [${cVal}] | Gestation: ${cleanReportText(b.gestation)} wks`, M + P, cy + 5, 24, theme);
    drawInfoRow(doc, "Birth / Consang.", `${cleanReportText(b.birthWeight)} kg / ${cleanReportText(b.delivery)} | Consang: ${cleanReportText(b.consanguinity)}`, M + P, cy + 10, 24, theme);
    drawInfoRow(doc, "Mother / Father", `Mother: ${mother.age || "?"}y, ${truncateText(mother.issues?.join(",") || "None", 40)} | Father: ${father.age || "?"}y, ${truncateText(father.issues?.join(",") || "None", 40)}`, M + P, cy + 15, 24, theme);
    drawInfoRow(doc, "Siblings", truncateText(sibDetails, 100), M + P, cy + 20, 24, theme);
    drawInfoRow(doc, "Perinatal/Medical", `Peri: ${truncateText(cleanReportText(peri.complications), 35)} | PBU: ${peri.pbuStay === "Y" ? (peri.pbuDays + " d") : "No"} | Med: ${truncateText(cleanReportText(med.pastMedical), 40)}`, M + P, cy + 25, 24, theme);
    drawInfoRow(doc, "Surgical/Drugs", `Surg: ${truncateText(cleanReportText(med.pastSurgical), 40)} | Drugs: ${truncateText(cleanReportText(med.drugHistory), 40)}`, M + P, cy + 30, 24, theme);
    cy += chHeight + Spacing.LG;

    // --- Headache Phenotype ---
    drawSectionTitle(doc, "Headache Phenotype", M, cy, theme); cy += Spacing.MD;
    const phenoHeight = 31;
    drawRoundedCard(doc, M, cy, UW, phenoHeight, theme);
    const colW = (UW - (P * 2)) / 2;

    drawInfoRow(doc, "Duration/Pattern", `${h.durationYears || 0}y ${h.durationMonths || 0}m | ${cleanReportText(h.pattern)}`, M + P, cy + 5, 22, theme);
    drawInfoRow(doc, "Loc / Side", formatArrayItems(h.location, 3) + (h.frontalSide ? ` (F: ${h.frontalSide})` : "") + (h.temporalSide ? ` (T: ${h.temporalSide})` : ""), M + P, cy + 10, 22, theme);
    drawInfoRow(doc, "Character", formatArrayItems(h.painNature, 3) + " | " + formatArrayItems(h.associated, 4), M + P, cy + 15, 22, theme);
    drawInfoRow(doc, "Triggers", formatArrayItems(h.aggravating, 3), M + P, cy + 20, 22, theme);
    drawInfoRow(doc, "Relief", formatArrayItems(h.relief, 3), M + P, cy + 25, 22, theme);
    drawInfoRow(doc, "Medication", formatArrayItems(h.medicineType, 4), M + P, cy + 30, 22, theme);

    drawInfoRow(doc, "Severity", cleanReportText(t.headache?.severity), M + P + colW, cy + 5, 18, theme);
    drawInfoRow(doc, "Frequency", `${h.headacheDaysLastFourWeeks || 0} d/4wks`, M + P + colW, cy + 10, 18, theme);
    drawInfoRow(doc, "Aura", t.aura?.hasAura === "Yes" ? "Yes" : "No", M + P + colW, cy + 15, 18, theme);
    drawInfoRow(doc, "Prod/Post", `Prod: ${t.prodromal?.hasProdromal === "Yes" ? "Yes" : "No"} | Post: ${t.postdrome?.hasPostdrome === "Yes" ? "Yes" : "No"}`, M + P + colW, cy + 20, 18, theme);
    cy += phenoHeight + Spacing.LG;

    // --- Impact & Development ---
    drawSectionTitle(doc, "Impact & Development", M, cy, theme); cy += Spacing.MD;
    const impHeight = 16;
    drawRoundedCard(doc, M, cy, UW, impHeight, theme);
    drawInfoRow(doc, "Motor/Speech", `Gross: ${dev.grossMotorIssue === "Yes" ? cleanReportText(dev.grossMotorDescribe) : "Normal"} | Fine: ${dev.fineMotorIssue === "Yes" ? cleanReportText(dev.fineMotorDescribe) : "Normal"} | Speech: ${dev.speechIssue === "Yes" ? cleanReportText(dev.speechDescribe) : "Normal"}`, M + P, cy + 5, 20, theme);
    drawInfoRow(doc, "School/Activity", `Absence: ${cleanReportText(impact.schoolAbsentDaysLastFourWeeks)}d/4wks | Activity Limited: ${cleanReportText(impact.activityLimitedDaysLastFourWeeks)}d/4wks`, M + P, cy + 10, 20, theme);
    drawInfoRow(doc, "Parent/Yday", `Work Loss: ${cleanReportText(impact.parentLostWork)} (${cleanReportText(impact.parentLostWorkDays)}d) | Yesterday HA: ${cleanReportText(yesterday.hadHeadacheYesterday)} (${cleanReportText(yesterday.severity)})`, M + P, cy + 15, 20, theme);

    drawFooter(doc, pageNum, 2, theme, PW, PH);

    // ============================================================
    // PAGE 2
    // ============================================================
    doc.addPage();
    pageNum++;
    cy = M;
    drawLocalHeader();

    // --- Impression & Red Flags ---
    const halfW = (UW - Spacing.MD) / 2;
    const diagHeight = 44;

    // Primary Impression
    drawSectionTitle(doc, "Primary Headache Impression", M, cy, theme);
    drawRoundedCard(doc, M, cy + Spacing.MD, halfW, diagHeight, theme);
    let pY = cy + Spacing.MD + 6;
    const primItems = [
        ["Migraine (No Aura)", cleanReportText(diagRaw["migraineNoAura.status"])],
        ["Migraine (With Aura)", cleanReportText(diagRaw["migraineAura.status"])],
        ["Tension-Type HA", cleanReportText(diagRaw["tension.status"])],
        ["Cluster HA", cleanReportText(diagRaw["cluster.status"])]
    ];
    primItems.forEach(item => {
        drawInfoRow(doc, item[0], item[1], M + P, pY, 35, theme);
        pY += 5;
    });

    drawDivider(doc, M, pY + 2, halfW, theme);
    const uFeatures = [...new Set([...(diagRaw.migraineNoAuraCharacteristics || []), ...(diagRaw.tensionCharacteristics || []), ...(diagRaw.clusterSymptoms || [])])].map(x => cleanReportText(x)).filter(x => x !== "—");
    if (uFeatures.length > 0) {
        doc.setFont(Typography.Family, "bold"); doc.setFontSize(Typography.Label.size); doc.setTextColor(...Colors.Muted);
        doc.text("Features:", M + P, pY + 7);
        doc.setFont(Typography.Family, "normal"); doc.setTextColor(...Colors.Text);
        const fLines = doc.splitTextToSize(uFeatures.join(", "), halfW - 20);
        doc.text(fLines.slice(0, 3), M + 17, pY + 7);
    }

    // Red Flags & Screening
    drawSectionTitle(doc, "Red Flags & Screening", M + halfW + Spacing.MD, cy, theme);
    drawRoundedCard(doc, M + halfW + Spacing.MD, cy + Spacing.MD, halfW, diagHeight, theme);
    let rfY = cy + Spacing.MD + 6;
    const rfC = redFlags.length;
    doc.setFont(Typography.Family, "bold"); doc.setFontSize(Typography.Label.size + 0.5);
    doc.setTextColor(...(rfC > 0 ? Colors.Danger : Colors.Success));
    doc.text(rfC > 0 ? "RED FLAGS DETECTED" : "NO RED FLAGS REPORTED", M + halfW + Spacing.MD + P, rfY);
    rfY += 5;

    doc.setFont(Typography.Family, "normal"); doc.setFontSize(Typography.Value.size);
    if (rfC > 0) {
        doc.setTextColor(...Colors.Danger);
        const rLines = doc.splitTextToSize(formatArrayItems(redFlags, 10), halfW - (P * 2));
        doc.text(rLines.slice(0, 3), M + halfW + Spacing.MD + P, rfY);
        rfY += rLines.slice(0, 3).length * 3.5;
    } else {
        doc.setTextColor(...Colors.Muted);
        doc.text("None", M + halfW + Spacing.MD + P, rfY);
        rfY += 4;
    }

    drawDivider(doc, M + halfW + Spacing.MD, Math.max(rfY + 1, pY + 2), halfW, theme);
    rfY = Math.max(rfY + 1, pY + 2) + 5;

    const hasInf = redFlags.includes("Fever, acute symptoms") || exam.Gait === "Neck stiffness";
    const hasICP_ = redFlags.includes("Onset in sleep/early morning") || exam.Papilloedema === "Yes";
    const sItems = [
        ["Infection/ICP", `${hasInf ? "Yes" : "No"} / ${hasICP_ ? "Yes" : "No"}`],
        ["ENT / Eye", `${(exam["Tenderness over Sinus"] === "Yes" || exam["Tenderness over Sinus"] === "AN") ? "Abn" : "Normal"} / ${(exam["Eye Movement"] === "Yes" || exam["Eye Movement"] === "AN") ? "Abn" : "Normal"}`],
        ["Med Overuse", (parseInt(h.medicineDaysLastFourWeeks) > 10) ? "Risk" : "Normal"]
    ];
    sItems.forEach(row => {
        drawInfoRow(doc, row[0], row[1], M + halfW + Spacing.MD + P, rfY, 25, theme);
        rfY += 5;
    });

    cy += diagHeight + Spacing.MD + Spacing.LG;

    // --- Clinical Findings & Management ---
    drawSectionTitle(doc, "Clinical Findings & Management", M, cy, theme); cy += Spacing.MD;
    const findHeight = 31;
    drawRoundedCard(doc, M, cy, UW, findHeight, theme);

    drawInfoRow(doc, "Vitals/Growth", `Ht: ${cleanReportText(exam.height)}cm, Wt: ${cleanReportText(exam.weight)}kg, BMI: ${cleanReportText(exam.bmi)}, OFC: ${cleanReportText(exam.ofc)}cm`, M + P, cy + 5, 20, theme);
    drawInfoRow(doc, "Neurological", `${cleanReportText(exam.bpSystolic)}/${cleanReportText(exam.bpDiastolic)} | HR: ${cleanReportText(exam.heartRate)} | Papilloedema: ${cleanReportText(exam.Papilloedema)} | CN Palsy: ${cleanReportText(exam.crNvPalsy)}`, M + P, cy + 10, 20, theme);
    drawInfoRow(doc, "Gait / ENT", `Gait: ${cleanReportText(exam.Gait)} | Eye: ${cleanReportText(exam["Eye Movement"])} | Sinus: ${cleanReportText(exam["Tenderness over Sinus"])} | Teeth: ${cleanReportText(exam.Teeth)}`, M + P, cy + 15, 20, theme);
    drawDivider(doc, M, cy + 18, UW, theme);
    drawInfoRow(doc, "Allergies", med.allergies === "Yes" ? cleanReportText(med.allergySpecify) : "None", M + P, cy + 22, 20, theme);
    drawInfoRow(doc, "Medicine Use", `Used in last 4wks: ${safeDay(h.medicineDaysLastFourWeeks)} | Yesterday: ${cleanReportText(yesterday.hadHeadacheYesterday === "Yes" ? "taken" : "none")}`, M + P, cy + 26, 20, theme);
    drawInfoRow(doc, "Prev. Outcome", truncateText(form.clinicPath?.previousTreatmentOutcome, 120), M + P, cy + 30, 20, theme);
    cy += findHeight + Spacing.LG;

    // --- Lifestyle Summary (FRESSH) ---
    drawSectionTitle(doc, "Lifestyle Summary (FRESSH)", M, cy, theme); cy += Spacing.MD;
    const fCardW = (UW - (Spacing.MD * 5)) / 6;
    let fx = M;
    const fTitles = ["Fluid", "Relax", "Eat", "Sleep", "Screen", "Health"];
    const fVals = [
        fresshObj.waterGlassesScore,
        fresshObj.relaxScore,
        fresshObj.mealsScore,
        fresshObj.sleepScore,
        fresshObj.screenTimeScore,
        fresshObj.exerciseScore
    ];
    for (let i = 0; i < 6; i++) {
        drawRoundedCard(doc, fx, cy, fCardW, 14, theme);
        doc.setFont(Typography.Family, "bold"); doc.setFontSize(Typography.Label.size); doc.setTextColor(...Colors.Muted);
        doc.text(fTitles[i], fx + fCardW/2, cy + 4, { align: "center" });

        doc.setFontSize(10);
        const val = fVals[i];
        let c = Colors.Success;
        if (val === 1) c = Colors.Warning;
        if (val === 0) c = Colors.Danger;
        doc.setTextColor(...c);
        doc.text(val !== undefined && val !== null ? String(val) : "—", fx + fCardW/2, cy + 10, { align: "center" });
        fx += fCardW + Spacing.MD;
    }
    cy += 14 + Spacing.LG;

    // --- Doctor Notes ---
    drawSectionTitle(doc, "Doctor Notes", M, cy, theme); cy += Spacing.MD;
    const noteHeight = PH - cy - PageConstants.FooterHeight - Spacing.MD;
    drawRoundedCard(doc, M, cy, UW, noteHeight, theme, Colors.White, Colors.Border);

    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    let lineY = cy + 8;
    while(lineY < cy + noteHeight - 4) {
        doc.line(M + 5, lineY, M + UW - 5, lineY);
        lineY += 7;
    }

    drawFooter(doc, pageNum, 2, theme, PW, PH);

    doc.save(`BeatHeadache-Doctor-Clinical-Report-${p.registrationCode || "Report"}.pdf`);
}
