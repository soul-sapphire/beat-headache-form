const fs = require('fs');
const path = require('path');

const historyRoots = [
    path.join(process.env.APPDATA, 'Code', 'User', 'History'),
    path.join(process.env.APPDATA, 'Trae', 'User', 'History')
];

for (const root of historyRoots) {
    if (!fs.existsSync(root)) continue;
    const dirs = fs.readdirSync(root);
    for (const dir of dirs) {
        const folderPath = path.join(root, dir);
        const entriesPath = path.join(folderPath, 'entries.json');
        if (fs.existsSync(entriesPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
                const res = (data.resource || '').toLowerCase();
                if (res.includes('compact_report.cjs')) {
                    console.log(`\n=== Found in ${root} ===`);
                    console.log(`Resource: ${data.resource}`);
                    console.log(`Folder: ${folderPath}`);
                    for (const entry of data.entries) {
                        const d = new Date(entry.timestamp);
                        console.log(`  ID: ${entry.id.padEnd(12)} | TS: ${entry.timestamp} | Local: ${d.toLocaleString()}`);
                    }
                }
            } catch(e) {}
        }
    }
}
