const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain';
const subdirs = fs.readdirSync(brainDir);

for (const sd of subdirs) {
    const transcriptPath = path.join(brainDir, sd, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(transcriptPath)) {
        const content = fs.readFileSync(transcriptPath, 'utf8');
        if (content.includes('compact_report') || content.includes('reportUtils') || content.includes('July 17')) {
            console.log(`FOUND IN CONVERSATION [${sd}]:`);
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('compact_report') || lines[i].includes('July 17') || lines[i].includes('snapshot')) {
                    console.log(`  Line ${i+1}: ${lines[i].substring(0, 300)}`);
                }
            }
        }
    }
}
