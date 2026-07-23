const fs = require('fs');

const file = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\d69eab24-4f24-472c-a008-50912b3958f1\\.system_generated\\logs\\transcript_full.jsonl';
if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line);
            if (obj.step_index === 159 || obj.step_index === 160) {
                console.log(`\n=== Step ${obj.step_index} ===`);
                console.log(JSON.stringify(obj, null, 2));
            }
        } catch(e) {}
    }
}
