const fs = require('fs');
const path = require('path');

const file = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\26fb628f-5979-409e-807e-18cd1dc0b57a\\.system_generated\\logs\\transcript_full.jsonl';
if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line);
            if (obj.step_index >= 150 && obj.step_index <= 170) {
                console.log(`=== Step ${obj.step_index} (${obj.type}) ===`);
                console.log(JSON.stringify(obj.content || obj.thinking || obj.tool_calls, null, 2).substring(0, 2000));
            }
        } catch(e) {}
    }
}
