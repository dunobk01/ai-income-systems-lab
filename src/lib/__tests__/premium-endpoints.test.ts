import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * Static contract tests: premium generation endpoints must enforce auth AND
 * the paid-tier check inside the handler, so a free member cannot bypass the
 * UI gate by calling the server function directly.
 */
describe("premium server functions are guarded at the endpoint", () => {
  const src = read("src/lib/builders.functions.ts");

  const generators = ["generateProductPlan", "generateFunnelPlan", "generateAgentSpec"];

  for (const name of generators) {
    it(`${name} requires auth and asserts builder access`, () => {
      const start = src.indexOf(`export const ${name} = createServerFn`);
      expect(start, `${name} not found`).toBeGreaterThan(-1);
      const nextExport = src.indexOf("\nexport const ", start + 1);
      const block = src.slice(start, nextExport === -1 ? undefined : nextExport);

      expect(block).toContain(".middleware([requireSupabaseAuth])");
      expect(block).toContain("assertBuilderAccess(context)");

      // The entitlement check must run before any AI call or DB write.
      const guardAt = block.indexOf("assertBuilderAccess(context)");
      const aiAt = block.indexOf("generateText(");
      const insertAt = block.indexOf(".insert(");
      if (aiAt > -1) expect(guardAt).toBeLessThan(aiAt);
      if (insertAt > -1) expect(guardAt).toBeLessThan(insertAt);
    });
  }

  it("every builders server function is authenticated", () => {
    const declarations = src.match(/createServerFn\([^)]*\)\s*\n?\s*\.[a-zA-Z]+/g) ?? [];
    expect(declarations.length).toBeGreaterThan(0);
    for (const d of declarations) {
      expect(d).toMatch(/\.middleware$/);
    }
  });

  it("prompt full text is never selected through an unguarded server route", () => {
    // Prompt text is served only through RLS-protected direct table reads;
    // no public API route may project prompt_text.
    const publicRoutes = [
      "src/routes/api/public/payments/webhook.ts",
      "src/routes/api/public/pinterest/catalog[.]tsv.ts",
    ];
    for (const file of publicRoutes) {
      expect(read(file)).not.toContain("prompt_text");
    }
  });
});
