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

function addFooter(doc, pageNumber) {
    const totalPages = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const footerText = "Generated from Beat Headache form responses — clinical/research review support only. Clinician confirmation required.";
    doc.text(footerText, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: "center" });
    doc.text(`Page ${pageNumber} of ${totalPages}`, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 10, { align: "right" });
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
    y = MARGIN_TOP;
    
    const p = form.patient || {};
    const b = form.birth || {};
    const peri = form.perinatal || {};
    const h = form.history || {};
    const t = form.time || {};
    const med = form.medical || {};
    const diag = form.diagnosis || {};
    const exam = form.examination || {};
    const final = form.final || {};
    
    const diagSummary = getSuggestedDiagnosisSummary(form);
    const redFlags = getRedFlagSummary(form);

    // Header
    addHeader(doc, "Clinical Report", "Clinician/Researcher View", p.registrationCode);

    // 1. Patient & Encounter Details
    addSectionTitle(doc, "1. Patient & Encounter Details");
    addKeyValueTable(doc, [
        ["First Name", sanitizeText(p.firstName)],
        ["Last Name", sanitizeText(p.lastName)],
        ["DOB / Age", `${sanitizeText(p.dob)} / ${sanitizeText(p.age)}`],
        ["Gender / Ethnicity", `${sanitizeText(p.gender)} / ${sanitizeText(p.ethnicity)}`],
        ["Registration Code", sanitizeText(p.registrationCode)],
        ["Phone / WhatsApp", `${sanitizeText(p.phone)} / ${sanitizeText(p.whatsapp)}`],
        ["Email", sanitizeText(p.email)],
        ["Report Date", formatDate(form.meta?.reportGeneratedAt)],
        ["Form Version", sanitizeText(form.meta?.formVersion)]
    ]);

    // 2. Referral / Path to Clinic
    addSectionTitle(doc, "2. Referral & Clinical Path");
    addKeyValueTable(doc, [
        ["Referral source", sanitizeText(form.referral?.source)],
        ["Visit initiated by", sanitizeText(form.clinicPath?.initiatedBy)],
        ["Seen before for HA", sanitizeText(form.clinicPath?.seenBefore)],
        ["Previous provider", sanitizeText(form.clinicPath?.seenBeforeWhere)],
        ["Prev. Diagnosis Given", sanitizeText(form.clinicPath?.previousDiagnosisGiven)],
        ["Prev. Diagnosis", sanitizeText(form.clinicPath?.previousDiagnosis)],
        ["Prev. Treatment Outcome", sanitizeText(form.clinicPath?.previousTreatmentOutcome)]
    ]);

    // 3. Background History
    addSectionTitle(doc, "3. Background History");
    
    addSubSectionTitle(doc, "A) Birth & Perinatal History");
    addKeyValueTable(doc, [
        ["Parity / Gestation", `${sanitizeText(b.parity)} / ${sanitizeText(b.gestation)} weeks`],
        ["Birth Weight / Delivery", `${sanitizeText(b.birthWeight)} kg / ${sanitizeText(b.delivery)}`],
        ["Consanguinity", sanitizeText(b.consanguinity)],
        ["PBU Stay / Days", `${sanitizeText(peri.pbuStay)} / ${sanitizeText(peri.pbuDays)}`],
        ["Perinatal Complications", sanitizeText(peri.complications)],
        ["Other Perinatal Notes", sanitizeText(peri.other)]
    ]);

    addSubSectionTitle(doc, "B) Family History");
    const familyRows = (form.familyRows || []).filter(r => r.relation).map(r => [
        r.relation,
        `Age: ${r.age || "?"}, Occ: ${r.occupation || "N/A"}, Issues: ${sanitizeText(r.issues)}`
    ]);
    addKeyValueTable(doc, familyRows, { keyWidth: 30 });

    addSubSectionTitle(doc, "C) Medical / Drug / Allergy History");
    addKeyValueTable(doc, [
        ["Past Medical History", sanitizeText(med.pastMedical)],
        ["Past Surgical History", sanitizeText(med.pastSurgical)],
        ["Current Drug History", sanitizeText(med.drugHistory)],
        ["Allergies", sanitizeText(med.allergies)],
        ["Allergy Details", sanitizeText(med.allergySpecify)]
    ]);

    addSubSectionTitle(doc, "D) Developmental History");
    addKeyValueTable(doc, [
        ["Gross Motor Issue", `${sanitizeText(form.development?.grossMotorIssue)}: ${sanitizeText(form.development?.grossMotorDescribe)}`],
        ["Fine Motor Issue", `${sanitizeText(form.development?.fineMotorIssue)}: ${sanitizeText(form.development?.fineMotorDescribe)}`],
        ["Speech Issue", `${sanitizeText(form.development?.speechIssue)}: ${sanitizeText(form.development?.speechDescribe)}`],
        ["Other Concerns", sanitizeText(form.development?.other)]
    ]);

    // 4. Presenting Headache History
    addSectionTitle(doc, "4. Presenting Headache History");
    addKeyValueTable(doc, [
        ["Headache Confirmation", sanitizeText(form.headache?.confirmed)],
        ["Exclude (non-primary)", sanitizeText(form.headache?.exclude)],
        ["Duration History", `${sanitizeText(h.durationYears)}y ${sanitizeText(h.durationMonths)}m`],
        ["Frequency Pattern", sanitizeText(h.pattern)],
        ["HA Days (Last week / 4 wks)", `${sanitizeText(h.headacheDaysLastWeek)} / ${sanitizeText(h.headacheDaysLastFourWeeks)}`],
        ["Meds Days (Last week / 4 wks)", `${sanitizeText(h.medicineDaysLastWeek)} / ${sanitizeText(h.medicineDaysLastFourWeeks)}`]
    ]);

    // 5. Headache Phenotype
    addSectionTitle(doc, "5. Headache Phenotype");
    addKeyValueTable(doc, [
        ["Location", sanitizeText(h.location)],
        ["Side (F / T)", `F: ${sanitizeText(h.frontalSide)}, T: ${sanitizeText(h.temporalSide)}`],
        ["Quality / Nature", sanitizeText(h.painNature)],
        ["Usual Severity", sanitizeText(t.headache?.severity)],
        ["Preferred Relief", sanitizeText(h.relief)],
        ["Aggravating Factors", sanitizeText(h.aggravating)],
        ["Associated Symptoms", sanitizeText(h.associated)],
        ["Time of Day", sanitizeText(h.timeOfDay)]
    ]);

    // 6. T-Time Pattern
    addSectionTitle(doc, "6. Temporal Pattern (T-Time)");
    addKeyValueTable(doc, [
        ["Prodromal Symptoms", sanitizeText(t.prodromal?.symptoms)],
        ["Aura Presence", sanitizeText(t.aura?.hasAura)],
        ["Aura Type / Duration", `${sanitizeText(t.aura?.symptoms)} / ${sanitizeText(t.aura?.duration)}`],
        ["Aura Side / Timing", `${sanitizeText(t.aura?.side)} / ${sanitizeText(t.aura?.timing)}`],
        ["Gradual Spread", sanitizeText(t.aura?.gradualSpread)],
        ["Headache Duration", sanitizeText(t.headache?.duration)],
        ["Postdrome Symptoms", sanitizeText(t.postdrome?.symptoms)]
    ]);

    // 7. Impact Summary
    addSectionTitle(doc, "7. Impact Summary");
    addKeyValueTable(doc, [
        ["School Absence (Last 4 wks)", `${sanitizeText(form.impact?.schoolAbsentDaysLastFourWeeks)} days`],
        ["Left Early (Last 4 wks)", `${sanitizeText(form.impact?.leftSchoolEarlyDaysLastFourWeeks)} days`],
        ["Activity Limitation", `${sanitizeText(form.impact?.activityLimitedDaysLastFourWeeks)} days`],
        ["Parent Work Loss", `${sanitizeText(form.impact?.parentLostWork)} (${sanitizeText(form.impact?.parentLostWorkDays)} days)`],
        ["Yesterday Headache", `${sanitizeText(form.yesterday?.hadHeadacheYesterday)}: ${sanitizeText(form.yesterday?.severity)} (${sanitizeText(form.yesterday?.duration)})`],
        ["Medicine Yesterday", sanitizeText(form.yesterday?.tookMedicine)]
    ]);

    // 8. Red Flags / Secondary Headache Screen
    addSectionTitle(doc, "8. Red Flags & Secondary Screen");
    if (redFlags.length > 0) {
        addParagraph(doc, "RED FLAGS IDENTIFIED — REQUIRE CLINICAL ATTENTION:", { color: COLOR_WARNING, fontStyle: "bold" });
        addBulletList(doc, redFlags, { color: COLOR_WARNING });
    } else {
        addParagraph(doc, "No major red flags selected in form.", { color: [5, 150, 105] });
    }
    addKeyValueTable(doc, [
        ["Secondary HA status notes", sanitizeText(med.secondaryStatus)]
    ]);

    // 9. ICHD-3 Criteria Reflection
    addSectionTitle(doc, "9. ICHD-3 Criteria Reflection (Form Responses)");
    
    addSubSectionTitle(doc, "A) Migraine Without Aura");
    addKeyValueTable(doc, [
        ["Characteristics Matched", sanitizeText(diag.migraineNoAuraCharacteristics)],
        ["Associated Symptoms", sanitizeText(diag.migraineNoAuraAssociated)],
        ["Classification Status", sanitizeText(diag["migraineNoAura.status"])]
    ]);

    addSubSectionTitle(doc, "B) Migraine With Aura");
    addKeyValueTable(doc, [
        ["Aura Types", sanitizeText(diag.auraTypes)],
        ["Aura Characteristics", sanitizeText(diag.auraCharacteristics)],
        ["Classification Status", sanitizeText(diag["migraineAura.status"])]
    ]);

    addSubSectionTitle(doc, "C) Tension-Type Headache");
    addKeyValueTable(doc, [
        ["Characteristics", sanitizeText(diag.tensionCharacteristics)],
        ["Associated / Exclusion", sanitizeText(diag.tensionAssociated)],
        ["Classification Status", sanitizeText(diag["tension.status"])]
    ]);

    addSubSectionTitle(doc, "D) Cluster Headache");
    addKeyValueTable(doc, [
        ["Autonomic Symptoms", sanitizeText(diag.clusterSymptoms)],
        ["Classification Status", sanitizeText(diag["cluster.status"])]
    ]);
    addParagraph(doc, "NOTE: Criteria mapping is reflected from automated form responses and does not constitute a final clinical diagnosis.", { fontSize: 8, color: COLOR_SECONDARY });

    // 10. Examination & Investigation Prompts
    addSectionTitle(doc, "10. Examination & Investigation Summary");
    addKeyValueTable(doc, [
        ["Vitals / Growth", `Ht: ${sanitizeText(exam.height)}cm, Wt: ${sanitizeText(exam.weight)}kg, BMI: ${sanitizeText(exam.bmi)}, OFC: ${sanitizeText(exam.ofc)}cm`],
        ["BP / HR", `${sanitizeText(exam.bpSystolic)}/${sanitizeText(exam.bpDiastolic)} mmHg | HR: ${sanitizeText(exam.heartRate)} bpm`],
        ["General / Dysmorphism", sanitizeText(exam.Dysmorphism)],
        ["Neuro / Papilloedema", `${sanitizeText(exam.Papilloedema)} | CN Palsy: ${sanitizeText(exam.crNvPalsy)}`],
        ["Neuro / Gait / Eye Mov", `${sanitizeText(exam.Gait)} | ${sanitizeText(exam["Eye Movement"])}`],
        ["ENT / Sinus / Teeth", `Sinus: ${sanitizeText(exam["Tenderness over Sinus"])}, Teeth: ${sanitizeText(exam.Teeth)}`],
        ["Suggested Tests", sanitizeText(exam.tests)]
    ]);

    // 11. FRESSH Lifestyle Score
    addSectionTitle(doc, "11. FRESSH Lifestyle Score");
    const fTable = Object.entries(form.fressh || {}).filter(([k]) => !k.includes(".extra")).map(([k, v]) => [k, v]);
    fTable.push(["TOTAL SCORE", `${fresshTotal} / 60`]);
    fTable.push(["INTERPRETATION", getFresshInterpretation(fresshTotal)]);
    addKeyValueTable(doc, fTable);

    // 12. Assessment / Working Impression
    addSectionTitle(doc, "12. Assessment & Working Impression");
    addParagraph(doc, `Suggested Category: ${diagSummary.likelyType}`, { fontStyle: "bold" });
    addParagraph(doc, diagSummary.explanation);
    
    const diagNotes = uniqueLines(final.diagnosis);
    if (diagNotes.length > 0) {
        addSubSectionTitle(doc, "Additional Diagnostic Observations:");
        addBulletList(doc, diagNotes);
    }

    // 13. Proposed Plan / Medication Discussion
    addSectionTitle(doc, "13. Proposed Plan & Medication Discussion");
    const planNotes = uniqueLines(final.medicationPlan);
    if (planNotes.length > 0) {
        addBulletList(doc, planNotes);
    } else {
        addParagraph(doc, "No medication plan notes provided.");
    }
    
    addParagraph(doc, "PLANNING NOTE: Review drug history and allergies (Section 3C) before prescribing. Discuss red flags (Section 8) if present.", { fontSize: 8, color: COLOR_WARNING });

    // 14. Disclaimer
    addSectionTitle(doc, "14. Disclaimer");
    addParagraph(doc, "This clinical report is generated from systematic form responses to support clinical review and research documentation. It does not replace clinician assessment, examination, diagnosis, or treatment decisions. The automated criteria matching is an aid for the clinician and is not definitive.", { fontSize: 8 });

    // Finalize footers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(doc, i);
    }

    doc.save(`BeatHeadache-Doctor-Clinical-Report-${p.registrationCode || p.firstName || "Report"}.pdf`);
}
