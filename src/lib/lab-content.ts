export const TRUSTED_LAB_HTML_PREFIX = '<div class="lab-post"';

export function isTrustedLabHtml(content: string) {
  return content.startsWith(TRUSTED_LAB_HTML_PREFIX);
}

export function sanitizeTrustedLabHtml(content: string) {
  return content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<\/?script\b[^>]*>/gi, "")
    // Strip on* attributes only inside tag markup so text-node words like
    // "one", "only" or "online" are never touched.
    .replace(/<[^>]*>/g, (tag) =>
      tag.replace(
        /\s+on[a-z][\w:.-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/gi,
        "",
      ),
    );
}