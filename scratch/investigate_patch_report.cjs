const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = 'c:\\Users\\Admin\\beat-headache-form';

console.log('=== Checking scratch/patch_report.js ===');
if (fs.existsSync('scratch/patch_report.js')) {
    const s = fs.statSync('scratch/patch_report.js');
    console.log(`scratch/patch_report.js size: ${s.size}, mtime: ${s.mtime.toLocaleString()}`);
}

console.log('\n=== Checking scratch/patch_report.cjs ===');
if (fs.existsSync('scratch/patch_report.cjs')) {
    const s = fs.statSync('scratch/patch_report.cjs');
    console.log(`scratch/patch_report.cjs size: ${s.size}, mtime: ${s.mtime.toLocaleString()}`);
}

console.log('\n=== Searching transcripts for patch_report.js creation ===');
const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain';
const subdirs = fs.readdirSync(brainDir);

for (const sd of subdirs) {
    const transcriptPath = path.join(brainDir, sd, '.system_generated', 'logs', 'transcript_full.jsonl');
    if (!fs.existsSync(transcriptPath)) continue;
    const content = fs.readFileSync(transcriptPath, 'utf8');
    if (content.includes('patch_report.js')) {
        console.log(`In conversation ${sd}:`);
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('patch_report.js') && (lines[i].includes('write_to_file') || lines[i].includes('TargetFile'))) {
                try {
                    const obj = JSON.parse(lines[i]);
                    console.log(`  Step ${obj.step_index} (${obj.created_at}): ${JSON.stringify(obj.tool_calls || obj.content).substring(0, 300)}`);
                } catch(e) {}
            }
        }
    }
}
