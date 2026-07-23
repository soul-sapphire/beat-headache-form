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
        const entriesPath = path.join(root, dir, 'entries.json');
        if (fs.existsSync(entriesPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
                if (data.resource) {
                    console.log(`Resource: ${data.resource}`);
                    console.log(`  Folder: ${path.join(root, dir)}`);
                    for (const entry of data.entries) {
                        const d = new Date(entry.timestamp);
                        console.log(`    File ID: ${entry.id} | ts: ${entry.timestamp} | Local: ${d.toLocaleString()}`);
                    }
                }
            } catch(e) {}
        }
    }
}
