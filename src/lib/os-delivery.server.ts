import { createHash } from "node:crypto";

const PDF_URL = "https://ai-income-systems.com/downloads/ai-income-operating-system.pdf";
const DOWNLOAD_URL = "https://ai-income-systems.com/downloads/ai-income-operating-system.pdf";

export async function sendOsPdfEmail(email: string): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("Email delivery is not configured");

  const pdfResponse = await fetch(PDF_URL);
  if (!pdfResponse.ok) throw new Error("The OS guide could not be prepared for delivery");

  const pdf = Buffer.from(await pdfResponse.arrayBuffer());
  const idempotencyKey = `os-pdf-${createHash("sha256").update(email).digest("hex")}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: "AI Income Systems <noreply@notify.ai-income-systems.com>",
      reply_to: "support@ai-income-systems.com",
      to: [email],
      subject: "Your AI Income Operating System is attached",
      html: `
        <div style="background:#f3f1eb;padding:28px 12px;font-family:Arial,sans-serif;color:#171717">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #ded8ca">
            <div style="background:#111111;padding:24px 30px;color:#d6ad55;font-size:13px;font-weight:bold;letter-spacing:1px">AI INCOME SYSTEMS LAB</div>
            <div style="padding:34px 30px">
              <h1 style="margin:0 0 20px;font-size:30px;line-height:1.2">Your Operating System is here</h1>
              <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Thanks for joining. Your free <strong>AI Income Operating System</strong> PDF is attached to this email.</p>
              <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Start with one outcome you can finish this week. Use the guide to connect the right prompts, automations, offer, and weekly rhythm into one practical system.</p>
              <p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#666">If your email app blocks attachments, you can also <a href="${DOWNLOAD_URL}" style="color:#8a641f">download the PDF here</a>.</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#666">Build systems, not hype.<br>Dustin<br>AI Income Systems Lab</p>
            </div>
          </div>
        </div>`,
      text: `Your AI Income Operating System is here.\n\nThe PDF is attached to this email. Start with one outcome you can finish this week, then use the guide to connect your prompts, automations, offer, and weekly rhythm.\n\nBackup download: ${DOWNLOAD_URL}\n\nBuild systems, not hype.\nDustin\nAI Income Systems Lab`,
      attachments: [
        {
          filename: "AI-Income-Operating-System.pdf",
          content: pdf.toString("base64"),
          content_type: "application/pdf",
        },
      ],
      tags: [
        { name: "email_type", value: "os_pdf_delivery" },
        { name: "lead_magnet", value: "ai_income_operating_system" },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[os-delivery] attachment email failed", response.status, detail);
    throw new Error("We could not email the guide. Please try again.");
  }
}