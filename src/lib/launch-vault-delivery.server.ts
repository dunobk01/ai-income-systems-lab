/** The attachment and the instant download use the same immutable uploaded PDF. */
import { createHash } from "crypto";
import guide from "@/assets/ai-income-launch-vault.pdf.asset.json";

const GUIDE_URL = `https://ai-income-systems.com${guide.url}`;

export async function sendLaunchVaultGuide(email: string): Promise<{ ok: boolean }> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    console.error("[launch-vault] email credentials not configured");
    return { ok: false };
  }

  try {
    const pdf = await fetch(GUIDE_URL);
    if (!pdf.ok) throw new Error(`Guide fetch failed (${pdf.status})`);
    const content = Buffer.from(await pdf.arrayBuffer()).toString("base64");
    const unsubscribe = `https://ai-income-systems.com/unsubscribe?email=${encodeURIComponent(email)}`;
    const idempotencyKey = `launch-vault-${guide.asset_id}-${createHash("sha256").update(email.trim().toLowerCase()).digest("hex")}`;

    const result = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
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
        subject: "Your free AI Income Launch Guide is attached",
        html: `<div style="max-width:600px;margin:auto;padding:32px;background:#111;color:#e5e5e5;font-family:Arial,sans-serif"><p style="color:#c9a227">AI INCOME SYSTEMS LAB</p><h1 style="color:#fff">Your AI Income Launch Guide is here.</h1><p>The full AI Income Launch Vault PDF is attached: 35 practical prompts, a 7-day build sprint, and four bonus systems. Pick one idea, run a small test, and build from there.</p><p><a style="color:#c9a227" href="${GUIDE_URL}">Download the same PDF directly</a></p><p style="font-size:12px;color:#aaa">You received this because you requested the free guide. <a style="color:#aaa" href="${unsubscribe}">Unsubscribe</a>.</p></div>`,
        text: `Your free AI Income Launch Guide is attached. Download the same PDF: ${GUIDE_URL}\n\nYou received this because you requested the guide. Unsubscribe: ${unsubscribe}`,
        attachments: [{ filename: "AI-Income-Launch-Vault.pdf", content }],
        tags: [{ name: "launch-vault-guide" }],
      }),
    });
    if (!result.ok) {
      console.error("[launch-vault] send failed", result.status, (await result.text()).slice(0, 500));
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error("[launch-vault] delivery failed", error);
    return { ok: false };
  }
}