import { createFileRoute } from "@tanstack/react-router";
import { sendOsDay5Email, STEP } from "@/lib/os-day5.server";

const LEAD_MAGNET = "ai-income-operating-system";

async function run(request: Request) {
  const secret = process.env["OS_SEQUENCE_CRON_SECRET"];
  const provided = request.headers.get("x-cron-secret");
  if (!secret || provided !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // OS leads that signed up 4-30 days ago.
  const now = Date.now();
  const from = new Date(now - 30 * 864e5).toISOString();
  const to = new Date(now - 4 * 864e5).toISOString();

  const { data: leads, error } = await supabaseAdmin
    .from("leads")
    .select("email, created_at")
    .eq("lead_magnet", LEAD_MAGNET)
    .gte("created_at", from)
    .lte("created_at", to)
    .limit(200);
  if (error) return new Response(error.message, { status: 500 });

  // Reserved/test domains (RFC 2606) are never deliverable — seed and QA rows
  // would otherwise be retried on every run.
  const UNDELIVERABLE = /@(example|test|invalid|localhost)\.(com|net|org)$|@(example|test|invalid|localhost)$/i;
  const emails = Array.from(new Set((leads ?? []).map((l) => l.email.toLowerCase()))).filter(
    (e) => !UNDELIVERABLE.test(e),
  );
  if (emails.length === 0) return Response.json({ sent: 0, skipped: 0 });

  const [{ data: sentRows }, { data: suppressed }] = await Promise.all([
    supabaseAdmin.from("os_sequence_sends").select("email").eq("step", STEP).in("email", emails),
    supabaseAdmin.from("suppressed_emails").select("email").in("email", emails),
  ]);
  const skip = new Set([
    ...(sentRows ?? []).map((r) => r.email),
    ...(suppressed ?? []).map((r) => r.email),
  ]);

  let sent = 0;
  let failed = 0;
  for (const email of emails) {
    if (skip.has(email)) continue;
    const result = await sendOsDay5Email(email);
    if (!result.ok) {
      failed++;
      // Permanently rejected addresses get recorded so the cron stops
      // hammering them; transient failures stay eligible for the next run.
      if ("permanent" in result && result.permanent) {
        await supabaseAdmin.from("os_sequence_sends").insert({ email, step: STEP });
      }
      continue;
    }
    sent++;
    await supabaseAdmin.from("os_sequence_sends").insert({ email, step: STEP });
  }

  return Response.json({ sent, failed, skipped: skip.size });
}

export const Route = createFileRoute("/api/public/email/os-day5")({
  server: {
    handlers: {
      POST: ({ request }) => run(request),
    },
  },
});
