const { execSync } = require('child_process');
const fs = require('fs');

const files = [
    'compact_report.cjs',
    'optimizedFunction.js',
    'generateA5PatientReport.js',
    'swap_pdf_gen.cjs',
    'update_report.cjs',
    'patch_report.js',
    'scratch/patch_report.js'
];

const cwd = 'c:\\Users\\Admin\\beat-headache-form';

for (const f of files) {
    console.log(`\n=== FILE: ${f} ===`);
    if (fs.existsSync(f)) {
        const curSize = fs.statSync(f).size;
        console.log(`Current size: ${curSize} bytes`);
    } else {
        console.log(`Current: DOES NOT EXIST`);
    }

    try {
        const gitContent = execSync(`git show 00e054b:"${f}"`, { cwd, stdio: ['pipe', 'pipe', 'ignore'] });
        console.log(`Git 00e054b size: ${gitContent.length} bytes`);
        if (fs.existsSync(f)) {
            const curContent = fs.readFileSync(f);
            console.log(`Equal to 00e054b? ${curContent.equals(gitContent)}`);
        }
    } catch(e) {
        console.log(`Git 00e054b: NOT IN GIT`);
    }
}
