const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'reportUtils.js');
let content = fs.readFileSync(filePath, 'utf8');

const newFuncPath = path.join(__dirname, 'patient_report_pdf.txt');
const newFunc = fs.readFileSync(newFuncPath, 'utf8');

const startMarker = 'export function generatePatientReportPdf';
const endMarker = 'export function generateDoctorReportPdf';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find generation functions markers");
    process.exit(1);
}

// Find the last closing brace before the doctor report generator
const textBeforeDoctor = content.substring(0, endIndex);
const lastClosingBrace = textBeforeDoctor.lastIndexOf('}');

const finalContent = content.substring(0, startIndex) + newFunc + '\n\n' + content.substring(lastClosingBrace + 1);

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully patched reportUtils.js!");
