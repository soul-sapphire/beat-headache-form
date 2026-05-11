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
    "Alergies",
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

const headacheExclude = ["Toothache", "Ear pain", "Throat Pain", "Neck pain"];
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
    "Aura",
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

const applyForwardReflections = (form) => {
    const next = JSON.parse(JSON.stringify(form));

    // Page 1 -> Later
    const age = toNumber(next.patient.age);
    if (age > 0 && age < 5) {
        next.redFlags.position = addToList(next.redFlags.position, "Toddler (below 5 yrs)");
        next.examination.weightForHeight = appendPrompt(
            next.examination.weightForHeight,
            "Age is under 5 years, consider weight-for-height assessment."
        );
    }
    if (next.patient.email && !next.final.ccEmail) {
        next.final.ccEmail = next.patient.email;
    }

    let familyHeadacheFound = false;
    let anyFamilyIssue = false;
    next.familyRows.forEach((row) => {
        if (hasAny(row.issues, ["Migraine/Headache"])) familyHeadacheFound = true;
        if (row.issues && row.issues.length > 0) anyFamilyIssue = true;
        if (hasAny(row.issues, ["Alergies"])) {
            next.medical.secondaryStatus = appendPrompt(next.medical.secondaryStatus, `Family history of allergies (${row.relation}).`);
            next.examination["Tenderness over Sinus"] = "+";
        }
        if (hasAny(row.issues, ["DM", "CVD", "HT", "Cancer", "Overweight/Obese"])) {
            next.redFlags.systemic = addToList(next.redFlags.systemic, "Comorbidities");
        }
    });
    if (familyHeadacheFound) {
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Family history of Migraine/Headache - supporting background.");
    }
    if (anyFamilyIssue && !familyHeadacheFound) {
        next.redFlags.position = addToList(next.redFlags.position, "Lack of Family History");
    }

    // Page 2 -> Later
    const excludes = next.headache.exclude || [];
    if (excludes.includes("Toothache")) {
        next.medical.secondaryStatus = appendPrompt(next.medical.secondaryStatus, "Toothache reported.");
        next.examination.Teeth = "AN";
    }
    if (excludes.includes("Ear pain")) {
        next.medical.secondaryStatus = appendPrompt(next.medical.secondaryStatus, "Ear pain reported. Review ENT/Secondary status.");
    }
    if (excludes.includes("Throat Pain")) {
        next.medical.secondaryStatus = appendPrompt(next.medical.secondaryStatus, "Throat pain reported.");
        next.examination.Throat = "AN";
    }
    if (excludes.includes("Neck pain")) {
        next.examination["Neck stifness"] = "+";
    }

    const locationsVal = next.history.location || [];
    if (locationsVal.includes("Occipital")) {
        next.medical.secondaryStatus = appendPrompt(next.medical.secondaryStatus, "Occipital location - review for secondary causes.");
    }

    const isLSorRS =
        next.history.frontalSide === "L/S" ||
        next.history.frontalSide === "R/S" ||
        next.history.temporalSide === "L/S" ||
        next.history.temporalSide === "R/S";
    if ((locationsVal.includes("Frontal") || locationsVal.includes("Temporal")) && isLSorRS) {
        next.diagnosis.migraineNoAuraCharacteristics = addToList(next.diagnosis.migraineNoAuraCharacteristics, "unilateral location");
    }
    if (locationsVal.includes("Allover") || next.history.frontalSide === "B/L" || next.history.temporalSide === "B/L") {
        next.diagnosis.tensionCharacteristics = addToList(next.diagnosis.tensionCharacteristics, "bilateral location");
    }

    const nature = next.history.painNature || [];
    if (locationsVal.includes("Band like") || nature.includes("Constant pressure, tightening (like a band)")) {
        next.diagnosis.tensionCharacteristics = addToList(next.diagnosis.tensionCharacteristics, "pressing or tightening (non-pulsating) quality");
    }
    if (nature.includes("Throbbing or pulsing (like a heart beat)")) {
        next.diagnosis.migraineNoAuraCharacteristics = addToList(next.diagnosis.migraineNoAuraCharacteristics, "pulsating quality");
    }
    if (nature.includes("Thunder clapping")) {
        next.redFlags.position = addToList(next.redFlags.position, "Sudden onset");
        next.examination.tests = addToList(next.examination.tests, "Brain Imaging");
    }
    if (nature.includes("Sharp or stabbing")) {
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Sharp/stabbing pain reported - doctor review required.");
    }

    const perDayVal = toNumber(next.history.perDay);
    const perWeekVal = toNumber(next.history.perWeek);
    const perMonthVal = toNumber(next.history.perMonth);
    const totalFreq = perDayVal * 30 + perWeekVal * 4 + perMonthVal;

    if (totalFreq >= 2) next.diagnosis["migraineAura.0"] = "Yes";
    if (totalFreq >= 5) {
        next.diagnosis["migraineNoAura.0"] = "Yes";
        next.diagnosis["cluster.0"] = "Yes";
    }
    if (totalFreq >= 10) next.diagnosis["tension.0"] = "Yes";

    const durationVal = next.history.episodeDuration;
    if (durationVal === "More than 04 Hours" || durationVal === "All day") {
        next.diagnosis["migraineNoAura.1"] = "Yes";
    }
    if (durationVal) {
        next.diagnosis["tension.1"] = "Yes";
    }
    if (durationVal === "1-2 Hour" || durationVal === "2-4 Hour") {
        next.diagnosis["cluster.1"] = "Yes";
    }

    const intensityVal = toNumber(next.history.intensity);
    if (intensityVal >= 4)
        next.diagnosis.migraineNoAuraCharacteristics = addToList(
            next.diagnosis.migraineNoAuraCharacteristics,
            "moderate or severe pain intensity"
        );
    if (intensityVal >= 1 && intensityVal <= 6)
        next.diagnosis.tensionCharacteristics = addToList(next.diagnosis.tensionCharacteristics, "mild or moderate intensity");
    if (intensityVal >= 7) next.diagnosis["cluster.1"] = "Yes";
    if (intensityVal > 0) next.final.diagnosis = appendPrompt(next.final.diagnosis, `Reported intensity: ${intensityVal}/10.`);

    const relief = next.history.relief || [];
    if (relief.includes("Sleeping in a dim lit, quiet room"))
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Sleeping in dim quiet room helps - migraine supporting.");
    if (relief.includes("Having a meal"))
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Having a meal helps - review FRESSH food score.");
    if (relief.includes("Drinking water"))
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Drinking water helps - review FRESSH hydration.");
    if (relief.includes("Relaxation (Eg: meditation)"))
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Relaxation helps - review FRESSH relaxation.");
    if (relief.includes("Medication"))
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Medication helps - review medication plan.");

    const timeOfDay = next.history.timeOfDay || [];
    if (hasAny(timeOfDay, ["Morning", "Night"])) {
        next.redFlags.position = addToList(next.redFlags.position, "Onset in sleep/early morning");
    }

    const premonitory = next.history.premonitory || [];
    if (premonitory.length > 0) {
        next.final.diagnosis = appendPrompt(next.final.diagnosis, `Premonitory symptoms: ${premonitory.join(", ")}.`);
    }

    const aggravating = next.history.aggravating || [];
    if (hasAny(aggravating, ["Activity", "Walking", "Climbing Stairs"])) {
        next.diagnosis.migraineNoAuraCharacteristics = addToList(
            next.diagnosis.migraineNoAuraCharacteristics,
            "aggravation by or causing avoidance of routine physical activity (e.g. walking or climbing stairs)"
        );
    }
    if (aggravating.includes("Reading")) {
        next.examination["Eye Movement"] = "AN";
        next.examination["Eye Movement.describe"] = appendPrompt(next.examination["Eye Movement.describe"], "Reading aggravates headache.");
    }

    const associated = next.history.associated || [];
    if (hasAny(associated, ["Nausea", "Vomiting"])) {
        next.diagnosis.migraineNoAuraAssociated = addToList(next.diagnosis.migraineNoAuraAssociated, "nausea and/or vomiting");
    }
    if (associated.includes("Vomiting")) {
        next.redFlags.systemic = addToList(next.redFlags.systemic, "Vomiting");
    }
    if (hasAny(associated, ["Light Sensitivity", "Sound Sensitivity"])) {
        next.diagnosis.migraineNoAuraAssociated = addToList(next.diagnosis.migraineNoAuraAssociated, "photophobia and phonophobia");
    }
    if (associated.includes("Aura")) {
        next.diagnosis["migraineAura.1"] = "Yes";
    }
    if (associated.includes("Vision issues/Diplopia")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Visual disturbances");
        next.examination["Eye Movement"] = "AN";
        next.examination.Papilloedema = "+";
        next.examination.crNvPalsy = "Y";
        next.examination.crNvPalsyDescribe = appendPrompt(next.examination.crNvPalsyDescribe, "Vision issues reported.");
    }
    if (associated.includes("Walking difficulty")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Abnormal gait");
        next.examination.Gait = "AN";
    }
    if (associated.includes("Balance issues")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Ataxia");
        next.examination.Gait = "AN";
    }
    if (hasAny(associated, ["Epilepsy", "Fainting"])) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Seizures");
        next.examination.tests = addToList(next.examination.tests, "Brain Imaging");
    }
    if (associated.includes("Behavioral changes")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Changes in behavior or cognition");
        next.evaluations["Professional Evaluation.Behavior.notes"] = appendPrompt(
            next.evaluations["Professional Evaluation.Behavior.notes"],
            "Behavioral changes reported."
        );
    }
    if (associated.includes("Attention issues")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Changes in behavior or cognition");
        next.evaluations["Professional Evaluation.Attention.notes"] = appendPrompt(
            next.evaluations["Professional Evaluation.Attention.notes"],
            "Attention issues reported."
        );
    }
    if (associated.includes("Memory issues")) {
        next.redFlags.neuro = addToList(next.redFlags.neuro, "Changes in behavior or cognition");
        next.evaluations["Professional Evaluation.Memory.notes"] = appendPrompt(
            next.evaluations["Professional Evaluation.Memory.notes"],
            "Memory issues reported."
        );
    }
    if (associated.includes("Tearing")) {
        next.diagnosis.clusterSymptoms = addToList(next.diagnosis.clusterSymptoms, "conjunctival injection and/or lacrimation");
    }
    if (associated.includes("Atopic disorder")) {
        next.medical.secondaryStatus = appendPrompt(next.medical.secondaryStatus, "Atopic disorder reported.");
        next.examination["Tenderness over Sinus"] = "+";
    }
    if (associated.includes("Tiring quickly")) {
        next.examination.tests = addToList(next.examination.tests, "FBC");
    }

    // Page 3 -> Later
    if (next.medical.pastMedical) {
        next.redFlags.systemic = addToList(next.redFlags.systemic, "Comorbidities");
        next.final.diagnosis = appendPrompt(next.final.diagnosis, `PMH: ${next.medical.pastMedical}`);
    }
    if (next.medical.drugHistory) {
        next.final.medicationPlan = appendPrompt(next.final.medicationPlan, `Drug History: ${next.medical.drugHistory}`);
    }
    if (hasAny(next.medical.allergies, ["Food", "Drug", "Plaster"]) || next.medical.allergySpecify) {
        next.final.medicationPlan = appendPrompt(
            next.final.medicationPlan,
            `Allergy Warning: ${next.medical.allergies?.join(", ") || ""}. ${next.medical.allergySpecify || ""}`
        );
    }

    const systemic = next.redFlags.systemic || [];
    if (systemic.includes("Fever, acute symptoms")) {
        ["FBC", "CRP", "ESR"].forEach((t) => (next.examination.tests = addToList(next.examination.tests, t)));
    }
    if (systemic.includes("Weight loss")) {
        next.examination.tests = addToList(next.examination.tests, "FBC");
        next.examination.height = appendPrompt(next.examination.height, "Weight loss noted.");
        next.examination.weight = appendPrompt(next.examination.weight, "Weight loss noted.");
    }

    const neuro = next.redFlags.neuro || [];
    if (neuro.includes("Papilledema")) {
        next.examination.Papilloedema = "+";
    }
    if (hasAny(neuro, ["Visual disturbances", "Eye movement abnormalities"])) {
        next.examination["Eye Movement"] = "AN";
    }
    if (hasAny(neuro, ["Abnormal gait", "Ataxia"])) {
        next.examination.Gait = "AN";
    }

    const position = next.redFlags.position || [];
    if (
        hasAny(position, [
            "Progressive",
            "Head trauma",
            "Triggered by Valsalva",
            "Sudden onset",
            "Worse upright",
            "Worse supine",
            "Onset in sleep/early morning",
        ])
    ) {
        next.examination.tests = addToList(next.examination.tests, "Brain Imaging");
    }

    // Page 5 -> Page 7
    if (next.diagnosis["migraineNoAura.status"] === "Confirmed") {
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Diagnosis Status: Migraine without Aura confirmed.");
    }
    if (next.diagnosis["migraineAura.status"] === "Confirmed") {
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Diagnosis Status: Migraine with Aura confirmed.");
    }
    if (next.diagnosis["tension.status"] === "Confirmed") {
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Diagnosis Status: Tension-type Headache confirmed.");
    }
    if (next.diagnosis["cluster.status"] === "Confirmed") {
        next.final.diagnosis = appendPrompt(next.final.diagnosis, "Diagnosis Status: Cluster Headache confirmed.");
    }

    return next;
};

