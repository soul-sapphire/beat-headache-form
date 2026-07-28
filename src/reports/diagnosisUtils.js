/**
 * diagnosisUtils.js
 * -----------------
 * Clinical logic functions shared by both PDF report generators
 * and by consumer UI components.
 *
 * Exported from here and re-exported through reportUtils.js so
 * all existing import paths remain unchanged.
 */

/**
 * Returns a human-readable interpretation string for a given FRESSH total score.
 * @param {number} score
 * @returns {string}
 */
export function getFresshInterpretation(score) {
    if (score <= 25) return "Needs significant lifestyle attention";
    if (score <= 40) return "Some lifestyle risks identified";
    if (score <= 55) return "Fair lifestyle pattern";
    return "Strong lifestyle pattern";
}

/**
 * Returns a flat array of all red flag strings from form.redFlags.
 * @param {object} form
 * @returns {string[]}
 */
export function getRedFlagSummary(form) {
    const flags = form.redFlags || { systemic: [], neuro: [], position: [] };
    return [
        ...(flags.systemic  || []),
        ...(flags.neuro     || []),
        ...(flags.position  || [])
    ];
}

/**
 * Returns a structured diagnosis summary object derived from form data.
 * @param {object} form
 * @returns {{ likelyType: string, confidenceLabel: string, explanation: string, doctorMustConfirm: boolean, redFlagCount: number }}
 */
export function getSuggestedDiagnosisSummary(form) {
    const diagnosis = form.diagnosis || {};
    const time      = form.time      || {};
    const aura      = time.aura      || {};

    let likelyType  = "Headache type not fully classified";
    let explanation = "Based on the provided symptoms, a specific primary headache pattern is not clearly dominant.";

    const hasAuraFeatures  = aura.hasAura === "Yes" || (diagnosis.auraTypes || []).length > 0;
    const migNoAuraChars   = (diagnosis.migraineNoAuraCharacteristics || []).length;
    const migNoAuraAssoc   = (diagnosis.migraineNoAuraAssociated      || []).length;
    const tensionChars     = (diagnosis.tensionCharacteristics        || []).length;
    const clusterSyms      = (diagnosis.clusterSymptoms               || []).length;

    if (hasAuraFeatures) {
        likelyType  = "Migraine with aura features";
        explanation = "Symptoms match the pattern of migraine with neurological aura (temporary sensory or visual changes).";
    } else if (migNoAuraChars >= 2 && migNoAuraAssoc >= 1) {
        likelyType  = "Migraine-type headache features";
        explanation = "Symptoms such as pulsating pain, nausea, or sensitivity to light/sound are characteristic of migraine.";
    } else if (
        clusterSyms >= 1 &&
        (time.headache?.severity === "Very bad" ||
         time.headache?.duration?.includes("1–2") ||
         time.headache?.duration?.includes("2–4"))
    ) {
        likelyType  = "Cluster headache features";
        explanation = "Severe unilateral pain with autonomic symptoms (like tearing) suggests cluster-type headache.";
    } else if (tensionChars >= 2) {
        likelyType  = "Tension-type headache features";
        explanation = "The pattern of pressure-like, bilateral pain often fits tension-type headache.";
    }

    return {
        likelyType,
        confidenceLabel:   "Clinician confirmation required",
        explanation,
        doctorMustConfirm: true,
        redFlagCount:      getRedFlagSummary(form).length
    };
}
