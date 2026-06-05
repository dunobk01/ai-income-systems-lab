
INSERT INTO public.modules (id, course_id, title, slug, summary, order_index, required_tier, is_preview)
SELECT '22222222-2222-2222-2222-000000000012'::uuid, c.id,
  'AI Agents & Skills',
  'agents-and-skills',
  'Design, build, and ship real AI agents with tools, memory, and skills — using ChatGPT, Claude, and open frameworks.',
  12, 'pro', false
FROM public.courses c
WHERE NOT EXISTS (SELECT 1 FROM public.modules WHERE id='22222222-2222-2222-2222-000000000012')
LIMIT 1;

INSERT INTO public.lessons (module_id, slug, title, content, action_steps, order_index, duration_minutes) VALUES
('22222222-2222-2222-2222-000000000012','agent-mental-model','What an AI agent actually is',
$$# What an AI agent actually is

Most people use "agent" to mean any chatbot. That's wrong, and the confusion costs you money. An **AI agent** is a system where an LLM decides what to do next in a loop until a goal is met — choosing tools, calling them, reading the results, and continuing.

## The three things that separate an agent from a chatbot

1. **A goal it owns.** Not a single message — an outcome. "Find 25 qualified leads and put them in this sheet" is an agent task. "Write me an email" is a prompt.
2. **Tools it can call.** Web search, code execution, your database, an email sender, a calendar, a CRM. The agent decides *when* to call them.
3. **A loop with a stop condition.** It keeps reasoning → acting → observing until the goal is satisfied (or it gives up).

If your "agent" has no tools and no loop, it's a prompt with a system message. That's fine — but don't over-engineer it.

## The ReAct loop (the pattern under everything)

Every modern agent — ChatGPT custom GPTs with actions, Claude with tool use, LangGraph, CrewAI, OpenAI's Agents SDK, Anthropic's Skills — runs some flavor of this loop:

```
THOUGHT: what should I do next to reach the goal?
ACTION: call tool X with these arguments
OBSERVATION: tool returned this result
THOUGHT: am I done? if not, what next?
... repeat ...
FINAL: deliver result to user
```

You don't have to write this loop yourself anymore. The platforms run it for you. But you have to **design** for it.

## When to use an agent (and when not to)

Use an agent when:
- The task has **branching steps** that depend on intermediate results
- It needs **fresh external data** (web, CRM, your DB)
- The user wants an **outcome**, not a draft

Skip the agent when:
- A single prompt with good context gives 90% of the value
- Latency or cost matters more than autonomy
- The task is deterministic — write a script, not an agent

## The buyer's frame

Clients don't pay for "an agent." They pay for **a job done unattended**. Lead research, inbox triage, content repurposing, customer support tier-1, internal reporting. Sell the job. Build the agent behind it.

## Common failure modes to design around

- **Tool sprawl** — too many tools, the model picks the wrong one. Start with 2–4.
- **No stop condition** — agent loops forever or quits early. Always set a max-step budget.
- **Silent hallucination** — agent invents tool outputs. Validate every result the agent claims to have.
- **No eval** — you have no idea if v2 is better than v1. Build a 10-task test set on day one.

The rest of this module gives you the patterns, the prompts, and the platforms to ship agents people actually pay for.$$,
$$1. Write down one task in your business that you do repeatedly and would happily hand to an unattended worker. Be specific: inputs, outputs, frequency.
2. Decide: is this an agent task (branching, tools, fresh data) or a prompt task (one shot)? If prompt — stop here and just write the prompt.
3. List the 2–4 tools the agent would minimally need. No more.
4. Define one acceptance test: "the agent succeeded if ___ in under ___ steps."$$,
1, 18),

