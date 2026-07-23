const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain';
const targetNames = ['compact_report', 'optimizedFunction', 'generateA5PatientReport', 'swap_pdf_gen', 'update_report', 'patch_report'];

function searchBrain(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            searchBrain(full);
        } else {
            for (const t of targetNames) {
                if (f.toLowerCase().includes(t.toLowerCase())) {
                    console.log(`BRAIN MATCH: ${full} | size: ${stat.size} | mtime: ${stat.mtime.toLocaleString()}`);
                }
            }
        }
    }
}

searchBrain(brainDir);
