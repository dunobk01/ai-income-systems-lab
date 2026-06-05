import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Sparkles, Package, Copy, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { generateProductPlan } from "@/lib/builders.functions";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/builders/product")({
  head: () => ({ meta: [{ title: "Digital Product Builder — AI Income Systems Lab" }] }),
  component: ProductBuilder,
});

const tierOk = (t?: string, isAdmin?: boolean) => isAdmin === true || t === "builder" || t === "pro";

type Plan = Awaited<ReturnType<typeof generateProductPlan>>;

function ProductBuilder() {
  const { profile, isAdmin } = useAuth();
  const fn = useServerFn(generateProductPlan);
  const [form, setForm] = useState({
    niche: "Solo coaches who want more leads from LinkedIn",
    audience: "Coaches with 1-3 years experience and < 5k followers",
    outcome: "5 qualified discovery calls per week within 60 days",
    price: "$79",
    format: "Ebook + 5 prompt templates",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!tierOk(profile?.tier, isAdmin)) {
    return <LockedView title="Digital Product Builder" />;
  }

  const submit = async () => {
    setLoading(true); setError(null); setPlan(null);
    try {
      const result = await fn({ data: form });
      setPlan(result);
    } catch (e) {
      setError((e as Error).message ?? "Couldn't generate. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <Header icon={<Package className="h-5 w-5" />} eyebrow="Builder" title="Digital Product Builder" subtitle="Turn a fuzzy idea into a shippable product brief in 30 seconds." />

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <section className="glass rounded-2xl p-6 space-y-4">
          <Field label="Niche" v={form.niche} onChange={(v) => setForm({ ...form, niche: v })} />
          <Field label="Audience" v={form.audience} onChange={(v) => setForm({ ...form, audience: v })} />
          <Field label="Outcome buyer wants" v={form.outcome} onChange={(v) => setForm({ ...form, outcome: v })} textarea />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" v={form.price} onChange={(v) => setForm({ ...form, price: v })} />
            <Field label="Format" v={form.format} onChange={(v) => setForm({ ...form, format: v })} />
          </div>
          <Button variant="brand" onClick={submit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Building your brief…" : "Generate product brief"}
          </Button>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </section>

        <section className="glass rounded-2xl p-6 min-h-[400px]">
          {!plan && !loading && (
            <div className="h-full grid place-items-center text-center text-sm text-muted-foreground">
              <div>
                <Sparkles className="h-6 w-6 mx-auto text-[color:var(--brand)] mb-2" />
                Your brief will appear here.
              </div>
            </div>
          )}
          {loading && <div className="h-full grid place-items-center text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}
          {plan && <ProductPlanView plan={plan} />}
        </section>
      </div>
    </div>
  );
}

function ProductPlanView({ plan }: { plan: Plan }) {
  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    toast.success("Copied to clipboard");
  };
  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Product</p>
          <h2 className="text-xl font-bold">{plan.title}</h2>
          <p className="text-muted-foreground mt-1">{plan.promise}</p>
        </div>
        <Button size="sm" variant="glass" onClick={copy}><Copy className="h-3 w-3" /> Copy</Button>
      </div>
      <Block label="Target buyer">{plan.target_buyer}</Block>
      <Block label="Top pains"><List items={plan.top_pains} /></Block>
      <Block label="Deliverables"><List items={plan.deliverables} /></Block>
      <Block label="Outline">
        <ol className="space-y-2">
          {plan.outline.map((c, i) => (
            <li key={i}><span className="font-medium">{i + 1}. {c.chapter}</span> — <span className="text-muted-foreground">{c.summary}</span></li>
          ))}
        </ol>
      </Block>
      <Block label="Positioning">{plan.positioning}</Block>
      <Block label="3-week ship plan"><List items={plan.three_week_plan} ordered /></Block>
      <Block label="Launch hooks"><List items={plan.launch_hooks} /></Block>
    </div>
  );
}

export function Header({ icon, eyebrow, title, subtitle }: { icon: React.ReactNode; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-xl shrink-0" style={{ background: "var(--gradient-soft)" }}>
        <span className="text-[color:var(--brand)]">{icon}</span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>
      </div>
    </div>
  );
}

export function Field({ label, v, onChange, textarea }: { label: string; v: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {textarea ? <Textarea value={v} onChange={(e) => onChange(e.target.value)} rows={3} /> : <Input value={v} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

export function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}

export function List({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={ordered ? "space-y-1 list-decimal pl-5" : "space-y-1 list-disc pl-5"}>
      {items.map((i, k) => <li key={k}>{i}</li>)}
    </Tag>
  );
}

export function LockedView({ title }: { title: string }) {
  return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="glass-strong rounded-3xl p-10 text-center">
        <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Available on the Builder and Pro tiers.</p>
        <Button asChild variant="brand" className="mt-5"><Link to="/pricing">See pricing</Link></Button>
      </div>
    </div>
  );
}
