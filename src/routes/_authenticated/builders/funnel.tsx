import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Sparkles, Megaphone, Copy } from "lucide-react";
import { generateFunnelPlan } from "@/lib/builders.functions";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Header, Field, Block, List, LockedView } from "./product";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/builders/funnel")({
  head: () => ({ meta: [{ title: "Sales Funnel Builder — AI Income Systems Lab" }] }),
  component: FunnelBuilder,
});

const tierOk = (t?: string, isAdmin?: boolean) => isAdmin === true || t === "builder" || t === "pro";
type Plan = Awaited<ReturnType<typeof generateFunnelPlan>>;

function FunnelBuilder() {
  const { profile, isAdmin } = useAuth();
  const fn = useServerFn(generateFunnelPlan);
  const [form, setForm] = useState({
    offer: "A 4-week group coaching cohort that gets coaches 10 LinkedIn leads/week",
    audience: "Solo coaches with $0-5k MRR",
    price: "$497",
    channel: "Organic LinkedIn + email list",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!tierOk(profile?.tier, isAdmin)) return <LockedView title="Sales Funnel Builder" />;

  const submit = async () => {
    setLoading(true); setError(null); setPlan(null);
    try {
      const r = await fn({ data: form });
      setPlan(r);
    } catch (e) { setError((e as Error).message ?? "Couldn't generate. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <Header icon={<Megaphone className="h-5 w-5" />} eyebrow="Builder" title="Sales Funnel Builder" subtitle="End-to-end funnel blueprint: hooks, lead magnet, landing page, emails, sales page, upsell." />
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <section className="glass rounded-2xl p-6 space-y-4">
          <Field label="Offer" v={form.offer} onChange={(v) => setForm({ ...form, offer: v })} textarea maxLength={2000} />
          <Field label="Audience" v={form.audience} onChange={(v) => setForm({ ...form, audience: v })} maxLength={1000} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" v={form.price} onChange={(v) => setForm({ ...form, price: v })} maxLength={50} />
            <Field label="Channel" v={form.channel} onChange={(v) => setForm({ ...form, channel: v })} maxLength={500} />
          </div>
          <Button variant="brand" onClick={submit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Designing your funnel…" : "Generate funnel blueprint"}
          </Button>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </section>

        <section className="glass rounded-2xl p-6 min-h-[400px]">
          {!plan && !loading && (
            <div className="h-full grid place-items-center text-center text-sm text-muted-foreground">
              <div><Sparkles className="h-6 w-6 mx-auto text-[color:var(--brand)] mb-2" />Your funnel will appear here.</div>
            </div>
          )}
          {loading && <div className="h-full grid place-items-center text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}
          {plan && <FunnelView plan={plan} />}
        </section>
      </div>
    </div>
  );
}

function FunnelView({ plan }: { plan: Plan }) {
  const copy = () => { navigator.clipboard.writeText(JSON.stringify(plan, null, 2)); toast.success("Copied"); };
  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Positioning</p>
          <h2 className="text-lg font-semibold mt-1">{plan.positioning_line}</h2>
        </div>
        <Button size="sm" variant="glass" onClick={copy}><Copy className="h-3 w-3" /> Copy</Button>
      </div>
      <Block label="Ad hooks"><List items={plan.ad_hooks} /></Block>
      <Block label="Lead magnet">
        <p className="font-medium">{plan.lead_magnet.name} <span className="text-muted-foreground font-normal">({plan.lead_magnet.format})</span></p>
        <p className="text-muted-foreground mt-1">{plan.lead_magnet.description}</p>
      </Block>
      <Block label="Landing page">
        <p className="font-medium">{plan.landing_page.headline}</p>
        <p className="text-muted-foreground">{plan.landing_page.subhead}</p>
        <List items={plan.landing_page.sections} />
      </Block>
      <Block label="5-day email sequence">
        <div className="space-y-2">
          {plan.email_sequence.map((e) => (
            <div key={e.day} className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Day {e.day} · {e.purpose}</p>
              <p className="font-medium mt-1">{e.subject}</p>
              <p className="text-muted-foreground text-xs mt-1">{e.body_outline}</p>
            </div>
          ))}
        </div>
      </Block>
      <Block label="Sales page outline"><List items={plan.sales_page_outline} ordered /></Block>
      <Block label="Upsell">
        <p className="font-medium">{plan.upsell.name} — {plan.upsell.price}</p>
        <p className="text-muted-foreground mt-1">{plan.upsell.pitch}</p>
      </Block>
      <Block label="KPIs to track"><List items={plan.kpis} /></Block>
    </div>
  );
}
