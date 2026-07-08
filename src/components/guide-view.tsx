import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Block, StaticGuide } from "@/lib/guides-content";

function PromptBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-[#0a0a0f] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
        <div className="text-xs uppercase tracking-widest text-[color:var(--brand)]">
          {label}
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-white/10 hover:border-[color:var(--brand)]/50 hover:bg-white/5 transition"
          aria-label="Copy prompt"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="px-4 py-4 text-[13px] leading-relaxed font-mono text-foreground/90 whitespace-pre-wrap break-words">
        {text}
      </pre>
    </div>
  );
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="text-[15px] leading-relaxed text-foreground/85">{block.text}</p>;
    case "h3":
      return <h3 className="mt-8 mb-2 text-lg font-bold text-foreground">{block.text}</h3>;
    case "ul":
      return (
        <ul className="my-4 space-y-2 list-disc pl-5 text-[15px] text-foreground/85 marker:text-[color:var(--brand)]">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="my-4 space-y-2 list-decimal pl-5 text-[15px] text-foreground/85 marker:text-[color:var(--brand)]">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it}
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div className="my-6 rounded-xl border border-[color:var(--brand)]/25 bg-[color:var(--brand)]/5 p-4 text-[14px] text-foreground/90">
          {block.text}
        </div>
      );
    case "prompt":
      return <PromptBlock label={block.label} text={block.text} />;
    default:
      return null;
  }
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      const pct = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    if (!ids.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top));
        if (visible[0]) setActive((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function GuideView({ guide }: { guide: StaticGuide }) {
  const progress = useReadingProgress();
  const ids = useMemo(() => guide.sections.map((s) => s.id), [guide.sections]);
  const active = useActiveSection(ids);

  return (
    <div className="relative">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-[60] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[color:var(--brand)] to-[color:var(--brand-2)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-16">
        <Link
          to="/guides"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All guides
        </Link>

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ${guide.badgeColor}`}
          >
            {guide.badge}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {guide.readMinutes} min read
          </span>
        </div>

        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight max-w-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl">{guide.description}</p>

        <div className="mt-10 grid lg:grid-cols-[minmax(0,1fr)_240px] gap-10">
          {/* Content */}
          <article className="min-w-0">
            {guide.intro.length > 0 && (
              <div className="space-y-4 pb-8 border-b border-white/10">
                {guide.intro.map((b, i) => (
                  <RenderBlock key={i} block={b} />
                ))}
              </div>
            )}

            {guide.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 pt-10"
              >
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-1">
                  {section.blocks.map((b, i) => (
                    <RenderBlock key={i} block={b} />
                  ))}
                </div>
              </section>
            ))}

            {/* Bottom CTA */}
            <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-[color:var(--brand)]/10 to-[color:var(--brand-2)]/5 p-8">
              <h3 className="text-xl font-bold">Ready to actually build this?</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                The full AI Income Systems Lab curriculum takes you from playbook to shipped business — courses, prompt library, workflow templates, and a private community of builders.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="brand">
                  <a href="https://ai-income-systems.com" target="_blank" rel="noopener noreferrer">
                    Explore the full curriculum
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="https://ai-income-systems.netlify.app/prompt-engine"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Free prompt pack →
                  </a>
                </Button>
              </div>
            </div>

            {guide.next && (
              <Link
                to="/guides/$slug"
                params={{ slug: guide.next.slug }}
                className="mt-8 group flex items-center justify-between glass rounded-2xl p-5 hover:border-[color:var(--brand)]/40 transition"
              >
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Next guide</div>
                  <div className="mt-1 font-bold group-hover:text-[color:var(--brand)] transition">
                    {guide.next.title}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[color:var(--brand)]" />
              </Link>
            )}
          </article>

          {/* Sticky TOC (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                On this page
              </div>
              <nav className="space-y-1 border-l border-white/10 pl-3">
                {guide.sections.map((s) => {
                  const isActive = active === s.id;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={`block text-sm py-1.5 leading-snug transition -ml-[13px] pl-3 border-l-2 ${
                        isActive
                          ? "border-[color:var(--brand)] text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.title}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