function createInitialState() {

    return {
        patient: {},
        birth: {},
        perinatal: {},
        familyRows: [{ relation: "Mother" }, { relation: "Farther" }, { relation: "Sibling" }],
        headache: {},
        history: {},
        medical: {},
        redFlags: {},
        evaluations: {},
        diagnosis: {},
        examination: {},
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
                        <Field label="Name" required><TextInput value={form.patient.name} onChange={(v) => update("patient", "name", v)} /></Field>
                        <Field label="Phone"><TextInput value={form.patient.phone} onChange={(v) => update("patient", "phone", v)} /></Field>
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
                    <Field label="PBU Stay"><OptionGroup options={yesNoNc} value={form.perinatal.pbuStay} onChange={(v) => update("perinatal", "pbuStay", v)} /></Field>
                    <Field label="If Yes, Days"><TextInput type="number" value={form.perinatal.pbuDays} onChange={(v) => update("perinatal", "pbuDays", v)} /></Field>
                    <Field label="Complications"><OptionGroup type="checkbox" options={complicationOptions} value={form.perinatal.complications} onChange={(v) => update("perinatal", "complications", v)} columns="md:grid-cols-4" /></Field>
                    <Field label="Other"><TextArea value={form.perinatal.other} onChange={(v) => update("perinatal", "other", v)} /></Field>
                </Card>

                <Card title="Family History">
                    <div className="space-y-5">
                        {form.familyRows.map((row, index) => (
                            <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <div className="mb-3 text-sm font-bold text-slate-700">Family History Row {index + 1}</div>
                                <Grid>
                                    <Field label="Relation"><OptionGroup options={["Mother", "Farther", "Sibling"]} value={row.relation} onChange={(v) => updateFamily(index, "relation", v)} /></Field>
                                    <Field label="Age"><TextInput type="number" value={row.age} onChange={(v) => updateFamily(index, "age", v)} /></Field>
                                    <Field label="Occupation"><TextInput value={row.occupation} onChange={(v) => updateFamily(index, "occupation", v)} /></Field>
                                </Grid>
                                <div className="mt-4">
                                    <Field label="Issues"><OptionGroup type="checkbox" options={familyIssues} value={row.issues} onChange={(v) => updateFamily(index, "issues", v)} columns="md:grid-cols-4" /></Field>
                                </div>
                                <div className="mt-4">
                                    <Field label="Describe"><TextArea value={row.describe} onChange={(v) => updateFamily(index, "describe", v)} /></Field>
                                </div>
                            </div>
                        ))}
                    </div>
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
                        <Field label="Age of Onset(Years)"><TextInput type="number" value={form.history.onsetYears} onChange={(v) => update("history", "onsetYears", v)} /></Field>
                        <Field label="Months"><TextInput type="number" value={form.history.onsetMonths} onChange={(v) => update("history", "onsetMonths", v)} /></Field>
                        <Field label="Duration(Years)"><TextInput type="number" value={form.history.durationYears} onChange={(v) => update("history", "durationYears", v)} /></Field>
                        <Field label="Months"><TextInput type="number" value={form.history.durationMonths} onChange={(v) => update("history", "durationMonths", v)} /></Field>
                    </Grid>
                    <Field label="Constant / Variable"><OptionGroup options={["Constant", "Variable"]} value={form.history.pattern} onChange={(v) => update("history", "pattern", v)} columns="md:grid-cols-2" /></Field>
                    <Field label="Location"><OptionGroup type="checkbox" options={locations} value={form.history.location} onChange={(v) => update("history", "location", v)} /></Field>
                    <Grid>
                        <Field label="If frontal – Side"><OptionGroup options={sideOptions} value={form.history.frontalSide} onChange={(v) => update("history", "frontalSide", v)} /></Field>
                        <Field label="If Temporal – Side"><OptionGroup options={sideOptions} value={form.history.temporalSide} onChange={(v) => update("history", "temporalSide", v)} /></Field>
                    </Grid>
                    <Field label="Nature of Pain"><OptionGroup type="checkbox" options={painNature} value={form.history.painNature} onChange={(v) => update("history", "painNature", v)} columns="md:grid-cols-2" /></Field>
                </Card>

                <Card title="How Many Times">
                    <Grid>
                        <Field label="Per Day"><TextInput type="number" value={form.history.perDay} onChange={(v) => update("history", "perDay", v)} /></Field>
                        <Field label="Per Week"><TextInput type="number" value={form.history.perWeek} onChange={(v) => update("history", "perWeek", v)} /></Field>
                        <Field label="Per Month"><TextInput type="number" value={form.history.perMonth} onChange={(v) => update("history", "perMonth", v)} /></Field>
                        <Field label="Seasonal"><TextInput value={form.history.seasonal} onChange={(v) => update("history", "seasonal", v)} /></Field>
                    </Grid>
                    <Field label="DURATION: How long did the pain last?"><OptionGroup options={durationOptions} value={form.history.episodeDuration} onChange={(v) => update("history", "episodeDuration", v)} /></Field>
                    <Field label="Intensity of the headache (0-No Hurt – 10 Hurts Worst)"><TextInput type="range" value={form.history.intensity || 0} onChange={(v) => update("history", "intensity", v)} /></Field>
                    <div className="text-sm font-semibold text-slate-600">Selected intensity: {form.history.intensity || 0}</div>
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
                    <Field label="History of allergies(Please Specify)"><TextArea value={form.medical.allergySpecify} onChange={(v) => update("medical", "allergySpecify", v)} /></Field>
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

                    {["Teeth", "Throat", "RS", "Eye Movement", "Gait", "AS"].map((item) => (
                        <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <Field label={item}><OptionGroup options={normalAbnormal} value={form.examination[item]} onChange={(v) => update("examination", item, v)} columns="md:grid-cols-2" /></Field>
                            <div className="mt-3"><Field label="Describe"><TextArea value={form.examination[`${item}.describe`]} onChange={(v) => update("examination", `${item}.describe`, v)} /></Field></div>
                        </div>
                    ))}

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <Field label="Cr. Nv. Palsy"><OptionGroup options={["Y", "N"]} value={form.examination.crNvPalsy} onChange={(v) => update("examination", "crNvPalsy", v)} columns="md:grid-cols-2" /></Field>
                        <div className="mt-3"><Field label="Describe"><TextArea value={form.examination.crNvPalsyDescribe} onChange={(v) => update("examination", "crNvPalsyDescribe", v)} /></Field></div>
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
                    {fressh.map((item) => (
                        <div key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <Field label={item.name}>
                                <p className="mb-3 text-sm text-slate-500">{item.prompt}</p>
                                <OptionGroup options={item.options} value={form.fressh[item.name]} onChange={(v) => update("fressh", item.name, v)} columns="md:grid-cols-1" />
                            </Field>
                            {item.extra && <div className="mt-3"><Field label={item.extra}><TextInput value={form.fressh[`${item.name}.extra`]} onChange={(v) => update("fressh", `${item.name}.extra`, v)} /></Field></div>}
                        </div>
                    ))}
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

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <button
                        type="button"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <div className="text-center text-sm font-bold text-slate-600">
                        Page {page + 1} of {pageTitles.length}: {pageTitles[page]}
                    </div>
                    <button
                        type="button"
                        disabled={page === pageTitles.length - 1}
                        onClick={() => setPage((p) => Math.min(pageTitles.length - 1, p + 1))}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>

                {pages[page]()}
            </div>
        </main>
    );
}
