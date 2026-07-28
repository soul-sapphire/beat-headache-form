/**
 * qrRenderer.js
 * -------------
 * Plain QR code rendering utility for PDF reports without decorative branding or logos.
 */

import QRCode from 'qrcode';
import { Colors } from './pdfTheme.js';

/**
 * Renders a plain QR code onto a jsPDF document page natively.
 *
 * @param {import("jspdf").jsPDF} doc    - Active jsPDF document instance.
 * @param {any}                   data   - String/token to encode in the QR code.
 * @param {number}                x      - X position (mm from left edge).
 * @param {number}                y      - Y position (mm from top edge).
 * @param {number}                [size] - Width/height of the QR square in mm. Default: 14.
 * @returns {boolean} true if rendered vector QR matrix, false if rendered fallback placeholder.
 */
export function renderQrCode(doc, data, x, y, size = 14) {
    const drawFallback = () => {
        doc.setDrawColor(...Colors.Border);
        doc.setLineWidth(0.2);
        doc.setFillColor(...Colors.White);
        doc.roundedRect(x, y, size, size, 0.6, 0.6, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(Math.max(3, size * 0.35));
        doc.setTextColor(...Colors.Muted);
        doc.text("QR", x + (size / 2), y + (size * 0.62), { align: "center" });
        return false;
    };

    if (data === undefined || data === null) {
        return drawFallback();
    }

    const cleanData = String(data).trim();
    if (!cleanData) {
        return drawFallback();
    }

    try {
        const qr = QRCode.create(cleanData, { errorCorrectionLevel: 'M' });
        const modules = qr.modules;
        const count = modules.size;

        if (!count || count <= 0) {
            return drawFallback();
        }

        // Draw background container
        doc.setDrawColor(...Colors.Border);
        doc.setFillColor(...Colors.White);
        doc.setLineWidth(0.2);
        doc.roundedRect(x, y, size, size, 0.6, 0.6, "FD");

        const padding = size * 0.05; // 5% padding inside border
        const qrDrawSize = size - (padding * 2);
        const moduleSize = qrDrawSize / count;

        const startX = x + padding;
        const startY = y + padding;

        doc.setFillColor(...Colors.Text);

        // Draw full plain QR code matrix without center logo mask
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                if (modules.data[row * count + col]) {
                    doc.rect(
                        startX + (col * moduleSize),
                        startY + (row * moduleSize),
                        moduleSize,
                        moduleSize,
                        "F"
                    );
                }
            }
        }

        return true;
    } catch (error) {
        return drawFallback();
    }
}
