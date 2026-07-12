// Pinterest Tag event helpers. Base tag is loaded in src/routes/__root.tsx.
// Docs: https://help.pinterest.com/en/business/article/add-event-codes

declare global {
  interface Window {
    pintrk?: (...args: unknown[]) => void;
  }
}

function pin(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const fn = window.pintrk;
  if (typeof fn !== "function") return;
  try {
    fn("track", event, params);
  } catch {
    // no-op
  }
}

function eventId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function pinPageVisit(extra: Record<string, unknown> = {}) {
  pin("pagevisit", { event_id: eventId("pv"), ...extra });
}

export function pinLead(opts: { lead_type?: string } = {}) {
  pin("lead", { event_id: eventId("lead"), lead_type: opts.lead_type ?? "Newsletter" });
}

export function pinSignUp(opts: { lead_type?: string } = {}) {
  pin("signup", { event_id: eventId("signup"), lead_type: opts.lead_type ?? "Account" });
}

export function pinAddToCart(opts: {
  value?: number;
  currency?: string;
  order_quantity?: number;
  product_id?: string;
}) {
  pin("addtocart", {
    event_id: eventId("atc"),
    value: opts.value ?? 0,
    order_quantity: opts.order_quantity ?? 1,
    currency: opts.currency ?? "USD",
    ...(opts.product_id ? { line_items: [{ product_id: opts.product_id }] } : {}),
  });
}

export function pinCheckout(opts: {
  value?: number;
  currency?: string;
  order_quantity?: number;
  order_id?: string;
  product_id?: string;
}) {
  pin("checkout", {
    event_id: opts.order_id ?? eventId("chk"),
    value: opts.value ?? 0,
    order_quantity: opts.order_quantity ?? 1,
    currency: opts.currency ?? "USD",
    ...(opts.order_id ? { order_id: opts.order_id } : {}),
    ...(opts.product_id ? { line_items: [{ product_id: opts.product_id }] } : {}),
  });
}
