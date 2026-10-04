import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'

type Reason = 'bounce' | 'complaint' | 'unsubscribe'

const STATUS: Record<Reason, 'bounced' | 'complained' | 'suppressed'> = {
  bounce: 'bounced',
  complaint: 'complained',
  unsubscribe: 'suppressed',
}

const MESSAGE: Record<Reason, string> = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
}

// Notification-only record keeping: Lovable enforces suppression at send time.
async function record(
  reason: Reason,
  event: { event_id: string; data: { recipient: string; message_id?: string | null } },
) {
  const supabaseUrl = process.env['SUPABASE_URL'] ?? import.meta.env.VITE_SUPABASE_URL
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!supabaseUrl || !serviceKey) throw new Error('Server configuration error')
  const supabase = createClient(supabaseUrl, serviceKey)
  const email = event.data.recipient.toLowerCase()

  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })
  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      code: suppressError.code,
      message: suppressError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to write suppression')
  }

  const { error: logError } = await supabase.from('email_send_log').insert({
    message_id: event.data.message_id ?? null,
    template_name: 'system',
    recipient_email: email,
    status: STATUS[reason],
    error_message: MESSAGE[reason],
    metadata: null,
  })
  if (logError) {
    console.error('Failed to insert email_send_log', {
      code: logError.code,
      message: logError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to write send log')
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': (event) => record('bounce', event as any),
            'email.complaint': (event) => record('complaint', event as any),
            'email.unsubscribed': (event) => record('unsubscribe', event as any),
          },
        })
        return handler(request)
      },
    },
  },
})
