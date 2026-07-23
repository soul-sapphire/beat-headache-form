const fs = require('fs');
const path = require('path');

const historyRoots = [
    path.join(process.env.APPDATA, 'Code', 'User', 'History'),
    path.join(process.env.APPDATA, 'Trae', 'User', 'History')
];

// Target timestamp is around 1784260388909 (July 17, 2026 09:23:08 AM)

for (const root of historyRoots) {
    if (!fs.existsSync(root)) continue;
    const dirs = fs.readdirSync(root);
    for (const dir of dirs) {
        const entriesPath = path.join(root, dir, 'entries.json');
        if (fs.existsSync(entriesPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
                for (const entry of data.entries) {
                    const d = new Date(entry.timestamp);
                    // Check if timestamp is on July 17, 2026 (between 09:20 AM and 09:30 AM or anywhere on July 17 2026)
                    const iso = d.toISOString();
                    const local = d.toLocaleString();
                    if (iso.includes('2026-07-17') || local.includes('7/17/2026')) {
                        console.log(`Resource: ${data.resource}`);
                        console.log(`  Folder: ${path.join(root, dir)}`);
                        console.log(`  File ID: ${entry.id} | ts: ${entry.timestamp} | Local: ${local}`);
                        const filePath = path.join(root, dir, entry.id);
                        if (fs.existsSync(filePath)) {
                            const stats = fs.statSync(filePath);
                            console.log(`  File size: ${stats.size} bytes`);
                        }
                    }
                }
            } catch(e) {}
        }
    }
}
