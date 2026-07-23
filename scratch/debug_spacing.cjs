const fs = require('fs');

const code = fs.readFileSync('src/reportUtils.js', 'utf8');

const startStr = "export function generatePatientReportPdf(form, fresshTotal) {";
const endStr = "export function generateDoctorReportPdf(form, fresshTotal) {";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

const origMiddle = code.substring(startIndex, endIndex);

console.log('Original middle length:', origMiddle.length);
console.log('Original middle ends with (repr):', JSON.stringify(origMiddle.substring(origMiddle.length - 30)));
