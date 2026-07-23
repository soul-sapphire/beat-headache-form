const fs = require('fs');
const path = require('path');

const historyRoots = [
    path.join(process.env.APPDATA, 'Code', 'User', 'History'),
    path.join(process.env.APPDATA, 'Trae', 'User', 'History'),
    path.join(process.env.APPDATA, 'antigravity', 'User', 'History'),
    path.join(process.env.USERPROFILE, '.gemini', 'antigravity-ide', 'History')
];

const targetFiles = [
    'compact_report.cjs',
    'optimizedFunction.js',
    'generateA5PatientReport.js',
    'swap_pdf_gen.cjs',
    'update_report.cjs',
    'patch_report.js',
    'reportUtils.js'
];

for (const root of historyRoots) {
    if (!fs.existsSync(root)) continue;
    console.log('=== Checking root:', root, '===');
    const dirs = fs.readdirSync(root);
    for (const dir of dirs) {
        const entriesPath = path.join(root, dir, 'entries.json');
        if (fs.existsSync(entriesPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
                for (const tf of targetFiles) {
                    if (data.resource && (data.resource.endsWith('/' + tf) || data.resource.endsWith('\\' + tf) || data.resource.endsWith(tf))) {
                        console.log('Resource:', data.resource);
                        console.log('Folder:', path.join(root, dir));
                        for (const entry of data.entries) {
                            const d = new Date(entry.timestamp);
                            console.log(`  id: ${entry.id} | ts: ${entry.timestamp} | ISO: ${d.toISOString()} | Local: ${d.toLocaleString()}`);
                        }
                    }
                }
            } catch(e) {
                console.error(e);
            }
        }
    }
}
