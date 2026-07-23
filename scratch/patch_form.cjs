const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'BeatHeadacheNewPatientForm.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Helper to check and replace once
function replaceOnce(target, replacement) {
    const count = content.split(target).length - 1;
    if (count !== 1) {
        console.error(`Error: Found ${count} occurrences of target:`, target.substring(0, 100));
        process.exit(1);
    }
    content = content.replace(target, replacement);
}

// 1. Add Select and SearchableMultiSelect components after OptionGroup
const optionGroupEnd = `                    </label>
                );
            })}
        </div>
    );
}`;

const newComponents = `                    </label>
                );
            })}
        </div>
    );
}

function Select({ value, onChange, options, placeholder = "" }) {
    return (
        <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900"
        >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    );
}

function SearchableMultiSelect({ options, value, onChange, placeholder = "Select medications..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const selected = Array.isArray(value) ? value : [];

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    const toggleOption = (option) => {
        const next = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(next);
    };

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[48px] w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white px-4 py-2 text-sm outline-none transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100 dark:focus-within:ring-sky-900 flex items-center justify-between cursor-pointer"
            >
                <div className="flex flex-wrap gap-1.5">
                    {selected.length === 0 ? (
                        <span className="text-slate-400">{placeholder}</span>
                    ) : (
                        selected.map(item => (
                            <span
                                key={item}
                                className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200 px-2 py-0.5 rounded-lg text-xs font-semibold border border-sky-100 dark:border-sky-800"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(item);
                                }}
                            >
                                {item}
                                <span className="hover:text-sky-900 dark:hover:text-white font-bold ml-1">×</span>
                            </span>
                        ))
                    )}
                </div>
                <span className="text-slate-400 ml-2">▼</span>
            </div>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto p-2 space-y-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white px-3 py-2 text-xs outline-none focus:border-sky-400"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="space-y-1">
                            {filteredOptions.length === 0 ? (
                                <div className="text-xs text-slate-400 text-center py-2">No results found</div>
                            ) : (
                                filteredOptions.map(option => {
                                    const isChecked = selected.includes(option);
                                    return (
                                        <div
                                            key={option}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOption(option);
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors \${
                                                isChecked
                                                    ? "bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-200 font-semibold"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200"
                                            }`}
                                        >
                                            <span>{option}</span>
                                            {isChecked && <span className="text-sky-600 dark:text-sky-400 font-bold">✓</span>}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}`;

replaceOnce(optionGroupEnd, newComponents);

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
                brainImaging: { checked: false, imagingType: "CT Brain", result: "Normal", finding: "" },
                ophthalmology: { checked: false, result: "Normal" }
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
                brainImaging: { checked: safeArray(input.examination?.tests).includes("Brain Imaging"), imagingType: "CT Brain", result: "Normal", finding: "", ...(input.examination?.investigations?.brainImaging || {}) },
                ophthalmology: { checked: false, result: "Normal", ...(input.examination?.investigations?.ophthalmology || {}) },
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
                brainImaging: { checked: false, imagingType: "CT Brain", result: "Normal", finding: "" },
                ophthalmology: { checked: false, result: "Normal" }
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

    const update = (section, key, value) => {`;

replaceOnce(updateStart, updateStartReplacement);

// 6. Replace Page 6 Tests checkbox with new investigations UI
const pageSixTests = `<Field label="Tests"><OptionGroup type="checkbox" options={tests} value={form.examination.tests} onChange={(v) => update("examination", "tests", v)} /></Field>`;

const newInvestigationsUI = `<div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-5">
                        <span className="text-sm font-bold text-slate-800 block border-b border-slate-200 pb-2">Investigations</span>
                        
                        {/* Blood Tests */}
                        <div className="space-y-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Blood Tests</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* FBC */}
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-2">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.examination.investigations?.fbc?.checked || false}
                                            onChange={(e) => toggleInvestigationChecked("fbc", e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">FBC</span>
                                    </label>
                                    {form.examination.investigations?.fbc?.checked && (
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 font-medium">Result</span>
                                            <Select
                                                options={["Normal", "Abnormal", "Pending"]}
                                                value={form.examination.investigations?.fbc?.result || "Normal"}
                                                onChange={(v) => updateInvestigation("fbc", "result", v)}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* CRP */}
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-2">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.examination.investigations?.crp?.checked || false}
                                            onChange={(e) => toggleInvestigationChecked("crp", e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">CRP</span>
                                    </label>
                                    {form.examination.investigations?.crp?.checked && (
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 font-medium">Result</span>
                                            <Select
                                                options={["Normal", "Abnormal", "Pending"]}
                                                value={form.examination.investigations?.crp?.result || "Normal"}
                                                onChange={(v) => updateInvestigation("crp", "result", v)}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* ESR */}
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-2">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.examination.investigations?.esr?.checked || false}
                                            onChange={(e) => toggleInvestigationChecked("esr", e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">ESR</span>
                                    </label>
                                    {form.examination.investigations?.esr?.checked && (
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 font-medium">Result</span>
                                            <Select
                                                options={["Normal", "Abnormal", "Pending"]}
                                                value={form.examination.investigations?.esr?.result || "Normal"}
                                                onChange={(v) => updateInvestigation("esr", "result", v)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Brain Imaging */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.examination.investigations?.brainImaging?.checked || false}
                                    onChange={(e) => toggleInvestigationChecked("brainImaging", e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Brain Imaging</span>
                            </label>
                            {form.examination.investigations?.brainImaging?.checked && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 font-medium">Imaging Type</span>
                                        <Select
                                            options={["CT Brain", "MRI Brain", "CT + MRI", "CT Sinus", "Other"]}
                                            value={form.examination.investigations?.brainImaging?.imagingType || "CT Brain"}
                                            onChange={(v) => updateInvestigation("brainImaging", "imagingType", v)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 font-medium">Result</span>
                                        <Select
                                            options={["Normal", "Abnormal", "Pending"]}
                                            value={form.examination.investigations?.brainImaging?.result || "Normal"}
                                            onChange={(v) => updateInvestigation("brainImaging", "result", v)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 font-medium">Finding (remarks)</span>
                                        <TextInput
                                            placeholder="Optional remarks"
                                            value={form.examination.investigations?.brainImaging?.finding || ""}
                                            onChange={(v) => updateInvestigation("brainImaging", "finding", v)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ophthalmology */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col space-y-3">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.examination.investigations?.ophthalmology?.checked || false}
                                    onChange={(e) => toggleInvestigationChecked("ophthalmology", e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ophthalmology</span>
                            </label>
                            {form.examination.investigations?.ophthalmology?.checked && (
                                <div className="space-y-1 max-w-xs pt-1">
                                    <span className="text-xs text-slate-500 font-medium">Result</span>
                                    <Select
                                        options={["Normal", "Papilloedema", "Visual Defect", "Other"]}
                                        value={form.examination.investigations?.ophthalmology?.result || "Normal"}
                                        onChange={(v) => updateInvestigation("ophthalmology", "result", v)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>`;

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
