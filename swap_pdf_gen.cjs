const fs = require('fs');

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

const optimizedFunction = fs.readFileSync('optimizedFunction.js', 'utf8');

const newCode = code.substring(0, startIndex) + optimizedFunction + "\n" + code.substring(endIndex);
fs.writeFileSync(path, newCode, 'utf8');
console.log('Update complete.');
