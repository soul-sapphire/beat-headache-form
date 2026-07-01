const fs = require('fs');

const path = 'src/reportUtils.js';
let code = fs.readFileSync(path, 'utf8');

const targetStart = code.indexOf('    const lifestyleRecs = [');
const targetEnd = code.indexOf('    // Divider before Special Notes');

if (targetStart === -1 || targetEnd === -1) {
    console.error('Could not find boundaries');
    process.exit(1);
}

const newBlock = `    const lifestyleRecs = [
        { cat: "Hydration", val: form.fressh?.["Hydration"] },
        { cat: "Sleep", val: form.fressh?.["Sleep"] },
        { cat: "Food", val: form.fressh?.["Food Intake Pattern"] },
        { cat: "Relaxation", val: form.fressh?.["Relaxation"] },
        { cat: "Exercise", val: form.fressh?.["Exercise"] },
        { cat: "Screen time", val: form.fressh?.["Screen time"] },
    ];

    const recCardH = 21;
    const recColWidth = (U_WIDTH - 8) / 3;

    lifestyleRecs.forEach((rec, idx) => {
        const col = idx % 3;
        const cx = M_LEFT + col * (recColWidth + 4);
        
        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, y, recColWidth, recCardH, 1.5, 1.5, "FD");

        const { current, goal } = getRecommendation(rec.cat, rec.val);
        
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_ACCENT);
        doc.text(rec.cat.toUpperCase(), cx + 2, y + 4.5);

        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED);
        doc.text(current, cx + 2, y + 8.5);
        
        const isExcellent = goal.includes("✅");
        doc.setFont("helvetica", isExcellent ? "bold" : "normal"); 
        doc.setFontSize(6.5);
        if (isExcellent) {
            doc.setTextColor(21, 128, 61);
        } else {
            doc.setTextColor(...C_TEXT);
        }
        
        let actionText = goal;
        if (!isExcellent) {
            actionText = "→ " + goal;
        }
        
        const actionLines = doc.splitTextToSize(actionText, recColWidth - 4);
        doc.text(actionLines.slice(0, 3), cx + 2, y + 13);
        
        if (col === 2 || idx === lifestyleRecs.length - 1) {
            y += recCardH + 3;
        }
    });

    // Special Notice Footer
    let footY = P_HEIGHT - 44; // Anchored to bottom
    const footH = 34;

`;

const newCode = code.substring(0, targetStart) + newBlock + code.substring(targetEnd);
fs.writeFileSync(path, newCode, 'utf8');
console.log('Update complete.');
