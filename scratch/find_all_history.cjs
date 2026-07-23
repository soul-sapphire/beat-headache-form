const fs = require('fs');
const path = require('path');

function searchForHistory(dir, depth = 0) {
    if (depth > 5) return;
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (file === 'History' || file === 'entries.json') {
                console.log('Found:', fullPath);
            }
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    searchForHistory(fullPath, depth + 1);
                }
            } catch(e) {}
        }
    } catch(e) {}
}

console.log('Searching AppData Roaming...');
searchForHistory('C:\\Users\\Admin\\AppData\\Roaming');

console.log('Searching AppData Local...');
searchForHistory('C:\\Users\\Admin\\AppData\\Local');

console.log('Searching .gemini...');
searchForHistory('C:\\Users\\Admin\\.gemini');
