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

// Exactly what is between startIndex and endIndex in reportUtils.js
const targetFuncCode = code.substring(startIndex, endIndex);

// Escape ` and ${ in targetFuncCode for insertion into a template literal in compact_report.cjs
const escapedFuncCode = targetFuncCode
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');

const compactReportContent = `const fs = require('fs');

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

const optimizedFunction = \`${escapedFuncCode}\`;

const newCode = code.substring(0, startIndex) + optimizedFunction + code.substring(endIndex);
fs.writeFileSync(path, newCode, 'utf8');
console.log('Update complete.');
`;

fs.writeFileSync('compact_report.cjs', compactReportContent, 'utf8');
console.log('Updated compact_report.cjs successfully.');
