/**
 * reportUtils.js
 * --------------
 * Public API barrel for all Beat Headache PDF report utilities.
 *
 * Re-exports generator functions and clinical diagnosis utilities from src/reports/.
 * Contains zero function implementations or report logic.
 */

export { generatePatientReportPdf } from "./reports/patientSummaryReport.js";
export { generateDoctorReportPdf } from "./reports/doctorClinicalReport.js";
export {
    getFresshInterpretation,
    getRedFlagSummary,
    getSuggestedDiagnosisSummary
} from "./reports/diagnosisUtils.js";
