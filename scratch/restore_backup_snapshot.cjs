const fs = require('fs');
const path = require('path');

const workspace = 'c:/Users/Admin/beat-headache-form';
const historyRoots = [
    path.join(process.env.APPDATA, 'Trae', 'User', 'History'),
    path.join(process.env.APPDATA, 'Code', 'User', 'History')
];

const targetTimestamp = 1784781774753; // July 23, 2026, 10:12:54 AM
const restoredFiles = [];
const failedFiles = [];
const processedPaths = new Set();

function walkHist(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(walkHist(filePath));
            } else if (file === 'entries.json') {
                results.push(filePath);
            }
        } catch(e) {}
    });
    return results;
}

historyRoots.forEach(histDir => {
    const entriesFiles = walkHist(histDir);
    entriesFiles.forEach(f => {
        try {
            const data = JSON.parse(fs.readFileSync(f, 'utf8'));
            let rawUri = data.resource || '';
            
            // Normalize rawUri
            let decoded = decodeURIComponent(rawUri);
            let normalized = decoded.replace(/\\/g, '/');
            
            if (normalized.toLowerCase().includes('beat-headache-form')) {
                // Extract path after beat-headache-form/
                const idx = normalized.toLowerCase().indexOf('beat-headache-form/');
                if (idx !== -1) {
                    const relPath = normalized.substring(idx + 'beat-headache-form/'.length);
                    
                    // Skip scratch/ script created by AI during tool runs if you want or restore all
                    // But we want to restore everything in the backup snapshot
                    if (!relPath) return;
                    
                    const targetFile = path.join(workspace, relPath);
                    if (processedPaths.has(targetFile)) return; // Avoid duplicate processing if multiple entries exist
                    
                    const validEntries = (data.entries || []).filter(e => e.timestamp <= targetTimestamp + 10000);
                    if (validEntries.length > 0) {
                        validEntries.sort((a, b) => b.timestamp - a.timestamp);
                        const bestEntry = validEntries[0];
                        const snapshotFile = path.join(path.dirname(f), bestEntry.id);
                        if (fs.existsSync(snapshotFile)) {
                            const snapshotContent = fs.readFileSync(snapshotFile);
                            const dirName = path.dirname(targetFile);
                            if (!fs.existsSync(dirName)) {
                                fs.mkdirSync(dirName, { recursive: true });
                            }
                            fs.writeFileSync(targetFile, snapshotContent);
                            processedPaths.add(targetFile);
                            restoredFiles.push({
                                relPath,
                                snapshotId: bestEntry.id,
                                timestamp: bestEntry.timestamp,
                                date: new Date(bestEntry.timestamp).toLocaleString()
                            });
                        } else {
                            failedFiles.push(relPath + " (Snapshot file missing)");
                        }
                    }
                }
            }
        } catch(e) {
            console.error('Error processing entry:', f, e.message);
        }
    });
});

console.log(JSON.stringify({
    successCount: restoredFiles.length,
    failedCount: failedFiles.length,
    restoredFiles,
    failedFiles
}, null, 2));
