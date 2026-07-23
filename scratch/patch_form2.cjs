const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'BeatHeadacheNewPatientForm.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF
content = content.replace(/\r\n/g, '\n');

// Helper to check and replace once
function replaceOnce(target, replacement) {
    // Normalize target line endings
    const normalizedTarget = target.replace(/\r\n/g, '\n');
    const count = content.split(normalizedTarget).length - 1;
    if (count !== 1) {
        console.error(`Error: Found ${count} occurrences of target:`, normalizedTarget.substring(0, 100));
        process.exit(1);
    }
    content = content.replace(normalizedTarget, replacement);
}

// 1. Load components from scratch/new_components.txt
const newComponents = fs.readFileSync(path.join(__dirname, 'new_components.txt'), 'utf8').replace(/\r\n/g, '\n');
const optionGroupEnd = `                    </label>
                );
            })}
        </div>
    );
}`;

const newComponentsReplacement = `                    </label>
                );
            })}
        </div>
    );
}

` + newComponents;

replaceOnce(optionGroupEnd, newComponentsReplacement);

// 2. Update createInitialState examination and final blocks
const examinationBlock = `        examination: {
            tests: [],
        },`;

const newExaminationBlock = `        examination: {
            tests: [],
            investigations: {
                fbc: { checked: false, result: "Normal" },
                crp: { checked: false, result: "Normal" },
                esr: { checked: false, result: "Normal" },
                brainImaging: { checked: false, studies: [], result: "Normal", finding: "" },
                ophthalmology: { checked: false, findings: [], remarks: "" }
            }
        },`;

replaceOnce(examinationBlock, newExaminationBlock);

const finalBlock = `        final: {},`;
const newFinalBlock = `        final: {
            diagnosis: "",
            medications: [],
            medicationPlan: "",
            ccEmail: "",
        },`;

replaceOnce(finalBlock, newFinalBlock);

// 3. Update ensureFormDefaults examination and final mapping
const ensureFormDefaultsMatch = `        examination: {
            ...fresh.examination,
            ...(input.examination || {}),
            tests: safeArray(input.examination?.tests),
        },
        fressh: { ...fresh.fressh, ...(input.fressh || {}) },
        final: { ...fresh.final, ...(input.final || {}) },`;

const ensureFormDefaultsReplacement = `        examination: {
            ...fresh.examination,
            ...(input.examination || {}),
            tests: safeArray(input.examination?.tests),
            investigations: {
                fbc: { checked: safeArray(input.examination?.tests).includes("FBC"), result: "Normal", ...(input.examination?.investigations?.fbc || {}) },
                crp: { checked: safeArray(input.examination?.tests).includes("CRP"), result: "Normal", ...(input.examination?.investigations?.crp || {}) },
                esr: { checked: safeArray(input.examination?.tests).includes("ESR"), result: "Normal", ...(input.examination?.investigations?.esr || {}) },
                brainImaging: { 
                    checked: safeArray(input.examination?.tests).includes("Brain Imaging"), 
                    studies: Array.isArray(input.examination?.investigations?.brainImaging?.studies) 
                        ? input.examination.investigations.brainImaging.studies 
                        : (input.examination?.investigations?.brainImaging?.imagingType ? [input.examination.investigations.brainImaging.imagingType] : []), 
                    result: "Normal", 
                    finding: "", 
                    ...(input.examination?.investigations?.brainImaging || {}) 
                },
                ophthalmology: { 
                    checked: (Array.isArray(input.examination?.investigations?.ophthalmology?.findings) && input.examination.investigations.ophthalmology.findings.length > 0) || !!input.examination?.investigations?.ophthalmology?.checked, 
                    findings: Array.isArray(input.examination?.investigations?.ophthalmology?.findings) 
                        ? input.examination.investigations.ophthalmology.findings 
                        : (input.examination?.investigations?.ophthalmology?.result ? [input.examination.investigations.ophthalmology.result] : []), 
                    remarks: "", 
                    ...(input.examination?.investigations?.ophthalmology || {}) 
                },
                ...(input.examination?.investigations || {})
            }
        },
        fressh: { ...fresh.fressh, ...(input.fressh || {}) },
        final: { 
            ...fresh.final, 
            ...(input.final || {}),
            medications: safeArray(input.final?.medications)
        },`;

replaceOnce(ensureFormDefaultsMatch, ensureFormDefaultsReplacement);

// 4. Update applyForwardReflections with the end sync block
const applyForwardReflectionsEnd = `    diagConditions.forEach((cond) => {
        if (next.diagnosis[cond.id]) {
            next.final.diagnosis = addNote(
                next.final.diagnosis,
                \`Suggested diagnosis status from Page 5: \${cond.name} = \${next.diagnosis[cond.id]}. Doctor must confirm.\`
            );
        }
    });

    return next;`;

