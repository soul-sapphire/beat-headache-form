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

function searchDirAll(dir, maxDepth = 6, depth = 0) {
    if (depth > maxDepth) return;
    try {
        const files = fs.readdirSync(dir);
        for (const f of files) {
            const fullPath = path.join(dir, f);
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    if (f !== 'node_modules' && !f.includes('Cache') && !f.includes('gpu')) {
                        searchDirAll(fullPath, maxDepth, depth + 1);
                    }
                } else {
                    const nameLower = f.toLowerCase();
                    for (const tf of targetFiles) {
                        const tfBase = tf.split('.')[0].toLowerCase();
                        if (nameLower.includes(tfBase)) {
                            const d = new Date(stat.mtimeMs);
                            console.log(`FOUND FILE: ${fullPath} | Size: ${stat.size} | mtime: ${d.toLocaleString()} (${stat.mtimeMs})`);
                        }
                    }
                }
            } catch(e) {}
        }
    } catch(e) {}
}

console.log('=== Searching AppData Roaming ===');
searchDirAll(path.join(process.env.APPDATA));

console.log('=== Searching .gemini ===');
searchDirAll(path.join(process.env.USERPROFILE, '.gemini'));
