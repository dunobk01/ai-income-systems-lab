/**
 * AI Time & Money Savings Calculator.
 *
 * Every task carries a deliberately conservative automation percentage —
 * the share of that task a well-built AI/automation setup typically removes.
 * These are estimates, shown transparently in the UI, never promises.
 */

export type TaskDef = {
  id: string;
  label: string;
  /** Default hours/week. */
  defaultHours: number;
  /** Share of the task automation typically removes (0–1). */
  automation: number;
  /** Plain-English reason for the percentage. */
  rationale: string;
};

export const TASKS: TaskDef[] = [
  {
    id: "leads",
    label: "Replying to leads & DMs",
    defaultHours: 5,
    automation: 0.5,
    rationale:
      "An instant first reply and a qualifying question set handle about half the back-and-forth. You still take the real conversations.",
  },
  {
    id: "followup",
    label: "Follow-up emails",
    defaultHours: 3,
    automation: 0.6,
    rationale:
      "Sequences are the most automatable thing in a small business — the drafting and the remembering both go away.",
  },
  {
    id: "content",
    label: "Social posts & content",
    defaultHours: 4,
    automation: 0.5,
    rationale:
      "Drafting, repurposing and scheduling automate well. Ideas, judgement and your actual voice don't.",
  },
  {
    id: "scheduling",
    label: "Scheduling & booking",
    defaultHours: 2,
    automation: 0.55,
    rationale: "Self-serve booking plus automatic reminders removes most of the coordination, not the exceptions.",
  },
  {
    id: "admin",
    label: "Invoicing & bookkeeping admin",
    defaultHours: 3,
    automation: 0.45,
    rationale: "Generating and chasing documents automates; reconciliation and judgement calls still need you.",
  },
  {
    id: "faqs",
    label: "Answering the same questions",
    defaultHours: 4,
    automation: 0.6,
    rationale: "A trained assistant fed with your real answers handles the repeats and escalates the rest.",
  },
  {
    id: "quotes",
    label: "Writing quotes & proposals",
    defaultHours: 3,
    automation: 0.4,
    rationale: "Structure, boilerplate and first drafts automate. Pricing and scope stay yours.",
  },
  {
    id: "research",
    label: "Research",
    defaultHours: 2,
    automation: 0.5,
    rationale: "AI search collapses gathering and summarising. Verifying the important bits is still manual.",
  },
];

/** Custom tasks use a middle-of-the-road assumption. */
export const CUSTOM_AUTOMATION = 0.4;
export const CUSTOM_RATIONALE =
  "We use a conservative 40% for tasks we can't see. Adjust your expectations once you've mapped the steps.";

export const MAX_HOURS = 40;
export const WEEKS_PER_MONTH = 4.33;

export type TaskInput = { id: string; label: string; hours: number; automation: number };

export type Savings = {
  perTask: Array<{ id: string; label: string; hours: number; automation: number; savedHours: number; savedMoney: number }>;
  hoursWeek: number;
  hoursMonth: number;
  moneyMonth: number;
  moneyYear: number;
  totalHoursWeek: number;
};

export function computeSavings(tasks: TaskInput[], hourlyRate: number): Savings {
  const perTask = tasks.map((t) => {
    const savedHours = t.hours * t.automation;
    return {
      id: t.id,
      label: t.label,
      hours: t.hours,
      automation: t.automation,
      savedHours,
      savedMoney: savedHours * WEEKS_PER_MONTH * hourlyRate,
    };
  });
  const hoursWeek = perTask.reduce((s, t) => s + t.savedHours, 0);
  const hoursMonth = hoursWeek * WEEKS_PER_MONTH;
  const moneyMonth = hoursMonth * hourlyRate;
  return {
    perTask,
    hoursWeek,
    hoursMonth,
    moneyMonth,
    moneyYear: moneyMonth * 12,
    totalHoursWeek: tasks.reduce((s, t) => s + t.hours, 0),
  };
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const hours = (n: number) => `${n.toFixed(n < 10 ? 1 : 0)}`;
