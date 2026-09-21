/** Browser-side helpers shared by every free tool. */

export type Utm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export function readUtm(): Utm {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Utm = {};
  const source = p.get("utm_source");
  const medium = p.get("utm_medium");
  const campaign = p.get("utm_campaign");
  if (source) out.utm_source = source.slice(0, 120);
  if (medium) out.utm_medium = medium.slice(0, 120);
  if (campaign) out.utm_campaign = campaign.slice(0, 120);
  return out;
}

type DL = Record<string, unknown>;

function push(payload: DL & { event: string }) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

export const dlToolStart = (tool_slug: string, extra: DL = {}) =>
  push({ event: "tool_start", tool_slug, ...extra });

export const dlToolComplete = (tool_slug: string, extra: DL = {}) =>
  push({ event: "tool_complete", tool_slug, ...extra });

export const dlToolEmailCapture = (tool_slug: string, extra: DL = {}) =>
  push({ event: "tool_email_capture", tool_slug, ...extra });

export const dlToolCtaClick = (tool_slug: string, extra: DL = {}) =>
  push({ event: "tool_cta_click", tool_slug, ...extra });

/** Copy link + native share where available. Returns what actually happened. */
export async function shareResult(opts: { title: string; text: string; url?: string }) {
  const url = opts.url ?? (typeof window !== "undefined" ? window.location.href : "");
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav && typeof nav.share === "function") {
    try {
      await nav.share({ title: opts.title, text: opts.text, url });
      return "shared" as const;
    } catch {
      // user dismissed — fall through to copy
    }
  }
  try {
    await nav?.clipboard?.writeText(url);
    return "copied" as const;
  } catch {
    return "failed" as const;
  }
}
