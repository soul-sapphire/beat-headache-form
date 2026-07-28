# Beat Headache EMR — PDF Report Framework Documentation

The Beat Headache EMR PDF Report Framework is a production-hardened, modular system designed to render pixel-perfect, design-system-aligned medical summary reports.

---

## 1. Architecture & Folder Structure

All report generation logic is encapsulated inside `src/reports/` and re-exported via `src/reportUtils.js` to provide a clean barrel interface to UI components.

```
src/
├── reportUtils.js               # Public barrel API re-exporting framework utilities
└── reports/
    ├── pdfTheme.js              # Canonical design tokens (Colors, Typography, Spacing, Radius, PageConstants)
    ├── pdfHelpers.js            # Shared V2 vector drawing primitives & text sanitization helpers
    ├── qrRenderer.js            # Native vector QR code renderer with center emblem & fallback
    ├── diagnosisUtils.js        # Shared clinical diagnostic classification and FRESSH logic
    ├── patientSummaryReport.js  # Patient Summary Report generator (A5, 2 pages)
    ├── doctorClinicalReport.js   # Doctor Clinical Report generator (A4, 2 pages)
    └── README.md                # Developer documentation
```

---

## 2. Component Responsibilities

| File | Primary Responsibility |
|---|---|
| `pdfTheme.js` | Single source of truth for design system tokens (colors, typography scale, radii, margins, spacing). |
| `pdfHelpers.js` | Standardized graphics functions (`drawSectionTitle`, `drawRoundedCard`, `drawLabelValue`, `drawInfoRow`, `drawFooter`, `drawDivider`) and string cleaning/truncating helpers. |
| `qrRenderer.js` | Generates vector QR codes on jsPDF pages with high error correction and Beat Headache logo. Handles invalid/empty inputs with fallback graphics. |
| `diagnosisUtils.js` | Form-independent clinical logic computing suggested diagnosis categories, red flag summaries, and FRESSH lifestyle interpretations. |
| `patientSummaryReport.js` | Generates the family/patient-facing summary PDF formatted for A5 layout. |
| `doctorClinicalReport.js` | Generates the comprehensive, technical clinician report formatted for A4 layout. |
| `reportUtils.js` | Public API re-exporting generator functions and diagnostic helpers for form pages and modals. |

---

## 3. How to Use `pdfTheme`

Import `Colors`, `Typography`, `Spacing`, `Radius`, or `PageConstants` from `./pdfTheme.js`:

```javascript
import { Colors, Typography, PageConstants } from "./pdfTheme.js";

// Setting text colors and fonts on jsPDF instance
doc.setFont(Typography.Family, Typography.Title.style);
doc.setFontSize(Typography.Title.size);
doc.setTextColor(...Colors.Text);
```

### Color Palette Reference (`Colors`)
- **Primary / Text**: `[15, 23, 42]` (Slate-900 / Navy)
- **Accent**: `[37, 99, 235]` (Accent Blue)
- **Background**: `[239, 246, 255]` (Soft Blue)
- **BackgroundCyan**: `[224, 242, 254]` (Soft Cyan-Blue)
- **Border**: `[191, 219, 254]` (Blue Border)
- **Success / SuccessBg**: `[5, 150, 105]` / `[220, 252, 231]` (Green)
- **Danger / DangerBg**: `[220, 38, 38]` / `[254, 226, 226]` (Red)

---

## 4. How to Use `pdfHelpers`

`pdfHelpers.js` provides drawing primitives that adhere to `pdfTheme.js`:

### Common Helpers
- `cleanReportText(val, fallback)`: Strips system boilerplate and cleans raw user inputs.
- `truncateText(text, maxLen)`: Safely truncates strings with ellipsis.
- `formatArrayItems(arr, maxItems)`: Formats string arrays into clean comma-separated lists.
- `parseParityString(val)`: Extracts `P` (Pregnancy) and `C` (Child) numbers from parity input.
- `drawSectionTitle(doc, title, x, y, theme)`: Renders standardized uppercase blue section headers.
- `drawRoundedCard(doc, x, y, width, height, theme, fillColor, borderColor)`: Renders rounded cards.
- `drawLabelValue(doc, label, value, x, y, width, theme)`: Draws a standard demographic field box.
- `drawInfoRow(doc, label, value, x, y, labelWidth, theme)`: Draws a horizontal key-value row.
- `drawFooter(doc, pageNum, totalPages, theme, pageWidth, pageHeight)`: Renders the standard confidential footer.

---

## 5. How to Use `qrRenderer`

`renderQrCode` renders a QR matrix with the center "BH" badge onto any jsPDF document:

```javascript
import { renderQrCode } from "./qrRenderer.js";

// Renders a 14mm x 14mm QR code at position (x=186, y=10)
const success = renderQrCode(doc, patientQrToken, 186, 10, 14);
```

*Note*: If `patientQrToken` is invalid, empty, or null, `renderQrCode` automatically draws a fallback QR placeholder frame without throwing errors.

---

## 6. How `diagnosisUtils` Integrates

`diagnosisUtils.js` provides pure, testable clinical classification functions:

```javascript
import {
    getFresshInterpretation,
    getRedFlagSummary,
    getSuggestedDiagnosisSummary
} from "./diagnosisUtils.js";

const redFlags = getRedFlagSummary(formState);
const diagSummary = getSuggestedDiagnosisSummary(formState);
const fresshText = getFresshInterpretation(totalScore);
```

---

## 7. How to Add a New PDF Report

1. Create a new generator module in `src/reports/` (e.g. `src/reports/researchSummaryReport.js`).
2. Import `jsPDFPackage` from `"jspdf"` and design system primitives:
   ```javascript
   import jsPDFPackage from "jspdf";
   const jsPDF = jsPDFPackage.jsPDF || jsPDFPackage;
   import { Colors, Typography, PageConstants } from "./pdfTheme.js";
   import { drawSectionTitle, drawFooter, renderQrCode } from "./pdfHelpers.js";
   ```
3. Use `Colors`, `Typography`, and `pdfHelpers` drawing routines to build the layout.
4. Export your generator function from the module:
   ```javascript
   export function generateResearchReportPdf(form) { ... }
   ```
5. Re-export the function in `src/reportUtils.js`:
   ```javascript
   export { generateResearchReportPdf } from "./reports/researchSummaryReport.js";
   ```

---

## 8. Public API Reference (`src/reportUtils.js`)

```javascript
// Generator Functions
generatePatientReportPdf(form, fresshTotal) // Generates Patient Summary PDF (A5)
generateDoctorReportPdf(form, fresshTotal)  // Generates Doctor Clinical Report PDF (A4)

// Clinical & Diagnostic Utilities
getFresshInterpretation(score)               // Returns score interpretation string
getRedFlagSummary(form)                      // Returns array of identified red flags
getSuggestedDiagnosisSummary(form)          // Returns structured primary headache summary
```
