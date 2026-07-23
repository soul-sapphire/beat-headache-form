const { execSync } = require('child_process');
const fs = require('fs');

const cwd = 'c:\\Users\\Admin\\beat-headache-form';

console.log('=== Testing current compact_report.cjs ===');
try {
    require('../compact_report.cjs');
    console.log('Current compact_report.cjs parsed cleanly!');
} catch(e) {
    console.error('Current compact_report.cjs PARSE ERROR:', e.message);
}

console.log('\n=== Testing git 00e054b compact_report.cjs ===');
try {
    const gitBuf = execSync('git show 00e054b:compact_report.cjs', { cwd, encoding: 'utf8' });
    fs.writeFileSync('scratch/test_git_compact.cjs', gitBuf);
    require('./test_git_compact.cjs');
    console.log('Git 00e054b compact_report.cjs parsed cleanly!');
} catch(e) {
    console.error('Git 00e054b compact_report.cjs PARSE ERROR:', e.message);
}