('22222222-2222-2222-2222-000000000012','anatomy','Anatomy of a production agent',
$$# Anatomy of a production agent

Every shippable agent has the same six parts. Skip any of them and it breaks in week two.

## 1. System prompt (the agent's brain)

Not a personality blurb. A **contract**. It defines:
- **Identity & scope:** who the agent is and what it will and won't touch
- **Operating procedure:** the exact steps to follow for the most common job
- **Tool policy:** when to use which tool, and what to do when a tool fails
- **Output contract:** the exact shape of the final answer
- **Guardrails:** what to refuse, what to escalate, what to never invent

Treat it like a job description for a new hire — including the boring parts.

## 2. Tools (the agent's hands)

A tool is a function the model can call with structured arguments. Each tool needs:
- A **clear name** (`search_crm_contacts`, not `tool1`)
- A **one-sentence description** the model reads to decide when to use it
- A **typed input schema** (JSON Schema / Zod)
- A **deterministic output shape**
- **Failure handling** — return an error object the model can reason about, never throw silently

Rule: if two tools could do the same job, you have one tool too many.

## 3. Memory

Three layers, often confused:
- **Short-term:** the current conversation / scratchpad. Free.
- **Working:** stuff the agent needs across turns of one task (a plan, a list of leads it's already processed).
- **Long-term:** things to remember across sessions (user preferences, completed jobs, prior decisions). Usually a database + retrieval.

Start with short-term only. Add the others when a specific failure forces you to.

## 4. Skills (capability bundles)

A "skill" is a reusable package of instructions + reference files + scripts the agent loads only when relevant. Anthropic formalized this with `SKILL.md`; ChatGPT does it informally with Custom GPTs + uploaded files; you can do it manually by chunking your prompts.

The win: instead of one giant 12,000-token system prompt, the agent loads a tiny router and pulls in the right skill for the task.

## 5. The orchestrator

The runtime that runs the loop, enforces the step budget, logs every tool call, and handles retries. You almost never write this from scratch anymore. Pick one:
- **ChatGPT Custom GPTs + Actions** — fastest for non-technical builders
- **Claude (Anthropic Console / Claude.ai) with tool use** — strongest reasoning, native skills
- **OpenAI Agents SDK / Assistants** — for code
- **n8n, Make, Zapier Agents** — for workflow people
- **LangGraph / CrewAI** — for devs who want full control

## 6. Evals

A small, frozen set of input → expected-behavior pairs you run after every change. 10 tasks is enough to start. Without evals, "I improved the agent" is a feeling, not a fact.

## Putting it together

```
USER GOAL
   ↓
SYSTEM PROMPT (identity, SOP, tool policy, output contract)
   ↓
LOOP: think → pick tool → call → observe → repeat (budget: N steps)
   ↓        ↑
TOOLS ──────┘   (each typed, each fails loudly)
   ↓
MEMORY (scratchpad now; DB later)
   ↓
SKILLS (loaded on demand)
   ↓
FINAL OUTPUT (matches output contract)
   ↓
EVAL (does this still pass the 10 frozen tasks?)
```

Master these six parts and every "agent framework" stops being magic — it's just a different UI over the same anatomy.$$,
$$1. Take the agent task from lesson 1 and write its system prompt with the five required sections (identity, SOP, tool policy, output contract, guardrails).
2. For each tool, write a one-sentence description + input schema in plain English.
3. Decide which memory layers it needs today — default to short-term only.
4. Write down 10 input examples that you'll use as your eval set forever.$$,
2, 22),

('22222222-2222-2222-2222-000000000012','build-with-chatgpt','Build your first agent in ChatGPT',
$$# Build your first agent in ChatGPT (Custom GPT + Actions)

The fastest path from idea to working agent for a non-developer. You'll build a **Lead Research Agent** that takes a company name and returns a qualified-lead brief.

## Step 1 — Define the contract before opening the builder

Don't touch ChatGPT yet. Write:

- **Job:** "Given a company name and our ICP, return a 1-page lead brief with company facts, 3 buying signals, the right contact, and a personalized opener."
- **Inputs:** company name, optional URL
- **Output shape:** the exact sections of the brief
- **Tools needed:** web browsing (built-in), optionally a custom Action that POSTs the brief into a Google Sheet
- **Acceptance:** "Brief takes < 90 seconds, opener mentions a fact only true of this company, no invented people."

## Step 2 — Create the Custom GPT

ChatGPT → **Explore GPTs → Create**. Use the Configure tab (not the chat builder — it generates fluffier prompts).

Fill in:
- **Name:** "ICP Lead Brief"
- **Description:** one line for users
- **Instructions:** paste the system prompt (template below)
- **Conversation starters:** 3 realistic example inputs
- **Knowledge:** upload your ICP doc, your value-prop one-pager, your case studies (PDFs/markdown). This is the cheap skills layer.
- **Capabilities:** turn on Web Search. Turn off the ones you don't need (less surface area for the model to wander).
- **Actions:** add one only if you actually need a write operation today.

## Step 3 — The system prompt template

```
You are "ICP Lead Brief," a research agent for [company]. You always produce a one-page brief in the exact format below. You never invent contacts, headcounts, or quotes.

ICP (read from knowledge file "icp.md"). If a target company clearly does not fit the ICP, say so in one sentence and stop.

Operating procedure:
1. Read the company name (+ optional URL) from the user.
2. Use web search to gather: company description, size, recent news in the last 6 months, hiring signals, tech stack hints.
3. Identify the most likely buyer role for our offer (titles listed in knowledge file "buyer-roles.md").
4. Draft 3 buying signals based ONLY on facts you found.
5. Write a 2–3 sentence personalized opener that references one of those facts.

Output contract (use these exact headings):
COMPANY: ...
FIT (1–5): ...
BUYING SIGNALS (3): ...
BUYER ROLE: ...
OPENER: ...
SOURCES: bullet list of URLs

Guardrails:
- If you can't find a fact, write "unknown" rather than guessing.
- Never include personal information beyond public role/title.
- Cap web searches at 6. If still unsure, return the brief with "low confidence" noted.
```

## Step 4 — Adding an Action (when you're ready)

An Action is an OpenAPI spec the GPT calls like a tool. Common first one: "Save this brief to my Google Sheet" via a Zapier or Make webhook.

- Create the webhook in Zapier (catch hook → add row to sheet)
- Convert the webhook into a minimal OpenAPI 3.1 spec (Zapier gives you a starter)
- Paste it into **Actions → Add new action**
- Set Authentication = None (Zapier webhooks are unguessable) or API Key

In the system prompt, add: *"After producing the brief, call `save_brief` with the structured fields above."*

## Step 5 — Test against your 10 frozen examples

Run all 10. Track: did it follow the format? did it invent? how many web searches? Tweak the prompt, not the model. Re-run.

## What to do next

When you outgrow Custom GPTs (multi-step jobs, multiple users, real auth), graduate to **Claude with tool use** (next lesson) or the **OpenAI Agents SDK**. But ship v1 here first.$$,
$$1. Build the ICP Lead Brief GPT exactly as described — or substitute your own agent task.
2. Upload at least one knowledge file so the agent has source material it can cite.
3. Run all 10 eval inputs. Note every failure in a doc.
4. Fix the top 2 failures by editing the system prompt only. Re-run.
5. Optional: wire one Action that writes output somewhere (Sheet, Notion, Airtable).$$,
3, 25),

('22222222-2222-2222-2222-000000000012','build-with-claude','Build agents in Claude with tool use',
$$# Build agents in Claude with tool use

Claude is the strongest model for agents that need to **plan**, **follow long instructions**, and **use multiple tools without losing the plot**. Its tool-use API is also the cleanest to learn the underlying pattern on.

## The mental model

In Claude, a tool is a JSON spec with `name`, `description`, and `input_schema`. You send the user message + the tool definitions. Claude either replies with text or returns a `tool_use` block. You execute the tool, send the result back as a `tool_result`, and Claude continues. Loop until it returns plain text.

That's the whole agent loop. Once you've built it once, every framework reads as a wrapper around it.

## Minimal example (Anthropic SDK)

```ts
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const tools = [{
  name: "get_weather",
  description: "Get current weather for a city.",
  input_schema: {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"],
  },
}];

let messages = [{ role: "user", content: "Should I bring an umbrella to Austin today?" }];

while (true) {
  const res = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    tools,
    messages,
  });
  messages.push({ role: "assistant", content: res.content });

  if (res.stop_reason !== "tool_use") {
    console.log(res.content.find(b => b.type === "text")?.text);
    break;
  }
  const toolUse = res.content.find(b => b.type === "tool_use");
  const result = await runTool(toolUse.name, toolUse.input);
  messages.push({
    role: "user",
    content: [{ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(result) }],
  });
}
```

That's a full agent in 25 lines. Everything else is engineering: better tools, better prompt, eval, logging, retries.

## Where Claude really shines

- **Long-running plans** — Claude tends to actually finish multi-step jobs without quitting halfway.
- **Following structured output contracts** — fewer "almost JSON" failures.
- **Skills (native).** Claude.ai supports a `SKILL.md` format where you bundle instructions + reference files + scripts; Claude loads them on demand when the task matches. See the Skills lesson later in this module.
- **Computer use / MCP tools** — Claude supports the Model Context Protocol natively, which is the cleanest way to give an agent access to your real systems without writing one-off integrations.

## A good Claude system prompt (template)

```
You are <Agent Name>, an AI agent that owns the following job: <one sentence>.

Operating procedure:
1. <step>
2. <step>

Tools available:
- <tool>: use when <condition>. Never use for <antipattern>.
- <tool>: ...

Tool-failure policy:
- If a tool returns an error, retry once with corrected inputs.
- If it fails twice, stop and report what you tried.

Output contract:
- Always return a final message in this exact shape: <schema>.

Budget:
- Use at most 8 tool calls. If you can't finish in 8, return your best partial answer with "incomplete: <reason>".

Guardrails:
- Never claim a tool result you didn't actually receive.
- Refuse: <list>.
- Escalate to human: <list>.
```

## Step budgets and stop conditions

Always set a max-iteration counter in your loop. Without it, a confused agent will loop on a failing tool forever. 8–12 is a sane default for most jobs.

## When to use Claude vs ChatGPT

| Use | Pick |
|---|---|
| No-code, single-user, ship today | ChatGPT Custom GPT |
| Multi-step jobs, long instructions, dev team | Claude API |
| Heavy code + data analysis | Either; Claude slightly stronger on plan adherence, GPT-5 on raw code |
| Native MCP tool ecosystem | Claude |
| Voice + image generation in one agent | ChatGPT |

There is no wrong answer. Pick one, ship, iterate.$$,
$$1. Get an Anthropic API key and run the minimal example above end-to-end.
2. Replace `get_weather` with a real tool from your business (a fetch to your DB, a Notion search, anything).
3. Add a max-step counter and a fail-loud tool error path.
4. Wrap the loop in a thin function and call it from a route, a CLI, or a server function.
5. Run your 10 evals against it and compare to the ChatGPT version.$$,
4, 26),

('22222222-2222-2222-2222-000000000012','tools-and-mcp','Designing tools the agent will actually use right',
$$# Designing tools the agent will actually use right

Tools are where 80% of agent failures originate. The model is fine. Your tool design is the problem.

## The 5 rules of tool design

**1. One job per tool.** `search_contacts` and `create_contact` are two tools. A single `manage_contacts` with a `mode` arg is a footgun — the model will pick the wrong mode under pressure.

**2. Names that read like verbs.** `get_calendar_events`, `send_email`, `summarize_transcript`. Not `helper`, `data`, `do_thing`.

**3. Descriptions are prompts.** The description is the only thing the model reads to decide whether to call the tool. Front-load *when to use it* and *when NOT to*.

Bad:
> Searches the database.

Good:
> Search our internal CRM for contacts by name, email, or company. Use this BEFORE creating a new contact to avoid duplicates. Do NOT use for prospect/lead research — use `web_search` for that.

**4. Strict, narrow input schemas.** Required fields required. Enums where possible. Descriptions on each field. A loose schema invites the model to invent fields.

**5. Outputs the model can reason about.** Return JSON, not prose. Include a `success: boolean` and an `error` field on failure with a human-readable message the model can read and adapt to.

```json
{ "success": false, "error": "Contact not found by email. Try search_contacts by company name." }
```

That error message is a *hint to the model*. Write it that way.

## How many tools is too many?

- 1–5 tools: model picks correctly almost always.
- 6–15: still fine if names + descriptions are crisp.
- 15+: accuracy drops. Use a router pattern: a top-level tool whose only job is to pick the right sub-agent, each with its own narrow toolset. This is the "swarm" / "supervisor" pattern in the Multi-Agent lesson.

## MCP — the universal tool protocol

The **Model Context Protocol** (MCP) is an open standard for exposing tools (and data) to LLMs. Instead of writing custom Action specs for ChatGPT *and* tool schemas for Claude *and* function defs for your own SDK, you write **one MCP server** and any compliant client can use it.

Popular MCP servers already exist for: GitHub, Linear, Notion, Slack, Postgres, Stripe, Google Drive, Figma, Sentry, and many more. Claude, Cursor, Zed, and a growing list of clients speak MCP natively.

For most users: **don't write an MCP server yet**. Use the off-the-shelf ones that already exist. Write your own only when you've validated the agent task with built-in tools first.

## Tool-failure patterns to bake in

- **Idempotency keys** for create/send tools so a retry doesn't double-fire.
- **Dry-run mode** for destructive tools (`send_email` with `dry_run: true` returns what would be sent without sending).
- **Quotas and rate limits** enforced in the tool itself, not in the prompt — the model will not respect prompt-only limits under pressure.
- **Approval gating** for irreversible actions: the tool returns `{ awaiting_approval: true, summary }` and the orchestrator surfaces it to a human.

## Test every tool independently

Before letting the agent call a new tool, run it 10 times yourself with edge inputs. Tools fail in much more interesting ways than agents do.$$,
$$1. Audit your current tool list. Cut any tool whose description doesn't tell the model when NOT to use it.
2. Add a `dry_run` mode to any tool that sends, posts, charges, or deletes.
3. Make every tool return `success` + `error` fields. Rewrite error strings as hints to the model.
4. Pick one off-the-shelf MCP server (e.g. Notion or GitHub) and wire it into Claude. Notice you wrote zero tool schemas.$$,
5, 22),

('22222222-2222-2222-2222-000000000012','multi-agent','Multi-agent systems without overengineering',
$$# Multi-agent systems without overengineering

Multi-agent looks impressive in demos and slow-and-expensive in production. Most "multi-agent" systems should be one agent with better tools. But there are real cases where multi-agent is the right call.

## When multi-agent is actually better

- **Different specialties with different tool sets.** A "research" agent with web tools and a "writer" agent with no internet access reduces hallucination — the writer can only use what research handed it.
- **Parallelism.** A supervisor fans out 10 lead-research subtasks to 10 worker agents simultaneously. That's a 10x latency win.
- **Containment of failure.** One agent crashes or loops — the supervisor kills it and reassigns. Single-agent loops just die.

## When it's a trap

- "I'll have a planner agent that talks to an executor agent that talks to a critic." Three round-trips per step, 3x the cost, marginally better output.
- You haven't proven a single agent fails at the job yet.

## The patterns worth knowing

**Supervisor + workers** (most common)
A supervisor agent decomposes the job, dispatches subtasks to specialized worker agents (each with its own narrow prompt + tools), and assembles the final result.

```
SUPERVISOR
  ├─ research_worker (web tools)
  ├─ analyst_worker  (code interpreter)
  └─ writer_worker   (no tools, just text)
```

**Evaluator-Optimizer loop**
Generator produces a draft. Evaluator scores it against criteria. If score < threshold, evaluator gives feedback and generator retries. Cap at 3 loops. Massive quality win on writing/code tasks.

**Router**
A cheap fast model classifies the incoming request and routes it to one of N specialist agents. Use this when you have a clear taxonomy (support ticket categories, content types). Don't use it when categories overlap.

**Pipeline (sequential workflow)**
Step 1 agent → Step 2 agent → Step 3 agent, no decisions between them. This is *not* really multi-agent — it's a workflow. Build it in n8n or as a script. Cheaper, faster, easier to debug.

## How to actually build one (without a heavy framework)

You don't need CrewAI or AutoGen on day one. A supervisor pattern in plain code:

```ts
async function supervisor(goal: string) {
  const plan = await llm({ system: SUPERVISOR_PROMPT, user: goal });
  // plan is JSON: [{ agent: "research", task: "..." }, ...]
  const results = await Promise.all(plan.tasks.map(t => workers[t.agent](t.task)));
  return llm({
    system: ASSEMBLER_PROMPT,
    user: `Goal: ${goal}\nResults:\n${JSON.stringify(results)}`,
  });
}
```

That's it. Every multi-agent framework is a fancier version of this.

## Cost and latency reality check

Each extra agent = at minimum one more LLM call. Two-agent systems are ~2x cost and latency of one-agent. Three-agent ~3x. Make sure the quality lift justifies the bill, especially at scale.

## Frameworks worth a look (when you outgrow plain code)

- **OpenAI Agents SDK** — official, clean handoff API
- **LangGraph** — state-machine model, great for complex flows
- **CrewAI** — opinionated, fast to prototype
- **Anthropic's MCP + Claude Skills** — for tool & capability sharing across agents

Try plain code first. Adopt a framework when you feel actual pain.$$,
$$1. Take an existing single-agent task and ask: "Would specialization or parallelism make this 2x better?" Most answers will be no.
2. For one task where the answer is yes, sketch a supervisor + 2 workers on paper before you write code.
3. Implement the supervisor pattern in ~50 lines (or in n8n with parallel branches if you don't code).
4. Compare cost and quality vs the single-agent version on your 10 evals. Keep whichever wins.$$,
6, 24),

('22222222-2222-2222-2222-000000000012','skills','Skills — packaging capability the agent loads on demand',
$$# Skills — packaging capability the agent loads on demand

Your agent's system prompt is getting long. You're stuffing in domain knowledge, output examples, edge-case rules, file-format specs. At ~6k tokens, the model starts forgetting earlier sections. At ~12k, it gets noticeably dumber. There's a better pattern: **skills**.

## What a skill is

A **skill** is a self-contained bundle the agent loads only when relevant. Think: a folder with a manifest, instructions, optional reference docs, and optional scripts. Anthropic formalized this with `SKILL.md`. The idea generalizes to any platform.

A minimal skill:

```
my-skill/
├── SKILL.md          # required: frontmatter + body
├── references/       # optional: docs the body links to
└── scripts/          # optional: copyable, runnable files
```

`SKILL.md` starts with frontmatter:

```
---
name: my-skill
description: One sentence. What the skill does, and when the agent should trigger it.
---
```

The **description** is the most important line. It's how the agent (or the platform's retrieval) decides whether to load this skill at all. Write it like a job posting headline, not a wiki summary.

## Why this beats one huge system prompt

- **Context stays small.** The base agent prompt is a thin router. Skills are pulled in only when matched.
- **Reusable across agents.** Three agents all need the "brand voice" skill? One skill file, three references.
- **Versionable.** Edit a skill, run evals, ship — without touching the base prompt.
- **Composable.** A complex task can trigger multiple skills.

## How skills work in each platform

- **Claude (claude.ai + Claude apps):** native `SKILL.md` format. You upload skills to your workspace; Claude loads them when the task matches the description. Lovable's own agent uses the same pattern.
- **ChatGPT Custom GPTs:** no formal "skill" object — but uploaded **Knowledge files** + good system prompt routing achieve the same thing. Name files descriptively; instruct the GPT to consult specific files for specific tasks.
- **Code (Claude/OpenAI SDK):** roll your own. A `skills/` folder, a simple matcher (keyword or embedding), and a step in your orchestrator that injects the matched skill bodies into the prompt before the LLM call.

## Anatomy of a good skill

1. **Frontmatter description** — when to trigger.
2. **Overview** — one paragraph: what this gives the agent.
3. **Procedure** — the steps to follow. Numbered. Specific.
4. **Examples** — at least one full input → output pair.
5. **References** (optional) — links to longer docs the agent reads on demand.
6. **Scripts** (optional) — runnable helpers (e.g. a JSON formatter, a PDF builder).

## Skills vs Tools vs Knowledge

- **Tool:** the agent *does* something (call API).
- **Knowledge:** the agent *reads* something static (a doc, an FAQ).
- **Skill:** the agent *knows how* to do a kind of task (procedure + the right tools + the right references, bundled).

You'll usually need all three.

## Writing your first skill

Pick something you keep retyping into the agent's prompt. Example: "How to format our weekly investor update." Move it out of the system prompt into `skills/investor-update/SKILL.md`. In the base prompt, add: *"If the user asks for an investor update or similar exec summary, load and follow the `investor-update` skill."*

Test. The base prompt is now shorter and the investor-update behavior is sharper.

## Anti-patterns

- **Skill that does five unrelated things.** Split it.
- **Vague description** ("helpful utilities"). The skill will never get loaded at the right time.
- **Skill > 2,000 words.** Move detail into `references/` and link from the body.
- **Hardcoding skills you only use once.** Just leave it in the prompt.$$,
$$1. Find the section of your current system prompt that's longest and most domain-specific. That's your first skill candidate.
2. Create `skills/<name>/SKILL.md` with frontmatter (name + description), an overview, a numbered procedure, and one worked example.
3. Replace that section of the system prompt with a one-line router: "If the user asks for X, load skill Y."
4. If you're on Claude.ai, upload the skill. If you're on ChatGPT, upload it as a Knowledge file and reference it by filename.
5. Re-run your evals. The score should hold or improve; the base prompt should be noticeably shorter.$$,
7, 22),

('22222222-2222-2222-2222-000000000012','evals-and-ship','Evals, observability, and shipping agents people pay for',
$$# Evals, observability, and shipping agents people pay for

Most agent projects die between "cool demo" and "reliable enough to charge for." This lesson is the bridge.

## Evals: the non-negotiable

An eval is a frozen list of inputs + the criteria the agent must satisfy. Run it after every change. Without this, you are guessing.

**The 10-task starter set.** Pick 10 inputs that cover:
- 5 happy-path examples
- 2 edge cases (ambiguous input, missing data)
- 2 adversarial (user asks for something out of scope)
- 1 known-bad (the agent should refuse or escalate)

For each, write down what "pass" looks like. Sometimes it's a regex match. Sometimes it's a checklist a human reviews. Sometimes it's another LLM acting as judge with a rubric.

**LLM-as-judge** (when human grading doesn't scale):

```
You are a strict grader. The agent was asked: <task>
The agent produced: <output>
Grade against these criteria: <list>
Return JSON: { score: 1-5, failures: [...], pass: boolean }
```

Use a cheap model for the judge. Run each eval 3x; take the mode.

## Observability

You need to see, for every run:
- The full message history (user, system, assistant, tool calls, tool results)
- Step count, token count, total cost
- Which tools were called and with what arguments
- Latency per step
- Whether evals passed

Tools that do this:
- **Langfuse, Helicone, Phoenix Arize** — open-source-friendly LLM observability
- **OpenAI Traces / Anthropic Console** — built-in for the respective APIs
- Or roll your own: log every LLM call to a Postgres table with `run_id`, `step`, `role`, `content`, `tokens`, `latency_ms`

You will not debug a misbehaving agent without traces. Period.

## The ship checklist

Before charging anyone for this agent:

- [ ] System prompt has all 5 sections (identity, SOP, tool policy, output contract, guardrails)
- [ ] Step budget enforced; agent never loops
- [ ] Every tool returns `success` + `error`; errors are written as hints
- [ ] Destructive tools have `dry_run` or approval gating
- [ ] 10-task eval set passes at ≥ 9/10
- [ ] Traces are saved for every run
- [ ] Cost per run is known, and < 20% of the price you charge
- [ ] One human can review the day's runs in under 5 minutes
- [ ] Failure path is friendly: a clear partial answer, not a stack trace
- [ ] You have a "kill switch" — turn the agent off without redeploying

## Pricing agents

Three models that work:
- **Per-run** ($X per brief, per ticket, per video). Clean. Easy to test demand.
- **Subscription with a quota** ($79/mo, 200 runs included). Predictable revenue.
- **Outcome-based** ($X per qualified lead). High trust required. Charge premium.

Avoid hourly billing for an agent that runs unattended. You're selling work done, not time.

## The version-1 hand-off

When you deliver an agent to a client (or to your future self):
1. A short README: what the agent does, what it does NOT do, how to turn it off.
2. The eval set + last run results.
3. A 1-page "if this breaks, here's where to look" runbook.
4. Access to traces.

That packaging is often what separates a $500 agent gig from a $5,000 one.

## Where to go from here

- **Productize:** wrap the agent in a simple form (n8n, Lovable, a Next.js route) so the client never sees the prompt.
- **Embed:** offer it as a feature inside an existing SaaS via API.
- **License:** sell the same agent + skills bundle to multiple clients in one niche.

You now have everything you need to build, evaluate, ship, and sell real AI agents. The lab won't grade you. The market will.$$,
$$1. Write your 10-task eval set in a Google Sheet with columns: input, criteria, last_pass, notes.
2. Add a simple logger — even a Postgres insert per LLM call — so you can review traces.
3. Run the ship checklist against your current agent. Note every unchecked box.
4. Decide your pricing model and write the one-page client README.
5. Show the agent to 5 people in the target niche. Note their first 3 objections. Fix the top one.$$,
8, 24);
