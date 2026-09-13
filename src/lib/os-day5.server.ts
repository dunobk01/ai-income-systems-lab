/**
 * Server-only: day-5 follow-up email for the AI Income Operating System list.
 *
 * MailerLite's API cannot author email bodies, so this one message in the
 * nurture sequence is sent from the site itself through Resend.
 * Never import this from client code.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "Dustin — AI Income Systems <support@ai-income-systems.com>";
const REPLY_TO = "support@ai-income-systems.com";
const SITE = "https://ai-income-systems.com";

export const STEP = "day5-n8n-automation";
export const SUBJECT = "Your first useful n8n automation";

function html(email: string) {
  const unsub = `${SITE}/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#111;padding:32px 28px;color:#e5e5e5;">
      <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#c9a227;margin:0 0 8px;">AI Income Systems Lab</p>
      <h1 style="font-size:24px;line-height:1.3;margin:0 0 16px;color:#ffffff;">Your first useful n8n automation</h1>
      <p style="font-size:16px;color:#a3a3a3;line-height:1.6;margin:0 0 16px;">
        Most people open n8n, stare at the canvas, and close it again. The fix is to stop looking for
        something clever and automate the boring thing you already do every week.
      </p>
      <p style="font-size:16px;color:#a3a3a3;line-height:1.6;margin:0 0 12px;">Build this one first:</p>
      <ol style="font-size:16px;color:#a3a3a3;line-height:1.7;margin:0 0 20px;padding-left:20px;">
        <li><strong style="color:#e5e5e5;">Trigger</strong> — a form submission, a new row, or a schedule.</li>
        <li><strong style="color:#e5e5e5;">Enrich</strong> — one AI step that turns the raw input into a usable draft.</li>
        <li><strong style="color:#e5e5e5;">Deliver</strong> — send it somewhere you'll actually see it: email, a doc, a sheet.</li>
      </ol>
      <p style="font-size:16px;color:#a3a3a3;line-height:1.6;margin:0 0 24px;">
        Three nodes. That's a real system. Once it runs on its own for a week, add a fourth step — never before.
      </p>
      <div style="margin:28px 0;">
        <a href="${SITE}/curriculum" style="display:inline-block;background:#c9a227;color:#0a0a0a;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;">See the full curriculum →</a>
      </div>
      <p style="font-size:15px;color:#a3a3a3;line-height:1.6;margin:0 0 8px;">
        Want the built workflows instead of building from scratch? The paid plans include the automation
        library, prompts and templates — <a href="${SITE}/pricing" style="color:#c9a227;">see the plans</a>.
      </p>
      <hr style="border:none;border-top:1px solid #262626;margin:32px 0 16px;">
      <p style="font-size:12px;color:#737373;margin:0;">
        You're getting this because you downloaded the free AI Income Operating System.
        <a href="${unsub}" style="color:#737373;text-decoration:underline;">Unsubscribe</a>.
      </p>
    </div>
  </body>
</html>`;
}

const text = `Your first useful n8n automation

Automate the boring thing you already do every week:
1. Trigger - a form submission, a new row, or a schedule
2. Enrich - one AI step that turns raw input into a usable draft
3. Deliver - send it where you'll actually see it

Three nodes is a real system. Full curriculum: ${SITE}/curriculum
Plans: ${SITE}/pricing`;

export async function sendOsDay5Email(email: string) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    return { ok: false, reason: "email credentials not configured" };
  }

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
      subject: SUBJECT,
      html: html(email),
      text,
      tags: [{ name: "os-day5" }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[os-day5] gateway error", res.status, body);
    return { ok: false, reason: `gateway ${res.status}: ${body}` };
  }
  const body = (await res.json()) as { id?: string };
  return { ok: true, id: body.id };
}
