const fs = require('fs');

const ru = fs.readFileSync('src/reportUtils.js', 'utf8');
const startStr = "export function generatePatientReportPdf(form, fresshTotal) {";
const endStr = "export function generateDoctorReportPdf(form, fresshTotal) {";
const startIdx = ru.indexOf(startStr);
const endIdx = ru.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find boundaries in src/reportUtils.js");
    process.exit(1);
}

const targetFuncCode = ru.substring(startIdx, endIdx);

const escaped = targetFuncCode
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');

const compactContent = `const fs = require('fs');

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

const optimizedFunction = \`${escaped}\`;

const newCode = code.substring(0, startIndex) + optimizedFunction + code.substring(endIndex);
fs.writeFileSync(path, newCode, 'utf8');
console.log('Update complete.');
`;

fs.writeFileSync('compact_report.cjs', compactContent, 'utf8');
console.log('Successfully written compact_report.cjs');
