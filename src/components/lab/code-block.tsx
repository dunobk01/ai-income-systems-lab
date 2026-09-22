import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** Minimal, dependency-free token highlighting tuned for the noir/gold palette. */
function highlight(code: string, lang?: string) {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (lang === "text" || lang === "") return escaped;

  const keywords =
    "const|let|var|function|return|if|else|for|while|import|from|export|async|await|new|class|try|catch|throw|select|insert|update|delete|from|where|true|false|null|def|print";

  return escaped
    .replace(/(\/\/[^\n]*|#[^\n]*)/g, '<span style="color:var(--muted-foreground)">$1</span>')
    .replace(/(&quot;|&#39;|")([^\n"']*?)\1/g, '<span style="color:var(--brand-2)">$1$2$1</span>')
    .replace(
      new RegExp(`\\b(${keywords})\\b`, "gi"),
      '<span style="color:var(--brand)">$1</span>',
    )
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:var(--chart-3)">$1</span>');
}

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="glass my-6 overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />
      </pre>
    </div>
  );
}
