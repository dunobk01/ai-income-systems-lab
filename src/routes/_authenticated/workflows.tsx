import { createFileRoute } from "@tanstack/react-router";
import { Workflow, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Header, LockedView } from "./builders/product";

export const Route = createFileRoute("/_authenticated/workflows")({
  head: () => ({ meta: [{ title: "n8n Workflows — AI Income Systems Lab" }] }),
  component: WorkflowsPage,
});

const tierOk = (t?: string, isAdmin?: boolean) => isAdmin === true || t === "builder" || t === "pro";

type WF = { title: string; category: string; difficulty: "Beginner" | "Intermediate" | "Advanced"; summary: string; nodes: string[]; setup: string[]; tip: string };

const workflows: WF[] = [
  {
    title: "Lead Delivery Engine",
    category: "Lead Gen",
    difficulty: "Beginner",
    summary: "New form submission → enrich with AI → write to Google Sheets → email lead + Slack alert. The reliable first workflow.",
    nodes: ["Webhook (form)", "Set", "OpenAI (enrich)", "Google Sheets (append)", "Gmail (send)", "Slack (alert)", "Error trigger"],
    setup: ["Create webhook + paste URL into your form tool", "Connect Sheets, Gmail, Slack credentials", "Add error workflow that posts to Slack on failure"],
    tip: "Add a 30s wait + retry on the Sheets node — Sheets rate-limits on bursts.",
  },
  {
    title: "Content Repurposing Pipeline",
    category: "Content",
    difficulty: "Intermediate",
    summary: "One long-form post in Notion → AI turns it into 5 tweets, 1 LinkedIn post, 1 YouTube description, 1 email.",
    nodes: ["Notion trigger (new published)", "OpenAI x4 (per format)", "Notion (write back)", "Buffer (schedule)"],
    setup: ["Tag posts 'ready-to-repurpose' in Notion", "Use one prompt per format with your voice profile", "Schedule outputs to Buffer or post manually"],
    tip: "Store your brand voice in a Notion database and inject it into every prompt for consistency.",
  },
  {
    title: "AI Lead Enrichment",
    category: "Sales",
    difficulty: "Intermediate",
    summary: "New row in CRM → Perplexity research → Claude writes a personalized opener → push back to CRM.",
    nodes: ["HubSpot trigger", "HTTP Request (Perplexity)", "OpenAI/Claude", "HubSpot (update)"],
    setup: ["Add a 'needs_enrichment' property in your CRM", "Build the Perplexity research prompt", "Cap to 50 leads/day to control cost"],
    tip: "Always include 1 verifiable fact in the opener — proves it's not generic AI spam.",
  },
  {
    title: "Customer Support Triage",
    category: "Ops",
    difficulty: "Intermediate",
    summary: "New email/ticket → Claude categorizes + drafts a reply → human approves in Slack → send.",
    nodes: ["Gmail/Help Scout trigger", "Claude (classify + draft)", "Slack (interactive approval)", "Help Scout (reply)"],
    setup: ["Define your category list (refund/bug/feature/how-to)", "Wire Slack approval buttons", "Always require human approval for refunds"],
    tip: "Log every AI draft + final reply to Sheets for ongoing prompt tuning.",
  },
  {
    title: "Daily Brief Generator",
    category: "Personal",
    difficulty: "Beginner",
    summary: "Cron at 7am → pull calendar + email + tasks → Claude writes a 200-word daily brief → email to you.",
    nodes: ["Cron", "Google Calendar", "Gmail", "Notion", "Claude", "Gmail (send)"],
    setup: ["Connect calendar, email, tasks", "Tune the brief prompt with your priorities", "Run for a week and refine"],
    tip: "Add a 'what would you skip today?' line — best part of the brief.",
  },
  {
    title: "Invoice → Bookkeeping",
    category: "Ops",
    difficulty: "Advanced",
    summary: "New invoice email → Claude extracts fields → push to Xero/QuickBooks → file PDF in Drive.",
    nodes: ["Gmail (filter)", "Claude (extract JSON)", "Xero", "Google Drive"],
    setup: ["Use Claude with strict JSON schema", "Validate fields before writing to Xero", "Move processed emails to a 'done' label"],
    tip: "Send yourself a daily summary of all auto-processed invoices.",
  },
  {
    title: "Cold Email Personalizer",
    category: "Sales",
    difficulty: "Advanced",
    summary: "CSV of prospects → enrich + personalize at scale → push to Instantly/Smartlead with rate limiting.",
    nodes: ["Sheets trigger", "Perplexity", "Claude", "Instantly", "Error workflow"],
    setup: ["Strict rate limit (1 lead/min)", "Always include unsubscribe + sender name", "QA 20 messages manually before bulk"],
    tip: "Score each lead 1-10 with Claude — only send to 8+ to keep deliverability high.",
  },
  {
    title: "Stripe Churn Saver",
    category: "Retention",
    difficulty: "Intermediate",
    summary: "Stripe customer.subscription.deleted → Claude writes a win-back email → send via your ESP.",
    nodes: ["Stripe webhook", "Claude", "Customer.io/Resend"],
    setup: ["Filter to paid plans only", "A/B test offer vs no-offer", "Track recovery rate"],
    tip: "Don't beg. Ask one question: 'What were you hoping this would do for you?'",
  },
];

function WorkflowsPage() {
  const { profile, isAdmin } = useAuth();
  if (!tierOk(profile?.tier, isAdmin)) return <LockedView title="n8n Workflow Library" />;
  const copyJSON = (wf: WF) => { navigator.clipboard.writeText(JSON.stringify(wf, null, 2)); toast.success("Workflow spec copied"); };
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <Header icon={<Workflow className="h-5 w-5" />} eyebrow="Library" title="n8n Workflow Library" subtitle="Production-ready automation templates. Copy the spec, build in n8n, save 5 hours a week." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {workflows.map((wf) => (
          <article key={wf.title} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="border-white/15 text-[10px] uppercase">{wf.category}</Badge>
                  <Badge variant="outline" className="border-white/15 text-[10px] uppercase">{wf.difficulty}</Badge>
                </div>
                <h3 className="mt-2 font-semibold">{wf.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{wf.summary}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Nodes</p>
                <p className="text-foreground/80">{wf.nodes.join(" → ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Setup</p>
                <ol className="list-decimal pl-5 space-y-0.5 text-foreground/80">{wf.setup.map((s, i) => <li key={i}>{s}</li>)}</ol>
              </div>
              <div className="rounded-lg bg-white/5 p-3 text-xs"><span className="font-semibold text-[color:var(--brand)]">Pro tip:</span> {wf.tip}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="glass" onClick={() => copyJSON(wf)}><Copy className="h-3 w-3" /> Copy spec</Button>
              <Button size="sm" variant="glass" asChild>
                <a href="https://n8n.io" target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /> Open n8n</a>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
