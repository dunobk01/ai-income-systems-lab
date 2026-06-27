// Standardized GTM dataLayer helpers.
// All events are pushed to window.dataLayer so GTM triggers can fire on them.

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type DLEvent = Record<string, unknown> & { event: string };

function push(payload: DLEvent) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Clear previous ecommerce object to avoid GA4 merging across events.
  if ("ecommerce" in payload) window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(payload);
}

/** SPA page_view — fire on every route change. */
export function dlPageView(opts: { path: string; title?: string }) {
  push({
    event: "page_view",
    page_path: opts.path,
    page_location: typeof window !== "undefined" ? window.location.href : opts.path,
    page_title: opts.title ?? (typeof document !== "undefined" ? document.title : ""),
  });
}

/** Generic button / CTA click. */
export function dlButtonClick(opts: {
  label: string;
  location?: string;
  destination?: string;
  category?: string;
  [k: string]: unknown;
}) {
  push({
    event: "button_click",
    button_label: opts.label,
    button_location: opts.location ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    button_destination: opts.destination,
    button_category: opts.category,
    ...opts,
  });
}

/** Course progress event — lesson started, completed, or module completed. */
export function dlCourseProgress(opts: {
  action: "lesson_start" | "lesson_complete" | "module_complete" | "course_complete";
  module_slug?: string;
  module_title?: string;
  lesson_slug?: string;
  lesson_title?: string;
  lesson_id?: string;
  progress_pct?: number;
  completed_count?: number;
  total_count?: number;
}) {
  push({
    event: "course_progress",
    ...opts,
  });
}

/** Lead capture (form submit). Mirrors TikTok Lead. */
export function dlLead(opts: { lead_source?: string; lead_magnet?: string; email_hash?: string }) {
  push({ event: "generate_lead", ...opts });
}

/** Sign-up complete. */
export function dlSignUp(opts: { method?: string; email_hash?: string } = {}) {
  push({ event: "sign_up", method: opts.method ?? "email", email_hash: opts.email_hash });
}

/** Purchase complete (mirror of GA4 ecommerce purchase). */
export function dlPurchase(opts: {
  transaction_id?: string;
  value?: number;
  currency?: string;
  items?: Array<Record<string, unknown>>;
}) {
  push({
    event: "purchase",
    ecommerce: {
      transaction_id: opts.transaction_id,
      value: opts.value,
      currency: opts.currency ?? "USD",
      items: opts.items ?? [],
    },
  });
}

/** Begin checkout (clicking a pricing CTA that opens Stripe). */
export function dlBeginCheckout(opts: { tier: string; value?: number; currency?: string }) {
  push({
    event: "begin_checkout",
    ecommerce: {
      currency: opts.currency ?? "USD",
      value: opts.value,
      items: [{ item_id: opts.tier, item_name: opts.tier }],
    },
  });
}
