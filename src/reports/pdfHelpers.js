/**
 * pdfHelpers.js
 * -------------
 * Shared V2 PDF rendering graphics, layout primitives, and text formatting
 * helpers for Beat Headache reports (Patient Summary A5 & Doctor Clinical A4).
 */

import { Colors, Typography, PageConstants, Radius } from "./pdfTheme.js";

/**
 * Cleans user/form string input by stripping clinical system disclaimer boilerplate.
 * @param {any} value
 * @param {string} [fallback="—"]
 * @returns {string}
 */
export function cleanReportText(value, fallback = "—") {
    if (value === undefined || value === null) return fallback;
    let s = String(value).trim();
    if (!s || s.toLowerCase() === "undefined" || s.toLowerCase() === "not provided") return fallback;

    const junk = [
        "Doctor must confirm", "Clinician confirmation required",
        "Generated from Beat Headache form responses", "Generated from Beat Headache form",
        "clinical/research review support only", "Not a diagnosis",
        "See full clinical record for complete details.", "See full clinical record.",
        "See full clinical record", "Previous diagnosis reported", "Referral source",
        "Headache impact reported", "Duration: undefined", "Severity: undefined",
        "Suggested diagnosis status from Page 5", "Doctor should review"
    ];

    junk.forEach(j => {
        s = s.replace(new RegExp(j, "gi"), "");
    });

    s = s.replace(/\s{2,}/g, " ").trim();
    if (s.endsWith(":") || s.endsWith(",")) s = s.slice(0, -1).trim();
    return s || fallback;
}

/**
 * Truncates text safely with an ellipsis.
 * @param {any} text
 * @param {number} [maxLen=80]
 * @returns {string}
 */
export function truncateText(text, maxLen = 80) {
    const s = cleanReportText(text);
    if (s === "—" || s === "None" || s === "Not provided") return s;
    return s.length <= maxLen ? s : s.slice(0, Math.max(0, maxLen - 3)) + "...";
}

/**
 * Filters out prefix substrings in arrays (e.g. progressive draft logs).
 * @param {Array} items
 * @returns {Array}
 */
export function pickFinalProgressiveValue(items) {
    if (!items || items.length === 0) return [];
    const sorted = items.map(String).filter(x => x && x !== "—").sort((a, b) => b.length - a.length);
    const finals = [];
    sorted.forEach(item => {
        if (!finals.some(f => f.includes(item))) {
            finals.push(item);
        }
    });
    return finals;
}

/**
 * Formats an array of items into a clean comma-separated list.
 * @param {Array} arr
 * @param {number} [maxItems=6]
 * @returns {string}
 */
export function formatArrayItems(arr, maxItems = 6) {
    let items = Array.isArray(arr) ? arr.filter(Boolean).map(x => cleanReportText(x)).filter(x => x !== "—" && x !== "None") : [];
    if (items.length === 0) return "None";
    items = pickFinalProgressiveValue(items);
    const unique = [...new Set(items)];
    if (unique.length <= maxItems) return unique.join(", ");
    return unique.slice(0, maxItems).join(", ") + " ...";
}

/**
 * Parses parity string "P[:x] C[:y]" into structured values.
 * @param {any} val
 * @returns {{ p: string, c: string }}
 */
