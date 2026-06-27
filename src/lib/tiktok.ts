// TikTok Pixel helper. The base pixel is loaded in src/routes/__root.tsx.
// Use these helpers to fire conversion events from anywhere in the app.

type TTQ = {
  page: () => void;
  track: (event: string, params?: Record<string, unknown>) => void;
  identify: (params: Record<string, string>) => void;
};

function ttq(): TTQ | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { ttq?: TTQ };
  return w.ttq ?? null;
}

export function tiktokPage() {
  ttq()?.page();
}

export function tiktokTrack(event: string, params: Record<string, unknown> = {}) {
  try {
    ttq()?.track(event, params);
  } catch {
    /* no-op */
  }
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function tiktokIdentify(opts: { email?: string; phone?: string; externalId?: string }) {
  try {
    const payload: Record<string, string> = {};
    if (opts.email) payload.email = await sha256Hex(opts.email);
    if (opts.phone) payload.phone_number = await sha256Hex(opts.phone);
    if (opts.externalId) payload.external_id = await sha256Hex(opts.externalId);
    ttq()?.identify(payload);
  } catch {
    /* no-op */
  }
}
