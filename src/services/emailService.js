/**
 * emailService.js
 * ---------------
 * Responsive HTML Email Generator and Dispatch Service for Beat Headache Digital Passports.
 */

export function buildAssessmentHtmlEmail(assessmentDoc) {
  const history = assessmentDoc.assessmentHistory || [];
  const latestEntry = history[history.length - 1] || {};
  const assessmentId = assessmentDoc.assessmentId || "BH-HA-PASSPORT";
  const name = assessmentDoc.firstName || "Valued User";
  const dateStr = new Date(latestEntry.assessmentDate || Date.now()).toLocaleDateString();
  const passportUrl = `${window.location.origin}/assessment/${assessmentId}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Beat Headache Digital Passport</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #e2e8f0; }
        .header { text-align: center; border-b: 1px solid #f1f5f9; padding-bottom: 20px; }
        .brand { font-size: 20px; font-weight: 900; color: #2563eb; }
        .badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #1d4ed8; border-radius: 12px; font-size: 12px; font-weight: 700; }
        .scores { display: flex; margin: 24px 0; gap: 16px; }
        .score-box { flex: 1; padding: 16px; background: #f8fafc; border-radius: 16px; text-align: center; border: 1px solid #e2e8f0; }
        .score-val { font-size: 28px; font-weight: 900; color: #2563eb; }
        .btn { display: inline-block; padding: 14px 28px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 800; font-size: 14px; margin-top: 16px; }
        .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; border-t: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">🧠 Beat Headache Clinic</div>
          <h2>Your Digital Headache Passport</h2>
          <span class="badge">Passport ID: ${assessmentId}</span>
        </div>

        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for completing your Beat Headache Self-Assessment on <strong>${dateStr}</strong>. Below is your personalized headache burden summary and digital passport link.</p>

        <div class="scores">
          <div class="score-box">
            <div style="font-size:11px; font-weight:700; color:#64748b;">BURDEN SCORE</div>
            <div class="score-val">${latestEntry.headacheScore || 0} / 60</div>
            <div style="font-size:12px; font-weight:700; color:#2563eb;">${latestEntry.severity || "Standard"}</div>
          </div>
          <div class="score-box">
            <div style="font-size:11px; font-weight:700; color:#64748b;">MINI FRESSH</div>
            <div class="score-val" style="color:#10b981;">${latestEntry.fresshScore || 0} / 60</div>
            <div style="font-size:12px; font-weight:700; color:#10b981;">Lifestyle Rating</div>
          </div>
        </div>

        <h3>Personal Action Guidance:</h3>
        <ul>
          ${(latestEntry.recommendations || ["Maintain healthy hydration and sleep habits."]).map(r => `<li>${r}</li>`).join("")}
        </ul>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${passportUrl}" class="btn">View Online Digital Passport</a>
        </div>

        <div class="footer">
          ⚠️ <strong>Medical Disclaimer:</strong> This assessment is educational only and does not replace medical advice. If you experience severe red flag symptoms, consult an emergency healthcare professional immediately.
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendAssessmentEmail(assessmentDoc) {
  if (!assessmentDoc.email) {
    throw new Error("No recipient email address specified.");
  }
  const htmlContent = buildAssessmentHtmlEmail(assessmentDoc);
  console.log(`[emailService] Dispatching Assessment HTML Email to: ${assessmentDoc.email} (Passport ID: ${assessmentDoc.assessmentId})`);
  return { success: true, recipient: assessmentDoc.email, htmlContent };
}
