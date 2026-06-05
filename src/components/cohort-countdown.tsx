import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// End of current month, UTC. Recomputes every minute when "Coming up" rolls over.
function nextDeadline(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { d, h, m, s };
}

export function CohortCountdown({ compact = false, label = "Current cohort closes in" }: { compact?: boolean; label?: string }) {
  const [mounted, setMounted] = useState(false);
  const [target, setTarget] = useState(nextDeadline);
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);
    setT(diff(target));
    const id = setInterval(() => {
      const next = diff(target);
      if (next.d + next.h + next.m + next.s === 0) {
        const fresh = nextDeadline();
        setTarget(fresh);
        setT(diff(fresh));
      } else {
        setT(next);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!mounted) return null;


  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
        <Clock className="h-3.5 w-3.5 text-[color:var(--brand-2)]" />
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold tabular-nums">
          {t.d}d {String(t.h).padStart(2, "0")}h {String(t.m).padStart(2, "0")}m
        </span>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl px-5 py-4 inline-flex items-center gap-4">
      <Clock className="h-5 w-5 text-[color:var(--brand-2)]" />
      <div className="text-left">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-mono text-xl font-bold tabular-nums leading-tight">
          {t.d}d {String(t.h).padStart(2, "0")}h {String(t.m).padStart(2, "0")}m {String(t.s).padStart(2, "0")}s
        </p>
      </div>
    </div>
  );
}