export function parseParityString(val) {
    const s = String(val || "").trim();
    if (!s || s === "Not provided" || s === "—") return { p: "—", c: "—" };
    const pM = s.match(/P\s*[:\[\s]*(\d+)/i);
    const cM = s.match(/C\s*[:\[\s]*(\d+)/i);
    let pv = pM ? pM[1] : "";
    let cv = cM ? cM[1] : "";
    if (!pv && !cv && /^\d+$/.test(s)) pv = s;
    return { p: pv || "—", c: cv || "—" };
}

/**
 * Deduplicates newline or pipe separated text into a clean semicolon-separated string.
 * @param {string} text
 * @returns {string}
 */
export function dedupeTextLines(text) {
    if (!text) return "—";
    const lines = String(text).split(/\n+|\s*\|\s*/).map(l => l.trim()).filter(Boolean);
    const items = pickFinalProgressiveValue(lines).map(x => cleanReportText(x)).filter(x => x !== "—");
    const unique = [...new Set(items)];
    return unique.length > 0 ? unique.join("; ") : "—";
}

// ============================================================================
// V2 GRAPHICS & DRAWING HELPERS
// ============================================================================

export function drawSectionTitle(doc, title, x, y, theme = { Colors, Typography }) {
    const colors = theme.Colors || Colors;
    const topo = theme.Typography || Typography;
    doc.setFont(topo.Family, topo.SectionHeading.style);
    doc.setFontSize(topo.SectionHeading.size);
    doc.setTextColor(...colors.Accent);
    doc.text(title.toUpperCase(), x, y);
    return y + 2.5;
}

export function drawRoundedCard(doc, x, y, width, height, theme = { Colors, Radius }, fillColor = null, borderColor = null) {
    const colors = theme.Colors || Colors;
    const radii = theme.Radius || Radius;
    const fill = fillColor || colors.White;
    const border = borderColor || colors.Border;

    doc.setDrawColor(...border);
    doc.setFillColor(...fill);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, width, height, radii.Medium, radii.Medium, "FD");
}

export function drawLabelValue(doc, label, value, x, y, width, theme = { Colors, Typography, PageConstants }) {
    const colors = theme.Colors || Colors;
    const topo = theme.Typography || Typography;
    const padding = (theme.PageConstants || PageConstants).DefaultCardPadding || 3;

    drawRoundedCard(doc, x, y, width, 9, theme);

    doc.setFont(topo.Family, topo.Label.style);
    doc.setFontSize(topo.Label.size);
    doc.setTextColor(...colors.Muted);
    doc.text(label.toUpperCase(), x + padding, y + 3.5);

    doc.setFont(topo.Family, topo.Value.style);
    doc.setFontSize(topo.Value.size);
    doc.setTextColor(...colors.Text);

    const s = cleanReportText(value);
    const maxChars = Math.floor((width - padding * 2) / 1.4);
    let finalStr = s;
    if (finalStr.length > maxChars) {
        finalStr = finalStr.slice(0, Math.max(0, maxChars - 3)) + "...";
    }
    doc.text(finalStr, x + padding, y + 7.5);
}

export function drawInfoRow(doc, label, value, x, y, labelWidth, theme = { Colors, Typography }) {
    const colors = theme.Colors || Colors;
    const topo = theme.Typography || Typography;

    doc.setFont(topo.Family, topo.Label.style);
    doc.setFontSize(topo.Label.size);
    doc.setTextColor(...colors.Muted);
    doc.text(label, x, y);

    doc.setFont(topo.Family, topo.Value.style);
    doc.setFontSize(topo.Value.size);
    doc.setTextColor(...colors.Text);

    const val = cleanReportText(value);
    const lines = doc.splitTextToSize(val, 150);
    doc.text(lines[0] || "—", x + labelWidth, y);
}

export function drawStatusChip(doc, text, x, y, statusType, theme = { Colors, Typography, Radius }) {
    const colors = theme.Colors || Colors;
    const topo = theme.Typography || Typography;
    const radii = theme.Radius || Radius;

    let bgColor, borderColor, textColor;
    if (statusType === "danger") {
        bgColor = colors.DangerBg;
        borderColor = colors.DangerBorder || colors.Danger;
        textColor = colors.Danger;
    } else if (statusType === "success") {
        bgColor = colors.SuccessBg;
        borderColor = colors.SuccessBorder || colors.Success;
        textColor = colors.Success;
    } else {
        bgColor = colors.Background;
        borderColor = colors.Border;
        textColor = colors.Muted;
    }

    const txtWidth = doc.getTextWidth(text);
    const chipW = txtWidth + 3;

    doc.setFillColor(...bgColor);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.15);
    doc.roundedRect(x, y, chipW, 3, radii.Small, radii.Small, "FD");

    doc.setFont(topo.Family, topo.Small.style);
    doc.setFontSize(topo.Small.size);
    doc.setTextColor(...textColor);
    doc.text(text, x + 1.5, y + 2.2);

    return chipW;
}

export function drawFooter(doc, pageNum, totalPages, theme = { Colors, Typography, PageConstants }, pageWidth, pageHeight) {
    const colors = theme.Colors || Colors;
    const topo = theme.Typography || Typography;
    const margin = (theme.PageConstants || PageConstants).Margin || 10;
    const footerHeight = (theme.PageConstants || PageConstants).FooterHeight || 12;
    const yPos = pageHeight - footerHeight / 2;

    doc.setDrawColor(...colors.Border);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos - 3, pageWidth - margin, yPos - 3);

    doc.setFont(topo.Family, topo.Footer.style);
    doc.setFontSize(topo.Footer.size - 1);
    doc.setTextColor(...colors.Muted);
    doc.text("CONFIDENTIAL MEDICAL RECORD  •  BEAT HEADACHE CLINICAL SYSTEM", margin, yPos);

    doc.setFont(topo.Family, topo.Footer.style);
    doc.setFontSize(topo.Footer.size);
    doc.setTextColor(...colors.Text);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, yPos, { align: "right" });
}

export function drawDivider(doc, x, y, width, theme = { Colors }) {
    const colors = theme.Colors || Colors;
    doc.setDrawColor(...colors.Border);
    doc.setLineWidth(0.25);
    doc.line(x, y, x + width, y);
}
