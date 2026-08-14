import { describe, expect, it } from "vitest";

/**
 * Live checks against the backend's Data API as an unauthenticated caller —
 * i.e. someone hitting the endpoints directly with the publishable key,
 * bypassing the app UI entirely. Premium content must never come back.
 */
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const live = Boolean(url && key);

const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key!, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

/** True when the response is a denial or contains zero rows. */
async function deniedOrEmpty(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok) return true;
  return Array.isArray(body) && body.length === 0;
}

describe.runIf(live)("anonymous callers cannot reach premium data", () => {
  it("cannot read prompt full text from the prompts table", async () => {
    const res = await rest("prompts?select=id,prompt_text&limit=5");
    expect(await deniedOrEmpty(res)).toBe(true);
  });

  it("cannot read lesson content", async () => {
    const res = await rest("lessons?select=id,content&limit=5");
    expect(await deniedOrEmpty(res)).toBe(true);
  });

  it("cannot read saved builder output (product plans, funnels, agent specs)", async () => {
    for (const table of ["digital_product_plans", "funnel_plans", "agent_specs"]) {
      const res = await rest(`${table}?select=id,output&limit=5`);
      expect(await deniedOrEmpty(res), `${table} leaked`).toBe(true);
    }
  });

  it("cannot escalate its own tier by writing to profiles", async () => {
    const res = await rest("profiles?id=not.is.null", {
      method: "PATCH",
      body: JSON.stringify({ tier: "pro" }),
      headers: { Prefer: "return=representation" },
    });
    const body = await res.json().catch(() => null);
    expect(res.ok && Array.isArray(body) && body.length > 0).toBe(false);
  });

  it("cannot call the catalog RPCs anonymously", async () => {
    for (const fn of ["prompt_catalog", "lesson_catalog"]) {
      const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
        method: "POST",
        headers: { apikey: key!, "Content-Type": "application/json" },
        body: "{}",
      });
      expect(res.ok, `${fn} was callable anonymously`).toBe(false);
    }
  });
});

describe.runIf(live)("catalog RPC shape never carries premium payloads", () => {
  it("prompt_catalog is declared without prompt_text", async () => {
    const types = await import("node:fs").then((fs) =>
      fs.readFileSync("src/integrations/supabase/types.ts", "utf8"),
    );
    const start = types.indexOf("prompt_catalog: {");
    expect(start).toBeGreaterThan(-1);
    const block = types.slice(start, start + 1200);
    expect(block).not.toContain("prompt_text");
  });
});
