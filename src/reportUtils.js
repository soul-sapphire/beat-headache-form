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
    y = MARGIN_TOP;
    
    const p = form.patient || {};
    const h = form.history || {};
    const t = form.time || {};
    const diag = getSuggestedDiagnosisSummary(form);
    const redFlags = getRedFlagSummary(form);

    // Header
    addHeader(doc, "Patient Summary", "Parent/Patient View", p.registrationCode);

    // 1. Patient Details
    addSectionTitle(doc, "1. Patient Details");
    addKeyValueTable(doc, [
        ["Name", `${sanitizeText(p.firstName)} ${sanitizeText(p.lastName)}`],
        ["Age / Gender", `${sanitizeText(p.age)} / ${sanitizeText(p.gender)}`],
        ["Registration Code", sanitizeText(p.registrationCode)],
        ["Contact", sanitizeText(p.phone)],
        ["WhatsApp / Email", `${sanitizeText(p.whatsapp)} / ${sanitizeText(p.email)}`],
        ["Report Date", formatDate(form.meta?.reportGeneratedAt)],
        ["Form Version", sanitizeText(form.meta?.formVersion)]
    ]);

    // 2. Why This Report Was Created
    addSectionTitle(doc, "2. Purpose of this Report");
    addParagraph(doc, "This report summarizes the answers entered in the Beat Headache form. It is designed to help your family understand the headache pattern and prepare for the consultation with your doctor.");

    // 3. Headache Pattern Summary
    addSectionTitle(doc, "3. Headache Pattern Summary");
    addKeyValueTable(doc, [
        ["Headache confirmed", sanitizeText(form.headache?.confirmed)],
        ["Common location", sanitizeText(h.location)],
        ["Side", `Frontal: ${sanitizeText(h.frontalSide)}, Temporal: ${sanitizeText(h.temporalSide)}`],
        ["Type of pain", sanitizeText(h.painNature)],
        ["Usual Severity", sanitizeText(t.headache?.severity)],
        ["Typical Duration", sanitizeText(t.headache?.duration)],
        ["Frequency (Last 4 wks)", `${sanitizeText(h.headacheDaysLastFourWeeks)} days`],
        ["Time of day", sanitizeText(h.timeOfDay)],
        ["Worsened by", sanitizeText(h.aggravating)],
        ["Relieved by", sanitizeText(h.relief)],
        ["Associated symptoms", sanitizeText(h.associated)]
    ]);

    // 4. Possible Headache Type
    addSectionTitle(doc, "4. Likely Headache Category");
    addParagraph(doc, `Based on the form answers, the headache pattern shows features of: ${diag.likelyType}.`, { fontStyle: "bold" });
    addParagraph(doc, diag.explanation);
    addParagraph(doc, "IMPORTANT: This is not a final diagnosis. Only a qualified doctor can confirm the diagnosis after a full physical examination and review of all clinical factors.", { color: COLOR_WARNING, fontStyle: "bold" });

    // 5. Important Warning Signs
    addSectionTitle(doc, "5. Important Warning Signs");
    if (redFlags.length > 0) {
        addParagraph(doc, "The following warning signs were identified from the form answers. Please ensure you discuss these with your doctor as they may require further tests:", { color: COLOR_WARNING, fontStyle: "bold" });
        addBulletList(doc, redFlags, { color: COLOR_WARNING });
    } else {
        addParagraph(doc, "Major warning signs (red flags) were not selected in this form.", { color: [5, 150, 105] });
    }

    // 6. Lifestyle / FRESSH Summary
    addSectionTitle(doc, "6. Lifestyle Summary (FRESSH)");
    addParagraph(doc, `Your child's total FRESSH score is ${fresshTotal} / 60. This is considered a "${getFresshInterpretation(fresshTotal)}".`);
    
    const fresshRows = Object.entries(form.fressh || {}).filter(([k]) => !k.includes(".extra")).map(([k, v]) => [k, v]);
    addKeyValueTable(doc, fresshRows);
    
    addParagraph(doc, "Lower scores show areas that may need attention. Lifestyle changes (Food, Relaxation, Exercise, Sleep, Screen time, Hydration) can often help reduce the frequency of headaches and should be discussed with the doctor.");

    // 7. What To Discuss With The Doctor
    addSectionTitle(doc, "7. Topics to Discuss with the Doctor");
    const discussionPoints = [
        "The frequency and severity of headaches recorded in this report.",
        "Any warning signs mentioned in Section 5.",
        "Aura symptoms (like vision changes) if your child experiences them.",
        "How much medicine is being used each week.",
        "How headaches are affecting school attendance and daily activities.",
        "Lifestyle habits related to sleep, meals, hydration, and screen time."
    ];
    addBulletList(doc, discussionPoints);

    // 8. Safety Note
    addSectionTitle(doc, "8. Safety Disclaimer");
    addParagraph(doc, "This report is a summary of answers provided in an intake form. It is NOT a diagnosis, prescription, or medical advice. A qualified clinician must review this data, perform a physical examination, and provide a definitive diagnosis and treatment plan.", { fontStyle: "bold" });

    // Finalize footers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(doc, i);
    }

    doc.save(`BeatHeadache-Patient-Summary-${p.registrationCode || p.firstName || "Report"}.pdf`);
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
