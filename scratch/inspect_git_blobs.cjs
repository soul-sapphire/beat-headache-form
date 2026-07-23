const { execSync } = require('child_process');
const fs = require('fs');

const cwd = 'c:\\Users\\Admin\\beat-headache-form';
const targetFiles = [
    'compact_report.cjs',
    'optimizedFunction.js',
    'generateA5PatientReport.js',
    'swap_pdf_gen.cjs',
    'update_report.cjs',
    'patch_report.js'
];

console.log('=== Git commits containing these files ===');
for (const tf of targetFiles) {
    try {
        const log = execSync(`git log --oneline --follow -- "${tf}"`, { cwd, encoding: 'utf8' }).trim();
        console.log(`\nFile: ${tf}`);
        console.log(log || '  No git history');
    } catch(e) {
        console.log(`\nFile: ${tf}\n  Error: ${e.message}`);
    }
}
