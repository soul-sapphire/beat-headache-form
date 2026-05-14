import React, { useMemo, useState } from "react";

const pageTitles = [
    "Patient, Birth & Family History",
    "Headache Confirmation & History",
    "Medical History, Red Flags & Secondary Status",
    "Parent / School / Professional Evaluation",
    "IHS / ICHD-3 Diagnosis Criteria",
    "Investigations & Physical Examination",
    "FRESSH Lifestyle Score & Final Plan",
];

const ethnicityOptions = ["Sinhala", "Tamil", "Muslim", "Other"];
const genderOptions = ["M", "F"];
const yesNo = ["Yes", "No"];
const yesNoYN = ["Y", "N"];
const yesNoNc = ["Y", "N", "NC"];
const plusMinus = ["+", "–"];
const normalAbnormal = ["NL", "AN"];
const evaluationScale = [
    "1 Help is Essential",
    "2 Help is Needed",
    "3 Average",
    "4 Above Average",
    "5 Superior",
    "NC No Idea",
];

const familyIssues = [
    "Migraine/Headache",
    "Overweight/Obese",
    "DM",
    "CVD",
    "HT",
    "Cancer",
    "Allergies",
];

const complicationOptions = [
    "Premature",
    "Sepsis",
    "Ventilated",
    "HIE",
    "Hypoglycaemia",
    "MAS",
    "Jaundice",
];

const headacheExclude = ["Toothache", "Ear pain", "Throat Pain", "Neck pain", "TM joint pain"];
const locations = ["Frontal", "Temporal", "Occipital", "Allover", "Band like", "Vertex"];
const sideOptions = ["L/S", "R/S", "B/L"];
const painNature = [
    "Constant pressure, tightening (like a band)",
    "Throbbing or pulsing (like a heart beat)",
    "Sharp or stabbing",
    "Thunder clapping",
];
const durationOptions = ["1-2 Hour", "2-4 Hour", "More than 04 Hours", "All day"];
const reliefOptions = [
    "Sleeping in a dim lit, quiet room",
    "Having a meal",
    "Drinking water",
    "Relaxation (Eg: meditation)",
    "Medication",
];
const timeOptions = ["Morning", "Mid day", "Evening", "Night", "No specific time"];
const premonitoryOptions = ["Facial pallor", "Fatigue", "Irritability", "Mood changes", "Yawning"];
const aggravatingOptions = ["Activity", "Walking", "Climbing Stairs", "Reading"];
const associatedSymptoms = [
    "Nausea",
    "Vomiting",
    "Recurrent Abdominal pain",
    "Anxiety – depression",
    "Attention issues",
    "Memory issues",
    "Light Sensitivity",
    "Sound Sensitivity",
    "Vision issues/Diplopia",
    "Walking difficulty",
    "Tiring quickly",
    "Tearing",
    "Epilepsy",
    "Fainting",
    "Atopic disorder",
    "Behavioral changes",
    "Balance issues",
];

const redFlagSystemic = ["Fever, acute symptoms", "Vomiting", "Weight loss", "Comorbidities"];
const redFlagNeuro = [
    "Abnormal gait",
    "Ataxia",
    "Visual disturbances",
    "Eye movement abnormalities",
    "Seizures",
    "Papilledema",
    "Changes in behavior or cognition",
];
const redFlagPosition = [
    "Worse upright",
    "Worse supine",
    "Progressive",
    "Sudden onset",
    "Head trauma",
    "Onset in sleep/early morning",
    "Triggered by Valsalva",
    "Toddler (below 5 yrs)",
    "Lack of Family History",
];

const evalAreas = [
    "Intelligence",
    "Behavior",
    "Attention",
    "Memory",
    "Reading ability",
    "Writing ability",
    "Mathematical ability",
];
const evalSources = ["Parental Evaluation", "School Evaluation", "Professional Evaluation"];

const migraineNoAuraCriteria = [
    "Total number of attacks five or more",
    "Headache attacks lasting 4-72 hr",
    "Headache has at least two of the following four characteristics",
    "During headache at least one of the following",
];
const migraineNoAuraCharacteristics = [
    "unilateral location",
    "pulsating quality",
    "moderate or severe pain intensity",
    "aggravation by or causing avoidance of routine physical activity (e.g. walking or climbing stairs)",
];
const migraineNoAuraAssociated = ["nausea and/or vomiting", "photophobia and phonophobia"];

const migraineAuraCriteria = [
    "Total number of attacks two or more",
    "One or more fully reversible aura symptoms",
    "At least three of the following six characteristics",
    "Patient’s headache cannot be attributed to another disorder",
];
const auraTypes = ["visual", "sensory", "speech and language", "motor", "brainstem", "retinal"];
const auraCharacteristics = [
    "at least one aura symptom spreads gradually over ≥5 minutes",
    "two or more aura symptoms occur in succession",
    "each individual aura symptom lasts 5-60 minutes",
    "at least one aura symptom is unilateral",
    "at least one aura symptom is positive",
    "the aura is accompanied, or followed within 60 minutes, by headache",
];

const tensionCriteria = [
    "At least 10 episodes of headache occurring on <1 day/month on average (<12 days/year)",
    "Lasting from 30 minutes to 7 days",
    "At least two of the following four characteristics",
    "Both of the following",
    "Patient’s headache cannot be attributed to another disorder",
];
const tensionCharacteristics = [
    "bilateral location",
    "pressing or tightening (non-pulsating) quality",
    "mild or moderate intensity",
    "not aggravated by routine physical activity such as walking or climbing stairs",
];
const tensionAssociated = ["no nausea or vomiting", "no more than one of photophobia or phonophobia"];

const clusterCriteria = [
    "At least five attacks fulfilling criteria B – D",
    "Severe or very severe unilateral orbital, supraorbital and/or temporal pain lasting 15-180 minutes (when untreated)",
    "Either or both of the following",
    "Occurring with a frequency between one every other day and 8 per day",
    "Patient’s headache cannot be attributed to another disorder",
];
const clusterSymptoms = [
    "conjunctival injection and/or lacrimation",
    "nasal congestion and/or rhinorrhea",
    "eyelid oedema",
    "forehead and facial sweating",
    "miosis and/or ptosis",
    "a sense of restlessness or agitation",
];

const tests = ["FBC", "CRP", "ESR", "Brain Imaging"];
const diagnosisStatuses = ["Confirmed", "Incomplete", "Unlikely"];

const fressh = [
    {
        name: "Food Intake Pattern",
        prompt: "Which of the following best describes your child’s diet for majority of the days of the month.",
        options: [
            "2 – Skips meals on most days (>15 days/month)",
            "4 – Skips meals frequently (>7 days/month)",
            "6 – Skips meals",
            "8 – Skips meals occasionally (2-3 days/month)",
            "10 – Never skips meals",
        ],
    },
    {
        name: "Relaxation",
        prompt: "How much time does your child spend relaxing on average per day?",
        options: [
            "2 – Does not engage in any regular relaxation activities",
            "4 – Less than 10 minutes/day",
            "6 – 10 to 20 minutes/day",
            "8 – 20 to 30 minutes/day",
            "10 – More than 30 minutes/day",
        ],
    },
    {
        name: "Exercise",
        prompt: "How much time does your child spend exercising on average per day?",
        options: [
            "2 – Does not engage in any regular exercises",
            "4 – Less than 30 minutes/day",
            "6 – 30 minutes to 1 hour/day",
            "8 – 1 to 2 hours/day",
            "10 – More than 2 hours/day",
        ],
        extra: "If you have selected >2 hours/day please specify the number of hours",
    },
    {
        name: "Sleep",
        prompt: "How many hours of continuous, good quality sleep does your child get at night per day?",
        options: [
            "2 – Less than 4 hours/day",
            "4 – 4 to 6 hours/day",
            "6 – 6 to 8 hours/day",
            "8 – 8 to 10 hours/day",
            "10 – More than 10 hours/day",
        ],
        extra: "If you have selected >10 hours/day please specify the number of hours",
    },
    {
        name: "Screen time",
        prompt: "How much is your child’s screen time on average per day?",
        options: [
            "2 – More than 2 hours/day",
            "4 – 1 to 2 hours/day",
            "6 – 30 mins to 1 hour/day",
            "8 – 15 to 30 mins/day",
            "10 – Less than 15 mins/day",
        ],
        extra: "If you have selected >2 hours/day please specify the number of hours",
    },
    {
        name: "Hydration",
        prompt: "How much water does your child consume on average within a day?",
        options: [
            "2 – Less than 2 glasses",
            "4 – 2 to 4 glasses",
            "6 – 4 to 6 glasses",
            "8 – 6 to 8 glasses",
            "10 – More than 8 glasses",
        ],
    },
];

const addToList = (list, item) => {
    if (!item) return list;
    const currentList = Array.isArray(list) ? list : [];
    if (currentList.includes(item)) return currentList;
    return [...currentList, item];
};

const appendPrompt = (current, prompt) => {
    if (!prompt) return current;
    const prefix = "Suggested from previous answers — doctor must confirm: ";
    const fullPrompt = prompt.startsWith(prefix) ? prompt : `${prefix}${prompt}`;
    if (!current) return fullPrompt;
    if (current.includes(prompt)) return current;
    return `${current}\n${fullPrompt}`;
};

const toNumber = (value) => {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
};

const hasAny = (list, words) => {
    if (!Array.isArray(list)) return false;
    return words.some((word) => list.includes(word));
};

const safeArray = (val) => Array.isArray(val) ? val : [];

