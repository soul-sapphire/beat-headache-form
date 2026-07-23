const fs = require('fs');
const path = require('path');

const targetFiles = [
    'compact_report.cjs',
    'optimizedFunction.js',
    'generateA5PatientReport.js',
    'swap_pdf_gen.cjs',
    'update_report.cjs',
    'patch_report.js'
];

function searchDir(dir, maxDepth = 4, currentDepth = 0) {
    if (currentDepth > maxDepth) return;
    try {
        const files = fs.readdirSync(dir);
        for (const f of files) {
            const full = path.join(dir, f);
            try {
                const stat = fs.statSync(full);
                if (stat.isDirectory()) {
                    if (f !== 'node_modules' && f !== '.git' && f !== 'BraveSoftware' && f !== 'Google') {
                        searchDir(full, maxDepth, currentDepth + 1);
                    }
                } else {
                    for (const tf of targetFiles) {
                        if (f === tf || f.endsWith(tf) || f.includes(tf.split('.')[0])) {
                            console.log(`MATCH: ${full} | size: ${stat.size} | mtime: ${stat.mtime.toLocaleString()} (${stat.mtimeMs})`);
                        }
                    }
                }
            } catch(e) {}
        }
    } catch(e) {}
}

console.log('--- Searching AppData Roaming ---');
searchDir('C:\\Users\\Admin\\AppData\\Roaming', 6);

console.log('--- Searching .gemini ---');
searchDir('C:\\Users\\Admin\\.gemini', 6);

console.log('--- Searching Workspace ---');
searchDir('c:\\Users\\Admin\\beat-headache-form', 4);
