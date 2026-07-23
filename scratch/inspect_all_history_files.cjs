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
        const files = fs.readdirSync(folderPath);
        for (const f of files) {
            const fullPath = path.join(folderPath, f);
            try {
                const stat = fs.statSync(fullPath);
                const mtime = new Date(stat.mtimeMs);
                const localStr = mtime.toLocaleString();
                if (localStr.includes('7/17/2026') || localStr.includes('7/16/2026') || localStr.includes('7/18/2026')) {
                    console.log(`Folder: ${dir} | File: ${f} | mtime: ${localStr} | size: ${stat.size}`);
                    // Check entries.json to see what resource this is
                    const entriesPath = path.join(folderPath, 'entries.json');
                    if (fs.existsSync(entriesPath)) {
                        const ent = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
                        console.log(`  Resource: ${ent.resource}`);
                    }
                }
            } catch(e) {}
        }
    }
}
