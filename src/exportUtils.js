export function buildDeidentifiedResearchRecord(form, fresshTotal) {
    const p = form.patient || {};
    const h = form.history || {};
    const t = form.time || {};
    const med = form.medical || {};
    const diag = form.diagnosis || {};
    const exam = form.examination || {};
    const meta = form.meta || {};

    // Generate a research ID if registration code is empty or potentially identifiable
    // For this implementation, we use BH-RESEARCH-[YYYYMMDD]-[random]
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const researchId = `BH-RESEARCH-${datePart}-${randomPart}`;

    return {
        researchId,
        registrationCode: p.registrationCode || "",
        formVersion: meta.formVersion || "unknown",
        createdAt: meta.createdAt || "",
        updatedAt: meta.updatedAt || "",
        reportGeneratedAt: meta.reportGeneratedAt || "",
        
        // Demographic
        age: p.age || "",
        gender: p.gender || "",
        ethnicity: p.ethnicity || "",
        
        // Clinical - Headache
        headacheConfirmed: form.headache?.confirmed || "",
        durationYears: h.durationYears || "",
        durationMonths: h.durationMonths || "",
        frequencyPattern: h.pattern || "",
        location: (h.location || []).join(", "),
        quality: (h.painNature || []).join(", "),
        severity: t.headache?.severity || "",
        episodeDuration: t.headache?.duration || "",
        
        // T-Time
        prodromalSymptoms: (t.prodromal?.symptoms || []).join(", "),
        auraPresent: t.aura?.hasAura || "",
        auraSymptoms: (t.aura?.symptoms || []).join(", "),
        auraDuration: t.aura?.duration || "",
        postdromeSymptoms: (t.postdrome?.symptoms || []).join(", "),
        
        // Impact
        schoolAbsentDays: form.impact?.schoolAbsentDaysLastFourWeeks || 0,
        leftSchoolEarlyDays: form.impact?.leftSchoolEarlyDaysLastFourWeeks || 0,
        activityLimitedDays: form.impact?.activityLimitedDaysLastFourWeeks || 0,
        parentWorkLoss: form.impact?.parentLostWork || "",
        parentWorkLossDays: form.impact?.parentLostWorkDays || 0,
        
        // Frequency
        haDaysLastWeek: h.headacheDaysLastWeek || 0,
        haDaysLast4Weeks: h.headacheDaysLastFourWeeks || 0,
        medDaysLastWeek: h.medicineDaysLastWeek || 0,
        medDaysLast4Weeks: h.medicineDaysLastFourWeeks || 0,
        
        // Medical
        pastMedicalHistory: med.pastMedical ? "Yes" : "No",
        drugHistory: med.drugHistory ? "Yes" : "No",
        allergies: (med.allergies || []).join(", "),
        
        // Red Flags
        redFlagSystemicCount: (form.redFlags?.systemic || []).length,
        redFlagNeuroCount: (form.redFlags?.neuro || []).length,
        redFlagPositionCount: (form.redFlags?.position || []).length,
        
        // Criteria reflection
        migraineNoAuraStatus: diag["migraineNoAura.status"] || "",
        migraineAuraStatus: diag["migraineAura.status"] || "",
        tensionStatus: diag["tension.status"] || "",
        clusterStatus: diag["cluster.status"] || "",
        
        // Examination
        height: exam.height || "",
        weight: exam.weight || "",
        bmi: exam.bmi || "",
        ofc: exam.ofc || "",
        bpSystolic: exam.bpSystolic || "",
        bpDiastolic: exam.bpDiastolic || "",
        heartRate: exam.heartRate || "",
        
        // FRESSH
        fresshTotal: fresshTotal || 0,
        fresshFood: form.fressh?.["Food Intake Pattern"] || "",
        fresshRelaxation: form.fressh?.["Relaxation"] || "",
        fresshExercise: form.fressh?.["Exercise"] || "",
        fresshSleep: form.fressh?.["Sleep"] || "",
        fresshScreen: form.fressh?.["Screen time"] || "",
        fresshHydration: form.fressh?.["Hydration"] || "",
    };
}

export function downloadDeidentifiedCsv(form, fresshTotal) {
    const record = buildDeidentifiedResearchRecord(form, fresshTotal);
    const headers = Object.keys(record);
    const values = Object.values(record).map(val => {
        if (typeof val === 'string') {
            return `"${val.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        }
        return val;
    });

    const csvContent = [
        headers.join(","),
        values.join(",")
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BH-Research-Export-${record.researchId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function downloadDeidentifiedJson(form, fresshTotal) {
    const record = buildDeidentifiedResearchRecord(form, fresshTotal);
    const jsonContent = JSON.stringify(record, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BH-Research-Export-${record.researchId}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
