const fs = require('fs');
const path = require('path');

const histDir = path.join(process.env.APPDATA, 'Trae', 'User', 'History');
const dirs = fs.readdirSync(histDir);

for (const dir of dirs) {
    const entriesPath = path.join(histDir, dir, 'entries.json');
    if (fs.existsSync(entriesPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
            const res = (data.resource || '');
            if (res.includes('patch_report')) {
                console.log(`Resource: ${res}`);
                console.log(`Folder: ${dir}`);
                for (const entry of data.entries) {
                    const snapFile = path.join(histDir, dir, entry.id);
                    const size = fs.existsSync(snapFile) ? fs.statSync(snapFile).size : 'N/A';
                    console.log(`  ID: ${entry.id} | TS: ${entry.timestamp} (${new Date(entry.timestamp).toLocaleString()}) | Size: ${size}`);
                }
            }
        } catch(e) {}
    }
}
