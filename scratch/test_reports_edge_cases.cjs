/**
 * test_reports_edge_cases.cjs
 * ----------------------------
 * Edge-case test runner for Phase 6 Responsive Layout & QR Validation.
 */

const { generatePatientReportPdf } = require('../src/reports/patientSummaryReport.js');
const { generateDoctorReportPdf } = require('../src/reports/doctorClinicalReport.js');
const { renderQrCode } = require('../src/reports/qrRenderer.js');

console.log("=== STARTING PHASE 6 REPORT EDGE-CASE TEST SUITE ===");

// Mock jsPDF save method for Node environment testing
const jsPDFPackage = require('jspdf');
const jsPDF = jsPDFPackage.jsPDF || jsPDFPackage;
const originalSave = jsPDF.prototype.save;
jsPDF.prototype.save = function(filename) {
    console.log(`  [PDF Generated & Saved: ${filename}]`);
    return this;
};

const sampleMinimalForm = {
    patient: { registrationCode: "BH-101", age: 10, gender: "Female" }
};

const sampleExtremeForm = {
    patient: {
        registrationCode: "BH-99999999999999999999",
        age: 12,
        gender: "Male",
        ethnicity: "Sinhalese / Extremely Long Ethnicity Field Entry Test String That Should Truncate Gracefully",
        dob: "2014-05-12",
        qrToken: "https://beatheadache.org/verify/encounter/99999999999999999999?token=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    },
    birth: { gestation: 38, delivery: "Normal Vaginal Delivery", consanguinity: "No", parity: "P[3] C[3]" },
    perinatal: { complications: "Extremely long neonatal history notes describing mild hyperbilirubinemia, phototherapy for 3 days, NICU admission, transient tachypnea of the newborn, and prolonged jaundice monitoring.", pbuStay: "Y", pbuDays: 5, other: "Detailed developmental assessment normal" },
    history: {
        durationYears: 2,
        durationMonths: 6,
        pattern: "Episodic with increasing frequency over past 6 months",
        location: ["Frontal (Bilateral)", "Temporal (Left)", "Occipital", "Vertex", "Retro-orbital"],
        painNature: ["Pulsating / Throbbing", "Pressing / Tightening", "Stabbing", "Explosive"],
        associated: ["Nausea", "Vomiting", "Photophobia", "Phonophobia", "Dizziness", "Osmophobia", "Neck stiffness", "Allodynia"],
        aggravating: ["Stress", "Lack of sleep", "Bright sunlight", "Physical exertion", "Skipped meals", "Screen time", "Dehydration", "Noise"],
        relief: ["Rest in dark room", "Sleep", "Paracetamol", "Ibuprofen", "Cold compress", "Hydration", "Quiet environment"],
        medicineType: ["Paracetamol 500mg", "Ibuprofen 400mg", "Domperidone 10mg", "Sumatriptan 50mg", "Flunarizine 5mg"],
        headacheDaysLastFourWeeks: 18,
        medicineDaysLastFourWeeks: 14
    },
    time: {
        headache: { severity: "Severe (8/10)", duration: "4-12 hours per attack" },
        aura: { hasAura: "Yes", symptoms: ["Visual scotoma", "Zigzag lines", "Paresthesia in left arm", "Dysphasic speech disturbance"] },
        prodromal: { hasProdromal: "Yes" },
        postdrome: { hasPostdrome: "Yes" }
    },
    medical: {
        pastMedical: "Asthma, Allergic rhinitis, Recurrent otitis media in early childhood, Eczema",
        pastSurgical: "Tonsillectomy & Adenoidectomy (2021), Appendectomy (2023)",
        drugHistory: "Salbutamol inhaler PRN, Cetirizine 5mg daily, Fluticasone nasal spray",
        allergies: "Yes",
        allergySpecify: "Penicillin (rash), Peanuts (anaphylaxis concern), NSAIDs (mild gastric irritation)",
        secondaryStatus: "Possible ENT sinus involvement noted during winter months; dental checkup recommended for TMJ discomfort."
    },
    development: {
        grossMotorIssue: "Yes", grossMotorDescribe: "Mild delay in walking (18 months), currently fully mobile",
        fineMotorIssue: "No", fineMotorDescribe: "Normal pencil grip and buttoning",
        speechIssue: "No", speechDescribe: "Fluent in two languages"
    },
    examination: {
        height: 145, weight: 38, bmi: 18.1, ofc: 52,
        bpSystolic: 110, bpDiastolic: 70, heartRate: 82,
        Papilloedema: "No", crNvPalsy: "None", Gait: "Normal",
        "Eye Movement": "Normal", "Tenderness over Sinus": "Mild frontal sinus tenderness", Teeth: "Normal occlusion"
    },
    fressh: {
        "Food Intake Pattern": "1 - Skips meals frequently due to school schedule",
        "Relaxation": "0 - No relaxation or stress management routine",
        "Exercise": "1 - Less than 30 minutes per week",
        "Sleep": "1 - 4-6 hours per night (irregular schedule)",
        "Screen time": "0 - More than 4 hours daily (gaming + phone)",
        "Hydration": "1 - 2-3 glasses of water daily",
        waterGlassesScore: 1, relaxScore: 0, mealsScore: 1, sleepScore: 1, screenTimeScore: 0, exerciseScore: 1
    },
    diagnosis: {
        "migraineNoAura.status": "Full criteria met",
        "migraineAura.status": "Criteria met",
        "tension.status": "Partial criteria",
        "cluster.status": "Not met",
        migraineNoAuraCharacteristics: ["Pulsating quality", "Unilateral / Frontal location", "Moderate-to-severe intensity", "Aggravated by routine physical activity"],
        migraineNoAuraAssociated: ["Nausea and/or vomiting", "Photophobia and phonophobia"]
    },
    impact: {
        schoolAbsentDaysLastFourWeeks: 6,
        activityLimitedDaysLastFourWeeks: 10,
        parentLostWork: "Yes",
        parentLostWorkDays: 3
    },
    yesterday: {
        hadHeadacheYesterday: "Yes",
        severity: "Moderate (6/10)"
    },
    familyRows: [
        { age: 42, issues: ["Migraine with aura", "Hypertension", "Hypothyroidism"], describe: "History of frequent severe headaches since adolescence." },
        { age: 45, issues: ["Tension headache", "Hypercholesterolemia"], describe: "Occasional stress headaches." },
        { relation: "Brother", age: 14, issues: ["Asthma"] },
        { relation: "Sister", age: 8, issues: ["Motion sickness"] }
    ]
};

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ PASS: ${name}`);
        testsPassed++;
    } catch (e) {
        console.error(`✗ FAIL: ${name}`, e);
        testsFailed++;
    }
}

// 1. Patient Summary - Minimal Data
runTest("Patient Summary Report - Minimal Data", () => {
    generatePatientReportPdf(sampleMinimalForm, 15);
});

// 2. Patient Summary - Extreme Data
runTest("Patient Summary Report - Extreme Data", () => {
    generatePatientReportPdf(sampleExtremeForm, 4);
});

// 3. Doctor Clinical Report - Minimal Data
runTest("Doctor Clinical Report - Minimal Data", () => {
    generateDoctorReportPdf(sampleMinimalForm, 15);
});

// 4. Doctor Clinical Report - Extreme Data
runTest("Doctor Clinical Report - Extreme Data", () => {
    generateDoctorReportPdf(sampleExtremeForm, 4);
});

// 5. QR Validation Suite
runTest("QR Renderer - Short Token", () => {
    const dummyDoc = new jsPDF();
    const res = renderQrCode(dummyDoc, "BH-12345", 10, 10, 20);
    if (!res) throw new Error("Expected vector QR generation success");
});

runTest("QR Renderer - Extremely Long Token", () => {
    const dummyDoc = new jsPDF();
    const longToken = "A".repeat(500);
    const res = renderQrCode(dummyDoc, longToken, 10, 10, 20);
});

runTest("QR Renderer - Empty Token", () => {
    const dummyDoc = new jsPDF();
    const res = renderQrCode(dummyDoc, "", 10, 10, 20);
    if (res !== false) throw new Error("Expected fallback for empty token");
});

runTest("QR Renderer - Null & Undefined Tokens", () => {
    const dummyDoc = new jsPDF();
    const res1 = renderQrCode(dummyDoc, null, 10, 10, 20);
    const res2 = renderQrCode(dummyDoc, undefined, 10, 10, 20);
    if (res1 !== false || res2 !== false) throw new Error("Expected fallback for null/undefined token");
});

runTest("QR Renderer - Invalid Token Type (Object)", () => {
    const dummyDoc = new jsPDF();
    const res = renderQrCode(dummyDoc, { invalid: "object" }, 10, 10, 20);
    if (typeof res !== "boolean") throw new Error("Expected boolean result");
});

console.log(`\n=== EDGE CASE TEST RESULTS: ${testsPassed} Passed, ${testsFailed} Failed ===`);
if (testsFailed > 0) {
    process.exit(1);
}
