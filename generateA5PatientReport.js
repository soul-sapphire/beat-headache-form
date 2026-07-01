export function generatePatientReportPdf(form, fresshTotal) {
    const doc = new jsPDF({ format: "a5" });
    
    // --- Layout Constants (A5 Scaled) ---
    const M_LEFT = 7;
    const M_RIGHT = 7;
    const M_TOP = 7;
    const M_BOTTOM = 7;
    const P_WIDTH = 148;
    const P_HEIGHT = 210;
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
        if (!s || s === "Not provided") return { p: "-", c: "-" };
        const pMatch = s.match(/P\s*[:\[\s]*(\d+)/i);
        const cMatch = s.match(/C\s*[:\[\s]*(\d+)/i);
        let p = pMatch ? pMatch[1] : "";
        let c = cMatch ? cMatch[1] : "";
        if (!p && !c && /^\d+$/.test(s)) p = s;
        return { p: p || "-", c: c || "-" };
    };

    // Helper: draw Header
    const drawHeader = () => {
        doc.setFillColor(...C_BG_LIGHT);
        doc.rect(0, 0, P_WIDTH, 13, "F"); 
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...C_TEXT);
        doc.text("Beat Headache", M_LEFT, 7); 
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C_MUTED);
        doc.text("Patient Summary", M_LEFT, 11); 
        
        doc.setFontSize(6.5);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, P_WIDTH - M_RIGHT, 11, { align: "right" });
        
        y = 15; 
    };
    
    // Helper: draw field box
    const drawFieldBox = (label, value, bx, by, bw, bh) => {
        doc.setFillColor(...C_WHITE);
        doc.setDrawColor(...C_BORDER);
        doc.setLineWidth(0.2);
        doc.roundedRect(bx, by, bw, bh, 0.7, 0.7, "FD"); 
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.5);
        doc.setTextColor(...C_MUTED);
        doc.text(label, bx + 1.5, by + 2); 
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        doc.setTextColor(...C_TEXT);
        doc.text(truncateSmart(value, bw / 1), bx + 1.5, by + 4.5); 
    };

    const drawSectionTitle = (title, sy) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), M_LEFT, sy);
        return sy + 2; 
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
    const bw = (U_WIDTH - 4) / 3;
    drawFieldBox("Patient ID", p.registrationCode || "N/A", M_LEFT, y, bw, 6.5); 
    drawFieldBox("Age / Gender", `${p.age || "N/A"} / ${p.gender || "N/A"}`, M_LEFT + bw + 2, y, bw, 6.5);
    drawFieldBox("Ethnicity", p.ethnicity || "N/A", M_LEFT + bw*2 + 4, y, bw, 6.5);
    y += 7.5; 
    drawFieldBox("Referral", form.referral?.source || "N/A", M_LEFT, y, bw, 6.5);
    drawFieldBox("Visit Type", form.clinicPath?.initiatedBy || "N/A", M_LEFT + bw + 2, y, bw, 6.5);
    drawFieldBox("Previous Diagnosis", form.clinicPath?.previousDiagnosis || "N/A", M_LEFT + bw*2 + 4, y, bw, 6.5);
    y += 8.5; 

    // Pregnancy / Birth / Family
    const parityObj = parseParity(b.parity);
    let pVal = peri.pregnancyNumber;
    let cVal = peri.childNumber;
    if (pVal === undefined || pVal === null || pVal === "") pVal = parityObj.p;
    if (cVal === undefined || cVal === null || cVal === "") cVal = parityObj.c;
    const pStr = pVal === "-" ? "-" : String(pVal);
    const cStr = cVal === "-" ? "-" : String(cVal);
    
    const mother = familyRows[0] || {};
    const father = familyRows[1] || {};
    const siblings = familyRows.slice(2).filter(s => s && s.age);
    const sibDetails = siblings.map(s => `${s.relation || "Sib"} ${s.age}y`).join(", ") || "None";
    
    y = drawSectionTitle("Pregnancy, Birth & Family Background", y);
    y += 1; 
    doc.setFontSize(5);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Pregnancy/Parity", M_LEFT, y);
    doc.text("P [", M_LEFT + 18, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(pStr, M_LEFT + 21, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("]   C [", M_LEFT + 23, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(cStr, M_LEFT + 28, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("]", M_LEFT + 30, y);
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Mother", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); 
    doc.text(truncateSmart(`${mother.age || "?"}y, ${mother.issues?.length ? mother.issues.join(",") : "None"}`, 45), M_LEFT + U_WIDTH / 2 + 18, y);
    y += 2.5; 
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Gestation", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(`${b.gestation || "-"} wks`, 25), M_LEFT + 18, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Father", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); 
    doc.text(truncateSmart(`${father.age || "?"}y, ${father.issues?.length ? father.issues.join(",") : "None"}`, 45), M_LEFT + U_WIDTH / 2 + 18, y);
    y += 2.5;
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Birth Method", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(b.delivery || "-", 25), M_LEFT + 18, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Siblings", M_LEFT + U_WIDTH / 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(sibDetails, 45), M_LEFT + U_WIDTH / 2 + 18, y);
    y += 2.5;
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED); doc.text("Consanguinity", M_LEFT, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT); doc.text(truncateSmart(b.consanguinity || "-", 25), M_LEFT + 18, y);
    y += 3; 

    // Childhood / Neonatal (Soft Card)
    doc.setFillColor(...C_CYAN);
    doc.roundedRect(M_LEFT, y, U_WIDTH, 8.5, 0.7, 0.7, "F"); 
    doc.setFont("helvetica", "bold"); doc.setFontSize(5); doc.setTextColor(...C_ACCENT);
    doc.text("Childhood / Neonatal Notes:", M_LEFT + 1.5, y + 3); 
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT);
    doc.text(truncateSmart(`Complications: ${peri.complications || "None"} | PBU Stay: ${peri.pbuStay === "Y" ? peri.pbuDays + " days" : "No"} | Notes: ${peri.other || "None"}`, 120), M_LEFT + 25, y + 3);
    doc.text(truncateSmart(`Early Childhood Illnesses: ${med.pastMedical || "None recorded"}`, 150), M_LEFT + 1.5, y + 6.5); 
    y += 10; 

    // Past Medical + Development Cards
    const drawCard = (cx, cy, cw, title, lines) => {
        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, cy, cw, 13.5, 0.7, 0.7, "FD"); 
        doc.setFont("helvetica", "bold"); doc.setFontSize(5); doc.setTextColor(...C_ACCENT);
        doc.text(title.toUpperCase(), cx + 1.5, cy + 3); 
        
        let ly = cy + 5.5; 
        lines.forEach(l => {
            if(!l) return;
            doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_MUTED); 
            doc.text(l[0], cx + 1.5, ly);
            
            doc.setFont("helvetica", "normal"); doc.setFontSize(4.5); doc.setTextColor(...C_TEXT);
            const val = cleanPatientSummaryText(l[1]);
            const splitVal = doc.splitTextToSize(val, cw - 19);
            doc.text(splitVal[0] || "", cx + 18, ly);
            ly += 2.5; 
        });
    };
    
    const cardW = U_WIDTH / 2 - 1.5;
    drawCard(M_LEFT, y, cardW, "Past Medical Issues", [
        ["Medical", med.pastMedical || "None"],
        ["Surgical", med.pastSurgical || "None"],
        ["Medications", med.drugHistory || "None"]
    ]);
    drawCard(M_LEFT + cardW + 3, y, cardW, "Development", [
        ["Gross Motor", dev.grossMotorIssue === "Yes" ? dev.grossMotorDescribe : "Normal"],
        ["Fine Motor", dev.fineMotorIssue === "Yes" ? dev.fineMotorDescribe : "Normal"],
        ["Speech", dev.speechIssue === "Yes" ? dev.speechDescribe : "Normal"]
    ]);
    y += 15; 

    // ----------------------------------------------------
    // USER REFINEMENT #1: Increase top spacing before HEADACHE FEATURES by ~6-8mm
    // ----------------------------------------------------
    y += 5; // Extra breathing room before Headache Features

    // Headache Features (Full Width Card, Spacious 2 Columns)
    y = drawSectionTitle("Headache Features", y);
    y += 1; 
    
    const hCardHeight = 23.5; 
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, U_WIDTH, hCardHeight, 0.7, 0.7, "FD"); 
    
    const colW = (U_WIDTH - 4) / 2;
    
    // Draw feature block helper to wrap text and prevent overflow
    const drawFeatureBlock = (label, value, fx, fy, fw, fh) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.5);
        doc.setTextColor(...C_MUTED);
        doc.text(label, fx, fy);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5);
        doc.setTextColor(...C_TEXT);
        
        const lines = doc.splitTextToSize(cleanPatientSummaryText(value), fw);
        const maxLines = Math.floor(fh / 2.3);
        doc.text(lines.slice(0, maxLines), fx, fy + 1.8); 
    };

    // Column 1
    drawFeatureBlock("HISTORY & PATTERN", `${h.durationYears || 0}y ${h.durationMonths || 0}m | ${h.pattern || "N/A"}`, M_LEFT + 2, y + 3, colW - 4, 4.5); 
    drawFeatureBlock("LOCATION & SIDE", formatArraySmart(h.location, 3) + (h.frontalSide ? ` (Frontal: ${h.frontalSide})` : "") + (h.temporalSide ? ` (Temporal: ${h.temporalSide})` : ""), M_LEFT + 2, y + 8, colW - 4, 4.5); 
    drawFeatureBlock("PAIN CHARACTER", formatArraySmart(h.painNature, 3), M_LEFT + 2, y + 13.5, colW - 4, 4.5); 
    drawFeatureBlock("ASSOCIATED SYMPTOMS", formatArraySmart(h.associated, 6), M_LEFT + 2, y + 19, colW - 4, 5.5); 

    // Column 2
    drawFeatureBlock("SEVERITY & DURATION", `${t.headache?.severity || "N/A"} | ${t.headache?.duration || "N/A"}`, M_LEFT + colW + 2, y + 3, colW - 4, 4.5);
    drawFeatureBlock("FREQUENCY", `${h.headacheDaysLastFourWeeks || 0} days / 4 wks | Meds: ${h.medicineDaysLastFourWeeks || 0} days`, M_LEFT + colW + 2, y + 8, colW - 4, 4.5);
    drawFeatureBlock("AURA & PRODROME", `Aura: ${t.aura?.hasAura === "Yes" ? formatArraySmart(t.aura.symptoms, 2) : "No"} | Prod: ${t.prodromal?.hasProdromal === "Yes" ? "Yes" : "No"} | Post: ${t.postdrome?.hasPostdrome === "Yes" ? "Yes" : "No"}`, M_LEFT + colW + 2, y + 13.5, colW - 4, 4.5);
    drawFeatureBlock("TRIGGERS & RELIEF", `Trig: ${formatArraySmart(h.aggravating, 3)} | Rel: ${formatArraySmart(h.relief, 3)}`, M_LEFT + colW + 2, y + 19, colW - 4, 5.5);

    y += hCardHeight + 2; 

    // ----------------------------------------------------
    // USER REFINEMENT #2: Lower the clinical summary block by ~5mm
    // ----------------------------------------------------
    y += 3.5; 

    // Primary & Secondary Headache Sections Side-by-Side
    const impressionH = 32.5; 
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT, y, cardW, impressionH, 0.7, 0.7, "FD"); 
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_ACCENT);
    doc.text("PRIMARY HEADACHE IMPRESSION", M_LEFT + 1.5, y + 3); 
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(5); doc.setTextColor(...C_MUTED); doc.text("Suggested Category:", M_LEFT + 1.5, y + 6); 
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_TEXT);
    const likelyLines = doc.splitTextToSize(cleanPatientSummaryText(diag.likelyType), cardW - 3);
    doc.text(likelyLines.slice(0, 2), M_LEFT + 1.5, y + 9); 
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(5); doc.setTextColor(...C_MUTED); doc.text("Classification Status:", M_LEFT + 1.5, y + 13.5); 
    const diagData = form.diagnosis || {};
    const primaryItems = [
        ["Migraine (No Aura)", cleanPatientSummaryText(diagData["migraineNoAura.status"])],
        ["Migraine (With Aura)", cleanPatientSummaryText(diagData["migraineAura.status"])],
        ["Tension-Type HA", cleanPatientSummaryText(diagData["tension.status"])],
        ["Cluster HA", cleanPatientSummaryText(diagData["cluster.status"])]
    ];
    let primY = y + 16; 
    primaryItems.forEach(item => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_MUTED);
        doc.text(item[0], M_LEFT + 1.5, primY);
        doc.setFont("helvetica", "normal"); doc.setFontSize(4.5); doc.setTextColor(...C_TEXT);
        doc.text(item[1], M_LEFT + 28, primY);
        primY += 2.5; 
    });
    
    // Supporting clinical features
    const features = [
        ...(diagData.migraineNoAuraCharacteristics || []),
        ...(diagData.tensionCharacteristics || []),
        ...(diagData.clusterSymptoms || [])
    ].filter(Boolean);
    const uniqFeatures = [...new Set(features)].map(cleanPatientSummaryText).filter(x => x !== "None");
    if (uniqFeatures.length > 0) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_MUTED);
        doc.text("Supporting Features:", M_LEFT + 1.5, primY + 1);
        doc.setFont("helvetica", "normal"); doc.setFontSize(4.5); doc.setTextColor(...C_TEXT);
        const featText = uniqFeatures.join(", ");
        const featLines = doc.splitTextToSize(featText, cardW - 3);
        doc.text(featLines.slice(0, 2), M_LEFT + 1.5, primY + 3); 
    }
    
    // Card B: Secondary Headache Screen & Red Flags
    doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
    doc.roundedRect(M_LEFT + cardW + 3, y, cardW, impressionH, 0.7, 0.7, "FD"); 
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
    doc.setTextColor(...C_ACCENT);
    doc.text("RED FLAGS & SECONDARY SCREEN", M_LEFT + cardW + 4.5, y + 3); 
    
    // Red Flags as chips/boxes
    let rfY = y + 5.5; 
    let rfX = M_LEFT + cardW + 4.5;
    if (redFlags.length > 0) {
        doc.setFontSize(4.5);
        redFlags.forEach((flag, idx) => {
            const flagText = cleanPatientSummaryText(flag);
            const txtWidth = doc.getTextWidth(flagText);
            const chipW = txtWidth + 3;
            
            if (rfX + chipW > M_LEFT + cardW * 2 + 3) {
                rfX = M_LEFT + cardW + 4.5;
                rfY += 3.5; 
            }
            
            if (rfY < y + 14.5) { 
                doc.setFillColor(254, 226, 226);
                doc.setDrawColor(248, 113, 113);
                doc.roundedRect(rfX, rfY, chipW, 2.5, 0.7, 0.7, "FD"); 
                doc.setTextColor(153, 27, 27);
                doc.text(flagText, rfX + 1.5, rfY + 1.8); 
                rfX += chipW + 1.5;
            }
        });
    } else {
        doc.setFillColor(220, 252, 231);
        doc.setDrawColor(74, 222, 128);
        doc.roundedRect(rfX, rfY, 18, 2.5, 0.7, 0.7, "FD");
        doc.setTextColor(21, 128, 61);
        doc.text("None reported", rfX + 1.5, rfY + 1.8);
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
    doc.setFontSize(4.5);
    itemsCol1.forEach((item, idx) => {
        // Column 1
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED);
        doc.text(item[0], M_LEFT + cardW + 4.5, itemY);
        doc.setFont("helvetica", "normal"); 
        doc.setTextColor(item[1] === "Yes" ? 220 : 15, item[1] === "Yes" ? 38 : 23, item[1] === "Yes" ? 38 : 42);
        doc.text(item[1], M_LEFT + cardW + 21, itemY);
        
        // Column 2
        const item2 = itemsCol2[idx];
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C_MUTED);
        doc.text(item2[0], M_LEFT + cardW + 34, itemY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(item2[1] === "Normal" ? 15 : 220, item2[1] === "Normal" ? 23 : 38, item2[1] === "Normal" ? 42 : 38);
        doc.text(item2[1], M_LEFT + cardW + 52, itemY);
        
        itemY += 2.5; 
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
        doc.text("Secondary Notes:", M_LEFT + cardW + 4.5, itemY + 1);
        doc.setFont("helvetica", "normal"); doc.setTextColor(...C_TEXT);
        const secNotesLines = doc.splitTextToSize(secNotes, cardW - 7);
        doc.text(secNotesLines.slice(0, 2), M_LEFT + cardW + 4.5, itemY + 3); 
    }
    
    y += impressionH + 2; 

    // FRESSH Lifestyle
    y = drawSectionTitle("FRESSH Lifestyle", y);
    y += 1; 
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
        doc.roundedRect(fx, y, 15.5, 4.2, 0.7, 0.7, "F"); 
        doc.setFont("helvetica", "bold"); doc.setFontSize(4); doc.setTextColor(...C_MUTED);
        doc.text(f.k, fx + 7.75, y + 1.8, { align: "center" }); 
        doc.setFont("helvetica", "bold"); doc.setFontSize(5); doc.setTextColor(...C_TEXT);
        doc.text(f.v ? `${String(f.v).match(/^(\d+)/)?.[1] || 0}/10` : "N/A", fx + 7.75, y + 3.8, { align: "center" }); 
        fx += 17;
    });
    
    // Total FRESSH score pill
    doc.setFillColor(...C_BG_LIGHT);
    doc.setDrawColor(...C_BORDER); doc.setLineWidth(0.2);
    doc.roundedRect(fx, y, 30, 4.2, 0.7, 0.7, "FD"); 
    doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_MUTED);
    doc.text("FRESSH Total", fx + 3, y + 2.8); 
    doc.setFont("helvetica", "bold"); doc.setFontSize(5.5); doc.setTextColor(...C_ACCENT);
    doc.text(`${fresshTotal} / 60`, fx + 18, y + 2.8);
    
    y += 8.5; 

    // Personalized Lifestyle Recommendations
    y = drawSectionTitle("Personalized Lifestyle Recommendations", y);
    y += 1;
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(...C_MUTED);
    doc.text("Based on your current lifestyle assessment, the following recommendations are suggested to help improve your overall health and reduce headache risk.", M_LEFT, y, { maxWidth: U_WIDTH });
    y += 4.5; 

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
            else if (valStr.includes("2-4") || valStr.includes("2-4") || valStr.includes("2 to 4")) goal = "Increase by 4-6 glasses/day.";
            else if (valStr.includes("4-6") || valStr.includes("4-6") || valStr.includes("4 to 6")) goal = "Increase by 2-4 glasses/day.";
            else if (valStr.includes("6-8") || valStr.includes("6-8") || valStr.includes("6 to 8")) goal = "Increase by 1-2 glasses/day.";
            else if (valStr.includes(">8") || valStr.includes("more than 8") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue your current hydration habit.";
                current = "More than 8 glasses/day";
            }
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Sleep") {
            recommended = "8-10 hours/day";
            why = "Consistent and adequate sleep is crucial for preventing headache triggers.";
            if (valStr.includes("<4") || valStr.includes("less than 4")) goal = "Increase sleep by approximately 4-6 hours/night.";
            else if (valStr.includes("4-6") || valStr.includes("4-6") || valStr.includes("4 to 6")) goal = "Increase sleep by approximately 2-4 hours/night.";
            else if (valStr.includes("6-8") || valStr.includes("6-8") || valStr.includes("6 to 8")) goal = "Increase sleep by approximately 1-2 hours/night.";
            else if (valStr.includes("8-10") || valStr.includes("8-10") || valStr.includes("8 to 10") || valStr.match(/^10/)) {
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
            else if (valStr.includes("10-20") || valStr.includes("10-20") || valStr.includes("10 to 20")) goal = "Increase by approximately 10-20 minutes/day.";
            else if (valStr.includes("20-30") || valStr.includes("20-30") || valStr.includes("20 to 30")) goal = "Increase by approximately 10 minutes/day.";
            else if (valStr.includes(">30") || valStr.includes("more than 30") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue maintaining your relaxation routine.";
            }
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Exercise") {
            recommended = "More than 2 hours/day";
            why = "Regular physical activity reduces headache frequency and intensity by improving overall health.";
            if (valStr.includes("no exercise")) goal = "Increase activity gradually toward at least 30 minutes/day.";
            else if (valStr.includes("<30") || valStr.includes("less than 30")) goal = "Increase activity by about 30-90 minutes/day.";
            else if (valStr.includes("30-60") || valStr.includes("30-60") || valStr.includes("30 to 60")) goal = "Increase activity by approximately 1-1.5 hours/day.";
            else if (valStr.includes("1-2") || valStr.includes("1-2") || valStr.includes("1 to 2")) goal = "Increase activity by approximately 30-60 minutes/day.";
            else if (valStr.includes(">2") || valStr.includes("more than 2") || valStr.match(/^10/)) {
                goal = "[OK] Excellent! Continue your current activity level.";
            }
            else goal = "[OK] Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Screen time") {
            recommended = "Less than 15 minutes/day";
            why = "Reducing screen time decreases eye strain and digital fatigue, common headache triggers.";
            if (valStr.includes(">2") || valStr.includes("more than 2")) goal = "Reduce screen time by approximately 2 hours/day.";
            else if (valStr.includes("1-2") || valStr.includes("1-2") || valStr.includes("1 to 2")) goal = "Reduce by approximately 1 hour/day.";
            else if (valStr.includes("30-60") || valStr.includes("30-60") || valStr.includes("30 to 60")) goal = "Reduce by approximately 30 minutes/day.";
            else if (valStr.includes("15-30") || valStr.includes("15-30") || valStr.includes("15 to 30")) goal = "Reduce by approximately 15 minutes/day.";
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

    const recCardH = 12; 
    const recColWidth = (U_WIDTH - 6) / 3;

    lifestyleRecs.forEach((rec, idx) => {
        const col = idx % 3;
        const cx = M_LEFT + col * (recColWidth + 3);
        
        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, y, recColWidth, recCardH, 0.7, 0.7, "FD");

        const { current, goal } = getRecommendation(rec.cat, rec.val);
        
        doc.setFont("helvetica", "bold"); doc.setFontSize(5); doc.setTextColor(...C_ACCENT);
        doc.text(rec.cat.toUpperCase(), cx + 1.5, y + 2.5); 

        doc.setFont("helvetica", "bold"); doc.setFontSize(4.5); doc.setTextColor(...C_MUTED);
        doc.text(current, cx + 1.5, y + 5.5); 
        
        const isExcellent = goal.includes("[OK]");
        let displayGoal = goal;
        
        if (isExcellent) {
            displayGoal = goal.replace("[OK] ", "");
        }
        
        doc.setFont("helvetica", isExcellent ? "bold" : "normal"); 
        doc.setFontSize(4.5);
        if (isExcellent) {
            doc.setTextColor(21, 128, 61);
        } else {
            doc.setTextColor(...C_TEXT);
        }
        
        let actionText = displayGoal;
        if (!isExcellent) {
            actionText = "> " + displayGoal;
        }
        
        const actionLines = doc.splitTextToSize(actionText, recColWidth - 3);
        doc.text(actionLines.slice(0, 3), cx + 1.5, y + 8.5); 
        
        if (col === 2 || idx === lifestyleRecs.length - 1) {
            y += recCardH + 2;
        }
    });

    // Special Notice Footer - Dynamic Height
    y += 1.5; 

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
    const allNotes = notesList.join(" | ");
    
    // Determine required height for Special Notes
    doc.setFont("helvetica", "normal");
    doc.setFontSize(4.5);
    let noteLines = [];
    if (notesList.length === 0) {
        noteLines = ["No additional special notes recorded."];
    } else {
        noteLines = doc.splitTextToSize(allNotes, U_WIDTH - 4).slice(0, 6);
    }
    
    const footH = 4 + (noteLines.length * 2.3); 
    
    let footY = P_HEIGHT - M_BOTTOM - footH - 2; 

    // Divider before Special Notes
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.3);
    doc.line(M_LEFT, footY - 2, P_WIDTH - M_RIGHT, footY - 2); 

    doc.setFillColor(...C_BG_LIGHT);
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.2);
    doc.roundedRect(M_LEFT, footY, U_WIDTH, footH, 0.7, 0.7, "FD"); 
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(...C_MUTED);
    doc.text("SPECIAL NOTES & OBSERVATIONS", M_LEFT + 2, footY + 3); 
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(4.5);
    doc.setTextColor(...C_TEXT);
    
    let noteY = footY + 5.5; 
    noteLines.forEach(l => {
        doc.text(l, M_LEFT + 2, noteY);
        noteY += 2.3;
    });

    doc.save(`BeatHeadache-Patient-Summary-${sanitizeText(p.registrationCode) !== "Not provided" ? p.registrationCode : "Report"}.pdf`);
}
