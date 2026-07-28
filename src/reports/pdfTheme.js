/**
 * pdfTheme.js
 * -----------
 * Shared color palette, typography hierarchy, and spacing constants
 * for all Beat Headache PDF reports (Patient Summary A5 & Doctor Clinical A4).
 */

export const Colors = {
    Primary: [15, 23, 42],         // #0F172A — Slate-900 / Navy
    Accent: [37, 99, 235],         // #2563EB — Accent Blue
    Background: [239, 246, 255],   // #EFF6FF — Soft Blue
    BackgroundCyan: [224, 242, 254], // #E0F2FE — Soft Cyan-Blue
    Border: [191, 219, 254],       // #BFDBFE — Blue Border
    BorderSoft: [226, 232, 240],   // #E2E8F0 — Soft Slate Border
    Muted: [100, 116, 139],        // #64748B — Slate-500
    Success: [5, 150, 105],        // #059669 — Green Text
    SuccessBg: [220, 252, 231],    // #DCFCE7 — Soft Green Background
    SuccessBorder: [74, 222, 128], // #4ADE80 — Light Green Border
    Warning: [202, 138, 4],        // #CA8A04 — Yellow/Orange Text
    Danger: [220, 38, 38],         // #DC2626 — Red Text
    DangerBg: [254, 226, 226],     // #FEE2E2 — Soft Red Background
    DangerBorder: [248, 113, 113], // #F87171 — Light Red Border
    White: [255, 255, 255],        // #FFFFFF
    Text: [15, 23, 42]             // #0F172A — Default body text
};

// Aliases for backwards compatibility with any remaining legacy references
export const C_BG_LIGHT  = Colors.Background;
export const C_CYAN      = Colors.BackgroundCyan;
export const C_BORDER    = Colors.Border;
export const C_TEXT      = Colors.Text;
export const C_MUTED     = Colors.Muted;
export const C_ACCENT    = Colors.Accent;
export const C_WHITE     = Colors.White;
export const C_RED       = Colors.Danger;
export const C_GREEN     = Colors.Success;

export const FONT_FAMILY = "helvetica";

export const Typography = {
    Family: "helvetica",
    Title: { size: 12, style: "bold" },
    Subtitle: { size: 9, style: "normal" },
    SectionHeading: { size: 7.5, style: "bold" },
    Label: { size: 6, style: "bold" },
    Value: { size: 7, style: "normal" },
    Small: { size: 5, style: "normal" },
    Footer: { size: 6, style: "bold" }
};

export const Spacing = {
    XS: 2,
    SM: 4,
    MD: 6,
    LG: 8,
    XL: 12
};

export const Radius = {
    Small: 0.5,
    Medium: 1.0,
    Large: 1.5
};

export const PageConstants = {
    Margin: 10, // mm
    HeaderHeight: 20,
    FooterHeight: 12,
    DefaultCardPadding: 3
};
