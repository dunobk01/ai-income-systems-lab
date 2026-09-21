import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FREE_TOOLS } from "@/lib/free-tools-data";
import { dlToolCtaClick, shareResult } from "@/lib/free-tools";

export function FreeToolCards({ exclude, location }: { exclude?: string; location?: string }) {
  const tools = FREE_TOOLS.filter((t) => t.slug !== exclude);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((t) => (
        <div key={t.slug} className="glass rounded-2xl p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: "var(--gradient-soft)" }}>
              <t.icon className="h-5 w-5 text-[color:var(--brand-2)]" />
            </div>
            {t.status === "soon" && (
              <span className="rounded-full glass px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Coming soon
              </span>
            )}
          </div>
          <h3 className="mt-4 font-semibold leading-snug">{t.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground flex-1">{t.promise}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {t.time}
          </p>
          <div className="mt-4">
            {t.status === "live" ? (
              <Button
                asChild
                variant="brand"
                className="w-full h-10"
                onClick={() => dlToolCtaClick(t.slug, { location: location ?? "free-tools-grid" })}
              >
                <Link
                  to={
                    t.slug === "ai-savings-calculator"
                      ? "/free-tools/ai-savings-calculator"
                      : t.slug === "ai-visibility-check"
                        ? "/free-tools/ai-visibility-check"
                        : "/free-tools/ai-readiness-scorecard"
                  }
                >
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="glass" className="w-full h-10" disabled>
                Coming soon
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TryAnotherTools({ exclude }: { exclude: string }) {
  return (
    <div className="mt-10">
      <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Try another free tool</h3>
      <div className="mt-4">
        <FreeToolCards exclude={exclude} location="try-another" />
      </div>
    </div>
  );
}

export function ShareResultButton({
  toolSlug,
  title,
  text,
}: {
  toolSlug: string;
  title: string;
  text: string;
}) {
  const [state, setState] = useState<"idle" | "done">("idle");
  return (
    <Button
      variant="glass"
      className="h-11 px-5"
      onClick={async () => {
        dlToolCtaClick(toolSlug, { location: "share-result" });
        const res = await shareResult({ title, text });
        if (res !== "failed") {
          setState("done");
          setTimeout(() => setState("idle"), 2500);
        }
      }}
    >
      {state === "done" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {state === "done" ? "Link copied" : "Share my result"}
    </Button>
  );
}
