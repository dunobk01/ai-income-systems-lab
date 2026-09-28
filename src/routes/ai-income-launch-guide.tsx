import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowRight, Check, Download, FileText, Loader2, ShieldCheck, Workflow } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/leads.functions";
import { trackDownload } from "@/lib/downloads";
import { dlLead } from "@/lib/datalayer";
import { pinLead } from "@/lib/pinterest";
import { tiktokIdentify, tiktokTrack } from "@/lib/tiktok";
import guide from "@/assets/ai-income-launch-vault.pdf.asset.json";
import cover from "@/assets/ai-income-launch-vault-cover.png.asset.json";

const SLUG = "ai-income-launch-vault";
const URL = "https://ai-income-systems.com/ai-income-launch-guide";
const TITLE = "Free AI Income Launch Guide | 35 Practical Prompts & 4 Bonus Systems";
const DESCRIPTION = "Get the free AI Income Launch Vault: 35 advanced copy-paste prompts, a 7-day build-to-launch sprint, an AI offer scorecard, and practical systems for testing your next idea.";

export const Route = createFileRoute("/ai-income-launch-guide")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: `https://ai-income-systems.com${cover.url}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `https://ai-income-systems.com${cover.url}` },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: LaunchGuidePage,
});

const BONUSES = [
  { number: "01", title: "7-Day Build-to-Launch Sprint", detail: "Turn one idea into a small, testable offer in a week." },
  { number: "02", title: "Faceless AI Video Factory", detail: "A content production method with an n8n automation map." },
  { number: "03", title: "100-Point AI Offer Scorecard", detail: "Pressure-test an idea before spending time building it." },
  { number: "04", title: "30 AI Offer Ideas", detail: "Service, product, automation, and app ideas to adapt." },
];

function LaunchGuidePage() {
  const submitLeadFn = useServerFn(submitLead);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading" || state === "done") return;
    setState("loading");
    setError(null);
    try {
      const result = await submitLeadFn({
        data: { email, company, audience: "free", source: "ai-income-launch-guide-landing", lead_magnet: SLUG },
      });
      setEmailSent(result.emailSent === true);
      setState("done");
      void tiktokIdentify({ email });
      tiktokTrack("Lead", { contents: [{ content_id: SLUG, content_type: "product", content_name: "AI Income Launch Guide" }], value: 0, currency: "USD" });
      dlLead({ lead_source: "ai-income-launch-guide-landing", lead_magnet: SLUG });
      pinLead({ lead_type: SLUG });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't send the guide. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="relative isolate min-h-[min(760px,calc(100svh-64px))] overflow-hidden border-b border-border">
          <img src={cover.url} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-[center_59%] opacity-20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/95 to-background/65" />
          <div className="mx-auto flex min-h-[min(760px,calc(100svh-64px))] max-w-7xl flex-col justify-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 border-l-2 border-primary pl-3 text-xs font-semibold uppercase text-brand-2">AI Income Systems Lab / Free field guide</p>
              <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">The free AI Income Launch Guide.</h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">35 advanced copy-paste prompts and 4 practical bonus systems to help you find an idea, build a real offer, and test it in the market.</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-foreground/80 sm:text-sm">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> 54-page PDF</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Instant download</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> No card required</span>
              </div>
              <div id="get-guide" className="mt-8 max-w-xl scroll-mt-24">
                {state === "done" ? (
                  <div aria-live="polite" className="border-t border-primary pt-5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-success"><Check className="h-4 w-4" /> Your guide is ready.</p>
                    <p className="mt-2 text-sm text-muted-foreground">{emailSent ? "The same PDF is on its way to your inbox, too." : "We couldn't confirm the email delivery. Download your guide here now."}</p>
                    <Button asChild variant="brand" size="lg" className="mt-4 h-12 w-full sm:w-auto">
                      <a href={guide.url} download="AI-Income-Launch-Vault.pdf" onClick={() => trackDownload(SLUG)}><Download className="h-4 w-4" /> Download the PDF</a>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="relative">
                    <label htmlFor="launch-email" className="mb-2 block text-sm font-semibold">Where should we send your free guide?</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input id="launch-email" type="email" autoComplete="email" required maxLength={255} placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} disabled={state === "loading"} className="h-12 min-w-0 flex-1 bg-background/80" />
                      <Button type="submit" variant="brand" disabled={state === "loading"} className="h-12 w-full px-5 sm:w-auto">
                        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Get my free guide
                      </Button>
                    </div>
                    <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={company} onChange={(event) => setCompany(event.target.value)} className="absolute left-[-9999px] h-0 w-0 opacity-0" />
                    <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Instant PDF + emailed copy. You'll also receive practical free resources. Unsubscribe anytime.</p>
                    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Inside the vault</p>
            <h2 className="mt-3 max-w-lg text-3xl font-bold sm:text-4xl">From scattered prompts to a working plan.</h2>
            <p className="mt-4 max-w-lg text-muted-foreground">These are not one-line tricks. Each prompt includes the context, inputs, constraints, output format, and quality checks needed to do a real business job.</p>
            <div className="mt-8 space-y-5">
              <div className="flex gap-3"><FileText className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-semibold">35 advanced prompts</h3><p className="mt-1 text-sm text-muted-foreground">Research opportunities, shape a product, write a landing page, plan content, and build automations.</p></div></div>
              <div className="flex gap-3"><Workflow className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-semibold">Use them as a system</h3><p className="mt-1 text-sm text-muted-foreground">Start with a real problem, choose a small offer, then connect your next steps instead of collecting more tools.</p></div></div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[350px] lg:mr-0"><img src={cover.url} alt="Cover of The AI Income Launch Vault PDF" loading="lazy" className="h-auto w-full border border-border shadow-2xl" /></div>
        </section>

        <section className="border-y border-border bg-card/45">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
            <p className="text-xs font-semibold uppercase text-primary">Included in the download</p>
            <h2 className="mt-3 text-3xl font-bold">Four bonuses built for action.</h2>
            <div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {BONUSES.map((bonus) => <div key={bonus.number} className="border-t border-border pt-4"><span className="text-xs font-semibold text-primary">{bonus.number}</span><h3 className="mt-2 text-lg font-semibold">{bonus.title}</h3><p className="mt-2 text-sm text-muted-foreground">{bonus.detail}</p></div>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-8 lg:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Pick one idea. Run one real test.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">No guaranteed income or shortcut promises. Just a practical starting point for building, checking, and improving an AI-assisted offer.</p>
          <Button asChild variant="brand" className="mt-6 h-11"><a href="#get-guide">Get the free AI Income Launch Guide <ArrowRight className="h-4 w-4" /></a></Button>
          <p className="mt-4 text-xs text-muted-foreground">Already have the guide? <Link to="/free-tools" className="text-primary underline underline-offset-4">Explore free tools</Link>.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}