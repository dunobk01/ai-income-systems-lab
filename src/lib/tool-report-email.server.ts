/**
 * Server-only delivery of free-tool reports via Resend.
 *
 * MailerLite is a marketing list sync and silently refuses previously
 * unsubscribed people, so it can't be relied on to deliver the report the
 * user explicitly just asked for. This sends the report link directly.
 */

import { createHash } from "crypto";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "AI Income Systems <support@ai-income-systems.com>";
const REPLY_TO = "support@ai-income-systems.com";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function sendToolReportEmail(opts: {
  email: string;
  firstName: string | null;
  toolName: string;
  reportUrl: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    console.error("[tool-report-email] missing LOVABLE_API_KEY or RESEND_API_KEY");
    return { ok: false, reason: "email credentials not configured" };
  }

  const email = opts.email.trim().toLowerCase();
  const hello = opts.firstName ? `Hi ${opts.firstName},` : "Hi,";

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#111;padding:32px 28px;color:#e5e5e5;">
      <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#c9a227;margin:0 0 8px;">AI Income Systems Lab</p>
      <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px;color:#ffffff;">Your ${opts.toolName} report</h1>
      <p style="font-size:16px;color:#a3a3a3;margin:0 0 24px;line-height:1.6;">
        ${hello} here's your full report. The link is permanent, so you can come back to it anytime.
      </p>
      <div style="margin:28px 0;">
        <a href="${opts.reportUrl}" style="display:inline-block;background:#c9a227;color:#0a0a0a;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;">Open my report →</a>
      </div>
      <p style="font-size:13px;color:#737373;margin:0 0 24px;word-break:break-all;">${opts.reportUrl}</p>
      <hr style="border:none;border-top:1px solid #262626;margin:32px 0 16px;">
      <p style="font-size:12px;color:#737373;margin:0;">
        You're getting this because you asked for this report on ai-income-systems.com.
        <a href="https://ai-income-systems.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#737373;text-decoration:underline;">Unsubscribe</a>.
      </p>
    </div>
  </body>
</html>`;

  try {
    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
        "Idempotency-Key": `tool-report-${sha256(`${email}|${opts.reportUrl}`)}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        reply_to: REPLY_TO,
        subject: `Your ${opts.toolName} report`,
        html,
        text: `${hello}\n\nHere's your full ${opts.toolName} report: ${opts.reportUrl}\n\nThe link is permanent, so you can come back to it anytime.`,
      }),
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 500);
      console.error("[tool-report-email] send failed", res.status, body);
      return { ok: false, reason: `${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[tool-report-email] send error", err);
    return { ok: false, reason: (err as Error).message.slice(0, 300) };
  }
}
