const { execSync } = require('child_process');
const fs = require('fs');

const cwd = 'c:\\Users\\Admin\\beat-headache-form';

console.log('--- Checking all git revisions ---');
try {
    const revs = execSync('git rev-list --all --objects', { cwd, encoding: 'utf8' }).split('\n');
    console.log(`Total objects in git: ${revs.length}`);
    for (const line of revs) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
            const sha = parts[0];
            const name = parts.slice(1).join(' ');
            if (name.includes('compact_report') || name.includes('optimizedFunction') || name.includes('generateA5') || name.includes('swap_pdf') || name.includes('update_report') || name.includes('patch_report')) {
                console.log(`GIT OBJECT: ${sha} | Path: ${name}`);
            }
        }
    }
} catch(e) {
    console.error(e.message);
}
