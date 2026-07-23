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
                console.log(`Folder [${dir}]: ${data.resource}`);
            } catch(e) {}
        }
    }
}
