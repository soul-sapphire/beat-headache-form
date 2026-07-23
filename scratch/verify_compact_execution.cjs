const fs = require('fs');
const { execSync } = require('child_process');

const cwd = 'c:\\Users\\Admin\\beat-headache-form';

// Read original reportUtils.js content
const origContent = fs.readFileSync('src/reportUtils.js', 'utf8');

console.log('1. Verifying compact_report.cjs syntax...');
try {
    require('../compact_report.cjs');
    console.log('   compact_report.cjs parses cleanly!');
} catch(e) {
    console.error('   PARSE ERROR:', e.message);
    process.exit(1);
}

console.log('2. Running node compact_report.cjs...');
const runOutput = execSync('node compact_report.cjs', { cwd, encoding: 'utf8' });
console.log('   Output:', runOutput.trim());

console.log('3. Checking if src/reportUtils.js was modified...');
const newContent = fs.readFileSync('src/reportUtils.js', 'utf8');

const isIdentical = (origContent === newContent);
console.log(`   src/reportUtils.js byte-for-byte identical? ${isIdentical}`);
if (!isIdentical) {
    console.error(`   Diff in length: Orig ${origContent.length} vs New ${newContent.length}`);
    process.exit(1);
}

console.log('SUCCESS: compact_report.cjs runs cleanly and leaves reportUtils.js byte-for-byte identical!');