const applyForwardReflectionsEndReplacement = `    diagConditions.forEach((cond) => {
        if (next.diagnosis[cond.id]) {
            next.final.diagnosis = addNote(
                next.final.diagnosis,
                \`Suggested diagnosis status from Page 5: \${cond.name} = \${next.diagnosis[cond.id]}. Doctor must confirm.\`
            );
        }
    });

    // Sync legacy tests array to structured investigations
    if (next.examination?.tests && Array.isArray(next.examination.tests)) {
        if (!next.examination.investigations) {
            next.examination.investigations = {
                fbc: { checked: false, result: "Normal" },
                crp: { checked: false, result: "Normal" },
                esr: { checked: false, result: "Normal" },
                brainImaging: { checked: false, studies: [], result: "Normal", finding: "" },
                ophthalmology: { checked: false, findings: [], remarks: "" }
            };
        }
        if (next.examination.tests.includes("FBC")) next.examination.investigations.fbc.checked = true;
        if (next.examination.tests.includes("CRP")) next.examination.investigations.crp.checked = true;
        if (next.examination.tests.includes("ESR")) next.examination.investigations.esr.checked = true;
        if (next.examination.tests.includes("Brain Imaging")) next.examination.investigations.brainImaging.checked = true;
    }

    return next;`;

replaceOnce(applyForwardReflectionsEnd, applyForwardReflectionsEndReplacement);

// 5. Add updateInvestigation and toggleInvestigationChecked inside component
const updateStart = `    const update = (section, key, value) => {`;
const updateStartReplacement = `    const syncLegacyTests = (investigations) => {
        const testsList = [];
        if (investigations.fbc?.checked) testsList.push("FBC");
        if (investigations.crp?.checked) testsList.push("CRP");
        if (investigations.esr?.checked) testsList.push("ESR");
        if (investigations.brainImaging?.checked) testsList.push("Brain Imaging");
        return testsList;
    };

    const updateInvestigation = (key, field, val) => {
        setForm((prevRaw) => {
            const prev = ensureFormDefaults(prevRaw);
            const current = prev.examination?.investigations || {};
            const updatedTest = { ...(current[key] || {}), [field]: val };
            const nextInvestigations = { ...current, [key]: updatedTest };
            const nextTests = syncLegacyTests(nextInvestigations);
            
            return applyForwardReflections({
                ...prev,
                examination: {
                    ...prev.examination,
                    investigations: nextInvestigations,
                    tests: nextTests
                }
            });
        });
    };

    const toggleInvestigationChecked = (key, checked) => {
        setForm((prevRaw) => {
            const prev = ensureFormDefaults(prevRaw);
            const current = prev.examination?.investigations || {};
            const updatedTest = { ...(current[key] || {}), checked };
            const nextInvestigations = { ...current, [key]: updatedTest };
            const nextTests = syncLegacyTests(nextInvestigations);
            
            return applyForwardReflections({
                ...prev,
                examination: {
                    ...prev.examination,
                    investigations: nextInvestigations,
                    tests: nextTests
                }
            });
        });
    };

    const toggleStudy = (study) => {
        setForm((prevRaw) => {
            const prev = ensureFormDefaults(prevRaw);
            const current = prev.examination?.investigations?.brainImaging || {};
            const prevStudies = current.studies || [];
            const nextStudies = prevStudies.includes(study)
                ? prevStudies.filter(s => s !== study)
                : [...prevStudies, study];
            
            const nextInvestigations = {
                ...(prev.examination?.investigations || {}),
                brainImaging: { ...current, studies: nextStudies }
            };
            
            return applyForwardReflections({
                ...prev,
                examination: {
                    ...prev.examination,
                    investigations: nextInvestigations
                }
            });
        });
    };

    const toggleOphFinding = (finding) => {
        setForm((prevRaw) => {
            const prev = ensureFormDefaults(prevRaw);
            const current = prev.examination?.investigations?.ophthalmology || {};
            const prevFindings = current.findings || [];
            const nextFindings = prevFindings.includes(finding)
                ? prevFindings.filter(f => f !== finding)
                : [...prevFindings, finding];
            
            const nextInvestigations = {
                ...(prev.examination?.investigations || {}),
                ophthalmology: { ...current, findings: nextFindings }
            };
            
            return applyForwardReflections({
                ...prev,
                examination: {
                    ...prev.examination,
                    investigations: nextInvestigations
                }
            });
        });
    };

    const update = (section, key, value) => {`;

replaceOnce(updateStart, updateStartReplacement);

// 6. Replace Page 6 Tests checkbox with new investigations UI
const pageSixTests = `<Field label="Tests"><OptionGroup type="checkbox" options={tests} value={form.examination.tests} onChange={(v) => update("examination", "tests", v)} /></Field>`;

const newInvestigationsUI = fs.readFileSync(path.join(__dirname, 'new_investigations_ui.txt'), 'utf8').replace(/\r\n/g, '\n');

replaceOnce(pageSixTests, newInvestigationsUI);

// 7. Add Headache Medications section to Page 7
const pageSevenMedications = `                <Card title="Final Plan">`;
const pageSevenMedicationsReplacement = `                <Card title="Headache Medications">
                    <Field label="Select Medications">
                        <SearchableMultiSelect
                            options={[
                                "Paracetamol",
                                "Ibuprofen",
                                "Flunarizine",
                                "Pizotifen",
                                "Propranolol",
                                "Topiramate",
                                "Desloratadine",
                                "Fexofenadine"
                            ]}
                            value={form.final.medications}
                            onChange={(v) => update("final", "medications", v)}
                        />
                    </Field>
                </Card>

                <Card title="Final Plan">`;

replaceOnce(pageSevenMedications, pageSevenMedicationsReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched BeatHeadacheNewPatientForm.jsx!");
