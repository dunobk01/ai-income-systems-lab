import { describe, expect, it } from "vitest";
import { isTrustedLabHtml, sanitizeTrustedLabHtml } from "@/lib/lab-content";

describe("trusted Lab HTML", () => {
  it("only recognizes content beginning with the exact trusted prefix", () => {
    expect(isTrustedLabHtml('<div class="lab-post"><p>Build</p></div>')).toBe(true);
    expect(isTrustedLabHtml(' <div class="lab-post"><p>Build</p></div>')).toBe(false);
    expect(isTrustedLabHtml('<div class="lab-post featured"><p>Build</p></div>')).toBe(false);
    expect(isTrustedLabHtml("## Markdown build")).toBe(false);
  });

  it("removes script elements and inline event attributes", () => {
    const html = '<div class="lab-post" onclick="bad()"><img src="x" onerror=bad()><script src="x"></script><script>bad()</script></script><p>Safe</p></div>';
    const sanitized = sanitizeTrustedLabHtml(html);

    expect(sanitized).toContain('<div class="lab-post">');
    expect(sanitized).toContain('<img src="x">');
    expect(sanitized).toContain("<p>Safe</p>");
    expect(sanitized).not.toMatch(/<script/i);
    expect(sanitized).not.toMatch(/\son[a-z]+\s*=/i);
  });

  it("preserves ordinary words starting with 'on' in visible text", () => {
    const html = '<div class="lab-post"><p>One new build every day, only online.</p><p>Once your onboarding is done, work on it.</p></div>';
    const sanitized = sanitizeTrustedLabHtml(html);

    expect(sanitized).toContain("One new build every day, only online.");
    expect(sanitized).toContain("Once your onboarding is done, work on it.");
  });
});