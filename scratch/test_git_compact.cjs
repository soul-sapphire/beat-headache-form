const fs = require('fs');

const path = 'src/reportUtils.js';
let code = fs.readFileSync(path, 'utf8');

const startStr = "export function generatePatientReportPdf(form, fresshTotal) {";
const endStr = "export function generateDoctorReportPdf(form, fresshTotal) {";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find boundaries");
    process.exit(1);
}

const optimizedFunction = \`export function generatePatientReportPdf(form, fresshTotal) {
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
    const C_BG_LIGHT = [239, 246, 255]; 
    const C_CYAN = [224, 242, 254]; 
    const C_BORDER = [191, 219, 254]; 
    const C_TEXT = [15, 23, 42]; 
    const C_MUTED = [100, 116, 139]; 
    const C_ACCENT = [37, 99, 235]; 
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
        const pMatch = s.match(/P\\s*[:\\[\\s]*(\\d+)/i);
        const cMatch = s.match(/C\\s*[:\\[\\s]*(\\d+)/i);
        let p = pMatch ? pMatch[1] : "";
        let c = cMatch ? cMatch[1] : "";
        if (!p && !c && /^\\d+$/.test(s)) p = s;
        return { p: p || "—", c: c || "—" };
    };

    // Helper: draw Header
    const drawHeader = () => {
        doc.setFillColor(...C_BG_LIGHT);
        doc.rect(0, 0, P_WIDTH, 18, "F"); // 22 -> 18
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...C_TEXT);
        doc.text("Beat Headache", M_LEFT, 10); // 12 -> 10
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...C_MUTED);
        doc.text("Patient Summary", M_LEFT, 15); // 17 -> 15
        
        doc.setFontSize(9);
        doc.text(\`Date: \${new Date().toLocaleDateString()}\`, P_WIDTH - M_RIGHT, 15, { align: "right" });
        
        y = 21; // 26 -> 21
    };
    
    // Helper: draw field box
    const drawFieldBox = (label, value, bx, by, bw, bh) => {
        doc.setFillColor(...C_WHITE);
        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(bx, by, bw, bh, 1, 1, "FD"); // 1.5 -> 1
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...C_MUTED);
        doc.text(label, bx + 2, by + 3); // 3.5 -> 3
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_TEXT);
        doc.text(truncateSmart(value, bw / 1.4), bx + 2, by + 6.5); // 7.5 -> 6.5
    };

    const drawSectionTitle = (title, sy) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), M_LEFT, sy);
        return sy + 2.5; // 3 -> 2.5
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
    drawFieldBox("Patient ID", p.registrationCode || "N/A", M_LEFT, y, bw, 9); // 10 -> 9
    drawFieldBox("Age / Gender", \`\${p.age || "N/A"} / \${p.gender || "N/A"}\`, M_LEFT + bw + 3, y, bw, 9);
    drawFieldBox("Ethnicity", p.ethnicity || "N/A", M_LEFT + bw*2 + 6, y, bw, 9);
    y += 10; // 12 -> 10
    drawFieldBox("Referral", form.referral?.source || "N/A", M_LEFT, y, bw, 9);
    drawFieldBox("Visit Type", form.clinicPath?.initiatedBy || "N/A", M_LEFT + bw + 3, y, bw, 9);
    drawFieldBox("Previous Diagnosis", form.clinicPath?.previousDiagnosis || "N/A", M_LEFT + bw*2 + 6, y, bw, 9);
    y += 12; // 14 -> 12

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
    const sibDetails = siblings.map(s => \`\${s.relation || "Sib"} \${s.age}y\`).join(", ") || "None";
    
    y = drawSectionTitle("Pregnancy, Birth & Family Background", y);
    y += 1.5; // 2 -> 1.5
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Pregnancy/Parity", M_LEFT, y);
    doc.text("P [", M_LEFT + 25, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(pStr, M_LEFT + 29, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("]   C [", M_LEFT + 32, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(cStr, M_LEFT + 40, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("]", M_LEFT + 43, y);
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Mother", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); 
    doc.text(truncateSmart(\`\${mother.age || "?"}y, \${mother.issues?.length ? mother.issues.join(",") : "None"}\`, 45), M_LEFT + U_WIDTH / 2 + 25, y);
    y += 3.5; // 4 -> 3.5
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Gestation", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(\`\${b.gestation || "—"} wks\`, 25), M_LEFT + 25, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Father", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); 
    doc.text(truncateSmart(\`\${father.age || "?"}y, \${father.issues?.length ? father.issues.join(",") : "None"}\`, 45), M_LEFT + U_WIDTH / 2 + 25, y);
    y += 3.5;
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Birth Method", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(b.delivery || "—", 25), M_LEFT + 25, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Siblings", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(sibDetails, 45), M_LEFT + U_WIDTH / 2 + 25, y);
    y += 3.5;
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Consanguinity", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(b.consanguinity || "—", 25), M_LEFT + 25, y);
    y += 4.5; // 6 -> 4.5

    // Childhood / Neonatal (Soft Card)
    doc.setFillColor(...C_CYAN);
    doc.roundedRect(M_LEFT, y, U_WIDTH, 12, 1, 1, "F"); // 14 -> 12
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_ACCENT);
    doc.text("Childhood / Neonatal Notes:", M_LEFT + 2, y + 4); // 4.5 -> 4
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT);
    doc.text(truncateSmart(\`Complications: \${peri.complications || "None"} | PBU Stay: \${peri.pbuStay === "Y" ? peri.pbuDays + " days" : "No"} | Notes: \${peri.other || "None"}\`, 120), M_LEFT + 35, y + 4);
    doc.text(truncateSmart(\`Early Childhood Illnesses: \${med.pastMedical || "None recorded"}\`, 150), M_LEFT + 2, y + 9); // 10 -> 9
    y += 14; // 18 -> 14

    // Past Medical + Development Cards
    const drawCard = (cx, cy, cw, title, lines) => {
        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, cy, cw, 19, 1, 1, "FD"); // 22 -> 19
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), cx + 2, cy + 4); // 4.5 -> 4
        
        let ly = cy + 8; // 9 -> 8
        lines.forEach(l => {
            if(!l) return;
            doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED); 
            doc.text(l[0], cx + 2, ly);
            
            doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...C_TEXT);
            const val = cleanPatientSummaryText(l[1]);
            const splitVal = doc.splitTextToSize(val, cw - 27);
            doc.text(splitVal[0] || "", cx + 25, ly);
            ly += 3.5; // 4.2 -> 3.5
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
    y += 21; // 26 -> 21

    // Headache Features (Full Width Card, Spacious 2 Columns)
    y = drawSectionTitle("Headache Features", y);
    y += 1.5; // 2 -> 1.5
    
    const hCardHeight = 33; // 40 -> 33
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, U_WIDTH, hCardHeight, 1, 1, "FD"); // 1.5 -> 1
    
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
        doc.text(lines.slice(0, maxLines), fx, fy + 2.5); // 3 -> 2.5
    };

    // Column 1
    drawFeatureBlock("HISTORY & PATTERN", \`\${h.durationYears || 0}y \${h.durationMonths || 0}m | \${h.pattern || "N/A"}\`, M_LEFT + 3, y + 4, colW - 6, 6); // 4.5 -> 4
    drawFeatureBlock("LOCATION & SIDE", formatArraySmart(h.location, 3) + (h.frontalSide ? \` (Frontal: \${h.frontalSide})\` : "") + (h.temporalSide ? \` (Temporal: \${h.temporalSide})\` : ""), M_LEFT + 3, y + 11.5, colW - 6, 6); // 13.5 -> 11.5
    drawFeatureBlock("PAIN CHARACTER", formatArraySmart(h.painNature, 3), M_LEFT + 3, y + 19, colW - 6, 6); // 22.5 -> 19
    drawFeatureBlock("ASSOCIATED SYMPTOMS", formatArraySmart(h.associated, 6), M_LEFT + 3, y + 26.5, colW - 6, 8); // 31.5 -> 26.5

    // Column 2
    drawFeatureBlock("SEVERITY & DURATION", \`\${t.headache?.severity || "N/A"} | \${t.headache?.duration || "N/A"}\`, M_LEFT + colW + 3, y + 4, colW - 6, 6);
    drawFeatureBlock("FREQUENCY", \`\${h.headacheDaysLastFourWeeks || 0} days / 4 wks | Meds: \${h.medicineDaysLastFourWeeks || 0} days\`, M_LEFT + colW + 3, y + 11.5, colW - 6, 6);
    drawFeatureBlock("AURA & PRODROME", \`Aura: \${t.aura?.hasAura === "Yes" ? formatArraySmart(t.aura.symptoms, 2) : "No"} | Prod: \${t.prodromal?.hasProdromal === "Yes" ? "Yes" : "No"} | Post: \${t.postdrome?.hasPostdrome === "Yes" ? "Yes" : "No"}\`, M_LEFT + colW + 3, y + 19, colW - 6, 6);
    drawFeatureBlock("TRIGGERS & RELIEF", \`Trig: \${formatArraySmart(h.aggravating, 3)} | Rel: \${formatArraySmart(h.relief, 3)}\`, M_LEFT + colW + 3, y + 26.5, colW - 6, 8);

    y += hCardHeight + 3; // 5 -> 3

    // Primary & Secondary Headache Sections Side-by-Side
    const impressionH = 46; // 55 -> 46
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, cardW, impressionH, 1, 1, "FD"); // 1.5 -> 1
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...C_ACCENT);
    doc.text("PRIMARY HEADACHE IMPRESSION", M_LEFT + 2, y + 4.5); // 5 -> 4.5
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_MUTED); doc.text("Suggested Category:", M_LEFT + 2, y + 8.5); // 10 -> 8.5
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...C_TEXT);
    const likelyLines = doc.splitTextToSize(cleanPatientSummaryText(diag.likelyType), cardW - 4);
    doc.text(likelyLines.slice(0, 2), M_LEFT + 2, y + 12.5); // 14 -> 12.5
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_MUTED); doc.text("Classification Status:", M_LEFT + 2, y + 19); // 23 -> 19
    const diagData = form.diagnosis || {};
    const primaryItems = [
        ["Migraine (No Aura)", cleanPatientSummaryText(diagData["migraineNoAura.status"])],
        ["Migraine (With Aura)", cleanPatientSummaryText(diagData["migraineAura.status"])],
        ["Tension-Type HA", cleanPatientSummaryText(diagData["tension.status"])],
        ["Cluster HA", cleanPatientSummaryText(diagData["cluster.status"])]
    ];
    let primY = y + 22.5; // 27 -> 22.5
    primaryItems.forEach(item => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED);
        doc.text(item[0], M_LEFT + 2, primY);
        doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...C_TEXT);
        doc.text(item[1], M_LEFT + 40, primY);
        primY += 3.5; // 4 -> 3.5
    });
    
    // Supporting clinical features
    const features = [
        ...(diagData.migraineNoAuraCharacteristics || []),
        ...(diagData.tensionCharacteristics || []),
        ...(diagData.clusterSymptoms || [])
    ].filter(Boolean);
    const uniqFeatures = [...new Set(features)].map(cleanPatientSummaryText).filter(x => x !== "None");
    if (uniqFeatures.length > 0) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED);
        doc.text("Supporting Features:", M_LEFT + 2, primY + 1);
        doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...C_TEXT);
        const featText = uniqFeatures.join(", ");
        const featLines = doc.splitTextToSize(featText, cardW - 4);
        doc.text(featLines.slice(0, 2), M_LEFT + 2, primY + 4); // 4.5 -> 4
    }
    
    // Card B: Secondary Headache Screen & Red Flags
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT + cardW + 4, y, cardW, impressionH, 1, 1, "FD"); // 1.5 -> 1
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.setTextColor(...C_ACCENT);
    doc.text("RED FLAGS & SECONDARY SCREEN", M_LEFT + cardW + 6, y + 4.5); // 5 -> 4.5
    
    // Red Flags as chips/boxes
    let rfY = y + 8; // 9 -> 8
    let rfX = M_LEFT + cardW + 6;
    if (redFlags.length > 0) {
        doc.setFontSize(6);
        redFlags.forEach((flag, idx) => {
            const flagText = cleanPatientSummaryText(flag);
            const txtWidth = doc.getTextWidth(flagText);
            const chipW = txtWidth + 4;
            
            if (rfX + chipW > M_LEFT + cardW * 2 + 4) {
                rfX = M_LEFT + cardW + 6;
                rfY += 4.5; // 5 -> 4.5
            }
            
            if (rfY < y + 20) { // 22 -> 20
                doc.setFillColor(254, 226, 226);
                doc.setDrawColor(248, 113, 113);
                doc.roundedRect(rfX, rfY, chipW, 3.5, 1, 1, "FD"); // 4 -> 3.5
                doc.setTextColor(153, 27, 27);
                doc.text(flagText, rfX + 2, rfY + 2.5); // 3 -> 2.5
                rfX += chipW + 2;
            }
        });
    } else {
        doc.setFillColor(220, 252, 231);
        doc.setDrawColor(74, 222, 128);
        doc.roundedRect(rfX, rfY, 25, 3.5, 1, 1, "FD");
        doc.setTextColor(21, 128, 61);
        doc.text("None reported", rfX + 2, rfY + 2.5);
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
    
    let itemY = y + 22.5; // 27 -> 22.5
    doc.setFontSize(6.5);
    itemsCol1.forEach((item, idx) => {
        // Column 1
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED);
        doc.text(item[0], M_LEFT + cardW + 6, itemY);
        doc.setFont("helvetica", "normal"); 
        doc.setTextColor(item[1] === "Yes" ? 220 : 15, item[1] === "Yes" ? 38 : 23, item[1] === "Yes" ? 38 : 42);
        doc.text(item[1], M_LEFT + cardW + 30, itemY);
        
        // Column 2
        const item2 = itemsCol2[idx];
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED);
        doc.text(item2[0], M_LEFT + cardW + 48, itemY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(item2[1] === "Normal" ? 15 : 220, item2[1] === "Normal" ? 23 : 38, item2[1] === "Normal" ? 42 : 38);
        doc.text(item2[1], M_LEFT + cardW + 74, itemY);
        
        itemY += 3.5; // 4 -> 3.5
    });
    
    // User manual secondary notes cleaner
    const cleanUserNotesOnly = (text) => {
        if (!text) return "";
        const isGeneratedJargon = (line) => {
            const l = line.toLowerCase();
            const patterns = [
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
            return patterns.some(p => l.includes(p));
        };

        const lines = String(text)
            .split(/\\n+|\\s*\\|\\s*/)
            .map(line => line.trim())
            .filter(Boolean)
            .filter(line => !isGeneratedJargon(line));
        
        return lines.join(", ");
    };

    // Secondary Notes if available
    const secNotes = cleanUserNotesOnly(form.medical?.secondaryStatus);
    if (secNotes && secNotes !== "None" && secNotes.trim() !== "") {
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED);
        doc.text("Secondary Notes:", M_LEFT + cardW + 6, itemY + 1);
        doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT);
        const secNotesLines = doc.splitTextToSize(secNotes, cardW - 10);
        doc.text(secNotesLines.slice(0, 2), M_LEFT + cardW + 6, itemY + 4); // 4.5 -> 4
    }
    
    y += impressionH + 3; // 5 -> 3

    // FRESSH Lifestyle
    y = drawSectionTitle("FRESSH Lifestyle", y);
    y += 1.5; // 2 -> 1.5
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
        doc.roundedRect(fx, y, 22, 6, 1, 1, "F"); // 7 -> 6
        doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(...C_MUTED);
        doc.text(f.k, fx + 11, y + 2.5, { align: "center" }); // 3 -> 2.5
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_TEXT);
        doc.text(f.v ? \`\${String(f.v).match(/^(\\d+)/)?.[1] || 0}/10\` : "N/A", fx + 11, y + 5.5, { align: "center" }); // 6 -> 5.5
        fx += 24;
    });
    
    // Total FRESSH score pill
    doc.setFillColor(...C_BG_LIGHT);
    doc.setDrawColor(...C_BORDER); doc.setLineWidth(0.2);
    doc.roundedRect(fx, y, 42, 6, 1, 1, "FD"); // 7 -> 6
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED);
    doc.text("FRESSH Total", fx + 4, y + 4); // 4.5 -> 4
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C_ACCENT);
    doc.text(\`\${fresshTotal} / 60\`, fx + 26, y + 4);
    
    y += 8; // 12 -> 8

    // Personalized Lifestyle Recommendations
    y = drawSectionTitle("Personalized Lifestyle Recommendations", y);
    y += 1.5;
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...C_MUTED);
    doc.text("Based on your current lifestyle assessment, the following recommendations are suggested to help improve your overall health and reduce headache risk.", M_LEFT, y, { maxWidth: U_WIDTH });
    y += 6; // 8 -> 6

    const getRecommendation = (category, value) => {
        const valStr = String(value || "").toLowerCase();
        let current = value ? String(value).replace(/^\\d+\\s*-\\s*/, '') : "Not provided";
        let goal = "";
        let why = "";
        let recommended = "";
        
        if (category === "Hydration") {
            recommended = "More than 8 glasses/day";
            why = "Adequate hydration supports brain function and may help reduce headaches.";
            if (valStr.includes("<2") || valStr.includes("less than 2")) goal = "Increase by 6–8 glasses/day.";
            else if (valStr.includes("2-4") || valStr.includes("2–4") || valStr.includes("2 to 4")) goal = "Increase by 4–6 glasses/day.";
            else if (valStr.includes("4-6") || valStr.includes("4–6") || valStr.includes("4 to 6")) goal = "Increase by 2–4 glasses/day.";
            else if (valStr.includes("6-8") || valStr.includes("6–8") || valStr.includes("6 to 8")) goal = "Increase by 1–2 glasses/day.";
            else if (valStr.includes(">8") || valStr.includes("more than 8") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue your current hydration habit.";
                current = "More than 8 glasses/day";
            }
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Sleep") {
            recommended = "8–10 hours/day";
            why = "Consistent and adequate sleep is crucial for preventing headache triggers.";
            if (valStr.includes("<4") || valStr.includes("less than 4")) goal = "Increase sleep by approximately 4–6 hours/night.";
            else if (valStr.includes("4-6") || valStr.includes("4–6") || valStr.includes("4 to 6")) goal = "Increase sleep by approximately 2–4 hours/night.";
            else if (valStr.includes("6-8") || valStr.includes("6–8") || valStr.includes("6 to 8")) goal = "Increase sleep by approximately 1–2 hours/night.";
            else if (valStr.includes("8-10") || valStr.includes("8–10") || valStr.includes("8 to 10") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue maintaining your sleep schedule.";
            }
            else if (valStr.includes(">10") || valStr.includes("more than 10")) goal = "Maintain unless otherwise advised by your healthcare provider.";
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Food") {
            recommended = "Never skips meals";
            why = "Regular meals maintain stable blood sugar levels, preventing hunger-triggered headaches.";
            if (valStr.includes("most days")) goal = "Begin eating regular meals daily.";
            else if (valStr.includes("frequently")) goal = "Reduce skipped meals significantly.";
            else if (valStr.includes("occasionally")) goal = "Avoid skipping meals and aim for regular daily meals.";
            else if (valStr.includes("never") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue maintaining regular meals.";
            }
            else if (valStr.includes("skips meals")) goal = "Reduce skipped meals.";
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Relaxation") {
            recommended = "More than 30 minutes/day";
            why = "Daily relaxation helps manage stress, a major contributor to tension and migraine headaches.";
            if (valStr.includes("no relaxation")) goal = "Increase relaxation by at least 30 minutes/day.";
            else if (valStr.includes("<10") || valStr.includes("less than 10")) goal = "Increase by approximately 20–30 minutes/day.";
            else if (valStr.includes("10-20") || valStr.includes("10–20") || valStr.includes("10 to 20")) goal = "Increase by approximately 10–20 minutes/day.";
            else if (valStr.includes("20-30") || valStr.includes("20–30") || valStr.includes("20 to 30")) goal = "Increase by approximately 10 minutes/day.";
            else if (valStr.includes(">30") || valStr.includes("more than 30") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue maintaining your relaxation routine.";
            }
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Exercise") {
            recommended = "More than 2 hours/day";
            why = "Regular physical activity reduces headache frequency and intensity by improving overall health.";
            if (valStr.includes("no exercise")) goal = "Increase activity gradually toward at least 30 minutes/day.";
            else if (valStr.includes("<30") || valStr.includes("less than 30")) goal = "Increase activity by about 30–90 minutes/day.";
            else if (valStr.includes("30-60") || valStr.includes("30–60") || valStr.includes("30 to 60")) goal = "Increase activity by approximately 1–1.5 hours/day.";
            else if (valStr.includes("1-2") || valStr.includes("1–2") || valStr.includes("1 to 2")) goal = "Increase activity by approximately 30–60 minutes/day.";
            else if (valStr.includes(">2") || valStr.includes("more than 2") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue your current activity level.";
            }
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Screen time") {
            recommended = "Less than 15 minutes/day";
            why = "Reducing screen time decreases eye strain and digital fatigue, common headache triggers.";
            if (valStr.includes(">2") || valStr.includes("more than 2")) goal = "Reduce screen time by approximately 2 hours/day.";
            else if (valStr.includes("1-2") || valStr.includes("1–2") || valStr.includes("1 to 2")) goal = "Reduce by approximately 1 hour/day.";
            else if (valStr.includes("30-60") || valStr.includes("30–60") || valStr.includes("30 to 60")) goal = "Reduce by approximately 30 minutes/day.";
            else if (valStr.includes("15-30") || valStr.includes("15–30") || valStr.includes("15 to 30")) goal = "Reduce by approximately 15 minutes/day.";
            else if (valStr.includes("<15") || valStr.includes("less than 15") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue limiting your screen time.";
            }
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
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

    const recCardH = 21;
    const recColWidth = (U_WIDTH - 8) / 3;

    lifestyleRecs.forEach((rec, idx) => {
        const col = idx % 3;
        const cx = M_LEFT + col * (recColWidth + 4);
        
        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, y, recColWidth, recCardH, 1, 1, "FD"); // 1.5 -> 1

        const { current, goal } = getRecommendation(rec.cat, rec.val);
        
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_ACCENT);
        doc.text(rec.cat.toUpperCase(), cx + 2, y + 4.5);

        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED);
        doc.text(current, cx + 2, y + 8.5);
        
        const isExcellent = goal.includes("✅");
        doc.setFont("helvetica", isExcellent ? "bold" : "normal"); 
        doc.setFontSize(6.5);
        if (isExcellent) {
            doc.setTextColor(21, 128, 61);
        } else {
            doc.setTextColor(...C_TEXT);
        }
        
        let actionText = goal;
        if (!isExcellent) {
            actionText = "→ " + goal;
        }
        
        const actionLines = doc.splitTextToSize(actionText, recColWidth - 4);
        doc.text(actionLines.slice(0, 3), cx + 2, y + 13);
        
        if (col === 2 || idx === lifestyleRecs.length - 1) {
            y += recCardH + 3;
        }
    });

    // Special Notice Footer
    let footY = P_HEIGHT - 38; // 44 -> 38
    const footH = 28; // 34 -> 28
    
    // Divider before Special Notes
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.5);
    doc.line(M_LEFT, footY - 3, P_WIDTH - M_RIGHT, footY - 3); // 4 -> 3

    doc.setFillColor(...C_BG_LIGHT);
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(M_LEFT, footY, U_WIDTH, footH, 1, 1, "FD"); // 1.5 -> 1
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_MUTED);
    doc.text("SPECIAL NOTES & OBSERVATIONS", M_LEFT + 3, footY + 4);
    
    // Notes logic
    const collectSpecialNoticeFieldsOnly = (f) => {
        const notesList = [];

        // Part 8 - Treatment Summary
        const cp = f.clinicPath || {};
        if (cp.homeTreatmentReceived === "Yes") {
            const types = formatArraySmart(cp.homeTreatmentTypes);
            notesList.push(\`Home treatment: \${types} — \${cp.homeTreatmentOutcome || "No outcome"}\`);
        }
        if (cp.previousTreatmentReceived === "Yes") {
            const type = cp.previousTreatmentType || "Other";
            notesList.push(\`Previous treatment: \${type} — \${cp.previousTreatmentOutcomeNew || "No outcome"} — Cost: Rs. \${cp.previousTreatmentCost || "N/A"}\`);
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
        if (momNote) {
            notesList.push(\`Mother: \${momNote}\`);
        } else if (mother.issues?.length > 0) {
            notesList.push(\`Mother: \${mother.issues.join(", ")}\`);
        }

        const dadNote = cleanNote(father.describe);
        if (dadNote) {
            notesList.push(\`Father: \${dadNote}\`);
        } else if (father.issues?.length > 0) {
            notesList.push(\`Father: \${father.issues.join(", ")}\`);
        }

        siblings.forEach((sib, idx) => {
            const sibNote = cleanNote(sib.describe);
            if (sibNote) {
                notesList.push(\`Sibling \${idx + 1}: \${sibNote}\`);
            } else if (sib.issues?.length > 0) {
                notesList.push(\`Sibling \${idx + 1}: \${sib.issues.join(", ")}\`);
            }
        });

        // Other parent illness details / development describe / perinatal describe / special notes
        const dev = f.development || {};
        const grossNote = cleanNote(dev.grossMotorDescribe);
        if (grossNote) notesList.push(\`Development (Gross Motor): \${grossNote}\`);
        
        const fineNote = cleanNote(dev.fineMotorDescribe);
        if (fineNote) notesList.push(\`Development (Fine Motor): \${fineNote}\`);

        const speechNote = cleanNote(dev.speechDescribe);
        if (speechNote) notesList.push(\`Development (Speech): \${speechNote}\`);

        const devOther = cleanNote(dev.other);
        if (devOther) notesList.push(\`Development (Other): \${devOther}\`);

        const peri = f.perinatal || {};
        const periOther = cleanNote(peri.other);
        if (periOther) notesList.push(\`Perinatal: \${periOther}\`);

        const history = f.history || {};
        const reliefOther = cleanNote(history.reliefOther);
        if (reliefOther) notesList.push(\`Other Relief Notes: \${reliefOther}\`);

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
        lines.slice(0, 6).forEach(l => { // 7 -> 6
            doc.text(l, M_LEFT + 3, noteY);
            noteY += 3.2;
        });
    }

    doc.save(\`BeatHeadache-Patient-Summary-\${sanitizeText(p.registrationCode) !== "Not provided" ? p.registrationCode : "Report"}.pdf\`);
}
\`;

const newCode = code.substring(0, startIndex) + optimizedFunction + "\\n" + code.substring(endIndex);
fs.writeFileSync(path, newCode, 'utf8');
console.log('Update complete.');
