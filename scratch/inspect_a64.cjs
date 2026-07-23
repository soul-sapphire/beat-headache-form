const fs = require('fs');

const file = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a643f860-971a-49e7-830a-bc93d805fe31\\.system_generated\\logs\\transcript_full.jsonl';
if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line);
            if (obj.step_index >= 90 && obj.step_index <= 100) {
                console.log(`\n=== Step ${obj.step_index} (${obj.type}) ===`);
                if (obj.tool_calls) console.log('Tool calls:', JSON.stringify(obj.tool_calls, null, 2));
                if (obj.content) console.log('Content:', obj.content.substring(0, 500));
            }
        } catch(e) {}
    }
}
