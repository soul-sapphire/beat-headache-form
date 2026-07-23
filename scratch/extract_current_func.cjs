const fs = require('fs');

const reportUtilsPath = 'src/reportUtils.js';
const code = fs.readFileSync(reportUtilsPath, 'utf8');

const startStr = "export function generatePatientReportPdf(form, fresshTotal) {";
const endStr = "export function generateDoctorReportPdf(form, fresshTotal) {";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Boundaries not found!");
    process.exit(1);
}

const targetFuncCode = code.substring(startIndex, endIndex).trimEnd();

console.log('Extracted function length:', targetFuncCode.length);
console.log('Starts with:', targetFuncCode.substring(0, 80));
console.log('Ends with:', targetFuncCode.substring(targetFuncCode.length - 80));
