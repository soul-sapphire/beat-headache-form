const fs = require('fs');
const path = require('path');

const file = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\d69eab24-4f24-472c-a008-50912b3958f1\\.system_generated\\logs\\transcript_full.jsonl';
if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line);
            if (obj.step_index >= 155 && obj.step_index <= 170) {
                console.log(`\n=== Step ${obj.step_index} (${obj.type}) ===`);
                if (obj.tool_calls) {
                    console.log('Tool calls:', JSON.stringify(obj.tool_calls, null, 2));
                }
                if (obj.content) {
                    console.log('Content:', obj.content.substring(0, 1500));
                }
                if (obj.thinking) {
                    console.log('Thinking:', obj.thinking.substring(0, 500));
                }
            }
        } catch(e) {}
    }
}
