import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Sparkles, Bot, Copy } from "lucide-react";
import { generateAgentSpec } from "@/lib/builders.functions";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header, Block, List, LockedView } from "@/routes/_authenticated/builders/product";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/builders/agent")({
  head: () => ({ meta: [{ title: "Agent Generator — AI Income Systems Lab" }] }),
  component: AgentBuilder,
});

const tierOk = (t?: string) => t === "pro";
type Spec = Awaited<ReturnType<typeof generateAgentSpec>>;

function AgentBuilder() {
  const { profile } = useAuth();
  const fn = useServerFn(generateAgentSpec);
  const [prompt, setPrompt] = useState(
    "I want an agent that researches inbound leads from a typeform and writes a 1-page brief with company facts, 3 buying signals, the right contact title, and a personalized opener — then saves it to a Google Sheet.",
  );
  const [goal, setGoal] = useState("Qualify and brief 25 inbound leads/week unattended");
  const [platform, setPlatform] = useState<"claude" | "chatgpt" | "code">("claude");
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!tierOk(profile?.tier)) return <LockedView title="Agent Generator (Pro)" />;

  const submit = async () => {
    setLoading(true); setError(null); setSpec(null);
    try {
      const result = await fn({ data: { prompt, platform, goal: goal || undefined } });
      setSpec(result);
    } catch (e) {
      setError((e as Error).message ?? "Couldn't generate. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Header
        icon={<Bot className="h-5 w-5" />}
        eyebrow="Pro builder"
        title="Generate Agent from Prompt"
        subtitle="Turn a rough idea or a pro prompt into a complete agent spec — roles, tools, skills, system prompt, and acceptance tests."
      />

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <section className="glass rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Source prompt / idea</Label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={9} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Outcome the agent owns</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Target platform</Label>
            <div className="flex gap-2">
              {(["claude", "chatgpt", "code"] as const).map((p) => (
                <Button key={p} type="button" size="sm" variant={platform === p ? "brand" : "glass"} onClick={() => setPlatform(p)}>
                  {p === "claude" ? "Claude" : p === "chatgpt" ? "ChatGPT" : "Code (SDK)"}
                </Button>
              ))}
            </div>
          </div>
          <Button variant="brand" onClick={submit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Designing your agent…" : "Generate agent spec"}
          </Button>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </section>

        <section className="glass rounded-2xl p-6 min-h-[400px]">
          {!spec && !loading && (
            <div className="h-full grid place-items-center text-center text-sm text-muted-foreground">
              <div>
                <Bot className="h-6 w-6 mx-auto text-[color:var(--brand)] mb-2" />
                Your agent spec will appear here.
              </div>
            </div>
          )}
          {loading && <div className="h-full grid place-items-center text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}
          {spec && <SpecView spec={spec} />}
        </section>
      </div>
    </div>
  );
}

function SpecView({ spec }: { spec: Spec }) {
  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    toast.success("Full spec copied as JSON");
  };
  const copySys = () => {
    navigator.clipboard.writeText(spec.system_prompt);
    toast.success("System prompt copied");
  };
  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Agent</p>
          <h2 className="text-xl font-bold">{spec.name}</h2>
          <p className="text-muted-foreground mt-1">{spec.one_liner}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="glass" onClick={copySys}><Copy className="h-3 w-3" /> Prompt</Button>
          <Button size="sm" variant="glass" onClick={copyJson}><Copy className="h-3 w-3" /> JSON</Button>
        </div>
      </div>

      <Block label="Job to be done">{spec.job_to_be_done}</Block>
      <Block label="Target user">{spec.target_user}</Block>

      <Block label="Roles">
        <div className="space-y-3">
          {spec.roles.map((r, i) => (
            <div key={i} className="rounded-lg bg-black/20 p-3">
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.purpose}</div>
              <List items={r.responsibilities} />
            </div>
          ))}
        </div>
      </Block>

      <Block label="Tools">
        <div className="space-y-3">
          {spec.tools.map((t, i) => (
            <div key={i} className="rounded-lg bg-black/20 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <code className="text-[color:var(--brand)] text-xs">{t.name}</code>
              </div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
              <div className="text-xs"><Badge variant="outline" className="border-white/15 text-[10px] mr-1">USE</Badge>{t.when_to_use}</div>
              <div className="text-xs"><Badge variant="outline" className="border-white/15 text-[10px] mr-1">AVOID</Badge>{t.when_not_to_use}</div>
              <pre className="text-[11px] bg-black/40 rounded p-2 overflow-auto whitespace-pre-wrap font-mono"><span className="text-muted-foreground">input:</span> {t.input_schema}{"\n"}<span className="text-muted-foreground">output:</span> {t.output_shape}</pre>
            </div>
          ))}
        </div>
      </Block>

      <Block label="Memory">
        <ul className="space-y-1">
          <li><span className="text-muted-foreground">short-term:</span> {spec.memory.short_term}</li>
          <li><span className="text-muted-foreground">working:</span> {spec.memory.working}</li>
          <li><span className="text-muted-foreground">long-term:</span> {spec.memory.long_term}</li>
        </ul>
      </Block>

      <Block label="Skills">
        <div className="space-y-2">
          {spec.skills.map((s, i) => (
            <div key={i} className="rounded-lg bg-black/20 p-3">
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
              <div className="text-xs mt-1"><span className="text-muted-foreground">triggers when:</span> {s.when_to_trigger}</div>
            </div>
          ))}
        </div>
      </Block>

      <Block label={`System prompt (step budget: ${spec.step_budget})`}>
        <pre className="text-xs bg-black/40 rounded-lg p-3 max-h-72 overflow-auto whitespace-pre-wrap font-mono text-foreground/85">{spec.system_prompt}</pre>
      </Block>

      <Block label="Output contract">
        <pre className="text-xs bg-black/40 rounded-lg p-3 overflow-auto whitespace-pre-wrap font-mono text-foreground/85">{spec.output_contract}</pre>
      </Block>

      <Block label="Guardrails"><List items={spec.guardrails} /></Block>

      <Block label="Acceptance tests">
        <div className="space-y-3">
          {spec.acceptance_tests.map((t, i) => (
            <div key={i} className="rounded-lg bg-black/20 p-3 space-y-1">
              <div className="font-medium text-xs">{i + 1}. {t.name}</div>
              <div className="text-xs"><span className="text-muted-foreground">input:</span> {t.input}</div>
              <div className="text-xs"><span className="text-muted-foreground">expected:</span> {t.expected}</div>
              <div className="text-xs"><span className="text-muted-foreground">pass if:</span> {t.pass_criteria}</div>
            </div>
          ))}
        </div>
      </Block>

      <Block label="Next steps"><List items={spec.next_steps} ordered /></Block>
    </div>
  );
}
