import { createFileRoute } from "@tanstack/react-router";

// Marketing sequences are managed by MailerLite, not Lovable app email.
export const Route = createFileRoute("/api/public/email/os-day5")({
  server: {
    handlers: {
      POST: () => Response.json({ error: "This legacy marketing sender is retired. Configure the Day-5 sequence in MailerLite." }, { status: 410 }),
    },
  },
});
