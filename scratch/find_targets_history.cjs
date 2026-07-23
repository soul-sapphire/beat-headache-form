const fs = require('fs');
const path = require('path');

const historyRoots = [
    path.join(process.env.APPDATA, 'Code', 'User', 'History'),
    path.join(process.env.APPDATA, 'Trae', 'User', 'History'),
    path.join(process.env.LOCALAPPDATA, 'Programs'),
    path.join(process.env.USERPROFILE, '.gemini')
];

const targetNames = [
    'compact_report',
    'optimizedfunction',
    'generatea5patientreport',
    'swap_pdf_gen',
    'update_report',
    'patch_report'
];

function searchHistoryRoot(root) {
    if (!fs.existsSync(root)) return;
    const dirs = fs.readdirSync(root);
    for (const dir of dirs) {
        const folderPath = path.join(root, dir);
        const entriesPath = path.join(folderPath, 'entries.json');
        if (fs.existsSync(entriesPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
                const res = (data.resource || '').toLowerCase();
                for (const t of targetNames) {
                    if (res.includes(t)) {
                        console.log(`Resource: ${data.resource}`);
                        console.log(`  Folder: ${folderPath}`);
                        for (const entry of data.entries) {
                            const d = new Date(entry.timestamp);
                            console.log(`    ID: ${entry.id.padEnd(12)} | TS: ${entry.timestamp} | Local: ${d.toLocaleString()}`);
                        }
                    }
                }
            } catch(e) {}
        }
    }
}

for (const r of historyRoots) {
    searchHistoryRoot(r);
}
