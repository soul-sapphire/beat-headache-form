const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain';
const subdirs = fs.readdirSync(brainDir);

const filesToWatch = [
    'compact_report.cjs',
    'optimizedFunction.js',
    'generateA5PatientReport.js',
    'swap_pdf_gen.cjs',
    'update_report.cjs',
    'patch_report.js'
];

for (const sd of subdirs) {
    const transcriptPath = path.join(brainDir, sd, '.system_generated', 'logs', 'transcript_full.jsonl');
    if (!fs.existsSync(transcriptPath)) continue;
    const content = fs.readFileSync(transcriptPath, 'utf8');
    for (const fw of filesToWatch) {
        if (content.includes(fw)) {
            console.log(`\n=== Conversation ${sd} mentions ${fw} ===`);
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(fw) && (lines[i].includes('write_to_file') || lines[i].includes('replace_file_content') || lines[i].includes('multi_replace_file_content'))) {
                    try {
                        const obj = JSON.parse(lines[i]);
                        console.log(`  Step ${obj.step_index} (${obj.created_at}): Tool ${obj.tool_calls?.[0]?.name}`);
                    } catch(e) {}
                }
            }
        }
    }
}
