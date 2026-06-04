import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Layout Constants ---
const MARGIN_LEFT = 14;
const MARGIN_RIGHT = 14;
const MARGIN_TOP = 18;
const MARGIN_BOTTOM = 18;
const PAGE_WIDTH = 210; // A4
const PAGE_HEIGHT = 297;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// --- Colors ---
const COLOR_PRIMARY = [15, 23, 42]; // #0F172A - Navy
const COLOR_SECONDARY = [71, 85, 105]; // #475569 - Slate
const COLOR_BORDER = [203, 213, 225]; // #CBD5E1
const COLOR_BG_LIGHT = [248, 250, 252]; // #F8FAFC
const COLOR_WARNING = [185, 28, 28]; // #B91C1C - Red
const COLOR_SOFT_BLUE = [224, 242, 254]; // #E0F2FE
const COLOR_SOFT_GREEN = [220, 252, 231]; // #DCFCE7

// --- State Tracker ---
let y = MARGIN_TOP;

// --- Helper Functions ---

function sanitizeText(value) {
    if (value === undefined || value === null) return "Not provided";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "None";
    if (typeof value === "string") return value.trim() || "Not provided";
    return String(value);
}

function formatDate(value) {
    if (!value) return new Date().toLocaleDateString();
    try {
        return new Date(value).toLocaleDateString();
    } catch (e) {
        return value;
    }
}

function uniqueLines(text) {
    return String(text || "")
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean)
        .filter((line, index, arr) => arr.indexOf(line) === index);
}

function checkPageBreak(doc, neededHeight) {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        y = MARGIN_TOP;
        return true;
    }
    return false;
}

function addHeader(doc, title, subtitle, regCode) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text(title, MARGIN_LEFT, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_SECONDARY);
    doc.text(`Beat Headache | ${subtitle}`, MARGIN_LEFT, y);
    
    const dateStr = `Date: ${new Date().toLocaleDateString()}`;
    const codeStr = regCode ? `ID: ${regCode}` : "";
    const rightInfo = [codeStr, dateStr].filter(Boolean).join(" | ");
    
    doc.text(rightInfo, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });
    
    y += 5;
    doc.setDrawColor(...COLOR_BORDER);
    doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
    y += 10;
}

function addSectionTitle(doc, title) {
    checkPageBreak(doc, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text(title.toUpperCase(), MARGIN_LEFT, y);
    y += 6;
    doc.setDrawColor(...COLOR_PRIMARY);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, y, MARGIN_LEFT + 20, y);
    y += 8;
}

function addSubSectionTitle(doc, title) {
    checkPageBreak(doc, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_SECONDARY);
    doc.text(title, MARGIN_LEFT, y);
    y += 6;
}

function addParagraph(doc, text, options = {}) {
    const fontSize = options.fontSize || 9;
    const color = options.color || COLOR_PRIMARY;
    const fontStyle = options.fontStyle || "normal";
    
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    
    const lines = doc.splitTextToSize(text, USABLE_WIDTH);
    const lineHeight = fontSize * 0.4;
    const blockHeight = lines.length * lineHeight;
    
    checkPageBreak(doc, blockHeight);
    doc.text(lines, MARGIN_LEFT, y);
    y += blockHeight + 4;
}

function addBulletList(doc, items, options = {}) {
    if (!items || items.length === 0) return;
    const fontSize = options.fontSize || 9;
    const color = options.color || COLOR_PRIMARY;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    
    const lineHeight = fontSize * 0.4;
    
    items.forEach(item => {
        const text = `• ${item}`;
        const lines = doc.splitTextToSize(text, USABLE_WIDTH - 5);
        const blockHeight = lines.length * lineHeight;
        
        checkPageBreak(doc, blockHeight);
        doc.text(lines, MARGIN_LEFT + 2, y);
        y += blockHeight + 2;
    });
    y += 2;
}

function addKeyValueTable(doc, rows, options = {}) {
    autoTable(doc, {
        startY: y,
        body: rows,
        theme: options.theme || "grid",
        styles: {
            fontSize: options.fontSize || 8,
            cellPadding: 2,
            overflow: "linebreak",
            valign: "top",
            font: "helvetica",
        },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: options.keyWidth || 50, fillColor: [249, 250, 251] },
        },
        headStyles: {
            fillColor: COLOR_PRIMARY,
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: COLOR_BG_LIGHT,
        },
        margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
        ...options.extra
    });
    y = doc.lastAutoTable.finalY + 8;
}

function cleanDoctorReportText(value) {
    if (value === undefined || value === null) return "Not recorded";
    const s = String(value).trim();
    if (!s || s.toLowerCase() === "undefined") return "Not recorded";
    // Remove boilerplate phrases
    const junk = [
        "Doctor must confirm",
        "Clinician confirmation required",
        "Generated from Beat Headache form responses",
        "clinical/research review support only",
        "Not a diagnosis"
    ];
    let cleaned = s;
    junk.forEach(p => {
        const re = new RegExp(p, "gi");
        cleaned = cleaned.replace(re, "");
    });
    return cleaned.trim() || "Not recorded";
}

