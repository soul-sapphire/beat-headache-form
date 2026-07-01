const fs = require('fs');

const path = 'src/reportUtils.js';
let code = fs.readFileSync(path, 'utf8');

const fresshStart = code.indexOf('    // FRESSH Lifestyle');
const primaryStart = code.indexOf('    // Primary & Secondary Headache Sections Side-by-Side');
const specialNoticeStart = code.indexOf('    // Special Notice Footer');

if (fresshStart === -1 || primaryStart === -1 || specialNoticeStart === -1) {
    console.error('Could not find one of the blocks');
    process.exit(1);
}

const fresshBlock = code.substring(fresshStart, primaryStart);
const primaryBlock = code.substring(primaryStart, specialNoticeStart);

// New recommendation block logic
const recBlock = `
    // Personalized Lifestyle Recommendations
    y = drawSectionTitle("Personalized Lifestyle Recommendations", y);
    y += 2;
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...C_MUTED);
    doc.text("Based on your current lifestyle assessment, the following recommendations are suggested to help improve your overall health and reduce headache risk.", M_LEFT, y, { maxWidth: U_WIDTH });
    y += 8;

    const getRecommendation = (category, value) => {
        const valStr = String(value || "").toLowerCase();
        let current = value ? String(value).replace(/^\\d+\\s*-\\s*/, '') : "Not provided";
        let goal = "";
        let why = "";
        let recommended = "";
        
        if (category === "Hydration") {
            recommended = "More than 8 glasses/day";
            why = "Adequate hydration supports brain function and may help reduce headaches.";
            if (valStr.includes("<2") || valStr.includes("less than 2")) goal = "Increase by 6–8 glasses/day.";
            else if (valStr.includes("2-4") || valStr.includes("2–4") || valStr.includes("2 to 4")) goal = "Increase by 4–6 glasses/day.";
            else if (valStr.includes("4-6") || valStr.includes("4–6") || valStr.includes("4 to 6")) goal = "Increase by 2–4 glasses/day.";
            else if (valStr.includes("6-8") || valStr.includes("6–8") || valStr.includes("6 to 8")) goal = "Increase by 1–2 glasses/day.";
            else if (valStr.includes(">8") || valStr.includes("more than 8") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue your current hydration habit.";
                current = "More than 8 glasses/day";
            }
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Sleep") {
            recommended = "8–10 hours/day";
            why = "Consistent and adequate sleep is crucial for preventing headache triggers.";
            if (valStr.includes("<4") || valStr.includes("less than 4")) goal = "Increase sleep by approximately 4–6 hours/night.";
            else if (valStr.includes("4-6") || valStr.includes("4–6") || valStr.includes("4 to 6")) goal = "Increase sleep by approximately 2–4 hours/night.";
            else if (valStr.includes("6-8") || valStr.includes("6–8") || valStr.includes("6 to 8")) goal = "Increase sleep by approximately 1–2 hours/night.";
            else if (valStr.includes("8-10") || valStr.includes("8–10") || valStr.includes("8 to 10") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue maintaining your sleep schedule.";
            }
            else if (valStr.includes(">10") || valStr.includes("more than 10")) goal = "Maintain unless otherwise advised by your healthcare provider.";
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Food") {
            recommended = "Never skips meals";
            why = "Regular meals maintain stable blood sugar levels, preventing hunger-triggered headaches.";
            if (valStr.includes("most days")) goal = "Begin eating regular meals daily.";
            else if (valStr.includes("frequently")) goal = "Reduce skipped meals significantly.";
            else if (valStr.includes("occasionally")) goal = "Avoid skipping meals and aim for regular daily meals.";
            else if (valStr.includes("never") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue maintaining regular meals.";
            }
            else if (valStr.includes("skips meals")) goal = "Reduce skipped meals.";
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Relaxation") {
            recommended = "More than 30 minutes/day";
            why = "Daily relaxation helps manage stress, a major contributor to tension and migraine headaches.";
            if (valStr.includes("no relaxation")) goal = "Increase relaxation by at least 30 minutes/day.";
            else if (valStr.includes("<10") || valStr.includes("less than 10")) goal = "Increase by approximately 20–30 minutes/day.";
            else if (valStr.includes("10-20") || valStr.includes("10–20") || valStr.includes("10 to 20")) goal = "Increase by approximately 10–20 minutes/day.";
            else if (valStr.includes("20-30") || valStr.includes("20–30") || valStr.includes("20 to 30")) goal = "Increase by approximately 10 minutes/day.";
            else if (valStr.includes(">30") || valStr.includes("more than 30") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue maintaining your relaxation routine.";
            }
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Exercise") {
            recommended = "More than 2 hours/day";
            why = "Regular physical activity reduces headache frequency and intensity by improving overall health.";
            if (valStr.includes("no exercise")) goal = "Increase activity gradually toward at least 30 minutes/day.";
            else if (valStr.includes("<30") || valStr.includes("less than 30")) goal = "Increase activity by about 30–90 minutes/day.";
            else if (valStr.includes("30-60") || valStr.includes("30–60") || valStr.includes("30 to 60")) goal = "Increase activity by approximately 1–1.5 hours/day.";
            else if (valStr.includes("1-2") || valStr.includes("1–2") || valStr.includes("1 to 2")) goal = "Increase activity by approximately 30–60 minutes/day.";
            else if (valStr.includes(">2") || valStr.includes("more than 2") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue your current activity level.";
            }
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        } else if (category === "Screen time") {
            recommended = "Less than 15 minutes/day";
            why = "Reducing screen time decreases eye strain and digital fatigue, common headache triggers.";
            if (valStr.includes(">2") || valStr.includes("more than 2")) goal = "Reduce screen time by approximately 2 hours/day.";
            else if (valStr.includes("1-2") || valStr.includes("1–2") || valStr.includes("1 to 2")) goal = "Reduce by approximately 1 hour/day.";
            else if (valStr.includes("30-60") || valStr.includes("30–60") || valStr.includes("30 to 60")) goal = "Reduce by approximately 30 minutes/day.";
            else if (valStr.includes("15-30") || valStr.includes("15–30") || valStr.includes("15 to 30")) goal = "Reduce by approximately 15 minutes/day.";
            else if (valStr.includes("<15") || valStr.includes("less than 15") || valStr.match(/^10/)) {
                goal = "✅ Excellent! Continue limiting your screen time.";
            }
            else goal = "✅ Excellent! Continue maintaining this healthy habit.";
        }
        
        return { current, recommended, goal, why };
    };

    const lifestyleRecs = [
        { cat: "Hydration", val: form.fressh?.["Hydration"] },
        { cat: "Sleep", val: form.fressh?.["Sleep"] },
        { cat: "Food", val: form.fressh?.["Food Intake Pattern"] },
        { cat: "Relaxation", val: form.fressh?.["Relaxation"] },
        { cat: "Exercise", val: form.fressh?.["Exercise"] },
        { cat: "Screen time", val: form.fressh?.["Screen time"] },
    ];

    const recCardH = 34;
    const recColWidth = (U_WIDTH - 4) / 2;

    lifestyleRecs.forEach((rec, idx) => {
        if (y + recCardH > P_HEIGHT - M_BOTTOM) {
            doc.addPage();
            drawHeader();
        }

        const isLeft = idx % 2 === 0;
        const cx = isLeft ? M_LEFT : M_LEFT + recColWidth + 4;
        
        doc.setDrawColor(...C_BORDER); doc.setFillColor(...C_WHITE);
        doc.roundedRect(cx, y, recColWidth, recCardH, 1.5, 1.5, "FD");

        const { current, recommended, goal, why } = getRecommendation(rec.cat, rec.val);
        
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C_ACCENT);
        doc.text(rec.cat.toUpperCase(), cx + 3, y + 5);

        let ly = y + 10;
        
        const drawRecField = (label, value, isGoal) => {
            doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C_MUTED);
            doc.text(label, cx + 3, ly);
            
            const isExcellent = isGoal && value.includes("✅");
            doc.setFont("helvetica", isExcellent ? "bold" : "normal"); 
            if (isExcellent) {
                doc.setTextColor(21, 128, 61); // Green
            } else {
                doc.setTextColor(...C_TEXT);
            }
            
            const lines = doc.splitTextToSize(value, recColWidth - 25);
            doc.text(lines, cx + 22, ly);
            ly += lines.length * 3.5;
        };

        drawRecField("Current:", current, false);
        drawRecField("Recommended:", recommended, false);
        drawRecField("Your Goal:", goal, true);
        
        ly += 1;
        doc.setFont("helvetica", "italic"); doc.setFontSize(6.5); doc.setTextColor(...C_MUTED);
        doc.text("Why?", cx + 3, ly);
        const whyLines = doc.splitTextToSize(why, recColWidth - 12);
        doc.text(whyLines, cx + 10, ly);
        
        if (!isLeft || idx === lifestyleRecs.length - 1) {
            y += recCardH + 4;
        }
    });

`;

const newCode = code.substring(0, fresshStart) + primaryBlock + fresshBlock + recBlock + code.substring(specialNoticeStart);

// Now handle the footer placement correctly.
// The original code was:
/*
    // Special Notice Footer
    const footY = P_HEIGHT - 44;
    const footH = 34;
*/
// I will replace that string to handle the dynamic page break.
const oldFooterStr = `    // Special Notice Footer
    const footY = P_HEIGHT - 44;
    const footH = 34;`;

const newFooterStr = `    // Special Notice Footer
    let footY = Math.max(y + 6, P_HEIGHT - 44);
    const footH = 34;
    
    // Check if footer fits on current page
    if (footY + footH > P_HEIGHT - M_BOTTOM) {
        doc.addPage();
        drawHeader();
        footY = Math.max(y + 6, P_HEIGHT - 44);
    }`;

fs.writeFileSync(path, newCode.replace(oldFooterStr, newFooterStr), 'utf8');
console.log('Update complete.');
