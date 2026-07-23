const fs = require('fs');
const path = require('path');

const historyRoots = [
    path.join(process.env.APPDATA, 'Code', 'User', 'History'),
    path.join(process.env.APPDATA, 'Trae', 'User', 'History')
];

for (const root of historyRoots) {
    if (!fs.existsSync(root)) continue;
    console.log(`\n================ ROOT: ${root} ================`);
    const dirs = fs.readdirSync(root);
    for (const dir of dirs) {
        const folderPath = path.join(root, dir);
        const entriesPath = path.join(folderPath, 'entries.json');
        if (fs.existsSync(entriesPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
                const res = data.resource || '';
                if (res.includes('beat-headache-form')) {
                    console.log(`\nFolder: ${dir}`);
                    console.log(`Resource: ${res}`);
                    for (const entry of data.entries) {
                        const d = new Date(entry.timestamp);
                        const fileOnDisk = path.join(folderPath, entry.id);
                        const exists = fs.existsSync(fileOnDisk);
                        const size = exists ? fs.statSync(fileOnDisk).size : 'MISSING';
                        console.log(`  ID: ${entry.id.padEnd(12)} | TS: ${entry.timestamp} | Local: ${d.toLocaleString()} | Size: ${size}`);
                    }
                }
            } catch(e) {
                console.error(`Error in ${entriesPath}:`, e.message);
            }
        }
    }
}
