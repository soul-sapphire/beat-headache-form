const fs = require('fs');
const path = require('path');

const file = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\d69eab24-4f24-472c-a008-50912b3958f1\\.system_generated\\logs\\transcript_full.jsonl';
if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line);
            if (obj.type === 'USER_INPUT') {
                console.log(`\n=== USER INPUT (Step ${obj.step_index}) ===`);
                console.log(obj.content);
            } else if (obj.type === 'PLANNER_RESPONSE' && obj.thinking) {
                console.log(`\n--- THINKING (Step ${obj.step_index}) ---`);
                console.log(obj.thinking.substring(0, 500));
            } else if (obj.tool_calls) {
                for (const tc of obj.tool_calls) {
                    if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
                        console.log(`\n--- TOOL CALL (Step ${obj.step_index}): ${tc.name} on ${tc.args?.TargetFile} ---`);
                    }
                }
            }
        } catch(e) {}
    }
}