function addFooter(doc, pageNumber) {
    const totalPages = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber} of ${totalPages}`, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 10, { align: "right" });
    if (pageNumber === totalPages) {
        doc.setFontSize(6);
        doc.setTextColor(...COLOR_SECONDARY);
        doc.text("For clinical documentation support; final assessment remains with the treating clinician.", MARGIN_LEFT, PAGE_HEIGHT - 10);
    }
}

// --- Logic Functions ---

export function getFresshInterpretation(score) {
    if (score <= 25) return "Needs significant lifestyle attention";
    if (score <= 40) return "Some lifestyle risks identified";
    if (score <= 55) return "Fair lifestyle pattern";
    return "Strong lifestyle pattern";
}

export function getRedFlagSummary(form) {
    const flags = form.redFlags || { systemic: [], neuro: [], position: [] };
    return [...(flags.systemic || []), ...(flags.neuro || []), ...(flags.position || [])];
}

export function getSuggestedDiagnosisSummary(form) {
    const diagnosis = form.diagnosis || {};
    const time = form.time || {};
    const aura = time.aura || {};
    
    let likelyType = "Headache type not fully classified";
    let explanation = "Based on the provided symptoms, a specific primary headache pattern is not clearly dominant.";

    const hasAuraFeatures = aura.hasAura === "Yes" || (diagnosis.auraTypes || []).length > 0;
    const migNoAuraChars = (diagnosis.migraineNoAuraCharacteristics || []).length;
    const migNoAuraAssoc = (diagnosis.migraineNoAuraAssociated || []).length;
    const tensionChars = (diagnosis.tensionCharacteristics || []).length;
    const clusterSyms = (diagnosis.clusterSymptoms || []).length;

    if (hasAuraFeatures) {
        likelyType = "Migraine with aura features";
        explanation = "Symptoms match the pattern of migraine with neurological aura (temporary sensory or visual changes).";
    } else if (migNoAuraChars >= 2 && migNoAuraAssoc >= 1) {
        likelyType = "Migraine-type headache features";
        explanation = "Symptoms such as pulsating pain, nausea, or sensitivity to light/sound are characteristic of migraine.";
    } else if (clusterSyms >= 1 && (time.headache?.severity === "Very bad" || time.headache?.duration?.includes("1–2") || time.headache?.duration?.includes("2–4"))) {
        likelyType = "Cluster headache features";
        explanation = "Severe unilateral pain with autonomic symptoms (like tearing) suggests cluster-type headache.";
    } else if (tensionChars >= 2) {
        likelyType = "Tension-type headache features";
        explanation = "The pattern of pressure-like, bilateral pain often fits tension-type headache.";
    }

    return {
        likelyType,
        confidenceLabel: "Clinician confirmation required",
        explanation,
        doctorMustConfirm: true,
        redFlagCount: getRedFlagSummary(form).length
    };
}

// --- Main Exported Report Generators ---

export function generatePatientReportPdf(form, fresshTotal) {
    const doc = new jsPDF();
    
    // --- Layout Constants ---
    const M_LEFT = 10;
    const M_RIGHT = 10;
    const M_TOP = 10;
    const M_BOTTOM = 10;
    const P_WIDTH = 210;
    const P_HEIGHT = 297;
    const U_WIDTH = P_WIDTH - M_LEFT - M_RIGHT;
    
    let y = M_TOP;
    
    // --- Colors ---
    const C_BG_LIGHT = [239, 246, 255]; // #EFF6FF (Very soft blue)
    const C_CYAN = [224, 242, 254]; // #E0F2FE (Soft cyan-blue)
    const C_BORDER = [191, 219, 254]; // #BFDBFE (Blue border)
    const C_TEXT = [15, 23, 42]; // #0F172A (Slate-900 / Navy)
    const C_MUTED = [100, 116, 139]; // #64748B (Slate-500)
    const C_ACCENT = [37, 99, 235]; // #2563EB (Accent Blue)
    const C_WHITE = [255, 255, 255];
    
    // --- Helpers ---
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
            "Generated from Beat Headache form responses",
            "Generated from Beat Headache form"
        ];
        removes.forEach(r => {
            s = s.replace(new RegExp(r, 'gi'), '');
        });
        return s.trim() || "None";
    };

    const truncateSmart = (text, maxLen = 80) => {
        const s = cleanPatientSummaryText(text);
        if (s === "None" || s === "Not provided") return s;
        if (s.length <= maxLen) return s;
        return s.slice(0, maxLen - 3) + "...";
    };

    const formatArraySmart = (arr, maxItems = 4) => {
        const items = Array.isArray(arr) ? arr.filter(Boolean).map(cleanPatientSummaryText).filter(x => x !== "None" && x !== "Not provided") : [];
        if (items.length === 0) return "None";
        if (items.length <= maxItems) return items.join(", ");
        return items.slice(0, maxItems).join(", ") + " ...";
    };

    const parseParity = (val) => {
        const s = String(val || "").trim();
        if (!s || s === "Not provided") return { p: "—", c: "—" };
        const pMatch = s.match(/P\s*[:\[\s]*(\d+)/i);
        const cMatch = s.match(/C\s*[:\[\s]*(\d+)/i);
        let p = pMatch ? pMatch[1] : "";
        let c = cMatch ? cMatch[1] : "";
        if (!p && !c && /^\d+$/.test(s)) p = s;
        return { p: p || "—", c: c || "—" };
    };

    // Helper: draw Header
    const drawHeader = () => {
        doc.setFillColor(...C_BG_LIGHT);
        doc.rect(0, 0, P_WIDTH, 22, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...C_TEXT);
        doc.text("Beat Headache", M_LEFT, 12);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...C_MUTED);
        doc.text("Patient Summary", M_LEFT, 17);
        
        doc.setFontSize(9);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, P_WIDTH - M_RIGHT, 17, { align: "right" });
        
        y = 26;
    };
    
    // Helper: draw field box
    const drawFieldBox = (label, value, bx, by, bw, bh) => {
        doc.setFillColor(...C_WHITE);
        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(bx, by, bw, bh, 1.5, 1.5, "FD");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...C_MUTED);
        doc.text(label, bx + 2, by + 3.5);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_TEXT);
        doc.text(truncateSmart(value, bw / 1.4), bx + 2, by + 7.5);
    };

    const drawSectionTitle = (title, sy) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), M_LEFT, sy);
        return sy + 3;
    };

    // === Extract Data ===
    const p = form.patient || {};
    const b = form.birth || {};
    const peri = form.perinatal || {};
    const h = form.history || {};
    const t = form.time || {};
    const med = form.medical || {};
    const dev = form.development || {};
    const exam = form.examination || {};
    const diag = getSuggestedDiagnosisSummary(form);
    const redFlags = getRedFlagSummary(form);
    const familyRows = form.familyRows || [];

    // Header
    drawHeader();
    
    // Top Demographics
    const bw = (U_WIDTH - 6) / 3;
    drawFieldBox("Patient ID", p.registrationCode || "N/A", M_LEFT, y, bw, 10);
    drawFieldBox("Age / Gender", `${p.age || "N/A"} / ${p.gender || "N/A"}`, M_LEFT + bw + 3, y, bw, 10);
    drawFieldBox("Ethnicity", p.ethnicity || "N/A", M_LEFT + bw*2 + 6, y, bw, 10);
    y += 12;
    drawFieldBox("Referral", form.referral?.source || "N/A", M_LEFT, y, bw, 10);
    drawFieldBox("Visit Type", form.clinicPath?.initiatedBy || "N/A", M_LEFT + bw + 3, y, bw, 10);
    drawFieldBox("Previous Diagnosis", form.clinicPath?.previousDiagnosis || "N/A", M_LEFT + bw*2 + 6, y, bw, 10);
    y += 14;

    // Pregnancy / Birth / Family
    const parityObj = parseParity(b.parity);
    let pVal = peri.pregnancyNumber;
    let cVal = peri.childNumber;
    if (pVal === undefined || pVal === null || pVal === "") pVal = parityObj.p;
    if (cVal === undefined || cVal === null || cVal === "") cVal = parityObj.c;
    const pStr = pVal === "—" ? "—" : String(pVal);
    const cStr = cVal === "—" ? "—" : String(cVal);
    
    const mother = familyRows[0] || {};
    const father = familyRows[1] || {};
    const siblings = familyRows.slice(2).filter(s => s && s.age);
    const sibDetails = siblings.map(s => `${s.relation || "Sib"} ${s.age}y`).join(", ") || "None";
    
    y = drawSectionTitle("Pregnancy, Birth & Family Background", y);
    y += 2;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Pregnancy/Parity", M_LEFT, y);
    doc.text("P [", M_LEFT + 25, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(pStr, M_LEFT + 29, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("]   C [", M_LEFT + 32, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(cStr, M_LEFT + 40, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("]", M_LEFT + 43, y);
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Mother", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); 
    doc.text(truncateSmart(`${mother.age || "?"}y, ${mother.issues?.length ? mother.issues.join(",") : "None"}`, 45), M_LEFT + U_WIDTH / 2 + 25, y);
    y += 4;
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Gestation", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(`${b.gestation || "—"} wks`, 25), M_LEFT + 25, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Father", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); 
    doc.text(truncateSmart(`${father.age || "?"}y, ${father.issues?.length ? father.issues.join(",") : "None"}`, 45), M_LEFT + U_WIDTH / 2 + 25, y);
    y += 4;
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Birth Method", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(b.delivery || "—", 25), M_LEFT + 25, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Siblings", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(sibDetails, 45), M_LEFT + U_WIDTH / 2 + 25, y);
    y += 4;
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Consanguinity", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(b.consanguinity || "—", 25), M_LEFT + 25, y);
    y += 6;

    // Childhood / Neonatal (Soft Card)
    doc.setFillColor(...C_CYAN);
    doc.roundedRect(M_LEFT, y, U_WIDTH, 14, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_ACCENT);
    doc.text("Childhood / Neonatal Notes:", M_LEFT + 2, y + 4.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT);
    doc.text(truncateSmart(`Complications: ${peri.complications || "None"} | PBU Stay: ${peri.pbuStay === "Y" ? peri.pbuDays + " days" : "No"} | Notes: ${peri.other || "None"}`, 120), M_LEFT + 35, y + 4.5);
    doc.text(truncateSmart(`Early Childhood Illnesses: ${med.pastMedical || "None recorded"}`, 150), M_LEFT + 2, y + 10);
    y += 18;

    // Past Medical + Development Cards
    const drawCard = (cx, cy, cw, title, lines) => {
        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, cy, cw, 22, 1.5, 1.5, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), cx + 2, cy + 4.5);
        
        let ly = cy + 9;
        lines.forEach(l => {
            if(!l) return;
            doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED); 
            doc.text(l[0], cx + 2, ly);
            
            doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...C_TEXT);
            const val = cleanPatientSummaryText(l[1]);
            const splitVal = doc.splitTextToSize(val, cw - 27);
            doc.text(splitVal[0] || "", cx + 25, ly);
            ly += 4.2;
        });
    };
    
    const cardW = U_WIDTH / 2 - 2;
    drawCard(M_LEFT, y, cardW, "Past Medical Issues", [
        ["Medical", med.pastMedical || "None"],
        ["Surgical", med.pastSurgical || "None"],
        ["Medications", med.drugHistory || "None"]
    ]);
    drawCard(M_LEFT + cardW + 4, y, cardW, "Development", [
        ["Gross Motor", dev.grossMotorIssue === "Yes" ? dev.grossMotorDescribe : "Normal"],
        ["Fine Motor", dev.fineMotorIssue === "Yes" ? dev.fineMotorDescribe : "Normal"],
        ["Speech", dev.speechIssue === "Yes" ? dev.speechDescribe : "Normal"]
    ]);
    y += 26;

    // Headache Features (Full Width Card, Spacious 2 Columns)
    y = drawSectionTitle("Headache Features", y);
    y += 2;
    
    const hCardHeight = 40;
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, U_WIDTH, hCardHeight, 1.5, 1.5, "FD");
    
    const colW = (U_WIDTH - 6) / 2;
    
    // Draw feature block helper to wrap text and prevent overflow
    const drawFeatureBlock = (label, value, fx, fy, fw, fh) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...C_MUTED);
        doc.text(label, fx, fy);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C_TEXT);
        
        const lines = doc.splitTextToSize(cleanPatientSummaryText(value), fw);
        const maxLines = Math.floor(fh / 3.2);
        doc.text(lines.slice(0, maxLines), fx, fy + 3);
    };

    // Column 1
    drawFeatureBlock("HISTORY & PATTERN", `${h.durationYears || 0}y ${h.durationMonths || 0}m | ${h.pattern || "N/A"}`, M_LEFT + 3, y + 4.5, colW - 6, 6);
    drawFeatureBlock("LOCATION & SIDE", formatArraySmart(h.location, 3) + (h.frontalSide ? ` (Frontal: ${h.frontalSide})` : "") + (h.temporalSide ? ` (Temporal: ${h.temporalSide})` : ""), M_LEFT + 3, y + 13.5, colW - 6, 6);
    drawFeatureBlock("PAIN CHARACTER", formatArraySmart(h.painNature, 3), M_LEFT + 3, y + 22.5, colW - 6, 6);
    drawFeatureBlock("ASSOCIATED SYMPTOMS", formatArraySmart(h.associated, 6), M_LEFT + 3, y + 31.5, colW - 6, 8);

    // Column 2
    drawFeatureBlock("SEVERITY & DURATION", `${t.headache?.severity || "N/A"} | ${t.headache?.duration || "N/A"}`, M_LEFT + colW + 3, y + 4.5, colW - 6, 6);
    drawFeatureBlock("FREQUENCY", `${h.headacheDaysLastFourWeeks || 0} days / 4 wks | Meds: ${h.medicineDaysLastFourWeeks || 0} days`, M_LEFT + colW + 3, y + 13.5, colW - 6, 6);
    drawFeatureBlock("AURA & PRODROME", `Aura: ${t.aura?.hasAura === "Yes" ? formatArraySmart(t.aura.symptoms, 2) : "No"} | Prod: ${t.prodromal?.hasProdromal === "Yes" ? "Yes" : "No"} | Post: ${t.postdrome?.hasPostdrome === "Yes" ? "Yes" : "No"}`, M_LEFT + colW + 3, y + 22.5, colW - 6, 6);
    drawFeatureBlock("TRIGGERS & RELIEF", `Trig: ${formatArraySmart(h.aggravating, 3)} | Rel: ${formatArraySmart(h.relief, 3)}`, M_LEFT + colW + 3, y + 31.5, colW - 6, 8);

    y += hCardHeight + 5;

    // Primary & Secondary Headache Sections Side-by-Side (height = 46)
    const cardH = 46;
    
    // Card A: Primary Impression
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, cardW, cardH, 1.5, 1.5, "FD");
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C_ACCENT);
    doc.text("PRIMARY HEADACHE IMPRESSION", M_LEFT + 2, y + 4.5);
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED); doc.text("Suggested Category:", M_LEFT + 2, y + 9);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C_TEXT);
    const likelyLines = doc.splitTextToSize(cleanPatientSummaryText(diag.likelyType), cardW - 4);
    doc.text(likelyLines.slice(0, 2), M_LEFT + 2, y + 12.5);
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED); doc.text("Classification Criteria Status:", M_LEFT + 2, y + 20);
    const diagData = form.diagnosis || {};
    const primaryItems = [
        ["Migraine (No Aura)", cleanPatientSummaryText(diagData["migraineNoAura.status"])],
        ["Migraine (With Aura)", cleanPatientSummaryText(diagData["migraineAura.status"])],
        ["Tension-Type HA", cleanPatientSummaryText(diagData["tension.status"])],
        ["Cluster HA", cleanPatientSummaryText(diagData["cluster.status"])]
    ];
    let primY = y + 23;
    primaryItems.forEach(item => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(...C_MUTED);
        doc.text(item[0], M_LEFT + 2, primY);
        doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...C_TEXT);
        doc.text(item[1], M_LEFT + 40, primY);
        primY += 3.5;
    });
    
    // Supporting clinical features
    const features = [
        ...(diagData.migraineNoAuraCharacteristics || []),
        ...(diagData.tensionCharacteristics || []),
        ...(diagData.clusterSymptoms || [])
    ].filter(Boolean);
    const uniqFeatures = [...new Set(features)].map(cleanPatientSummaryText).filter(x => x !== "None");
    if (uniqFeatures.length > 0) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(...C_MUTED);
        doc.text("Supporting Features:", M_LEFT + 2, primY + 0.5);
        doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...C_TEXT);
        const featText = uniqFeatures.join(", ");
        const featLines = doc.splitTextToSize(featText, cardW - 4);
        doc.text(featLines.slice(0, 2), M_LEFT + 2, primY + 3.2);
    }
    
    // Card B: Secondary Headache Screen & Red Flags
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT + cardW + 4, y, cardW, cardH, 1.5, 1.5, "FD");
    
    const rfCount = redFlags.length;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    if (rfCount > 0) {
        doc.setTextColor(220, 38, 38); // Coral/Red
        doc.text("RED FLAGS (REPORTED):", M_LEFT + cardW + 6, y + 4.5);
    } else {
        doc.setTextColor(...C_ACCENT);
        doc.text("RED FLAGS & SECONDARY SCREEN", M_LEFT + cardW + 6, y + 4.5);
    }
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
    if (rfCount > 0) {
        doc.setTextColor(220, 38, 38);
        const rfLines = doc.splitTextToSize(cleanPatientSummaryText(redFlags.join(", ")), cardW - 10);
        doc.text(rfLines.slice(0, 2), M_LEFT + cardW + 6, y + 8);
    } else {
        doc.setTextColor(...C_MUTED);
        doc.text("None reported", M_LEFT + cardW + 6, y + 8);
    }
    
    // Compact screening items
    const hasInfection = redFlags.includes("Fever, acute symptoms") || exam.Gait === "Neck stiffness" || exam["Neck stifness"] === "Yes" || exam.NeckStiffness === "Yes"; 
    const hasTrauma = redFlags.includes("Head trauma");
    const hasICP = redFlags.includes("Onset in sleep/early morning") || exam.Papilloedema === "Yes" || exam.Papilloedema === "Present";
    
    const itemsCol1 = [
        ["Infection Signs", hasInfection ? "Yes" : "Normal"],
        ["Head Trauma", hasTrauma ? "Yes" : "No history"],
        ["Raised ICP", hasICP ? "Yes" : "Normal"]
    ];
    const itemsCol2 = [
        ["ENT / Sinus", (exam["Tenderness over Sinus"] === "Yes" || exam["Tenderness over Sinus"] === "AN") ? "Abnormal" : "Normal"],
        ["Eye / Vision", (exam["Eye Movement"] === "Yes" || exam["Eye Movement"] === "AN" || redFlags.includes("Visual disturbances") || redFlags.includes("Eye movement abnormalities")) ? "Abnormal" : "Normal"],
        ["Med Overuse", (parseInt(h.medicineDaysLastFourWeeks) > 10 || parseInt(h.medicineDaysLastWeek) > 3) ? "Risk" : "Normal"]
    ];
    
    let itemY = y + 16;
    doc.setFontSize(6);
    itemsCol1.forEach((item, idx) => {
        // Column 1
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED);
        doc.text(item[0], M_LEFT + cardW + 6, itemY);
        doc.setFont("helvetica", "normal"); 
        doc.setTextColor(item[1] === "Yes" ? 220 : 15, item[1] === "Yes" ? 38 : 23, item[1] === "Yes" ? 38 : 42);
        doc.text(item[1], M_LEFT + cardW + 28, itemY);
        
        // Column 2
        const item2 = itemsCol2[idx];
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED);
        doc.text(item2[0], M_LEFT + cardW + 46, itemY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(item2[1] === "Normal" ? 15 : 220, item2[1] === "Normal" ? 23 : 38, item2[1] === "Normal" ? 42 : 38);
        doc.text(item2[1], M_LEFT + cardW + 72, itemY);
        
        itemY += 3.6;
    });
    
    // User manual secondary notes cleaner
    const cleanUserNotesOnly = (text) => {
        if (!text) return "";
        const isGeneratedJargon = (line) => {
            const l = line.toLowerCase();
            const patterns = [
                "suggested because",
                "previous diagnosis",
                "previous treatment",
                "referral source",
                "developmental concern",
                "developmental history concern",
                "prodromal symptoms",
                "aura symptoms",
                "suggested review",
                "postdrome reported",
                "chronic headache history",
                "doctor review note",
                "medicine used for headache",
                "frequent medicine use",
                "severity score from page",
                "migraine-supporting",
                "lifestyle note",
                "previous response:",
                "premonitory symptoms",
                "headache impact reported",
                "headache reported yesterday",
                "medicine taken yesterday",
                "suggested check",
                "medication safety warning",
                "red flag selected",
                "clinical/research review",
                "clinician confirmation",
                "not a diagnosis",
                "doctor must",
                "clinician must",
                "see full clinical",
                "possible non-primary",
                "possible ent-related",
                "possible secondary",
                "possible tm joint-related",
                "check current/past",
                "medication safety"
            ];
            return patterns.some(p => l.includes(p));
        };

        const lines = String(text)
            .split(/\n+|\s*\|\s*/)
            .map(line => line.trim())
            .filter(Boolean)
            .filter(line => !isGeneratedJargon(line));
        
        return lines.join(", ");
    };

    // Secondary Notes if available
    const secNotes = cleanUserNotesOnly(form.medical?.secondaryStatus);
    if (secNotes && secNotes !== "None" && secNotes.trim() !== "") {
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED);
        doc.text("Secondary Notes:", M_LEFT + cardW + 6, itemY + 0.5);
        doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT);
        const secNotesLines = doc.splitTextToSize(secNotes, cardW - 10);
        doc.text(secNotesLines.slice(0, 2), M_LEFT + cardW + 6, itemY + 3.5);
    }
    
    y += cardH + 5;

    // FRESSH Lifestyle
    y = drawSectionTitle("FRESSH Lifestyle", y);
    y += 2;
    const fresshMap = [
        {k: "Food", v: form.fressh?.["Food Intake Pattern"]},
        {k: "Relaxation", v: form.fressh?.["Relaxation"]},
        {k: "Exercise", v: form.fressh?.["Exercise"]},
        {k: "Sleep", v: form.fressh?.["Sleep"]},
        {k: "Screen time", v: form.fressh?.["Screen time"]},
        {k: "Hydration", v: form.fressh?.["Hydration"]},
    ];
    let fx = M_LEFT;
    fresshMap.forEach(f => {
        doc.setFillColor(...C_CYAN);
        doc.roundedRect(fx, y, 22, 7, 1, 1, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(...C_MUTED);
        doc.text(f.k, fx + 11, y + 3, { align: "center" });
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_TEXT);
        doc.text(f.v ? `${String(f.v).match(/^(\d+)/)?.[1] || 0}/10` : "N/A", fx + 11, y + 6, { align: "center" });
        fx += 24;
    });
    
    // Total FRESSH score pill
    doc.setFillColor(...C_BG_LIGHT);
    doc.setDrawColor(...C_BORDER); doc.setLineWidth(0.2);
    doc.roundedRect(fx, y, 42, 7, 1, 1, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED);
    doc.text("FRESSH Total", fx + 4, y + 4.5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C_ACCENT);
    doc.text(`${fresshTotal} / 60`, fx + 26, y + 4.5);
    
    y += 12;

    // Special Notice Footer
    const footY = P_HEIGHT - 44;
    const footH = 34;
    doc.setFillColor(...C_BG_LIGHT);
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(M_LEFT, footY, U_WIDTH, footH, 1.5, 1.5, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_MUTED);
    doc.text("SPECIAL NOTICE", M_LEFT + 3, footY + 4);
    
    // Notes logic
    const collectSpecialNoticeFieldsOnly = (f) => {
        const notesList = [];
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
        if (momNote) {
            notesList.push(`Mother: ${momNote}`);
        } else if (mother.issues?.length > 0) {
            notesList.push(`Mother: ${mother.issues.join(", ")}`);
        }

        const dadNote = cleanNote(father.describe);
        if (dadNote) {
            notesList.push(`Father: ${dadNote}`);
        } else if (father.issues?.length > 0) {
            notesList.push(`Father: ${father.issues.join(", ")}`);
        }

        siblings.forEach((sib, idx) => {
            const sibNote = cleanNote(sib.describe);
            if (sibNote) {
                notesList.push(`Sibling ${idx + 1}: ${sibNote}`);
            } else if (sib.issues?.length > 0) {
                notesList.push(`Sibling ${idx + 1}: ${sib.issues.join(", ")}`);
            }
        });

        // Other parent illness details / development describe / perinatal describe / special notes
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

    const notesList = collectSpecialNoticeFieldsOnly(form);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_TEXT);
    
    let noteY = footY + 8;
    if (notesList.length === 0) {
        doc.text("No additional special notes recorded.", M_LEFT + 3, noteY);
    } else {
        const allNotes = notesList.join(" | ");
        const lines = doc.splitTextToSize(allNotes, U_WIDTH - 6);
        lines.slice(0, 7).forEach(l => {
            doc.text(l, M_LEFT + 3, noteY);
            noteY += 3.2;
        });
    }

    doc.save(`BeatHeadache-Patient-Summary-${sanitizeText(p.registrationCode) !== "Not provided" ? p.registrationCode : "Report"}.pdf`);
}

export function generateDoctorReportPdf(form, fresshTotal) {
    const doc = new jsPDF();

    // --- Local Layout ---
    const M = 10;
    const PW = 210;
    const PH = 297;
    const UW = PW - M * 2;
    let cy = M;

    // --- Local Colors ---
    const C_BG = [239, 246, 255];       // #EFF6FF very soft blue
    const C_CYAN = [224, 242, 254];     // #E0F2FE soft cyan
    const C_BORDER = [191, 219, 254];   // #BFDBFE blue border
    const C_TEXT = [15, 23, 42];        // #0F172A slate-900
    const C_MUTED = [100, 116, 139];    // #64748B slate-500
    const C_ACCENT = [37, 99, 235];     // #2563EB accent blue
    const C_WHITE = [255, 255, 255];
    const C_RED = [220, 38, 38];        // red for flags
    const C_GREEN = [5, 150, 105];      // green for OK

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
    const final_ = form.final || {};
    const impact = form.impact || {};
    const yesterday = form.yesterday || {};
    const diagSummary = getSuggestedDiagnosisSummary(form);
    const redFlags = getRedFlagSummary(form);
    const familyRows = form.familyRows || [];

    // --- Local Helpers ---
    const clean = (val) => {
        if (val === undefined || val === null) return "—";
        let s = String(val).trim();
        if (!s || s.toLowerCase() === "undefined" || s.toLowerCase() === "not provided") return "—";
        // Strip boilerplate
        const junk = [
            "Doctor must confirm", "Clinician confirmation required",
            "Generated from Beat Headache form responses", "Generated from Beat Headache form",
            "clinical/research review support only", "Not a diagnosis",
            "See full clinical record for complete details.", "See full clinical record.",
            "See full clinical record"
        ];
        junk.forEach(j => { s = s.replace(new RegExp(j, "gi"), ""); });
        s = s.replace(/\s{2,}/g, " ").trim();
        return s || "—";
    };

    const cleanArr = (arr, max = 6) => {
        const items = Array.isArray(arr) ? arr.filter(Boolean).map(clean).filter(x => x !== "—") : [];
        if (items.length === 0) return "None";
        const unique = [...new Set(items)];
        if (unique.length <= max) return unique.join(", ");
        return unique.slice(0, max).join(", ") + " ...";
    };

    const dedupeText = (text) => {
        if (!text) return "—";
        const lines = String(text).split(/\n+|\s*\|\s*/).map(l => l.trim()).filter(Boolean);
        const unique = [...new Set(lines)].map(clean).filter(x => x !== "—");
        return unique.length > 0 ? unique.join("; ") : "—";
    };

    const trunc = (text, maxLen = 80) => {
        const s = clean(text);
        if (s === "—") return s;
        return s.length <= maxLen ? s : s.slice(0, maxLen - 3) + "...";
    };

    const parseParity = (val) => {
        const s = String(val || "").trim();
        if (!s || s === "Not provided" || s === "—") return { p: "—", c: "—" };
        const pM = s.match(/P\s*[:\[\s]*(\d+)/i);
        const cM = s.match(/C\s*[:\[\s]*(\d+)/i);
        let pv = pM ? pM[1] : "";
        let cv = cM ? cM[1] : "";
        if (!pv && !cv && /^\d+$/.test(s)) pv = s;
        return { p: pv || "—", c: cv || "—" };
    };

    // Filter out auto-generated jargon from secondary notes
    const cleanSecondaryNotes = (text) => {
        if (!text) return "";
        const jargon = [
            "suggested because", "previous diagnosis", "previous treatment",
            "referral source", "developmental concern", "developmental history concern",
            "prodromal symptoms", "aura symptoms", "suggested review", "postdrome reported",
            "chronic headache history", "doctor review note", "medicine used for headache",
            "frequent medicine use", "severity score from page", "migraine-supporting",
            "lifestyle note", "previous response:", "premonitory symptoms",
            "headache impact reported", "headache reported yesterday", "medicine taken yesterday",
            "suggested check", "medication safety warning", "red flag selected",
            "clinical/research review", "clinician confirmation", "not a diagnosis",
            "doctor must", "clinician must", "see full clinical",
            "possible non-primary", "possible ent-related", "possible secondary",
            "possible tm joint-related", "check current/past", "medication safety"
        ];
        const lines = String(text).split(/\n+|\s*\|\s*/).map(l => l.trim()).filter(Boolean)
            .filter(line => !jargon.some(j => line.toLowerCase().includes(j)));
        return lines.join(", ");
    };

    // --- Page-break aware Y tracker ---
    const ensureSpace = (need) => {
        if (cy + need > PH - 18) {
            doc.addPage();
            cy = M;
            return true;
        }
        return false;
    };

    // --- Drawing Helpers ---
    const drawHeader = () => {
        doc.setFillColor(...C_BG);
        doc.rect(0, 0, PW, 22, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...C_TEXT);
        doc.text("Beat Headache", M, 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...C_MUTED);
        doc.text("Doctor Clinical Report", M, 17);
        const codeStr = p.registrationCode ? `ID: ${p.registrationCode}` : "";
        const rightInfo = [codeStr, `Date: ${new Date().toLocaleDateString()}`].filter(Boolean).join(" | ");
        doc.setFontSize(9);
        doc.text(rightInfo, PW - M, 17, { align: "right" });
        cy = 26;
    };

    const drawSectionTitle = (title) => {
        ensureSpace(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), M, cy);
        cy += 3;
    };

    const drawFieldBox = (label, value, bx, by, bw, bh) => {
        doc.setFillColor(...C_WHITE);
        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(bx, by, bw, bh, 1.5, 1.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...C_MUTED);
        doc.text(label, bx + 2, by + 3.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_TEXT);
        doc.text(trunc(value, bw / 1.4), bx + 2, by + 7.5);
    };

    const drawInlineField = (label, value, fx, fy, labelW) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...C_MUTED);
        doc.text(label, fx, fy);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...C_TEXT);
        doc.text(trunc(value, 50), fx + (labelW || 25), fy);
    };

    const drawCard = (cx, cy_, cw, title, rows) => {
        const ch = 6 + rows.length * 4.2 + 2;
        doc.setDrawColor(...C_BORDER);
        doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, cy_, cw, ch, 1.5, 1.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), cx + 2, cy_ + 4.5);
        let ly = cy_ + 9;
        rows.forEach(r => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.5);
            doc.setTextColor(...C_MUTED);
            doc.text(r[0], cx + 2, ly);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...C_TEXT);
            const lines = doc.splitTextToSize(clean(r[1]), cw - 27);
            doc.text(lines[0] || "—", cx + 25, ly);
            ly += 4.2;
        });
        return ch;
    };

    const drawFeatureBlock = (label, value, fx, fy, fw, fh) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...C_MUTED);
        doc.text(label, fx, fy);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C_TEXT);
        const lines = doc.splitTextToSize(clean(value), fw);
        const maxLines = Math.floor((fh || 6) / 3.2);
        doc.text(lines.slice(0, maxLines), fx, fy + 3);
    };

    // ============================================================
    //  PAGE 1 — Demographics, Background, Headache Phenotype
    // ============================================================
    drawHeader();

    // --- Top Demographics (3-column field boxes) ---
    const bw = (UW - 6) / 3;
    drawFieldBox("Patient ID", p.registrationCode || "N/A", M, cy, bw, 10);
    drawFieldBox("Age / Gender", `${clean(p.age)} / ${clean(p.gender)}`, M + bw + 3, cy, bw, 10);
    drawFieldBox("Ethnicity", clean(p.ethnicity), M + bw * 2 + 6, cy, bw, 10);
    cy += 12;

    // Previous diagnosis: deduplicate
    const prevDiag = dedupeText(form.clinicPath?.previousDiagnosis);
    drawFieldBox("Referral", clean(form.referral?.source), M, cy, bw, 10);
    drawFieldBox("Visit Type", clean(form.clinicPath?.initiatedBy), M + bw + 3, cy, bw, 10);
    drawFieldBox("Previous Diagnosis", prevDiag, M + bw * 2 + 6, cy, bw, 10);
    cy += 14;

    // --- Background Summary (Pregnancy/Birth/Family) ---
    drawSectionTitle("Background Summary");
    cy += 2;
    const parityObj = parseParity(b.parity);
    let pVal = peri.pregnancyNumber;
    let cVal = peri.childNumber;
    if (pVal === undefined || pVal === null || pVal === "") pVal = parityObj.p;
    if (cVal === undefined || cVal === null || cVal === "") cVal = parityObj.c;

    const mother = familyRows[0] || {};
    const father = familyRows[1] || {};
    const siblings = familyRows.slice(2).filter(s => s && s.age);
    const sibDetails = siblings.map(s => `${s.relation || "Sib"} ${s.age}y`).join(", ") || "None";

    // Row 1: Parity + Mother
    drawInlineField("Pregnancy/Parity", `P [${pVal}]  C [${cVal}]`, M, cy, 27);
    drawInlineField("Mother", trunc(`${mother.age || "?"}y, ${mother.issues?.length ? mother.issues.join(",") : "None"}`, 45), M + UW / 2, cy, 15);
    cy += 4;
    // Row 2: Gestation + Father
    drawInlineField("Gestation", `${clean(b.gestation)} wks`, M, cy, 27);
    drawInlineField("Father", trunc(`${father.age || "?"}y, ${father.issues?.length ? father.issues.join(",") : "None"}`, 45), M + UW / 2, cy, 15);
    cy += 4;
    // Row 3: Birth + Siblings
    drawInlineField("Birth", `${clean(b.birthWeight)} kg / ${clean(b.delivery)}`, M, cy, 27);
    drawInlineField("Siblings", trunc(sibDetails, 45), M + UW / 2, cy, 15);
    cy += 4;
    // Row 4: Consanguinity
    drawInlineField("Consanguinity", clean(b.consanguinity), M, cy, 27);
    cy += 5;

    // Childhood/Neonatal card
    doc.setFillColor(...C_CYAN);
    doc.roundedRect(M, cy, UW, 10, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C_ACCENT);
    doc.text("Perinatal:", M + 2, cy + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C_TEXT);
    doc.text(trunc(`Complications: ${clean(peri.complications)} | PBU: ${peri.pbuStay === "Y" ? (peri.pbuDays + " days") : "No"} | ${clean(peri.other)}`, 130), M + 20, cy + 4);
    doc.text(trunc(`Early Illnesses: ${clean(med.pastMedical)}`, 150), M + 2, cy + 8);
    cy += 13;

    // --- Past Medical + Development (side-by-side cards) ---
    const cardW = UW / 2 - 2;
    const ch1 = drawCard(M, cy, cardW, "Medical / Drug / Allergy", [
        ["Medical", med.pastMedical || "None"],
        ["Surgical", med.pastSurgical || "None"],
        ["Drugs", med.drugHistory || "None"],
        ["Allergies", med.allergies === "Yes" ? (med.allergySpecify || "Yes") : "None"]
    ]);
    const ch2 = drawCard(M + cardW + 4, cy, cardW, "Development & Impact", [
        ["Gross Motor", dev.grossMotorIssue === "Yes" ? dev.grossMotorDescribe : "Normal"],
        ["Fine Motor", dev.fineMotorIssue === "Yes" ? dev.fineMotorDescribe : "Normal"],
        ["Speech", dev.speechIssue === "Yes" ? dev.speechDescribe : "Normal"],
        ["School Absence", `${clean(impact.schoolAbsentDaysLastFourWeeks)} days / 4 wks`]
    ]);
    cy += Math.max(ch1, ch2) + 4;

    // Impact inline
    ensureSpace(10);
    drawInlineField("Activity Limited", `${clean(impact.activityLimitedDaysLastFourWeeks)} days`, M, cy, 27);
    drawInlineField("Parent Work Loss", `${clean(impact.parentLostWork)} (${clean(impact.parentLostWorkDays)} days)`, M + UW / 2, cy, 30);
    cy += 4;
    drawInlineField("Yesterday HA", `${clean(yesterday.hadHeadacheYesterday)}: ${clean(yesterday.severity)}`, M, cy, 27);
    drawInlineField("Medicine Yday", clean(yesterday.tookMedicine), M + UW / 2, cy, 30);
    cy += 6;

    // --- Headache Phenotype (full-width card) ---
    drawSectionTitle("Headache Phenotype");
    cy += 2;
    const hCardH = 40;
    ensureSpace(hCardH + 5);
    doc.setDrawColor(...C_BORDER);
    doc.setFillColor(...C_WHITE);
    doc.roundedRect(M, cy, UW, hCardH, 1.5, 1.5, "FD");

    const colW = (UW - 6) / 2;
    // Col 1
    drawFeatureBlock("HISTORY & PATTERN", `${h.durationYears || 0}y ${h.durationMonths || 0}m | ${clean(h.pattern)}`, M + 3, cy + 4.5, colW - 6, 6);
    drawFeatureBlock("LOCATION & SIDE", cleanArr(h.location, 3) + (h.frontalSide ? ` (F: ${h.frontalSide})` : "") + (h.temporalSide ? ` (T: ${h.temporalSide})` : ""), M + 3, cy + 13.5, colW - 6, 6);
    drawFeatureBlock("PAIN CHARACTER", cleanArr(h.painNature, 3), M + 3, cy + 22.5, colW - 6, 6);
    drawFeatureBlock("ASSOCIATED SYMPTOMS", cleanArr(h.associated, 6), M + 3, cy + 31.5, colW - 6, 8);
    // Col 2
    drawFeatureBlock("SEVERITY & DURATION", `${clean(t.headache?.severity)} | ${clean(t.headache?.duration)}`, M + colW + 3, cy + 4.5, colW - 6, 6);
    drawFeatureBlock("FREQUENCY", `${h.headacheDaysLastFourWeeks || 0} days / 4 wks | Meds: ${h.medicineDaysLastFourWeeks || 0} days`, M + colW + 3, cy + 13.5, colW - 6, 6);
    drawFeatureBlock("AURA & PRODROME", `Aura: ${t.aura?.hasAura === "Yes" ? cleanArr(t.aura.symptoms, 2) : "No"} | Prod: ${t.prodromal?.hasProdromal === "Yes" ? "Yes" : "No"} | Post: ${t.postdrome?.hasPostdrome === "Yes" ? "Yes" : "No"}`, M + colW + 3, cy + 22.5, colW - 6, 6);
    drawFeatureBlock("TRIGGERS & RELIEF", `Trig: ${cleanArr(h.aggravating, 3)} | Rel: ${cleanArr(h.relief, 3)}`, M + colW + 3, cy + 31.5, colW - 6, 8);
    cy += hCardH + 5;

    // ============================================================
    //  PAGE 2 — Red Flags, ICHD, Examination, FRESSH, Plan
    // ============================================================

    // --- Red Flags + Secondary Screen (side by side) ---
    ensureSpace(52);
    const rfCardH = 46;

    // Card A: Primary Headache Impression
    doc.setDrawColor(...C_BORDER);
    doc.setFillColor(...C_WHITE);
    doc.roundedRect(M, cy, cardW, rfCardH, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_ACCENT);
    doc.text("PRIMARY HEADACHE IMPRESSION", M + 2, cy + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_MUTED);
    doc.text("Suggested Category:", M + 2, cy + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_TEXT);
    const likelyLines = doc.splitTextToSize(clean(diagSummary.likelyType), cardW - 4);
    doc.text(likelyLines.slice(0, 2), M + 2, cy + 12.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_MUTED);
    doc.text("Classification Status:", M + 2, cy + 20);
    const primaryItems = [
        ["Migraine (No Aura)", clean(diagRaw["migraineNoAura.status"])],
        ["Migraine (With Aura)", clean(diagRaw["migraineAura.status"])],
        ["Tension-Type HA", clean(diagRaw["tension.status"])],
        ["Cluster HA", clean(diagRaw["cluster.status"])]
    ];
    let primY = cy + 23;
    primaryItems.forEach(item => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...C_MUTED);
        doc.text(item[0], M + 2, primY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT);
        doc.text(item[1], M + 40, primY);
        primY += 3.5;
    });

    // Supporting clinical features
    const features = [
        ...(diagRaw.migraineNoAuraCharacteristics || []),
        ...(diagRaw.tensionCharacteristics || []),
        ...(diagRaw.clusterSymptoms || [])
    ].filter(Boolean);
    const uniqFeatures = [...new Set(features)].map(clean).filter(x => x !== "—");
    if (uniqFeatures.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...C_MUTED);
        doc.text("Supporting Features:", M + 2, primY + 0.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT);
        const featLines = doc.splitTextToSize(uniqFeatures.join(", "), cardW - 4);
        doc.text(featLines.slice(0, 2), M + 2, primY + 3.2);
    }

    // Card B: Red Flags & Secondary Screen
    doc.setDrawColor(...C_BORDER);
    doc.setFillColor(...C_WHITE);
    doc.roundedRect(M + cardW + 4, cy, cardW, rfCardH, 1.5, 1.5, "FD");

    const rfCount = redFlags.length;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    if (rfCount > 0) {
        doc.setTextColor(...C_RED);
        doc.text("RED FLAGS (REPORTED):", M + cardW + 6, cy + 4.5);
    } else {
        doc.setTextColor(...C_ACCENT);
        doc.text("RED FLAGS & SECONDARY SCREEN", M + cardW + 6, cy + 4.5);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    if (rfCount > 0) {
        doc.setTextColor(...C_RED);
        const rfLines = doc.splitTextToSize(clean(redFlags.join(", ")), cardW - 10);
        doc.text(rfLines.slice(0, 2), M + cardW + 6, cy + 8);
    } else {
        doc.setTextColor(...C_MUTED);
        doc.text("None reported", M + cardW + 6, cy + 8);
    }

    // Secondary screening items
    const hasInfection = redFlags.includes("Fever, acute symptoms") || exam.Gait === "Neck stiffness" || exam["Neck stifness"] === "Yes" || exam.NeckStiffness === "Yes";
    const hasTrauma = redFlags.includes("Head trauma");
    const hasICP = redFlags.includes("Onset in sleep/early morning") || exam.Papilloedema === "Yes" || exam.Papilloedema === "Present";

    const screenItems = [
        [["Infection Signs", hasInfection ? "Yes" : "Normal"], ["ENT / Sinus", (exam["Tenderness over Sinus"] === "Yes" || exam["Tenderness over Sinus"] === "AN") ? "Abnormal" : "Normal"]],
        [["Head Trauma", hasTrauma ? "Yes" : "No history"], ["Eye / Vision", (exam["Eye Movement"] === "Yes" || exam["Eye Movement"] === "AN" || redFlags.includes("Visual disturbances")) ? "Abnormal" : "Normal"]],
        [["Raised ICP", hasICP ? "Yes" : "Normal"], ["Med Overuse", (parseInt(h.medicineDaysLastFourWeeks) > 10 || parseInt(h.medicineDaysLastWeek) > 3) ? "Risk" : "Normal"]]
    ];

    let itemY = cy + 16;
    doc.setFontSize(6);
    screenItems.forEach(row => {
        const [item1, item2] = row;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_MUTED);
        doc.text(item1[0], M + cardW + 6, itemY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...(item1[1] === "Yes" ? C_RED : C_TEXT));
        doc.text(item1[1], M + cardW + 28, itemY);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_MUTED);
        doc.text(item2[0], M + cardW + 46, itemY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...(item2[1] === "Normal" || item2[1] === "No history" ? C_TEXT : C_RED));
        doc.text(item2[1], M + cardW + 72, itemY);
        itemY += 3.6;
    });

    // Secondary notes
    const secNotes = cleanSecondaryNotes(med.secondaryStatus);
    if (secNotes && secNotes.trim()) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_MUTED);
        doc.text("Secondary Notes:", M + cardW + 6, itemY + 0.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT);
        const secLines = doc.splitTextToSize(secNotes, cardW - 10);
        doc.text(secLines.slice(0, 2), M + cardW + 6, itemY + 3.5);
    }
    cy += rfCardH + 5;

    // --- Examination & Investigation ---
    ensureSpace(28);
    drawSectionTitle("Examination & Investigation");
    cy += 2;
    const examCardH = drawCard(M, cy, UW, "Examination Findings", [
        ["Vitals / Growth", `Ht: ${clean(exam.height)}cm, Wt: ${clean(exam.weight)}kg, BMI: ${clean(exam.bmi)}, OFC: ${clean(exam.ofc)}cm`],
        ["BP / HR", `${clean(exam.bpSystolic)}/${clean(exam.bpDiastolic)} mmHg | HR: ${clean(exam.heartRate)} bpm`],
        ["Neuro / Papilloedema", `${clean(exam.Papilloedema)} | CN Palsy: ${clean(exam.crNvPalsy)}`],
        ["Gait / Eye Movement", `${clean(exam.Gait)} | ${clean(exam["Eye Movement"])}`],
        ["ENT / Sinus / Teeth", `Sinus: ${clean(exam["Tenderness over Sinus"])}, Teeth: ${clean(exam.Teeth)}`],
        ["Suggested Tests", clean(exam.tests)]
    ]);
    cy += examCardH + 4;

    // --- FRESSH Lifestyle ---
    ensureSpace(16);
    drawSectionTitle("FRESSH Lifestyle Score");
    cy += 2;
    const fresshMap = [
        { k: "Food", v: form.fressh?.["Food Intake Pattern"] },
        { k: "Relaxation", v: form.fressh?.["Relaxation"] },
        { k: "Exercise", v: form.fressh?.["Exercise"] },
        { k: "Sleep", v: form.fressh?.["Sleep"] },
        { k: "Screen", v: form.fressh?.["Screen time"] },
        { k: "Hydration", v: form.fressh?.["Hydration"] },
    ];
    let fx = M;
    fresshMap.forEach(f => {
        doc.setFillColor(...C_CYAN);
        doc.roundedRect(fx, cy, 22, 7, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...C_MUTED);
        doc.text(f.k, fx + 11, cy + 3, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...C_TEXT);
        doc.text(f.v ? `${String(f.v).match(/^(\d+)/)?.[1] || 0}/10` : "N/A", fx + 11, cy + 6, { align: "center" });
        fx += 24;
    });
    // Total pill
    doc.setFillColor(...C_BG);
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.2);
    doc.roundedRect(fx, cy, 42, 7, 1, 1, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_MUTED);
    doc.text("FRESSH Total", fx + 4, cy + 4.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_ACCENT);
    doc.text(`${fresshTotal} / 60`, fx + 26, cy + 4.5);
    cy += 10;

    // Interpretation
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text(`Interpretation: ${getFresshInterpretation(fresshTotal)}`, M, cy);
    cy += 6;

    // --- Assessment & Plan ---
    ensureSpace(30);
    drawSectionTitle("Assessment & Plan");
    cy += 2;

    // Assessment card
    doc.setFillColor(...C_CYAN);
    doc.roundedRect(M, cy, UW, 12, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C_ACCENT);
    doc.text("Working Impression:", M + 2, cy + 4.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_TEXT);
    const impressionLines = doc.splitTextToSize(clean(diagSummary.likelyType) + " — " + clean(diagSummary.explanation), UW - 40);
    doc.text(impressionLines.slice(0, 2), M + 38, cy + 4.5);
    cy += 14;

    // Diagnostic observations
    const diagNotes = uniqueLines(final_.diagnosis);
    if (diagNotes.length > 0) {
        ensureSpace(diagNotes.length * 4 + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...C_MUTED);
        doc.text("Diagnostic Observations:", M, cy);
        cy += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C_TEXT);
        diagNotes.forEach(note => {
            const n = clean(note);
            if (n === "—") return;
            ensureSpace(5);
            const lines = doc.splitTextToSize(`• ${n}`, UW - 4);
            doc.text(lines.slice(0, 2), M + 2, cy);
            cy += lines.slice(0, 2).length * 3.2 + 1;
        });
        cy += 2;
    }

    // Plan / Medication notes
    const planNotes = uniqueLines(final_.medicationPlan);
    if (planNotes.length > 0) {
        ensureSpace(planNotes.length * 4 + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...C_MUTED);
        doc.text("Plan / Medication Discussion:", M, cy);
        cy += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C_TEXT);
        planNotes.forEach(note => {
            const n = clean(note);
            if (n === "—") return;
            ensureSpace(5);
            const lines = doc.splitTextToSize(`• ${n}`, UW - 4);
            doc.text(lines.slice(0, 2), M + 2, cy);
            cy += lines.slice(0, 2).length * 3.2 + 1;
        });
        cy += 2;
    }

    // Allergy/drug warning if relevant
    if (med.allergies === "Yes" && med.allergySpecify) {
        ensureSpace(8);
        doc.setFillColor(254, 243, 199); // soft yellow
        doc.roundedRect(M, cy, UW, 7, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...C_RED);
        doc.text(`⚠ Allergy Alert: ${trunc(med.allergySpecify, 120)}`, M + 2, cy + 4.5);
        cy += 9;
    }

    // --- Finalize: Add footers ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(doc, i);
    }

    doc.save(`BeatHeadache-Doctor-Clinical-Report-${p.registrationCode || "Report"}.pdf`);
}
