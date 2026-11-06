/**
 * Contact inbox notifications.
 *
 * Both sends are best-effort: a failed notification must never make the
 * visitor's submission itself look like it failed, so every send is caught
 * and logged instead of thrown. Recipients and templates are fixed here —
 * the browser never chooses either.
 */

export const SITE_URL = "https://ai-income-systems.com";
export const threadUrl = (token: string) => `${SITE_URL}/contact/r/${token}`;

export interface NotifySendOptions {
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
}

export type NotifySend = (
  templateName: string,
  to: string,
  options: NotifySendOptions,
) => Promise<{ sent: boolean }>;

/** Server-only at call time; never imported into the browser bundle. */
const defaultSend: NotifySend = async (templateName, to, options) => {
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  return sendTemplateEmail(templateName, to, options);
};

/** Heads-up to the site owner that a new message landed in the inbox. */
export async function notifyOwner(
  data: Record<string, unknown>,
  key: string,
  send: NotifySend = defaultSend,
) {
  try {
    await send("contact-new-message", "", { templateData: data, idempotencyKey: key });
  } catch (err) {
    console.error("[contact] owner notification failed", err);
  }
}

/** Automatic "we got your message" note back to the person who submitted. */
export async function notifyVisitor(
  data: { name: string; subject: string; threadUrl?: string },
  to: string,
  key: string,
  send: NotifySend = defaultSend,
) {
  try {
    await send("contact-confirmation", to, { templateData: data, idempotencyKey: key });
  } catch (err) {
    console.error("[contact] visitor confirmation failed", err);
  }
}
