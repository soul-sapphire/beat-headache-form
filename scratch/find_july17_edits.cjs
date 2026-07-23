const fs = require('fs');
const path = require('path');

const file = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\26fb628f-5979-409e-807e-18cd1dc0b57a\\.system_generated\\logs\\transcript_full.jsonl';
if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line);
            const str = JSON.stringify(obj);
            if (str.includes('2026-07-17')) {
                if (obj.tool_calls) {
                    for (const tc of obj.tool_calls) {
                        console.log(`Step ${obj.step_index} Tool: ${tc.name} | Args: ${JSON.stringify(tc.args).substring(0, 300)}`);
                    }
                }
            }
        } catch(e) {}
    }
}
