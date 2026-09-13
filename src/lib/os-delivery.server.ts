/**
 * Server-only Resend delivery for the AI Income Operating System PDF.
 *
 * Sends the PDF as an email attachment to new OS subscribers.
 * Never import this from client code.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const PDF_URL = "https://ai-income-systems.com/downloads/ai-income-operating-system.pdf";
const FROM = "AI Income Systems <support@ai-income-systems.com>";
const REPLY_TO = "support@ai-income-systems.com";

function sha256(input: string) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function fetchPdf(): Promise<Buffer> {
  const res = await fetch(PDF_URL);
  if (!res.ok) {
    throw new Error(`Could not fetch PDF: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function sendOsPdfEmail(email: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!lovableKey || !resendKey) {
    console.error("[os-delivery] missing LOVABLE_API_KEY or RESEND_API_KEY");
    return { ok: false, reason: "email credentials not configured" };
  }

  try {
    const pdf = await fetchPdf();
    const base64 = pdf.toString("base64");
    const idempotencyKey = `os-pdf-${sha256(email.toLowerCase().trim())}`;

    const html = `<!doctype html>
<html>
  <body style="margin:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#111;padding:32px 28px;color:#e5e5e5;">
      <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#c9a227;margin:0 0 8px;">AI Income Systems Lab</p>
      <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px;color:#ffffff;">Your AI Income Operating System is attached</h1>
      <p style="font-size:16px;color:#a3a3a3;margin:0 0 24px;line-height:1.6;">
        Thanks for downloading the AI Income Operating System. The full PDF is attached to this email.
        You can also grab it anytime from the link below.
      </p>
      <div style="margin:28px 0;">
        <a href="https://ai-income-systems.com/os" style="display:inline-block;background:#c9a227;color:#0a0a0a;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;">Download page →</a>
      </div>
      <hr style="border:none;border-top:1px solid #262626;margin:32px 0 16px;">
      <p style="font-size:12px;color:#737373;margin:0;">
        You're getting this because you requested the free AI Income Operating System.
        <a href="https://ai-income-systems.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#737373;text-decoration:underline;">Unsubscribe</a>.
      </p>
    </div>
  </body>
</html>`;

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        reply_to: REPLY_TO,
        subject: "Your AI Income Operating System PDF is attached",
        html,
        text: `Thanks for downloading the AI Income Operating System. The full PDF is attached to this email. You can also grab it anytime at https://ai-income-systems.com/os`,
        attachments: [
          {
            filename: "AI-Income-Operating-System.pdf",
            content: base64,
          },
        ],
        tags: [{ name: "os-pdf-delivery" }],
        headers: {
          "X-Idempotency-Key": idempotencyKey,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[os-delivery] gateway error", res.status, body);
      return { ok: false, reason: `gateway ${res.status}: ${body}` };
    }

    const body = (await res.json()) as { id?: string };
    console.log("[os-delivery] sent", email, body.id);
    return { ok: true, id: body.id };
  } catch (err) {
    console.error("[os-delivery] unexpected error", err);
    return { ok: false, reason: String(err) };
  }
}
