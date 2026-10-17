import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'

// Lovable is authoritative for suppression. Notifications must never overwrite
// a bounce/complaint with an unsubscribe or create a second suppression ledger.
export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) return Response.json({ error: 'Server configuration error' }, { status: 500 })
        const record = (event: { event_id: string }) => { console.info('Email event', event.event_id) }
        return createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': record,
            'email.complaint': record,
            'email.unsubscribed': record,
            'email.resubscribed': record,
          },
        })(request)
      },
    },
  },
})
