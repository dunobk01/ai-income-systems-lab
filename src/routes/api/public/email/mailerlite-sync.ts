import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

/**
 * Protected worker endpoint that drains the MailerLite sync outbox.
 *
 * Called on a schedule (pg_cron) with a shared secret header. Public prefix is
 * required so the scheduler can reach it; the secret is what authenticates.
 */
function authorized(request: Request): boolean {
  const secret = process.env.OS_SEQUENCE_CRON_SECRET;
  if (!secret) return false;
  const provided = request.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/email/mailerlite-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
        const { processMailerliteSyncJobs } = await import("@/lib/mailerlite-sync.server");
        const result = await processMailerliteSyncJobs(50);
        return Response.json(result);
      },
    },
  },
});
