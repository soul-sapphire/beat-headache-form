const fs = require('fs');

const file = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\d69eab24-4f24-472c-a008-50912b3958f1\\.system_generated\\logs\\transcript_full.jsonl';
if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line);
            const str = JSON.stringify(obj);
            if (str.includes('compact_report.cjs') && (obj.type === 'CODE_ACTION' || obj.type === 'REPLACE_FILE_CONTENT' || obj.type === 'WRITE_TO_FILE' || obj.tool_calls)) {
                console.log(`\n=== Step ${obj.step_index} (${obj.type}) ===`);
                if (obj.tool_calls) {
                    console.log('Tool calls:', JSON.stringify(obj.tool_calls, null, 2).substring(0, 1000));
                }
            }
        } catch(e) {}
    }
}
