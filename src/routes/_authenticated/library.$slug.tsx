import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Copy, Check, Lock, Sparkles, Workflow, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getTemplate, type Template, type TemplateKind } from "@/lib/templates-data";

export const Route = createFileRoute("/_authenticated/library/$slug")({
  head: ({ params }) => {
    const t = getTemplate(params.slug);
    return { meta: [{ title: t ? `${t.title} — Template Library` : "Template — Library" }, { name: "robots", content: "noindex" }] };
  },
  component: TemplatePage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Template not found. <Link to="/library" className="underline">Back</Link></div>
  ),
});

const kindMeta: Record<TemplateKind, { label: string; icon: typeof Sparkles; color: string }> = {
  prompt: { label: "Prompt", icon: Sparkles, color: "text-amber-300" },
  n8n: { label: "n8n Workflow", icon: Workflow, color: "text-sky-300" },
  lovable: { label: "Lovable Starter", icon: Layers, color: "text-violet-300" },
};

function TemplatePage() {
  const { slug } = Route.useParams();
  const template = getTemplate(slug) as Template | undefined;
  const { profile, isAdmin } = useAuth();
  const tier = profile?.tier ?? "none";
  const canAccess = isAdmin || tier === "builder" || tier === "pro";

  if (!template) {
    throw notFound();
  }
  const meta = kindMeta[template.kind];
  const Icon = meta.icon;

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <Link to="/library" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Library
      </Link>

      <header>
        <div className="inline-flex items-center gap-2 text-xs">
          <Icon className={`h-4 w-4 ${meta.color}`} />
          <span className="text-muted-foreground">{meta.label}</span>
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{template.title}</h1>
        <p className="mt-3 text-muted-foreground">{template.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{template.category}</Badge>
          <Badge variant="outline">{template.difficulty}</Badge>
          <Badge variant="outline">{template.estTime}</Badge>
        </div>
      </header>

      <Section title="Use cases">
        <ul className="grid gap-2 list-disc list-inside text-sm text-foreground/90">
          {template.useCases.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      </Section>

      <Section title="Who it's for">
        <ul className="grid gap-2 list-disc list-inside text-sm text-foreground/90">
          {template.whoItsFor.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      </Section>

      <Section title="Why it works">
        <p className="text-sm text-foreground/90 leading-relaxed">{template.whyItWorks}</p>
      </Section>

      <Section title="Setup">
        <ol className="grid gap-2 list-decimal list-inside text-sm text-foreground/90">
          {template.setup.map((u, i) => <li key={i}>{u}</li>)}
        </ol>
      </Section>

      {template.kind === "prompt" && template.prompt && (
        <Section title="The prompt">
          {canAccess ? (
            <>
              <CodeBlock code={template.prompt} />
              {template.variables && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Variables</h4>
                  <ul className="grid gap-1 text-sm text-muted-foreground">
                    {template.variables.map((v) => (
                      <li key={v.name}><code className="text-foreground">{v.name}</code> — {v.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <LockedBlock />
          )}
        </Section>
      )}

      {template.kind === "n8n" && (
        <>
          {template.nodes && (
            <Section title="Workflow nodes">
              <ul className="grid gap-2 text-sm">
                {template.nodes.map((n, i) => (
                  <li key={i} className="glass rounded-lg p-3">
                    <span className="font-medium">{n.name}</span> — <span className="text-muted-foreground">{n.purpose}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {template.jsonSnippet && (
            <Section title="Core prompt / config">
              {canAccess ? <CodeBlock code={template.jsonSnippet} /> : <LockedBlock />}
            </Section>
          )}
        </>
      )}

      {template.kind === "lovable" && (
        <>
          {template.stack && (
            <Section title="Stack">
              <ul className="flex flex-wrap gap-2">
                {template.stack.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
              </ul>
            </Section>
          )}
          {template.pages && (
            <Section title="Pages">
              <ul className="grid gap-2 text-sm">
                {template.pages.map((p) => (
                  <li key={p.name} className="glass rounded-lg p-3">
                    <code className="text-foreground">{p.name}</code> — <span className="text-muted-foreground">{p.purpose}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {template.starterPrompt && (
            <Section title="Starter prompt (paste into Lovable)">
              {canAccess ? <CodeBlock code={template.starterPrompt} /> : <LockedBlock />}
            </Section>
          )}
        </>
      )}

      <Section title="Pro tips">
        <ul className="grid gap-2 list-disc list-inside text-sm text-foreground/90">
          {template.proTips.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <Button
        size="sm"
        variant="glass"
        className="absolute top-3 right-3 z-10"
        onClick={() => { void navigator.clipboard.writeText(code); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 1500); }}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre className="glass rounded-xl p-5 pr-24 overflow-x-auto text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">{code}</pre>
    </div>
  );
}

function LockedBlock() {
  return (
    <div className="glass rounded-xl p-6 ring-brand flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl shrink-0" style={{ background: "var(--gradient-soft)" }}>
        <Lock className="h-5 w-5 text-[color:var(--brand)]" />
      </div>
      <div className="min-w-0">
        <p className="font-medium">Full template available on Builder & Pro</p>
        <p className="text-sm text-muted-foreground">Upgrade to unlock the complete prompt, workflow config, and starter app prompts.</p>
      </div>
      <Button asChild variant="brand" className="sm:ml-auto"><Link to="/pricing">See plans <ArrowRight className="h-4 w-4" /></Link></Button>
    </div>
  );
}
