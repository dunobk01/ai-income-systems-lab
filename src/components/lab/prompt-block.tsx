import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";

export function PromptBlock({ prompt, label = "Prompt" }: { prompt: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="my-6 rounded-xl border border-[color:var(--brand)]/45 bg-[color:var(--brand)]/[0.06] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--brand)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--brand)]/40 px-2.5 py-1 text-xs text-[color:var(--brand)] transition hover:bg-[color:var(--brand)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy prompt"}
        </button>
      </div>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-foreground/90">
        {prompt}
      </pre>
    </div>
  );
}
