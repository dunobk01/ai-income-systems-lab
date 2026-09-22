export const TRUSTED_LAB_HTML_PREFIX = '<div class="lab-post"';

export function isTrustedLabHtml(content: string) {
  return content.startsWith(TRUSTED_LAB_HTML_PREFIX);
}

export function sanitizeTrustedLabHtml(content: string) {
  return content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<\/?script\b[^>]*>/gi, "")
    .replace(/\s+on[a-z][\w:.-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/gi, "");
}