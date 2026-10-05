import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Repeat, ArrowRight, Sparkles, Copy, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ShareResultButton, TryAnotherTools } from "@/components/free-tools/tool-cards";
import { repurpose, type Repurposed, type RepurposeInput } from "@/lib/repurposing-engine-data";
import { dlToolStart, dlToolComplete, dlToolCtaClick } from "@/lib/free-tools";
import { ogImageMeta } from "@/lib/og";

const TITLE = "Free Content Repurposing Engine — Turn One Post Into a Week of Content";
const DESC =
  "Paste one blog post, product description or idea. Get Pinterest pins, short-video scripts, social posts, an email newsletter, an Instagram carousel, an SEO description and CTAs. Free, no signup.";
const URL = "https://ai-income-systems.com/free-tools/content-repurposer";

const FAQS = [
  {
    q: "What can I paste in?",
    a: "Anything written: a blog post, a product description, a video transcript, or even a rough idea. Longer content produces richer results.",
  },
  {
    q: "Do I need an account?",
    a: "No. Everything appears on screen instantly, ready to copy.",
  },
  {
    q: "Can I edit the results?",
    a: "Please do — treat the output as a strong first draft in your voice, not a final product.",
  },
];

const inputClass =
  "w-full rounded-xl glass px-4 py-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[color:var(--brand)]";

export const Route = createFileRoute("/free-tools/content-repurposer")({
  head: () => ({
    meta: [
      { title: `${TITLE} — AI Income Systems Lab` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      ...ogImageMeta(),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Content Repurposing Engine",
          description: DESC,
          url: URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: ContentRepurposerPage,
});

function ContentRepurposerPage() {
  const [result, setResult] = useState<Repurposed | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const input: RepurposeInput = {
      content: String(form.get("content") ?? ""),
      angle: String(form.get("angle") ?? ""),
    };
    dlToolStart("content-repurposing-engine");
    const r = repurpose(input);
    setResult(r);
    dlToolComplete("content-repurposing-engine", {});
    setBusy(false);
    setTimeout(() => document.getElementById("cr-result")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(id);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // clipboard unavailable — user can select manually
    }
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Button variant="glass" size="sm" className="h-8" onClick={() => copy(text, id)}>
      {copiedIdx === id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedIdx === id ? "Copied" : "Copy"}
    </Button>
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Repeat className="h-3.5 w-3.5 text-[color:var(--brand-2)]" /> Free tool
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            Content Repurposing <span className="text-gradient">Engine</span>
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            One piece of content in — Pinterest pins, video scripts, social posts, an email, a carousel and more out.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-8">
        <form onSubmit={run} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="content" className="text-sm font-medium">Paste your content</label>
            <textarea id="content" name="content" required rows={9} placeholder="Paste a blog post, product description, transcript or even a rough idea..." className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label htmlFor="angle" className="text-sm font-medium">Who should this content reach? (optional)</label>
            <input id="angle" name="angle" placeholder="e.g. small business owners, new freelancers" className={`${inputClass} mt-2`} />
          </div>
          <Button type="submit" variant="brand" className="w-full h-12" disabled={busy}>
            <Sparkles className="h-4 w-4" /> Repurpose my content
          </Button>
        </form>
      </section>

      {result && (
        <section id="cr-result" className="mx-auto max-w-3xl px-4 sm:px-6 pb-8 space-y-6">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Detected source</p>
            <h2 className="mt-2 font-semibold">{result.sourceTitle}</h2>
            {result.keyPoints.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
                {result.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pinterest pins</p>
            <div className="mt-4 space-y-4">
              {result.pinterest.map((p, i) => (
                <div key={i} className="rounded-xl glass p-4">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Short-video scripts</p>
            <div className="mt-4 space-y-4">
              {result.videoScripts.map((v) => (
                <div key={v.title} className="rounded-xl glass p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{v.title}</p>
                    <CopyBtn text={`${v.hook}\n\n${v.beats.join("\n")}\n\n${v.cta}`} id={`video-${v.title}`} />
                  </div>
                  <p className="mt-2 text-sm"><span className="font-semibold text-[color:var(--brand)]">Hook: </span>{v.hook}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
                    {v.beats.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                  <p className="mt-2 text-sm"><span className="font-semibold text-[color:var(--brand)]">CTA: </span>{v.cta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Social posts</p>
            <div className="mt-4 space-y-4">
              {result.socialPosts.map((p) => (
                <div key={p.platform} className="rounded-xl glass p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[color:var(--brand-2)]">{p.platform}</p>
                    <CopyBtn text={p.text} id={`social-${p.platform}`} />
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{p.text}</pre>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email newsletter</p>
              <CopyBtn text={`Subject: ${result.email.subject}\n\n${result.email.body}`} id="email" />
            </div>
            <p className="mt-3 text-sm font-semibold">Subject: {result.email.subject}</p>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{result.email.body}</pre>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Instagram carousel (6 slides)</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {result.carousel.map((s) => (
                <div key={s.slide} className="rounded-xl glass p-4">
                  <p className="text-xs text-muted-foreground">Slide {s.slide}</p>
                  <p className="mt-1 text-sm">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">SEO description (meta)</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <p className="text-sm text-foreground/85">{result.seoDescription}</p>
              <CopyBtn text={result.seoDescription} id="seo" />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Calls to action</p>
            <ul className="mt-3 space-y-1.5 text-sm list-disc pl-5">
              {result.ctas.map((c) => <li key={c} className="text-foreground/85">{c}</li>)}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ShareResultButton
              toolSlug="content-repurposing-engine"
              title="Free Content Repurposing Engine"
              text="Paste one piece of content, get a full week of posts, pins, scripts and emails — free:"
            />
            <Button variant="glass" className="h-11 px-5" onClick={() => { dlToolCtaClick("content-repurposing-engine", { location: "regenerate" }); setResult(null); }}>
              Repurpose another
            </Button>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <TryAnotherTools exclude="content-repurposing-engine" />
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold tracking-tight text-center">Questions people ask</h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <div key={f.q} className="glass rounded-2xl p-5">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <div className="glass-strong rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="text-2xl font-bold">Want the systems behind the content?</h2>
          <p className="mt-2 text-muted-foreground">The Lab teaches you to wire AI tools into complete income systems — step by step.</p>
          <Button asChild size="lg" variant="brand" className="mt-6 h-12 px-7">
            <Link to="/pricing">See pricing <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