// Random Helpers for Development Testing
const pick = (array) => array[Math.floor(Math.random() * array.length)];
const pickMany = (array, min, max) => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPhone = () => "07" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
const randomEmail = (firstName, lastName) => {
    const num = Math.floor(Math.random() * 999);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@testmail.com`;
};
const randomRegistrationCode = () => "TEST-" + Math.floor(Math.random() * 90000 + 10000);
const randomDobForAge = (age) => {
    const year = new Date().getFullYear() - age;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const todayISO = () => new Date().toISOString().split("T")[0];

const firstNames = ["Aarav", "Nethmi", "Kavindu", "Dinuki", "Sanula", "Aanya", "Mineth", "Thevini", "Rahul", "Amaya", "Vihan", "Sayuni", "Adithya", "Imasha"];
const lastNames = ["Perera", "Silva", "Fernando", "Jayasinghe", "Wijesinghe", "Rathnayake", "Gunasekara", "De Silva", "Herath", "Abeywardena"];
const parentOccupations = ["Teacher", "Engineer", "Accountant", "Nurse", "Driver", "Business Owner", "Software Developer", "Police Officer", "Bank Officer", "Farmer"];
const pastMedicalOptions = ["No chronic illness", "Bronchial asthma", "Allergic rhinitis", "No significant past medical history"];
const pastSurgicalOptions = ["None", "Tonsillectomy", "Appendicectomy"];
const drugHistoryOptions = ["Uses paracetamol occasionally", "No regular medication", "Uses cetirizine occasionally"];

function createRandomRealisticTestCase() {
    const fName = pick(firstNames);
    const lName = pick(lastNames);
    const age = randomInt(4, 15);

    const base = {
        patient: {
            firstName: fName,
            lastName: lName,
            phone: randomPhone(),
            whatsapp: Math.random() > 0.5 ? randomPhone() : null, 
            email: randomEmail(fName, lName),
            registeredDate: todayISO(),
            age: String(age),
            dob: randomDobForAge(age),
            registrationCode: randomRegistrationCode(),
            gender: pick(genderOptions),
            ethnicity: pick(ethnicityOptions),
        },
        birth: {
            parity: String(randomInt(1, 4)),
            gestation: String(randomInt(36, 40)),
            birthWeight: (Math.random() * (3.8 - 2.4) + 2.4).toFixed(1),
            familyIncome: String(randomInt(60000, 250000)),
            delivery: pick(["NVD", "Forceps", "Vaccum", "LSCS"]),
            consanguinity: Math.random() > 0.8 ? "Y" : "N",
        },
        perinatal: {
            pbuStay: Math.random() > 0.8 ? "Y" : "N",
            pbuDays: "",
            complications: [],
            other: "",
        },
        clinicPath: {
            initiatedBy: pick(["Self / Parent", "Medical officer", "Specialist", "School", "Other"]),
            seenBefore: pick(["No", "Yes"]),
            previousDiagnosisGiven: pick(["No", "Yes", "Not sure"]),
            previousTreatmentOutcome: pick(["No treatment given", "No improvement", "Some improvement", "Better", "Worse", "Not sure"]),
        },
        referral: {
            source: pick(["Self / Parent", "Medical officer", "Specialist", "School", "Other"]),
            notes: Math.random() > 0.5 ? "Referral for headache assessment." : "",
        },
        development: {
            grossMotorIssue: Math.random() > 0.9 ? "Yes" : "No",
            fineMotorIssue: Math.random() > 0.9 ? "Yes" : "No",
            speechIssue: Math.random() > 0.9 ? "Yes" : "No",
            other: Math.random() > 0.8 ? "Delayed milestones" : "",
        },
        familyRows: [
            { relation: "Mother", age: String(randomInt(28, 45)), occupation: pick(parentOccupations), issues: pickMany(familyIssues, 0, 2), describe: "Healthy if no issues" },
            { relation: "Father", age: String(randomInt(30, 50)), occupation: pick(parentOccupations), issues: pickMany(familyIssues, 0, 2), describe: "Occasional illness" },
            { relation: "Sibling 1", age: String(randomInt(3, 18)), occupation: "Student", issues: pickMany(familyIssues, 0, 1), describe: "" },
            { relation: "Sibling 2", age: "", occupation: "", issues: [], describe: "" },
            { relation: "Sibling 3", age: "", occupation: "", issues: [], describe: "" }
        ],
        headache: {
            exclude: Math.random() > 0.7 ? [pick(headacheExclude)] : [],
            confirmed: "Yes",
        },
        history: {
            durationYears: String(randomInt(0, 3)),
            durationMonths: String(randomInt(1, 11)),
            pattern: Math.random() > 0.3 ? "Variable" : "Constant",
            location: pickMany(locations, 1, 3),
            painNature: pickMany(painNature, 1, 2),
            perDay: String(randomInt(0, 2)),
            perWeek: String(randomInt(0, 5)),
            perMonth: String(randomInt(0, 10)),
            seasonal: Math.random() > 0.5 ? "Worse during school term" : "",
            headacheDaysLastWeek: randomInt(0, 7),
            headacheDaysLastFourWeeks: randomInt(0, 28),
            medicineDaysLastWeek: randomInt(0, 7),
            medicineDaysLastFourWeeks: randomInt(0, 28),
            relief: pickMany(reliefOptions, 1, 3),
            reliefOther: Math.random() > 0.5 ? "Rest helps" : "",
            timeOfDay: pickMany(timeOptions, 1, 2),
            premonitory: pickMany(premonitoryOptions, 0, 3),
            aggravating: pickMany(aggravatingOptions, 0, 3),
            associated: pickMany(associatedSymptoms, 2, 6),
        },
        time: {
            prodromal: {
                hasProdromal: Math.random() > 0.7 ? "Yes" : "No",
                symptoms: [],
                other: ""
            },
            aura: {
                hasAura: Math.random() > 0.8 ? "Yes" : "No",
                symptoms: [],
                duration: "Not sure",
                side: "Not sure",
                timing: "Not sure",
                gradualSpread: "Not sure",
                other: ""
            },
            headache: {
                duration: pick(["Less than 1 hour", "1–2 hours", "2–4 hours", "More than 4 hours", "All day"]),
                severity: pick(["Not bad", "Quite bad", "Very bad"])
            },
            postdrome: {
                hasPostdrome: Math.random() > 0.7 ? "Yes" : "No",
                symptoms: [],
                other: ""
            }
        },
        impact: {
            schoolAbsentDaysLastFourWeeks: randomInt(0, 5),
            leftSchoolEarlyDaysLastFourWeeks: randomInt(0, 5),
            activityLimitedDaysLastFourWeeks: randomInt(0, 10),
            parentLostWork: Math.random() > 0.8 ? "Yes" : "No",
            parentLostWorkDays: 0,
        },
        yesterday: {
            hadHeadacheYesterday: pick(["No", "Yes"]),
        },
        medical: {
            pastMedical: pick(pastMedicalOptions),
            pastSurgical: pick(pastSurgicalOptions),
            drugHistory: pick(drugHistoryOptions),
            allergies: pickMany(["Food", "Drug", "Plaster"], 0, 1),
            allergySpecify: "",
        },
        evaluations: {},
        diagnosis: {
            "migraineNoAura.status": pick(["Incomplete", "Confirmed", "Unlikely"]),
            "migraineAura.status": pick(["Incomplete", "Unlikely"]),
            "tension.status": pick(["Incomplete", "Unlikely"]),
            "cluster.status": "Unlikely",
            migraineNoAuraCharacteristics: [],
            migraineNoAuraAssociated: [],
            auraTypes: [],
            auraCharacteristics: [],
            tensionCharacteristics: [],
            tensionAssociated: [],
            clusterSymptoms: [],
        },
        examination: {
            height: "",
            weight: "",
            bmi: String(randomInt(14, 22)),
            ofc: String(randomInt(48, 56)),
            bpSystolic: String(randomInt(90, 115)),
            bpDiastolic: String(randomInt(55, 75)),
            heartRate: String(randomInt(70, 110)),
            "Dysmorphism": "–",
            "Neck stifness": "–",
            "Tenderness over Sinus": "–",
            "TMJ Tenderness /Dysfunction": "–",
            "Papilloedema": "–",
            "Numbness": "–",
            "Paralysis": "–",
            Teeth: "NL",
            Throat: "NL",
            RS: "NL",
            "Eye Movement": "NL",
            Gait: "NL",
            AS: "NL",
            crNvPalsy: "N",
            tests: [],
        },
        fressh: {},
        final: {
            diagnosis: "",
            medicationPlan: "",
            ccEmail: "",
        },
        redFlags: { systemic: [], neuro: [], position: [] },
    };

    if (base.patient.whatsapp === null) {
        base.patient.whatsapp = Math.random() > 0.5 ? base.patient.phone : randomPhone();
    }

    if (base.perinatal.pbuStay === "Y") {
        base.perinatal.pbuDays = String(randomInt(1, 10));
        base.perinatal.complications = pickMany(complicationOptions, 1, 2);
        base.perinatal.other = Math.random() > 0.5 ? "No other complications" : "";
    }

    if (base.clinicPath.initiatedBy === "Other") base.clinicPath.initiatedByOther = "Family friend";
    if (base.clinicPath.seenBefore === "Yes") base.clinicPath.seenBeforeWhere = pick(["GP / Medical officer", "Paediatrician", "Neurologist"]);
    if (base.clinicPath.previousDiagnosisGiven === "Yes") base.clinicPath.previousDiagnosis = "Suspected Tension Headache";

    if (base.referral.source === "Other") base.referral.other = "Neighbor suggestion";

    if (base.development.grossMotorIssue === "Yes") base.development.grossMotorDescribe = "Walked slightly late";
    if (base.development.fineMotorIssue === "Yes") base.development.fineMotorDescribe = "Writing issues";
    if (base.development.speechIssue === "Yes") base.development.speechDescribe = "Stuttering";

    if (base.time.prodromal.hasProdromal === "Yes") {
        base.time.prodromal.symptoms = pickMany(["Pallor", "Fatigue", "Irritability", "Mood change", "Yawning"], 1, 3);
    }
    
    if (base.time.aura.hasAura === "Yes") {
        base.time.aura.symptoms = pickMany(["Visual", "Auditory", "Gustatory", "Motor", "Brainstem", "Retinal"], 1, 2);
        base.time.aura.duration = pick(["Less than 5 minutes", "5–60 minutes", "More than 60 minutes", "Not sure"]);
        base.time.aura.side = pick(["Left", "Right", "Both sides", "Not sure"]);
        base.time.aura.timing = pick(["Before headache", "During headache", "After headache", "Not sure"]);
        base.time.aura.gradualSpread = pick(["No", "Yes", "Not sure"]);
    }

    if (base.time.postdrome.hasPostdrome === "Yes") {
        base.time.postdrome.symptoms = pickMany(["Tiredness", "Sleepiness", "Confusion", "Mood change", "Weakness"], 1, 3);
    }

    if (base.impact.parentLostWork === "Yes") base.impact.parentLostWorkDays = randomInt(1, 5);

    if (base.yesterday.hadHeadacheYesterday === "Yes") {
        base.yesterday.duration = pick(["Less than 1 hour", "1–2 hours", "2–4 hours", "More than 4 hours"]);
        base.yesterday.severity = pick(["Not bad", "Quite bad", "Very bad"]);
        base.yesterday.tookMedicine = pick(["No", "Yes"]);
    }

    if (base.history.location.includes("Frontal")) base.history.frontalSide = pick(sideOptions);
    if (base.history.location.includes("Temporal")) base.history.temporalSide = pick(sideOptions);

    // Randomly fill Sibling 2/3 sometimes
    if (Math.random() > 0.5) {
        base.familyRows[3] = { ...base.familyRows[3], age: String(randomInt(1, 15)), occupation: "Student", issues: pickMany(familyIssues, 0, 1) };
    }
    if (Math.random() > 0.7) {
        base.familyRows[4] = { ...base.familyRows[4], age: String(randomInt(1, 10)), occupation: "Student", issues: pickMany(familyIssues, 0, 1) };
    }

    evalSources.forEach(src => {
        evalAreas.forEach(area => {
            let val = pick(["3 Average", "NC No Idea"]);
            if (Math.random() > 0.8 && ["Attention", "Memory", "Behavior"].includes(area)) {
                val = "2 Help is Needed";
            }
            base.evaluations[`${src}.${area}`] = val;
        });
    });

    fressh.forEach(item => {
        base.fressh[item.name] = pick(item.options);
    });

    if (age <= 6) {
        base.examination.height = String(randomInt(95, 120));
        base.examination.weight = String(randomInt(14, 24));
    } else if (age <= 10) {
        base.examination.height = String(randomInt(115, 145));
        base.examination.weight = String(randomInt(20, 38));
    } else {
        base.examination.height = String(randomInt(135, 170));
        base.examination.weight = String(randomInt(35, 65));
    }

    // Occasionally ensure migraine signs for testing reflections
    if (Math.random() > 0.5) {
        const migraineSigns = ["Nausea", "Vomiting", "Light Sensitivity", "Sound Sensitivity", "Vision issues/Diplopia", "Walking difficulty"];
        base.history.associated = [...new Set([...base.history.associated, ...pickMany(migraineSigns, 2, 4)])];
    }

    return base;
}

const applyForwardReflections = (form) => {
    // Deep clone to avoid direct mutation
    const next = JSON.parse(JSON.stringify(form));

    // Helper to add note without duplication
    const addNote = (current, note) => {
        if (!note) return current;
        if (!current) return note;
        if (current.includes(note)) return current;
        return `${current}\n${note}`;
    };

    // Helper for safe array access
    const safe = (val) => Array.isArray(val) ? val : [];

    // Root safety
    next.clinicPath = next.clinicPath || {};
    next.referral = next.referral || {};
    next.development = next.development || {};
    next.impact = next.impact || {};
    next.yesterday = next.yesterday || {};
    next.time = next.time || {
        prodromal: { hasProdromal: "No", symptoms: [] },
        aura: { hasAura: "No", symptoms: [] },
        headache: {},
        postdrome: { hasPostdrome: "No", symptoms: [] }
    };
    next.time.prodromal = next.time.prodromal || { hasProdromal: "No", symptoms: [] };
    next.time.aura = next.time.aura || { hasAura: "No", symptoms: [] };
    next.time.headache = next.time.headache || {};
    next.time.postdrome = next.time.postdrome || { hasPostdrome: "No", symptoms: [] };
    next.aura = next.aura || {};
    next.history = next.history || {};
    next.history.prodromalSymptoms = safe(next.history.prodromalSymptoms);
    next.aura.types = safe(next.aura.types);

    // PAGE 1 -> FUTURE PAGES

    // 1. Age under 5
    const age = toNumber(next.patient.age);
    if (age > 0 && age < 5) {
        next.redFlags.position = addToList(next.redFlags.position, "Toddler (below 5 yrs)");
        next.examination.weightForHeight = addNote(next.examination.weightForHeight, "Suggested because patient is below 5 years.");
    }

    // 2. Email reuse
    if (next.patient.email && !next.final.ccEmail) {
        next.final.ccEmail = next.patient.email;
    }

    // Path to Headache Clinic
    if (next.clinicPath.previousDiagnosisGiven === "Yes" && next.clinicPath.previousDiagnosis) {
        next.final.diagnosis = addNote(next.final.diagnosis, `Previous diagnosis reported: ${next.clinicPath.previousDiagnosis}. Doctor must confirm.`);
    }
    if (next.clinicPath.previousTreatmentOutcome) {
        next.final.medicationPlan = addNote(next.final.medicationPlan, `Previous treatment outcome: ${next.clinicPath.previousTreatmentOutcome}. Doctor should review.`);
    }

    // Referral
    if (next.referral.source) {
        next.final.diagnosis = addNote(next.final.diagnosis, `Referral source: ${next.referral.source}.`);
    }

    // Developmental History
    const devIssues = [
        next.development.grossMotorIssue === "Yes",
        next.development.fineMotorIssue === "Yes",
        next.development.speechIssue === "Yes",
        next.development.other && next.development.other.trim().length > 0
    ].some(Boolean);

    if (devIssues) {
        ["intelligence", "Behavior", "Attention", "Memory"].forEach(area => {
            const key = `Parental Evaluation.${area}.notes`;
            next.evaluations[key] = addNote(next.evaluations[key], "Developmental concern reported. Please review learning, behavior, attention, and memory.");
        });
        next.final.diagnosis = addNote(next.final.diagnosis, "Developmental history concern reported. Doctor must review.");
    }

    // 3 & 4. Family migraine/headache vs Lack of Family History
    let familyHeadacheFound = false;
    let anyFamilyIssue = false;
    next.familyRows.forEach((row) => {
        if (hasAny(row.issues, ["Migraine/Headache"])) familyHeadacheFound = true;
        if (row.issues && row.issues.length > 0) anyFamilyIssue = true;
    });

    if (familyHeadacheFound) {
        next.final.diagnosis = addNote(
            next.final.diagnosis,
            "Family migraine/headache history reported. Doctor must confirm clinical relevance."
        );
    } else if (anyFamilyIssue) {
        // Rule 4: If any issue exists but NOT migraine/headache
        next.redFlags.position = addToList(next.redFlags.position, "Lack of Family History");
    }

    // 5. Family comorbidities
    const familyComorbidities = ["DM", "CVD", "HT", "Cancer", "Overweight/Obese"];
    const hasFamilyComorb = next.familyRows.some((row) => hasAny(row.issues, familyComorbidities));
    if (hasFamilyComorb) {
        next.redFlags.systemic = addToList(next.redFlags.systemic, "Comorbidities");
    }

    // 6. Family allergies
    const hasFamilyAllergy = next.familyRows.some((row) => hasAny(row.issues, ["Allergies"]));
    if (hasFamilyAllergy) {
        next.medical.secondaryStatus = addNote(
            next.medical.secondaryStatus,
            "Suggested review: family allergy history reported on Page 1."
        );
        next.examination["Tenderness over Sinus.describe"] = addNote(
            next.examination["Tenderness over Sinus.describe"],
            "Suggested check: allergy/sinus-related headache possibility from Page 1 family history."
        );
    }

    // PAGE 2 -> FUTURE PAGES

    // T-TIME REFLECTIONS
    const time = next.time || {};
    time.prodromal = time.prodromal || { hasProdromal: "No", symptoms: [] };
    time.aura = time.aura || { hasAura: "No", symptoms: [] };
    time.headache = time.headache || {};
    time.postdrome = time.postdrome || { hasPostdrome: "No", symptoms: [] };

    // 5. Prodromal
    if (time.prodromal.hasProdromal === "Yes") {
        const symptoms = safe(time.prodromal.symptoms);
        if (symptoms.length > 0) {
            next.final.diagnosis = addNote(next.final.diagnosis, `Prodromal symptoms reported: ${symptoms.join(", ")}. Doctor must confirm clinical relevance.`);
        }
    }

    // 6. Aura
    if (time.aura.hasAura === "Yes") {
        next.diagnosis["migraineAura.1"] = "Yes";
        next.final.diagnosis = addNote(next.final.diagnosis, "Aura symptoms reported. Doctor must confirm migraine with aura criteria.");

        const auraSymptoms = safe(time.aura.symptoms);
        // Aura type mapping
        if (auraSymptoms.includes("Visual")) next.diagnosis.auraTypes = addToList(next.diagnosis.auraTypes, "visual");
        if (hasAny(auraSymptoms, ["Auditory", "Gustatory"])) next.diagnosis.auraTypes = addToList(next.diagnosis.auraTypes, "sensory");
        if (auraSymptoms.includes("Motor")) next.diagnosis.auraTypes = addToList(next.diagnosis.auraTypes, "motor");
        if (auraSymptoms.includes("Brainstem")) next.diagnosis.auraTypes = addToList(next.diagnosis.auraTypes, "brainstem");
        if (auraSymptoms.includes("Retinal")) next.diagnosis.auraTypes = addToList(next.diagnosis.auraTypes, "retinal");

        // Aura characteristics
        if (time.aura.duration === "5–60 minutes") {
            next.diagnosis.auraCharacteristics = addToList(next.diagnosis.auraCharacteristics, "each individual aura symptom lasts 5-60 minutes");
        }
        if (hasAny(time.aura.side, ["Left", "Right"])) {
            next.diagnosis.auraCharacteristics = addToList(next.diagnosis.auraCharacteristics, "at least one aura symptom is unilateral");
        }
        if (time.aura.gradualSpread === "Yes") {
            next.diagnosis.auraCharacteristics = addToList(next.diagnosis.auraCharacteristics, "at least one aura symptom spreads gradually over ≥5 minutes");
        }
        if (hasAny(time.aura.timing, ["Before headache", "During headache"])) {
            next.diagnosis.auraCharacteristics = addToList(next.diagnosis.auraCharacteristics, "the aura is accompanied, or followed within 60 minutes, by headache");
        }
        if (auraSymptoms.length > 1) {
            next.diagnosis.auraCharacteristics = addToList(next.diagnosis.auraCharacteristics, "two or more aura symptoms occur in succession");
        }
    }

    // 7. Headache Duration & Severity
    const headDur = time.headache.duration;
    const headSev = time.headache.severity;

    if (hasAny(headDur, ["More than 4 hours", "All day"])) {
        next.diagnosis["migraineNoAura.1"] = "Yes";
    }
    if (hasAny(headDur, ["1–2 hours", "2–4 hours"])) {
        next.final.diagnosis = addNote(next.final.diagnosis, "Suggested review: cluster headache possibility due to 1-4 hour episode duration.");
        next.diagnosis["cluster.1"] = "Yes";
    }

    if (headSev === "Not bad") {
        next.diagnosis.tensionCharacteristics = addToList(next.diagnosis.tensionCharacteristics, "mild or moderate intensity");
    }
    if (hasAny(headSev, ["Quite bad", "Very bad"])) {
        next.diagnosis.migraineNoAuraCharacteristics = addToList(next.diagnosis.migraineNoAuraCharacteristics, "moderate or severe pain intensity");
    }
    if (headSev === "Very bad") {
        next.final.diagnosis = addNote(next.final.diagnosis, "Suggested review: cluster headache possibility due to very bad intensity.");
        next.diagnosis["cluster.1"] = "Yes";
    }

    // 8. Postdrome
    if (time.postdrome.hasPostdrome === "Yes") {
        const symptoms = safe(time.postdrome.symptoms);
        next.final.diagnosis = addNote(next.final.diagnosis, `Postdrome reported${symptoms.length > 0 ? ": " + symptoms.join(", ") : ""}. Doctor must confirm clinical relevance.`);
    }

    // LEGACY & OTHER Page 2
    if (next.history.durationYears && toNumber(next.history.durationYears) > 1) {
        next.final.diagnosis = addNote(next.final.diagnosis, "Chronic headache history (>1 year).");
    }

    // 7. Toothache under Exclude
    const excludes = next.headache.exclude || [];
    if (excludes.includes("Toothache")) {
        next.medical.secondaryStatus = addNote(
            next.medical.secondaryStatus,
            "Possible non-primary headache source: toothache reported on Page 2."
        );
        next.examination["Teeth.describe"] = addNote(next.examination["Teeth.describe"], "Suggested check: toothache reported on Page 2.");
    }

    // 8. Ear pain under Exclude
    if (excludes.includes("Ear pain")) {
        next.medical.secondaryStatus = addNote(
            next.medical.secondaryStatus,
            "Possible ENT-related source: ear pain reported on Page 2."
        );
    }

    // 9. Throat Pain under Exclude
    if (excludes.includes("Throat Pain")) {
        next.medical.secondaryStatus = addNote(
            next.medical.secondaryStatus,
            "Possible secondary source: throat pain reported on Page 2."
        );
        next.examination["Throat.describe"] = addNote(next.examination["Throat.describe"], "Suggested check: throat pain reported on Page 2.");
    }
    
    // 10.1 TM joint pain under Exclude
    if (excludes.includes("TM joint pain")) {
        next.medical.secondaryStatus = addNote(
            next.medical.secondaryStatus,
            "Possible TM joint-related source: TM joint pain reported on Page 2."
        );
        next.examination["TMJ Tenderness /Dysfunction.describe"] = addNote(
            next.examination["TMJ Tenderness /Dysfunction.describe"],
            "Suggested check: TM joint pain reported on Page 2."
        );
    }

    // 10. Neck pain under Exclude
    if (excludes.includes("Neck pain")) {
        next.examination["Neck stifness.describe"] = addNote(
            next.examination["Neck stifness.describe"],
            "Suggested check: neck pain reported on Page 2."
        );
    }

    // 11. Occipital location
    const locationsVal = next.history.location || [];
    if (locationsVal.includes("Occipital")) {
        next.medical.secondaryStatus = addNote(
            next.medical.secondaryStatus,
            "Review needed: occipital headache location reported on Page 2."
        );
    }

    // 12. Frontal/Temporal + L/S or R/S
    const sideUnilateral = ["L/S", "R/S"];
    const frontalUnilateral = locationsVal.includes("Frontal") && sideUnilateral.includes(next.history.frontalSide);
    const temporalUnilateral = locationsVal.includes("Temporal") && sideUnilateral.includes(next.history.temporalSide);
    if (frontalUnilateral || temporalUnilateral) {
        next.diagnosis.migraineNoAuraCharacteristics = addToList(next.diagnosis.migraineNoAuraCharacteristics, "unilateral location");
    }

    // 13. B/L side or Allover location
    const isBilateral = (locationsVal.includes("Frontal") && next.history.frontalSide === "B/L") || 
                       (locationsVal.includes("Temporal") && next.history.temporalSide === "B/L") || 
                       locationsVal.includes("Allover");
    if (isBilateral) {
        next.diagnosis.tensionCharacteristics = addToList(next.diagnosis.tensionCharacteristics, "bilateral location");
    }

    // 14. Band like
    if (locationsVal.includes("Band like")) {
        next.diagnosis.tensionCharacteristics = addToList(next.diagnosis.tensionCharacteristics, "bilateral location");
        next.diagnosis.tensionCharacteristics = addToList(
            next.diagnosis.tensionCharacteristics,
            "pressing or tightening (non-pulsating) quality"
        );
    }

    // 15. Throbbing/pulsing
    const nature = next.history.painNature || [];
    if (nature.includes("Throbbing or pulsing (like a heart beat)")) {
        next.diagnosis.migraineNoAuraCharacteristics = addToList(next.diagnosis.migraineNoAuraCharacteristics, "pulsating quality");
    }

    // 16. Constant pressure/tightening
    if (nature.includes("Constant pressure, tightening (like a band)")) {
        next.diagnosis.tensionCharacteristics = addToList(
            next.diagnosis.tensionCharacteristics,
            "pressing or tightening (non-pulsating) quality"
        );
    }

    // 17. Thunder clapping
    if (nature.includes("Thunder clapping")) {
        next.redFlags.position = addToList(next.redFlags.position, "Sudden onset");
        next.examination.tests = addToList(next.examination.tests, "Brain Imaging");
    }

    // 18. Sharp/stabbing
    if (nature.includes("Sharp or stabbing")) {
        next.final.diagnosis = addNote(next.final.diagnosis, "Doctor review note: sharp/stabbing pain quality reported on Page 2.");
    }

    // 19. Frequency calculation
    const freqDays = toNumber(next.history.headacheDaysLastFourWeeks);
    const oldFreq = toNumber(next.history.perDay) * 30 + toNumber(next.history.perWeek) * 4 + toNumber(next.history.perMonth);
    const attacksPerMonth = freqDays > 0 ? freqDays : oldFreq;

    if (attacksPerMonth >= 2) {
        next.diagnosis["migraineAura.0"] = "Yes";
    }
    if (attacksPerMonth >= 5) {
        next.diagnosis["migraineNoAura.0"] = "Yes";
        next.diagnosis["cluster.0"] = "Yes";
    }
    if (attacksPerMonth >= 10) {
        next.diagnosis["tension.0"] = "Yes";
    }

    if (toNumber(next.history.medicineDaysLastFourWeeks) > 0) {
        next.final.medicationPlan = addNote(next.final.medicationPlan, "Medicine used for headache in the last 4 weeks. Doctor should review medication pattern.");
    }
    if (toNumber(next.history.medicineDaysLastFourWeeks) >= 10) {
        next.final.medicationPlan = addNote(next.final.medicationPlan, "Frequent medicine use reported in the last 4 weeks. Doctor should review for possible medication overuse risk.");
    }

    // 21. Intensity
    const intensity = toNumber(next.history.intensity);
    if (intensity >= 4) {
        next.diagnosis.migraineNoAuraCharacteristics = addToList(
            next.diagnosis.migraineNoAuraCharacteristics,
            "moderate or severe pain intensity"
        );
    }
    if (intensity > 0 && intensity <= 6) {
        next.diagnosis.tensionCharacteristics = addToList(next.diagnosis.tensionCharacteristics, "mild or moderate intensity");
    }
    if (intensity >= 7) {
        next.diagnosis["cluster.1"] = "Yes";
    }
    if (intensity > 0) {
        next.final.diagnosis = addNote(next.final.diagnosis, `Severity score from Page 2: ${intensity}/10.`);
    }

    // 22. Relief
    const relief = next.history.relief || [];
    if (relief.includes("Sleeping in a dim lit, quiet room")) {
        next.final.diagnosis = addNote(next.final.diagnosis, "Migraine-supporting behaviour: sleep/dim quiet room relieves headache.");
    }
    if (relief.includes("Having a meal")) {
        next.final.diagnosis = addNote(
            next.final.diagnosis,
            "Lifestyle note: headache improves after meals; review missed meals under FRESSH."
        );
    }
    if (relief.includes("Drinking water")) {
        next.final.diagnosis = addNote(next.final.diagnosis, "Lifestyle note: headache improves with water; review hydration under FRESSH.");
    }
    if (relief.includes("Relaxation (Eg: meditation)")) {
        next.final.diagnosis = addNote(
            next.final.diagnosis,
            "Lifestyle note: headache improves with relaxation; review relaxation under FRESSH."
        );
    }
    if (relief.includes("Medication")) {
        next.final.medicationPlan = addNote(next.final.medicationPlan, "Previous response: medication reported as relieving headache.");
    }

    // 23. Time of day
    const timeOfDay = next.history.timeOfDay || [];
    if (hasAny(timeOfDay, ["Morning", "Night"])) {
        next.redFlags.position = addToList(next.redFlags.position, "Onset in sleep/early morning");
    }

    // 24. Premonitory symptoms
    const premonitory = next.history.premonitory || [];
    if (premonitory.length > 0) {
        next.final.diagnosis = addNote(next.final.diagnosis, `Premonitory symptoms reported: ${premonitory.join(", ")}.`);
    }

    // 25. Activity aggravation
    const aggravating = next.history.aggravating || [];
    if (hasAny(aggravating, ["Activity", "Walking", "Climbing Stairs"])) {
        next.diagnosis.migraineNoAuraCharacteristics = addToList(
            next.diagnosis.migraineNoAuraCharacteristics,
            "aggravation by or causing avoidance of routine physical activity (e.g. walking or climbing stairs)"
        );
    }

    // 26. Reading aggravation
    if (aggravating.includes("Reading")) {
        next.examination["Eye Movement.describe"] = addNote(
            next.examination["Eye Movement.describe"],
            "Suggested check: reading aggravates headache on Page 2."
        );
    }

    // 27. Nausea/Vomiting
    const associated = next.history.associated || [];
    if (hasAny(associated, ["Nausea", "Vomiting"])) {
        next.diagnosis.migraineNoAuraAssociated = addToList(next.diagnosis.migraineNoAuraAssociated, "nausea and/or vomiting");
    }
    if (associated.includes("Vomiting")) {
        next.redFlags.systemic = addToList(next.redFlags.systemic, "Vomiting");
    }

    // 28. Light/Sound sensitivity
    if (hasAny(associated, ["Light Sensitivity", "Sound Sensitivity"])) {
        next.diagnosis.migraineNoAuraAssociated = addToList(next.diagnosis.migraineNoAuraAssociated, "photophobia and phonophobia");
        next.diagnosis.tensionAssociated = addToList(
            next.diagnosis.tensionAssociated,
            "no more than one of photophobia or phonophobia"
        );
    }

    // Impact
    const impact = [
        toNumber(next.impact.schoolAbsentDaysLastFourWeeks),
        toNumber(next.impact.leftSchoolEarlyDaysLastFourWeeks),
        toNumber(next.impact.activityLimitedDaysLastFourWeeks),
        next.impact.parentLostWork === "Yes" ? toNumber(next.impact.parentLostWorkDays) : 0
    ];
    if (impact.some(v => v > 0) || next.impact.parentLostWork === "Yes") {
        next.final.diagnosis = addNote(next.final.diagnosis, `Headache impact reported: school absence ${next.impact.schoolAbsentDaysLastFourWeeks || 0} days, left school early ${next.impact.leftSchoolEarlyDaysLastFourWeeks || 0} days, activity limited ${next.impact.activityLimitedDaysLastFourWeeks || 0} days, parent work loss ${next.impact.parentLostWorkDays || 0} days in the last 4 weeks.`);
    }

    // Yesterday
    if (next.yesterday.hadHeadacheYesterday === "Yes") {
        next.final.diagnosis = addNote(next.final.diagnosis, `Headache reported yesterday. Duration: ${next.yesterday.duration}. Severity: ${next.yesterday.severity}.`);
        if (next.yesterday.tookMedicine === "Yes") {
            next.final.medicationPlan = addNote(next.final.medicationPlan, "Medicine taken yesterday for headache. Doctor should review.");
        }
    }

    // 30. Vision/Diplopia
    if (associated.includes("Vision issues/Diplopia")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Visual disturbances");
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Eye movement abnormalities");
        next.examination["Eye Movement.describe"] = addNote(
            next.examination["Eye Movement.describe"],
            "Suggested check: vision issues/diplopia reported on Page 2."
        );
    }

    // 31. Walking difficulty
    if (associated.includes("Walking difficulty")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Abnormal gait");
        next.examination["Gait.describe"] = addNote(next.examination["Gait.describe"], "Suggested check: walking difficulty reported on Page 2.");
    }

    // 32. Balance issues
    if (associated.includes("Balance issues")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Ataxia");
        next.examination["Gait.describe"] = addNote(next.examination["Gait.describe"], "Suggested check: balance issues reported on Page 2.");
    }

    // 33. Epilepsy/Fainting
    if (hasAny(associated, ["Epilepsy", "Fainting"])) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Seizures");
    }

    // 34. Behavioral changes
    if (associated.includes("Behavioral changes")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Changes in behavior or cognition");
        next.evaluations["Parental Evaluation.Behavior.notes"] = addNote(
            next.evaluations["Parental Evaluation.Behavior.notes"],
            "Suggested from Page 2: behavioral changes reported."
        );
    }

    // 35. Attention issues
    if (associated.includes("Attention issues")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Changes in behavior or cognition");
        next.evaluations["Parental Evaluation.Attention.notes"] = addNote(
            next.evaluations["Parental Evaluation.Attention.notes"],
            "Suggested from Page 2: attention issue reported."
        );
    }

    // 36. Memory issues
    if (associated.includes("Memory issues")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Changes in behavior or cognition");
        next.evaluations["Parental Evaluation.Memory.notes"] = addNote(
            next.evaluations["Parental Evaluation.Memory.notes"],
            "Suggested from Page 2: memory issue reported."
        );
    }

    // 37. Tearing
    if (associated.includes("Tearing")) {
        next.diagnosis.clusterSymptoms = addToList(next.diagnosis.clusterSymptoms, "conjunctival injection and/or lacrimation");
    }

    // 38. Atopic disorder
    if (associated.includes("Atopic disorder")) {
        next.medical.secondaryStatus = addNote(next.medical.secondaryStatus, "Suggested review: atopic disorder reported on Page 2.");
        next.examination["Tenderness over Sinus.describe"] = addNote(
            next.examination["Tenderness over Sinus.describe"],
            "Suggested check: atopic/sinus-related headache possibility from Page 2."
        );
    }

    // 39. Tiring quickly
    if (associated.includes("Tiring quickly")) {
        next.examination.tests = addToList(next.examination.tests, "FBC");
    }

    // PAGE 3 -> FUTURE PAGES

    // 40. Past medical history
    if (next.medical.pastMedical && next.medical.pastMedical.trim().length > 0) {
        next.redFlags.systemic = addToList(next.redFlags.systemic, "Comorbidities");
    }

    // 41. Drug history
    if (next.medical.drugHistory && next.medical.drugHistory.trim().length > 0) {
        next.final.medicationPlan = addNote(
            next.final.medicationPlan,
            "Check current/past drug history from Page 3 before final medication plan."
        );
    }

    // 42. Allergy history
    if ((next.medical.allergies && next.medical.allergies.length > 0) || (next.medical.allergySpecify && next.medical.allergySpecify.trim().length > 0)) {
        next.final.medicationPlan = addNote(next.final.medicationPlan, "Medication safety warning: allergy history reported on Page 3.");
    }

    // 43. Fever red flag
    const systemicFlags = next.redFlags.systemic || [];
    if (systemicFlags.includes("Fever, acute symptoms")) {
        ["FBC", "CRP", "ESR"].forEach((t) => (next.examination.tests = addToList(next.examination.tests, t)));
    }

    // 44. Weight loss red flag
    if (systemicFlags.includes("Weight loss")) {
        next.examination.tests = addToList(next.examination.tests, "FBC");
    }

    // 45. Papilledema red flag
    const neuroFlags = next.redFlags.neuro || [];
    if (neuroFlags.includes("Papilledema")) {
        next.examination["Papilloedema"] = "+";
    }

    // 46. Visual red flags
    if (hasAny(neuroFlags, ["Visual disturbances", "Eye movement abnormalities"])) {
        next.examination["Eye Movement.describe"] = addNote(
            next.examination["Eye Movement.describe"],
            "Suggested check: visual/eye red flag selected on Page 3."
        );
    }

    // 47. Gait/Ataxia red flags
    if (hasAny(neuroFlags, ["Abnormal gait", "Ataxia"])) {
        next.examination["Gait.describe"] = addNote(next.examination["Gait.describe"], "Suggested check: gait/ataxia red flag selected on Page 3.");
    }

    // 48. Serious position/pattern red flags
    const seriousPositionFlags = [
        "Progressive",
        "Head trauma",
        "Triggered by Valsalva",
        "Sudden onset",
        "Worse upright",
        "Worse supine",
        "Onset in sleep/early morning",
    ];
    if (hasAny(next.redFlags.position, seriousPositionFlags)) {
        next.examination.tests = addToList(next.examination.tests, "Brain Imaging");
    }

    // PAGE 5 -> PAGE 7

    // 49. Diagnosis status
    const diagConditions = [
        { id: "migraineNoAura.status", name: "Migraine without Aura" },
        { id: "migraineAura.status", name: "Migraine with Aura" },
        { id: "tension.status", name: "Tension-type Headache" },
        { id: "cluster.status", name: "Cluster Headache" },
    ];
    diagConditions.forEach((cond) => {
        if (next.diagnosis[cond.id]) {
            next.final.diagnosis = addNote(
                next.final.diagnosis,
                `Suggested diagnosis status from Page 5: ${cond.name} = ${next.diagnosis[cond.id]}. Doctor must confirm.`
            );
        }
    });

    return next;
};

function createInitialState() {

    return {
        patient: {
            firstName: "",
            lastName: "",
            phone: "",
            whatsapp: "",
            email: "",
            registeredDate: "",
            dob: "",
            age: "",
            registrationCode: "",
            gender: "",
            ethnicity: "",
        },
        birth: {},
        perinatal: {
            complications: [],
        },
        familyRows: [
            { relation: "Mother", issues: [] }, 
            { relation: "Father", issues: [] }, 
            { relation: "Sibling 1", issues: [] },
            { relation: "Sibling 2", issues: [] },
            { relation: "Sibling 3", issues: [] }
        ],
        clinicPath: {},
        referral: {},
        development: {},
        headache: {
            exclude: [],
        },
        history: {
            location: [],
            painNature: [],
            relief: [],
            timeOfDay: [],
            premonitory: [],
            aggravating: [],
            associated: [],
            prodromalSymptoms: [],
        },
        impact: {},
        yesterday: {},
        time: {
            prodromal: { hasProdromal: "No", symptoms: [] },
            aura: { hasAura: "No", symptoms: [] },
            headache: {},
            postdrome: { hasPostdrome: "No", symptoms: [] }
        },
        aura: {
            types: [],
        },
        medical: {
            allergies: [],
        },
        redFlags: {
            systemic: [],
            neuro: [],
            position: [],
        },
        evaluations: {},
        diagnosis: {
            migraineNoAuraCharacteristics: [],
            migraineNoAuraAssociated: [],
            auraTypes: [],
            auraCharacteristics: [],
            tensionCharacteristics: [],
            tensionAssociated: [],
            clusterSymptoms: [],
        },
        examination: {
            tests: [],
        },
        fressh: {},
        final: {},
    };
}

function getScore(value) {
    const match = String(value || "").match(/^\s*(\d+)/);
    return match ? Number(match[1]) : 0;
}

function Field({ label, children, required }) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
                {label} {required && <span className="text-rose-600">*</span>}
            </span>
            {children}
        </label>
    );
}

function TextInput({ value, onChange, type = "text", placeholder = "" }) {
    return (
        <input
            type={type}
            value={value || ""}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
    );
}

function TextArea({ value, onChange, placeholder = "" }) {
    return (
        <textarea
            value={value || ""}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
    );
}

function OptionGroup({ options, value, onChange, type = "radio", columns = "md:grid-cols-3" }) {
    const selected = Array.isArray(value) ? value : [];
    return (
        <div className={`grid grid-cols-1 gap-2 ${columns}`}>
            {options.map((option) => {
                const checked = type === "checkbox" ? selected.includes(option) : value === option;
                return (
                    <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${checked ? "border-sky-400 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                    >
                        <input
                            type={type}
                            checked={checked}
                            onChange={() => {
                                if (type === "checkbox") {
                                    const next = checked ? selected.filter((item) => item !== option) : [...selected, option];
                                    onChange(next);
                                } else {
                                    onChange(option);
                                }
                            }}
                            className="h-4 w-4 accent-sky-600"
                        />
                        <span>{option}</span>
                    </label>
                );
            })}
        </div>
    );
}

function SeverityFaceSelector({ value, onChange }) {
    const options = [
        {
            value: "Not bad",
            emoji: "🙂",
            title: "Not bad",
            description: "Mild / manageable",
            classes: "bg-emerald-50/50 border-emerald-200 ring-emerald-100"
        },
        {
            value: "Quite bad",
            emoji: "😟",
            title: "Quite bad",
            description: "Moderate discomfort",
            classes: "bg-amber-50/50 border-amber-200 ring-amber-100"
        },
        {
            value: "Very bad",
            emoji: "😣",
            title: "Very bad",
            description: "Severe pain",
            classes: "bg-rose-50/50 border-rose-200 ring-rose-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`flex flex-col items-center p-6 md:p-8 min-h-[180px] rounded-[2rem] border-2 transition-all duration-500 text-center space-y-4
                            ${isSelected 
                                ? `${opt.classes} border-opacity-100 ring-8 shadow-xl scale-[1.05] z-10` 
                                : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 opacity-80 hover:opacity-100"
                            }`}
                    >
                        <span className="text-5xl md:text-6xl transform transition-transform duration-500">{opt.emoji}</span>
                        <div className="space-y-1">
                            <div className={`text-lg md:text-xl font-black ${isSelected ? "text-slate-900" : "text-slate-700"}`}>{opt.title}</div>
                            <div className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-widest">{opt.description}</div>
                        </div>
                        {isSelected && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full shadow-inner">
                                <div className="h-2 w-2 rounded-full bg-slate-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Selected</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function PageNavigation({ page, totalPages, setPage, titles }) {
    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <button
                type="button"
                disabled={page === 0}
                onClick={() => {
                    setPage((p) => Math.max(0, p - 1));
                    handleScrollTop();
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
                Previous Page
            </button>
            <div className="hidden sm:block text-center text-sm font-bold text-slate-600">
                Page {page + 1} of {totalPages}: {titles[page]}
            </div>
            <div className="sm:hidden text-center text-sm font-bold text-slate-600">
                {page + 1} / {totalPages}
            </div>
            <button
                type="button"
                disabled={page === totalPages - 1}
                onClick={() => {
                    setPage((p) => Math.min(totalPages - 1, p + 1));
                    handleScrollTop();
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
                Next Page
            </button>
        </div>
    );
}

function Card({ title, description, children }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-5 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            <div className="space-y-5">{children}</div>
        </section>
    );
}

function Grid({ children }) {
    return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

export default function BeatHeadacheNewPatientForm() {
    const [page, setPage] = useState(0);
    const [form, setForm] = useState(createInitialState);
    const [activeSiblingTab, setActiveSiblingTab] = useState(2); // Sibling 1 is index 2

    const update = (section, key, value) => {
        setForm((prev) => {
            const next = { ...prev, [section]: { ...prev[section], [key]: value } };
            return applyForwardReflections(next);
        });
    };

    const updateFamily = (index, key, value) => {
        setForm((prev) => {
            const rows = [...prev.familyRows];
            rows[index] = { ...rows[index], [key]: value };
            const next = { ...prev, familyRows: rows };
            return applyForwardReflections(next);
        });
    };

    const fresshTotal = useMemo(
        () => fressh.reduce((sum, item) => sum + getScore(form.fressh[item.name]), 0),
        [form.fressh]
    );

    function renderPageOne() {
        return (
            <div className="space-y-6">
                <Card title="New Patient" description="Patient identification and registration details.">
                    <Grid>
                        <Field label="First Name" required><TextInput value={form.patient.firstName} onChange={(v) => update("patient", "firstName", v)} /></Field>
                        <Field label="Last Name" required><TextInput value={form.patient.lastName} onChange={(v) => update("patient", "lastName", v)} /></Field>
                        <Field label="Phone"><TextInput value={form.patient.phone} onChange={(v) => update("patient", "phone", v)} /></Field>
                        <Field label="WhatsApp"><TextInput value={form.patient.whatsapp} onChange={(v) => update("patient", "whatsapp", v)} /></Field>
                        <Field label="Email Address"><TextInput type="email" value={form.patient.email} onChange={(v) => update("patient", "email", v)} /></Field>
                        <Field label="Registered Date"><TextInput type="date" value={form.patient.registeredDate} onChange={(v) => update("patient", "registeredDate", v)} /></Field>
                        <Field label="DOB"><TextInput type="date" value={form.patient.dob} onChange={(v) => update("patient", "dob", v)} /></Field>
                        <Field label="Age(Years)"><TextInput type="number" value={form.patient.age} onChange={(v) => update("patient", "age", v)} /></Field>
                        <Field label="Registration Code" required><TextInput value={form.patient.registrationCode} onChange={(v) => update("patient", "registrationCode", v)} /></Field>
                    </Grid>
                    <Field label="Gender"><OptionGroup options={genderOptions} value={form.patient.gender} onChange={(v) => update("patient", "gender", v)} columns="md:grid-cols-2" /></Field>
                    <Field label="Ethnicity"><OptionGroup options={ethnicityOptions} value={form.patient.ethnicity} onChange={(v) => update("patient", "ethnicity", v)} /></Field>
                </Card>

                <Card title="Birth History">
                    <Grid>
                        <Field label="Parity of Mother"><TextInput value={form.birth.parity} onChange={(v) => update("birth", "parity", v)} /></Field>
                        <Field label="Duration of Gestation(weeks)"><TextInput type="number" value={form.birth.gestation} onChange={(v) => update("birth", "gestation", v)} /></Field>
                        <Field label="Birth Weight(Kg)"><TextInput type="number" value={form.birth.birthWeight} onChange={(v) => update("birth", "birthWeight", v)} /></Field>
                        <Field label="Family Income (LKR/Month)"><TextInput type="number" value={form.birth.familyIncome} onChange={(v) => update("birth", "familyIncome", v)} /></Field>
                    </Grid>
                    <Field label="Mode of Delivery"><OptionGroup options={["NVD", "Forceps", "Vaccum", "LSCS"]} value={form.birth.delivery} onChange={(v) => update("birth", "delivery", v)} /></Field>
                    <Field label="Consanguinity"><OptionGroup options={["Y", "N"]} value={form.birth.consanguinity} onChange={(v) => update("birth", "consanguinity", v)} columns="md:grid-cols-2" /></Field>
                </Card>

                <Card title="Perinatal History">
                    <Field label="PBU Stay"><OptionGroup options={yesNoYN} value={form.perinatal.pbuStay} onChange={(v) => {
                        update("perinatal", "pbuStay", v);
                        if (v === "N") {
                            update("perinatal", "pbuDays", "");
                            update("perinatal", "complications", []);
                            update("perinatal", "other", "");
                        }
                    }} /></Field>
                    {form.perinatal.pbuStay === "Y" && (
                        <div className="space-y-5 border-l-4 border-sky-400 pl-4 transition-all duration-300 ease-in-out">
                            <Field label="If Yes, Days"><TextInput type="number" value={form.perinatal.pbuDays} onChange={(v) => update("perinatal", "pbuDays", v)} /></Field>
                            <Field label="Complications"><OptionGroup type="checkbox" options={complicationOptions} value={form.perinatal.complications} onChange={(v) => update("perinatal", "complications", v)} columns="md:grid-cols-4" /></Field>
                            <Field label="Other"><TextArea value={form.perinatal.other} onChange={(v) => update("perinatal", "other", v)} /></Field>
                        </div>
                    )}
                </Card>

                <Card title="Developmental History">
                    <Field label="Gross motor issue?"><OptionGroup options={yesNo} value={form.development.grossMotorIssue} onChange={(v) => update("development", "grossMotorIssue", v)} columns="md:grid-cols-2" /></Field>
                    {form.development.grossMotorIssue === "Yes" && <Field label="Describe gross motor issue"><TextArea value={form.development.grossMotorDescribe} onChange={(v) => update("development", "grossMotorDescribe", v)} /></Field>}
                    
                    <Field label="Fine motor issue?"><OptionGroup options={yesNo} value={form.development.fineMotorIssue} onChange={(v) => update("development", "fineMotorIssue", v)} columns="md:grid-cols-2" /></Field>
                    {form.development.fineMotorIssue === "Yes" && <Field label="Describe fine motor issue"><TextArea value={form.development.fineMotorDescribe} onChange={(v) => update("development", "fineMotorDescribe", v)} /></Field>}
                    
                    <Field label="Speech issue?"><OptionGroup options={yesNo} value={form.development.speechIssue} onChange={(v) => update("development", "speechIssue", v)} columns="md:grid-cols-2" /></Field>
                    {form.development.speechIssue === "Yes" && <Field label="Describe speech issue"><TextArea value={form.development.speechDescribe} onChange={(v) => update("development", "speechDescribe", v)} /></Field>}
                    
                    <Field label="Other developmental concerns"><TextArea value={form.development.other} onChange={(v) => update("development", "other", v)} /></Field>
                </Card>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card title="Mother">
                        <Grid>
                            <Field label="Age"><TextInput type="number" value={form.familyRows[0].age} onChange={(v) => updateFamily(0, "age", v)} /></Field>
                            <Field label="Occupation"><TextInput value={form.familyRows[0].occupation} onChange={(v) => updateFamily(0, "occupation", v)} /></Field>
                        </Grid>
                        <div className="mt-4">
                            <Field label="Issues"><OptionGroup type="checkbox" options={familyIssues} value={form.familyRows[0].issues} onChange={(v) => updateFamily(0, "issues", v)} columns="grid-cols-2" /></Field>
                        </div>
                        <div className="mt-4">
                            <Field label="Describe"><TextArea value={form.familyRows[0].describe} onChange={(v) => updateFamily(0, "describe", v)} /></Field>
                        </div>
                    </Card>

                    <Card title="Father">
                        <Grid>
                            <Field label="Age"><TextInput type="number" value={form.familyRows[1].age} onChange={(v) => updateFamily(1, "age", v)} /></Field>
                            <Field label="Occupation"><TextInput value={form.familyRows[1].occupation} onChange={(v) => updateFamily(1, "occupation", v)} /></Field>
                        </Grid>
                        <div className="mt-4">
                            <Field label="Issues"><OptionGroup type="checkbox" options={familyIssues} value={form.familyRows[1].issues} onChange={(v) => updateFamily(1, "issues", v)} columns="grid-cols-2" /></Field>
                        </div>
                        <div className="mt-4">
                            <Field label="Describe"><TextArea value={form.familyRows[1].describe} onChange={(v) => updateFamily(1, "describe", v)} /></Field>
                        </div>
                    </Card>
                </div>

                <Card title="Siblings">
                    <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-2xl w-fit">
                        {[2, 3, 4].map((idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveSiblingTab(idx)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    activeSiblingTab === idx 
                                    ? "bg-white text-sky-600 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Sibling {idx - 1}
                            </button>
                        ))}
                    </div>

                    <div key={activeSiblingTab} className="transition-all duration-300 ease-in-out">
                        <Grid>
                            <Field label="Age"><TextInput type="number" value={form.familyRows[activeSiblingTab].age} onChange={(v) => updateFamily(activeSiblingTab, "age", v)} /></Field>
                            <Field label="Occupation"><TextInput value={form.familyRows[activeSiblingTab].occupation} onChange={(v) => updateFamily(activeSiblingTab, "occupation", v)} /></Field>
                        </Grid>
                        <div className="mt-4">
                            <Field label="Issues"><OptionGroup type="checkbox" options={familyIssues} value={form.familyRows[activeSiblingTab].issues} onChange={(v) => updateFamily(activeSiblingTab, "issues", v)} columns="md:grid-cols-4" /></Field>
                        </div>
                        <div className="mt-4">
                            <Field label="Describe"><TextArea value={form.familyRows[activeSiblingTab].describe} onChange={(v) => updateFamily(activeSiblingTab, "describe", v)} /></Field>
                        </div>
                    </div>
                </Card>

                <Card title="Path to Headache Clinic">
                    <Field label="Who initiated the visit?"><OptionGroup options={["Self / Parent", "Medical officer", "Specialist", "School", "Other"]} value={form.clinicPath.initiatedBy} onChange={(v) => update("clinicPath", "initiatedBy", v)} /></Field>
                    {form.clinicPath.initiatedBy === "Other" && <Field label="If Other, specify"><TextInput value={form.clinicPath.initiatedByOther} onChange={(v) => update("clinicPath", "initiatedByOther", v)} /></Field>}
                    
                    <Field label="Has the child been seen before for headache?"><OptionGroup options={["No", "Yes"]} value={form.clinicPath.seenBefore} onChange={(v) => update("clinicPath", "seenBefore", v)} columns="md:grid-cols-2" /></Field>
                    {form.clinicPath.seenBefore === "Yes" && (
                        <Field label="If Yes, where?"><OptionGroup options={["GP / Medical officer", "Paediatrician", "Neurologist", "ENT", "Eye clinic", "Other"]} value={form.clinicPath.seenBeforeWhere} onChange={(v) => update("clinicPath", "seenBeforeWhere", v)} /></Field>
                    )}

                    <Field label="Was a diagnosis given before?"><OptionGroup options={["No", "Yes", "Not sure"]} value={form.clinicPath.previousDiagnosisGiven} onChange={(v) => update("clinicPath", "previousDiagnosisGiven", v)} /></Field>
                    {form.clinicPath.previousDiagnosisGiven === "Yes" && <Field label="If Yes, what diagnosis?"><TextInput value={form.clinicPath.previousDiagnosis} onChange={(v) => update("clinicPath", "previousDiagnosis", v)} /></Field>}

                    <Field label="Previous treatment outcome"><OptionGroup options={["No treatment given", "No improvement", "Some improvement", "Better", "Worse", "Not sure"]} value={form.clinicPath.previousTreatmentOutcome} onChange={(v) => update("clinicPath", "previousTreatmentOutcome", v)} /></Field>
                </Card>

                <Card title="Referral">
                    <Field label="Referral source"><OptionGroup options={["Self / Parent", "Medical officer", "Specialist", "School", "Other"]} value={form.referral.source} onChange={(v) => update("referral", "source", v)} /></Field>
                    {form.referral.source === "Other" && <Field label="If Other, specify"><TextInput value={form.referral.other} onChange={(v) => update("referral", "other", v)} /></Field>}
                    <Field label="Referral notes"><TextArea value={form.referral.notes} onChange={(v) => update("referral", "notes", v)} /></Field>
                </Card>
            </div>
        );
    }

    function renderPageTwo() {
        return (
            <div className="space-y-6">
                <Card title="Confirm headache and visiting clinical characteristics.">
                    <Field label="Exclude"><OptionGroup type="checkbox" options={headacheExclude} value={form.headache.exclude} onChange={(v) => update("headache", "exclude", v)} /></Field>
                    <Field label="Headache Confirmed"><OptionGroup options={yesNo} value={form.headache.confirmed} onChange={(v) => update("headache", "confirmed", v)} columns="md:grid-cols-2" /></Field>
                </Card>

                <Card title="History of the Headache">
                    <Grid>
                        <Field label="Duration(Years)"><TextInput type="number" value={form.history.durationYears} onChange={(v) => update("history", "durationYears", v)} /></Field>
                        <Field label="Months"><TextInput type="number" value={form.history.durationMonths} onChange={(v) => update("history", "durationMonths", v)} /></Field>
                    </Grid>
                    <Field label="Constant / Variable"><OptionGroup options={["Constant", "Variable"]} value={form.history.pattern} onChange={(v) => update("history", "pattern", v)} columns="md:grid-cols-2" /></Field>
                    <Field label="Location"><OptionGroup type="checkbox" options={locations} value={form.history.location} onChange={(v) => {
                        update("history", "location", v);
                        if (!v.includes("Frontal")) update("history", "frontalSide", "");
                        if (!v.includes("Temporal")) update("history", "temporalSide", "");
                    }} /></Field>
                    <Grid>
                        {form.history.location?.includes("Frontal") && (
                            <div className="transition-all duration-300 ease-in-out">
                                <Field label="If frontal – Side"><OptionGroup options={sideOptions} value={form.history.frontalSide} onChange={(v) => update("history", "frontalSide", v)} /></Field>
                            </div>
                        )}
                        {form.history.location?.includes("Temporal") && (
                            <div className="transition-all duration-300 ease-in-out">
                                <Field label="If Temporal – Side"><OptionGroup options={sideOptions} value={form.history.temporalSide} onChange={(v) => update("history", "temporalSide", v)} /></Field>
                            </div>
                        )}
                    </Grid>
                    <Field label="Nature of Pain"><OptionGroup type="checkbox" options={painNature} value={form.history.painNature} onChange={(v) => update("history", "painNature", v)} columns="md:grid-cols-2" /></Field>
                </Card>

                <Card title="T-Time">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* A) Prodromal */}
                        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 transition-all duration-300">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2">Prodromal</h3>
                            <Field label="Before the headache starts, does the child get warning symptoms?">
                                <OptionGroup 
                                    options={["No", "Yes"]} 
                                    value={form.time.prodromal.hasProdromal} 
                                    onChange={(v) => update("time", "prodromal", { ...form.time.prodromal, hasProdromal: v })} 
                                    columns="md:grid-cols-2" 
                                />
                            </Field>
                            {form.time.prodromal.hasProdromal === "Yes" && (
                                <div className="space-y-4 border-l-2 border-sky-400 pl-3 transition-all duration-300">
                                    <Field label="Prodromal symptoms">
                                        <OptionGroup 
                                            type="checkbox" 
                                            options={["Pallor", "Fatigue", "Irritability", "Mood change", "Yawning", "Other"]} 
                                            value={form.time.prodromal.symptoms} 
                                            onChange={(v) => update("time", "prodromal", { ...form.time.prodromal, symptoms: v })} 
                                        />
                                    </Field>
                                    {safeArray(form.time.prodromal.symptoms).includes("Other") && (
                                        <Field label="Specify other prodromal symptom">
                                            <TextInput value={form.time.prodromal.other} onChange={(v) => update("time", "prodromal", { ...form.time.prodromal, other: v })} />
                                        </Field>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* B) Aura */}
                        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 transition-all duration-300">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2">Aura</h3>
                            <Field label="Does the child get aura symptoms?">
                                <OptionGroup 
                                    options={["No", "Yes"]} 
                                    value={form.time.aura.hasAura} 
                                    onChange={(v) => update("time", "aura", { ...form.time.aura, hasAura: v })} 
                                    columns="md:grid-cols-2" 
                                />
                            </Field>
                            {form.time.aura.hasAura === "Yes" && (
                                <div className="space-y-4 border-l-2 border-amber-400 pl-3 transition-all duration-300">
                                    <Field label="Aura symptoms">
                                        <OptionGroup 
                                            type="checkbox" 
                                            options={["Visual", "Auditory", "Gustatory", "Motor", "Brainstem", "Retinal", "Other"]} 
                                            value={form.time.aura.symptoms} 
                                            onChange={(v) => update("time", "aura", { ...form.time.aura, symptoms: v })} 
                                        />
                                    </Field>
                                    {safeArray(form.time.aura.symptoms).includes("Other") && (
                                        <Field label="Specify other aura symptom">
                                            <TextInput value={form.time.aura.other} onChange={(v) => update("time", "aura", { ...form.time.aura, other: v })} />
                                        </Field>
                                    )}
                                    <Field label="Aura duration">
                                        <OptionGroup 
                                            options={["Less than 5 minutes", "5–60 minutes", "More than 60 minutes", "Not sure"]} 
                                            value={form.time.aura.duration} 
                                            onChange={(v) => update("time", "aura", { ...form.time.aura, duration: v })} 
                                        />
                                    </Field>
                                    <Field label="Aura side">
                                        <OptionGroup 
                                            options={["Left", "Right", "Both sides", "Not sure"]} 
                                            value={form.time.aura.side} 
                                            onChange={(v) => update("time", "aura", { ...form.time.aura, side: v })} 
                                            columns="md:grid-cols-2" 
                                        />
                                    </Field>
                                    <Field label="When does aura happen?">
                                        <OptionGroup 
                                            options={["Before headache", "During headache", "After headache", "Not sure"]} 
                                            value={form.time.aura.timing} 
                                            onChange={(v) => update("time", "aura", { ...form.time.aura, timing: v })} 
                                            columns="md:grid-cols-2" 
                                        />
                                    </Field>
                                    <Field label="Does the aura spread gradually?">
                                        <OptionGroup 
                                            options={["No", "Yes", "Not sure"]} 
                                            value={form.time.aura.gradualSpread} 
                                            onChange={(v) => update("time", "aura", { ...form.time.aura, gradualSpread: v })} 
                                            columns="md:grid-cols-3" 
                                        />
                                    </Field>
                                </div>
                            )}
                        </div>

                        {/* C) Headache */}
                        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 transition-all duration-300">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2">Headache</h3>
                            <Field label="Duration of headache episode">
                                <OptionGroup 
                                    options={["Less than 1 hour", "1–2 hours", "2–4 hours", "More than 4 hours", "All day"]} 
                                    value={form.time.headache.duration} 
                                    onChange={(v) => update("time", "headache", { ...form.time.headache, duration: v })} 
                                />
                            </Field>
                        </div>

                        {/* D) Postdrome */}
                        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 transition-all duration-300">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2">Postdrome</h3>
                            <Field label="After the headache, does the child feel unwell, tired, confused, or different?">
                                <OptionGroup 
                                    options={["No", "Yes"]} 
                                    value={form.time.postdrome.hasPostdrome} 
                                    onChange={(v) => update("time", "postdrome", { ...form.time.postdrome, hasPostdrome: v })} 
                                    columns="md:grid-cols-2" 
                                />
                            </Field>
                            {form.time.postdrome.hasPostdrome === "Yes" && (
                                <div className="space-y-4 border-l-2 border-slate-400 pl-3 transition-all duration-300">
                                    <Field label="Postdrome symptoms">
                                        <OptionGroup 
                                            type="checkbox" 
                                            options={["Tiredness", "Sleepiness", "Confusion", "Mood change", "Weakness", "Other"]} 
                                            value={form.time.postdrome.symptoms} 
                                            onChange={(v) => update("time", "postdrome", { ...form.time.postdrome, symptoms: v })} 
                                        />
                                    </Field>
                                    {safeArray(form.time.postdrome.symptoms).includes("Other") && (
                                        <Field label="Specify other postdrome symptom">
                                            <TextInput value={form.time.postdrome.other} onChange={(v) => update("time", "postdrome", { ...form.time.postdrome, other: v })} />
                                        </Field>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="Headache Frequency and Medicine Use">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2">Headache days</h3>
                            <Field label="Last week">
                                <p className="text-xs text-slate-500 mb-1">How many days did the child have a headache?</p>
                                <TextInput type="number" value={form.history.headacheDaysLastWeek} onChange={(v) => update("history", "headacheDaysLastWeek", v)} placeholder="0 to 7 days" />
                            </Field>
                            <Field label="Last 4 weeks">
                                <p className="text-xs text-slate-500 mb-1">How many days did the child have a headache?</p>
                                <TextInput type="number" value={form.history.headacheDaysLastFourWeeks} onChange={(v) => update("history", "headacheDaysLastFourWeeks", v)} placeholder="0 to 28 days" />
                            </Field>
                        </div>
                        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2">Medicine days</h3>
                            <Field label="Last week">
                                <p className="text-xs text-slate-500 mb-1">How many days did the child take medicine?</p>
                                <TextInput type="number" value={form.history.medicineDaysLastWeek} onChange={(v) => update("history", "medicineDaysLastWeek", v)} placeholder="0 to 7 days" />
                            </Field>
                            <Field label="Last 4 weeks">
                                <p className="text-xs text-slate-500 mb-1">How many days did the child take medicine?</p>
                                <TextInput type="number" value={form.history.medicineDaysLastFourWeeks} onChange={(v) => update("history", "medicineDaysLastFourWeeks", v)} placeholder="0 to 28 days" />
                            </Field>
                        </div>
                    </div>
                </Card>

                <Card title="Impact Questions">
                    <p className="text-sm text-slate-500 mb-4">These questions are about how headaches affect the child’s life.</p>
                    <Grid>
                        <Field label="School absence (Last 4 weeks)">
                            <p className="text-xs text-slate-500 mb-1">How many days did the child not go to school?</p>
                            <TextInput type="number" value={form.impact.schoolAbsentDaysLastFourWeeks} onChange={(v) => update("impact", "schoolAbsentDaysLastFourWeeks", v)} placeholder="0 to 20 school days" />
                        </Field>
                        <Field label="Left school early (Last 4 weeks)">
                            <p className="text-xs text-slate-500 mb-1">How many days did the child leave school early?</p>
                            <TextInput type="number" value={form.impact.leftSchoolEarlyDaysLastFourWeeks} onChange={(v) => update("impact", "leftSchoolEarlyDaysLastFourWeeks", v)} placeholder="0 to 20 school days" />
                        </Field>
                        <Field label="Activity limitation (Last 4 weeks)">
                            <p className="text-xs text-slate-500 mb-1">How many days could the child not do things they wanted?</p>
                            <TextInput type="number" value={form.impact.activityLimitedDaysLastFourWeeks} onChange={(v) => update("impact", "activityLimitedDaysLastFourWeeks", v)} placeholder="0 to 28 days" />
                        </Field>
                        <Field label="Parent work loss">
                            <p className="text-xs text-slate-500 mb-1">Did the headaches cause parents to lose time from work?</p>
                            <OptionGroup options={yesNo} value={form.impact.parentLostWork} onChange={(v) => update("impact", "parentLostWork", v)} columns="md:grid-cols-2" />
                        </Field>
                    </Grid>
                    {form.impact.parentLostWork === "Yes" && (
                        <Field label="Total number of parent work days lost">
                            <TextInput type="number" value={form.impact.parentLostWorkDays} onChange={(v) => update("impact", "parentLostWorkDays", v)} placeholder="0 to 28 days" />
                        </Field>
                    )}
                </Card>

                <Card title="Yesterday Questions">
                    <Field label="Did the child have a headache yesterday?"><OptionGroup options={yesNo} value={form.yesterday.hadHeadacheYesterday} onChange={(v) => update("yesterday", "hadHeadacheYesterday", v)} columns="md:grid-cols-2" /></Field>
                    {form.yesterday.hadHeadacheYesterday === "Yes" && (
                        <div className="space-y-5 border-l-4 border-slate-400 pl-4 transition-all duration-300 ease-in-out">
                            <Field label="How long did yesterday's headache last?"><OptionGroup options={["Less than 1 hour", "1–2 hours", "2–4 hours", "More than 4 hours"]} value={form.yesterday.duration} onChange={(v) => update("yesterday", "duration", v)} /></Field>
                            <Field label="How bad was yesterday's headache?"><OptionGroup options={["Not bad", "Quite bad", "Very bad"]} value={form.yesterday.severity} onChange={(v) => update("yesterday", "severity", v)} columns="md:grid-cols-3" /></Field>
                            <Field label="Did the child take medicine yesterday?"><OptionGroup options={yesNo} value={form.yesterday.tookMedicine} onChange={(v) => update("yesterday", "tookMedicine", v)} columns="md:grid-cols-2" /></Field>
                        </div>
                    )}
                </Card>

                <Card title="How Many Times & Severity">
                    <Grid>
                        <Field label="Per Day"><TextInput type="number" value={form.history.perDay} onChange={(v) => update("history", "perDay", v)} /></Field>
                        <Field label="Per Week"><TextInput type="number" value={form.history.perWeek} onChange={(v) => update("history", "perWeek", v)} /></Field>
                        <Field label="Per Month"><TextInput type="number" value={form.history.perMonth} onChange={(v) => update("history", "perMonth", v)} /></Field>
                        <Field label="Seasonal"><TextInput value={form.history.seasonal} onChange={(v) => update("history", "seasonal", v)} /></Field>
                    </Grid>
                    
                    <Field label="Severity" description="Select the usual headache severity.">
                        <SeverityFaceSelector 
                            value={form.time.headache.severity} 
                            onChange={(v) => update("time", "headache", { ...form.time.headache, severity: v })} 
                        />
                    </Field>
                    
                    <Field label="What makes the pain feel better?"><OptionGroup type="checkbox" options={reliefOptions} value={form.history.relief} onChange={(v) => update("history", "relief", v)} columns="md:grid-cols-2" /></Field>
                    <Field label="What makes the pain feel better? Others (specify)"><TextArea value={form.history.reliefOther} onChange={(v) => update("history", "reliefOther", v)} /></Field>
                    <Field label="What time of the day you get the headache?"><OptionGroup type="checkbox" options={timeOptions} value={form.history.timeOfDay} onChange={(v) => update("history", "timeOfDay", v)} /></Field>
                    <Field label="Premonitory symptoms"><OptionGroup type="checkbox" options={premonitoryOptions} value={form.history.premonitory} onChange={(v) => update("history", "premonitory", v)} /></Field>
                    <Field label="Aggravating Factors"><OptionGroup type="checkbox" options={aggravatingOptions} value={form.history.aggravating} onChange={(v) => update("history", "aggravating", v)} /></Field>
                    <Field label="Headache was associated with;"><OptionGroup type="checkbox" options={associatedSymptoms} value={form.history.associated} onChange={(v) => update("history", "associated", v)} columns="md:grid-cols-3" /></Field>
                </Card>
            </div>
        );
    }
    function renderPageThree() {
        return (
            <div className="space-y-6">
                <Card title="Past Medical / Surgical / Drug / Allergy History">
                    <Field label="Past Medical History"><TextArea value={form.medical.pastMedical} onChange={(v) => update("medical", "pastMedical", v)} /></Field>
                    <Field label="Past Surgical History"><TextArea value={form.medical.pastSurgical} onChange={(v) => update("medical", "pastSurgical", v)} /></Field>
                    <Field label="Drug History (if any)"><TextArea value={form.medical.drugHistory} onChange={(v) => update("medical", "drugHistory", v)} /></Field>
                    <Field label="History of allergies"><OptionGroup type="checkbox" options={["Food", "Drug", "Plaster"]} value={form.medical.allergies} onChange={(v) => update("medical", "allergies", v)} /></Field>
                    {(form.medical.allergies?.length > 0) && (
                        <div className="transition-all duration-300 ease-in-out">
                            <Field label="History of allergies(Please Specify)"><TextArea value={form.medical.allergySpecify} onChange={(v) => update("medical", "allergySpecify", v)} /></Field>
                        </div>
                    )}
                </Card>

                <Card title="Identification of Life Threatening Headache (Red Flags)">
                    <Field label="SYSTEMIC SIGNS/SYMPTOMS"><OptionGroup type="checkbox" options={redFlagSystemic} value={form.redFlags.systemic} onChange={(v) => update("redFlags", "systemic", v)} columns="md:grid-cols-2" /></Field>
                    <Field label="NEUROLOGIC SIGNS/SYMPTOMS"><OptionGroup type="checkbox" options={redFlagNeuro} value={form.redFlags.neuro} onChange={(v) => update("redFlags", "neuro", v)} columns="md:grid-cols-2" /></Field>
                    <Field label="AGGRAVATION WITH POSITION"><OptionGroup type="checkbox" options={redFlagPosition} value={form.redFlags.position} onChange={(v) => update("redFlags", "position", v)} columns="md:grid-cols-2" /></Field>
                </Card>

                <Card title="Verifying – Secondary headache status" description="Structural, functional, metabolic or other secondary headache review.">
                    <Field label="Secondary headache status"><TextArea value={form.medical.secondaryStatus} onChange={(v) => update("medical", "secondaryStatus", v)} /></Field>
                </Card>
            </div>
        );
    }

    function renderEvaluationBlock(source) {
        return (
            <Card title={source} key={source}>
                {evalAreas.map((area) => (
                    <div key={area} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <Field label={area}>
                            <OptionGroup
                                options={evaluationScale}
                                value={form.evaluations[`${source}.${area}`]}
                                onChange={(v) => update("evaluations", `${source}.${area}`, v)}
                                columns="md:grid-cols-3"
                            />
                        </Field>
                        <div className="mt-3">
                            <Field label="Notes"><TextArea value={form.evaluations[`${source}.${area}.notes`]} onChange={(v) => update("evaluations", `${source}.${area}.notes`, v)} /></Field>
                        </div>
                    </div>
                ))}
            </Card>
        );
    }

    function renderPageFour() {
        return <div className="space-y-6">{evalSources.map(renderEvaluationBlock)}</div>;
    }

    function YesNoCriterion({ label, id }) {
        return <Field label={label}><OptionGroup options={yesNo} value={form.diagnosis[id]} onChange={(v) => update("diagnosis", id, v)} columns="md:grid-cols-2" /></Field>;
    }

    function DiagnosisStatus({ id }) {
        return <Field label="Diagnosis"><OptionGroup options={diagnosisStatuses} value={form.diagnosis[id]} onChange={(v) => update("diagnosis", id, v)} /></Field>;
    }

    function renderPageFive() {
        return (
            <div className="space-y-6">
                <Card title="Diagnosing Primary headaches – as per International Headache Society (IHS) Standards." />

                <Card title="Section 1 : ICHD-3 diagnostic criteria for MIGRAINE without AURA">
                    {migraineNoAuraCriteria.map((item, i) => <YesNoCriterion key={item} label={item} id={`migraineNoAura.${i}`} />)}
                    <Field label="Characteristics"><OptionGroup type="checkbox" options={migraineNoAuraCharacteristics} value={form.diagnosis.migraineNoAuraCharacteristics} onChange={(v) => update("diagnosis", "migraineNoAuraCharacteristics", v)} columns="md:grid-cols-2" /></Field>
                    <Field label="Associated symptoms"><OptionGroup type="checkbox" options={migraineNoAuraAssociated} value={form.diagnosis.migraineNoAuraAssociated} onChange={(v) => update("diagnosis", "migraineNoAuraAssociated", v)} columns="md:grid-cols-2" /></Field>
                    <DiagnosisStatus id="migraineNoAura.status" />
                </Card>

                <Card title="Section 2: ICHD-3 diagnostic criteria for MIGRAINE WITH AURA">
                    {migraineAuraCriteria.map((item, i) => <YesNoCriterion key={item} label={item} id={`migraineAura.${i}`} />)}
                    <Field label="Aura symptoms"><OptionGroup type="checkbox" options={auraTypes} value={form.diagnosis.auraTypes} onChange={(v) => update("diagnosis", "auraTypes", v)} /></Field>
                    <Field label="Aura characteristics"><OptionGroup type="checkbox" options={auraCharacteristics} value={form.diagnosis.auraCharacteristics} onChange={(v) => update("diagnosis", "auraCharacteristics", v)} columns="md:grid-cols-2" /></Field>
                    <DiagnosisStatus id="migraineAura.status" />
                </Card>

                <Card title="Section 3: ICHD-3 diagnostic criteria for TENSION TYPE HEADACHE">
                    {tensionCriteria.map((item, i) => <YesNoCriterion key={item} label={item} id={`tension.${i}`} />)}
                    <Field label="Characteristics"><OptionGroup type="checkbox" options={tensionCharacteristics} value={form.diagnosis.tensionCharacteristics} onChange={(v) => update("diagnosis", "tensionCharacteristics", v)} columns="md:grid-cols-2" /></Field>
                    <Field label="Both of the following"><OptionGroup type="checkbox" options={tensionAssociated} value={form.diagnosis.tensionAssociated} onChange={(v) => update("diagnosis", "tensionAssociated", v)} columns="md:grid-cols-2" /></Field>
                    <DiagnosisStatus id="tension.status" />
                </Card>

                <Card title="Section 4 : ICHD-3 diagnostic criteria for CLUSTER HEADACHE">
                    {clusterCriteria.map((item, i) => <YesNoCriterion key={item} label={item} id={`cluster.${i}`} />)}
                    <Field label="Symptoms or signs, ipsilateral to the headache"><OptionGroup type="checkbox" options={clusterSymptoms} value={form.diagnosis.clusterSymptoms} onChange={(v) => update("diagnosis", "clusterSymptoms", v)} columns="md:grid-cols-2" /></Field>
                    <DiagnosisStatus id="cluster.status" />
                </Card>
            </div>
        );
    }

    function renderPageSix() {
        return (
            <div className="space-y-6">
                <Card title="Considerations for further investigations" description="CT and/or MRI scanning / Blood / urine / general tests.">
                    <Grid>
                        <Field label="Height(cm)"><TextInput type="number" value={form.examination.height} onChange={(v) => update("examination", "height", v)} /></Field>
                        <Field label="Weight(kg)"><TextInput type="number" value={form.examination.weight} onChange={(v) => update("examination", "weight", v)} /></Field>
                        <Field label="Weight for Height (<5years)"><TextInput value={form.examination.weightForHeight} onChange={(v) => update("examination", "weightForHeight", v)} /></Field>
                        <Field label="BMI"><TextInput value={form.examination.bmi} onChange={(v) => update("examination", "bmi", v)} /></Field>
                        <Field label="OFC(cm)"><TextInput type="number" value={form.examination.ofc} onChange={(v) => update("examination", "ofc", v)} /></Field>
                        <Field label="Blood P. (systolic)mmHg"><TextInput type="number" value={form.examination.bpSystolic} onChange={(v) => update("examination", "bpSystolic", v)} /></Field>
                        <Field label="Blood P. (diastolic)mmHg"><TextInput type="number" value={form.examination.bpDiastolic} onChange={(v) => update("examination", "bpDiastolic", v)} /></Field>
                        <Field label="Heart Rate"><TextInput type="number" value={form.examination.heartRate} onChange={(v) => update("examination", "heartRate", v)} /></Field>
                    </Grid>

                    {["Dysmorphism", "Neck stifness", "Tenderness over Sinus", "TMJ Tenderness /Dysfunction", "Papilloedema", "Numbness", "Paralysis"].map((item) => (
                        <Field key={item} label={item}><OptionGroup options={plusMinus} value={form.examination[item]} onChange={(v) => update("examination", item, v)} columns="md:grid-cols-2" /></Field>
                    ))}

                    {["Teeth", "Throat", "RS", "Eye Movement", "Gait", "AS"].map((item) => {
                        const showDescribe = form.examination[item] === "AN" || (form.examination[`${item}.describe`] && form.examination[`${item}.describe`].trim().length > 0);
                        return (
                            <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <Field label={item}><OptionGroup options={normalAbnormal} value={form.examination[item]} onChange={(v) => update("examination", item, v)} columns="md:grid-cols-2" /></Field>
                                {showDescribe && (
                                    <div className="mt-3 transition-all duration-300 ease-in-out">
                                        <Field label="Describe"><TextArea value={form.examination[`${item}.describe`]} onChange={(v) => update("examination", `${item}.describe`, v)} /></Field>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <Field label="Cr. Nv. Palsy"><OptionGroup options={["Y", "N"]} value={form.examination.crNvPalsy} onChange={(v) => update("examination", "crNvPalsy", v)} columns="md:grid-cols-2" /></Field>
                        {(form.examination.crNvPalsy === "Y" || (form.examination.crNvPalsyDescribe && form.examination.crNvPalsyDescribe.trim().length > 0)) && (
                            <div className="mt-3 transition-all duration-300 ease-in-out">
                                <Field label="Describe"><TextArea value={form.examination.crNvPalsyDescribe} onChange={(v) => update("examination", "crNvPalsyDescribe", v)} /></Field>
                            </div>
                        )}
                    </div>

                    <Field label="Tests"><OptionGroup type="checkbox" options={tests} value={form.examination.tests} onChange={(v) => update("examination", "tests", v)} /></Field>
                </Card>
            </div>
        );
    }

    function renderPageSeven() {
        return (
            <div className="space-y-6">
                <Card title="FRESSH Lifestyle Score">
                    {fressh.map((item) => {
                        const selectedVal = form.fressh[item.name] || "";
                        const showExtra = item.extra && (
                            (item.name === "Exercise" && selectedVal.includes("More than 2 hours/day")) ||
                            (item.name === "Sleep" && selectedVal.includes("More than 10 hours/day")) ||
                            (item.name === "Screen time" && selectedVal.includes("More than 2 hours/day"))
                        );
                        return (
                            <div key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <Field label={item.name}>
                                    <p className="mb-3 text-sm text-slate-500">{item.prompt}</p>
                                    <OptionGroup options={item.options} value={form.fressh[item.name]} onChange={(v) => update("fressh", item.name, v)} columns="md:grid-cols-1" />
                                </Field>
                                {showExtra && (
                                    <div className="mt-3 transition-all duration-300 ease-in-out">
                                        <Field label={item.extra}><TextInput value={form.fressh[`${item.name}.extra`]} onChange={(v) => update("fressh", `${item.name}.extra`, v)} /></Field>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="rounded-2xl bg-sky-50 p-4 text-center">
                        <div className="text-sm font-semibold text-sky-700">FRESSH Total</div>
                        <div className="text-4xl font-black text-sky-900">{fresshTotal}</div>
                    </div>
                </Card>

                <Card title="Final Plan">
                    <Field label="Diagnosis"><TextArea value={form.final.diagnosis} onChange={(v) => update("final", "diagnosis", v)} /></Field>
                    <Field label="Medication Plan"><TextArea value={form.final.medicationPlan} onChange={(v) => update("final", "medicationPlan", v)} /></Field>
                    <Field label="CC Email Address"><TextInput type="email" value={form.final.ccEmail} onChange={(v) => update("final", "ccEmail", v)} /></Field>
                    <button
                        type="button"
                        onClick={() => console.log("New Patient Form Data", form)}
                        className="w-full rounded-2xl bg-sky-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700"
                    >
                        Submit
                    </button>
                </Card>
            </div>
        );
    }

    const pages = [renderPageOne, renderPageTwo, renderPageThree, renderPageFour, renderPageFive, renderPageSix, renderPageSeven];

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="rounded-3xl bg-gradient-to-br from-sky-700 to-cyan-500 p-6 text-white shadow-lg md:p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-100">Beat Headache</p>
                    <h1 className="mt-2 text-3xl font-black md:text-5xl">New Patient Form</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-sky-50 md:text-base">
                        A React front-end version of the child headache intake form, organized as a 7-page wizard for a cleaner patient and doctor workflow.
                    </p>
                </header>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">i</div>
                        <p>
                            <strong>Forward reflection is enabled.</strong> Earlier answers may auto-fill later clinical review fields. Doctor must confirm all reflected medical items.
                        </p>
                    </div>
                </div>

                <nav className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
                        {pageTitles.map((title, index) => (
                            <button
                                key={title}
                                type="button"
                                onClick={() => setPage(index)}
                                className={`rounded-2xl px-3 py-3 text-left text-xs font-bold transition ${page === index ? "bg-sky-600 text-white shadow-md" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                <span className="block text-[11px] opacity-80">Page {index + 1}</span>
                                {title}
                            </button>
                        ))}
                    </div>
                </nav>

                <PageNavigation page={page} totalPages={pageTitles.length} setPage={setPage} titles={pageTitles} />

                {pages[page]()}

                <PageNavigation page={page} totalPages={pageTitles.length} setPage={setPage} titles={pageTitles} />

                {/* Development Debug Panel */}
                <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-sky-400">Debug Reflection Panel</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const sample = createRandomRealisticTestCase();
                                    const reflected = applyForwardReflections(sample);
                                    setForm(reflected);
                                    setPage(0);
                                    alert("Random realistic test case loaded. Check later pages/debug panel.");
                                }}
                                className="rounded-xl bg-sky-600 px-4 py-3 text-xs font-bold transition hover:bg-sky-500 shadow-lg shadow-sky-900/20"
                            >
                                Fill Realistic Test Case
                            </button>
                            <p className="text-[10px] text-center text-slate-400 font-medium">Generates a different child headache case each time.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const sample = createInitialState();
                                sample.patient.firstName = "Smoke";
                                sample.patient.lastName = "Test";
                                sample.patient.email = "smoke@testmail.com";
                                sample.patient.whatsapp = "0711223344";
                                sample.patient.age = 4;
                                sample.headache.exclude = ["TM joint pain"];
                                
                                // Strong T-Time case
                                sample.time.prodromal.hasProdromal = "Yes";
                                sample.time.prodromal.symptoms = ["Fatigue", "Yawning"];
                                
                                sample.time.aura.hasAura = "Yes";
                                sample.time.aura.symptoms = ["Visual"];
                                sample.time.aura.duration = "5–60 minutes";
                                sample.time.aura.side = "Left";
                                sample.time.aura.timing = "Before headache";
                                sample.time.aura.gradualSpread = "Yes";
                                
                                sample.time.headache.duration = "More than 4 hours";
                                sample.time.headache.severity = "Very bad";
                                
                                sample.time.postdrome.hasPostdrome = "Yes";
                                sample.time.postdrome.symptoms = ["Tiredness", "Sleepiness"];

                                sample.history.painNature = ["Thunder clapping"];
                                sample.history.associated = ["Vomiting", "Vision issues/Diplopia", "Walking difficulty"];
                                sample.history.aggravating = ["Activity"];
                                
                                const reflected = applyForwardReflections(sample);
                                setForm(reflected);
                                console.log("Smoke Test Result:", reflected);
                                alert("Smoke test completed. Check console/debug panel.");
                            }}
                            className="rounded-xl bg-slate-700 px-4 py-2 text-xs font-bold transition hover:bg-slate-600"
                        >
                            Run Reflection Smoke Test
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-6 text-xs md:grid-cols-3">
                        <div className="space-y-2">
                            <p><span className="font-bold text-slate-400">Current Page:</span> {page + 1}</p>
                            <p><span className="font-bold text-slate-400">Prodromal:</span> {form.time?.prodromal?.hasProdromal} ({JSON.stringify(safeArray(form.time?.prodromal?.symptoms))})</p>
                            <p><span className="font-bold text-slate-400">Aura:</span> {form.time?.aura?.hasAura} ({JSON.stringify(safeArray(form.time?.aura?.symptoms))})</p>
                            <p><span className="font-bold text-slate-400">Aura Details:</span> {form.time?.aura?.duration} | {form.time?.aura?.side} | {form.time?.aura?.timing} | Spread: {form.time?.aura?.gradualSpread}</p>
                            <p><span className="font-bold text-slate-400">Headache:</span> {form.time?.headache?.duration} | <span className="text-sky-300">{form.time?.headache?.severity}</span></p>
                            <p><span className="font-bold text-slate-400">Postdrome:</span> {form.time?.postdrome?.hasPostdrome} ({JSON.stringify(safeArray(form.time?.postdrome?.symptoms))})</p>
                        </div>
                        <div className="space-y-2">
                            <p><span className="font-bold text-slate-400">Aura Types:</span> {JSON.stringify(safeArray(form.diagnosis?.auraTypes))}</p>
                            <p><span className="font-bold text-slate-400">Aura Char:</span> {JSON.stringify(safeArray(form.diagnosis?.auraCharacteristics))}</p>
                            <p><span className="font-bold text-slate-400">Migraine Char:</span> {JSON.stringify(safeArray(form.diagnosis?.migraineNoAuraCharacteristics))}</p>
                            <p><span className="font-bold text-slate-400">Tension Char:</span> {JSON.stringify(safeArray(form.diagnosis?.tensionCharacteristics))}</p>
                            <p><span className="font-bold text-slate-400">Cluster Symptoms:</span> {JSON.stringify(safeArray(form.diagnosis?.clusterSymptoms))}</p>
                        </div>
                        <div className="space-y-2">
                            <p><span className="font-bold text-slate-400">Final Diagnosis:</span> <span className="text-sky-200 whitespace-pre-wrap">{form.final?.diagnosis || ""}</span></p>
                            <p><span className="font-bold text-slate-400">Final Med Plan:</span> <span className="text-sky-200 whitespace-pre-wrap">{form.final?.medicationPlan || ""}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
