import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg ring-1 ring-white/10 shadow-[0_8px_24px_-8px_oklch(0.68_0.20_275_/_60%)] transition group-hover:scale-105"
        style={{ background: "var(--gradient-brand)" }}
      >
        <span className="text-[15px] font-black tracking-tight text-background">AI</span>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Income Systems <span className="text-muted-foreground">Lab</span>
      </span>
    </Link>
  );
}
