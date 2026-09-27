/** Server-only delivery for the uploaded, large-print AI Business Engine guide. */
import { createHash } from "crypto";
import guideAsset from "@/assets/ai-business-engine-gold.pdf.asset.json";

const GUIDE_URL = `https://ai-income-systems.com${guideAsset.url}`;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export async function sendBusinessEngineGuide(email: string): Promise<{ ok: boolean }> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    console.error("[business-engine-delivery] email credentials not configured");
    return { ok: false };
  }

  try {
    const response = await fetch(GUIDE_URL);
    if (!response.ok) throw new Error(`Guide fetch failed (${response.status})`);
    const content = Buffer.from(await response.arrayBuffer()).toString("base64");
    const idempotencyKey = `business-engine-gold-${createHash("sha256").update(email.trim().toLowerCase()).digest("hex")}`;
    const unsubscribe = `https://ai-income-systems.com/unsubscribe?email=${encodeURIComponent(email)}`;

    const result = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: "AI Income Systems <support@ai-income-systems.com>",
        to: [email],
        reply_to: "support@ai-income-systems.com",
        subject: "Your AI Business Engine guide (large-print PDF)",
        html: `<div style="max-width:600px;margin:auto;padding:32px;background:#111;color:#e5e5e5;font-family:Arial,sans-serif"><p style="color:#c9a227">AI Income Systems Lab</p><h1 style="color:#fff">Your AI Business Engine guide is attached</h1><p>The new large-print PDF is attached. You can also <a style="color:#c9a227" href="${GUIDE_URL}">download the same guide here</a>.</p><p style="font-size:12px;color:#aaa">You received this because you requested the free guide. <a style="color:#aaa" href="${unsubscribe}">Unsubscribe</a>.</p></div>`,
        text: `Your AI Business Engine large-print guide is attached. Download the same PDF: ${GUIDE_URL}\n\nYou received this because you requested the free guide. Unsubscribe: ${unsubscribe}`,
        attachments: [{ filename: "AI-Business-Engine-Large-Print.pdf", content }],
        tags: [{ name: "business-engine-guide" }],
      }),
    });
    if (!result.ok) {
      console.error("[business-engine-delivery] send failed", result.status, (await result.text()).slice(0, 500));
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error("[business-engine-delivery] unexpected error", error);
    return { ok: false };
  }
}