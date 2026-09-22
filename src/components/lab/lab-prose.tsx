import { Fragment, type ReactNode } from "react";
import { Linkify } from "@/components/linkify";
import { CodeBlock } from "./code-block";
import { MermaidDiagram } from "./mermaid-diagram";
import { PromptBlock } from "./prompt-block";
import { StepFlow, type Step } from "./step-flow";
import { BeforeAfter } from "./before-after";
import { StatTile, StatTileRow } from "./stat-tile";
import { ToolChain } from "./tool-chain";
import { ChecklistCard } from "./checklist-card";
import { Info, AlertTriangle, Lightbulb } from "lucide-react";

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function extractHeadings(content: string) {
  const out: { id: string; text: string }[] = [];
  let inFence = false;
  for (const line of (content ?? "").split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      out.push({ id: slugifyHeading(text), text });
    }
  }
  return out;
}

type Block =
  | { kind: "fence"; lang: string; body: string }
  | { kind: "text"; body: string };

function splitBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = (content ?? "").split("\n");
  let buffer: string[] = [];
  let fence: { lang: string; body: string[] } | null = null;

  const flushText = () => {
    const text = buffer.join("\n").trim();
    if (text) blocks.push({ kind: "text", body: text });
    buffer = [];
  };

  for (const line of lines) {
    const fenceMatch = line.trim().match(/^```([a-zA-Z0-9_-]*)\s*$/);
    if (fenceMatch) {
      if (fence) {
        blocks.push({ kind: "fence", lang: fence.lang, body: fence.body.join("\n") });
        fence = null;
      } else {
        flushText();
        fence = { lang: (fenceMatch[1] ?? "").toLowerCase(), body: [] };
      }
      continue;
    }
    if (fence) fence.body.push(line);
    else buffer.push(line);
  }
  if (fence) blocks.push({ kind: "fence", lang: fence.lang, body: fence.body.join("\n") });
  flushText();
  return blocks;
}

function parseJson<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

function renderFence(b: Extract<Block, { kind: "fence" }>, postSlug: string, key: number) {
  const body = b.body.trim();
  switch (b.lang) {
    case "mermaid":
      return <MermaidDiagram key={key} chart={body} />;
    case "prompt":
      return <PromptBlock key={key} prompt={body} />;
    case "stepflow": {
      const steps = parseJson<Step[]>(body);
      return steps ? <StepFlow key={key} steps={steps} /> : <CodeBlock key={key} code={body} lang="json" />;
    }
    case "beforeafter": {
      const d = parseJson<{ before: string[]; after: string[] }>(body);
      return d ? <BeforeAfter key={key} before={d.before} after={d.after} /> : <CodeBlock key={key} code={body} lang="json" />;
    }
    case "stats": {
      const d = parseJson<{ figure: string; label: string; sublabel?: string }[]>(body);
      return d ? (
        <StatTileRow key={key}>
          {d.map((s, i) => (
            <StatTile key={i} figure={s.figure} label={s.label} sublabel={s.sublabel} />
          ))}
        </StatTileRow>
      ) : (
        <CodeBlock key={key} code={body} lang="json" />
      );
    }
    case "toolchain": {
      const d = parseJson<string[]>(body);
      return d ? <ToolChain key={key} tools={d} /> : <CodeBlock key={key} code={body} lang="json" />;
    }
    case "checklist": {
      const d = parseJson<string[]>(body);
      return d ? <ChecklistCard key={key} postSlug={postSlug} items={d} /> : <CodeBlock key={key} code={body} lang="json" />;
    }
    default:
      return <CodeBlock key={key} code={body} lang={b.lang} />;
  }
}

const CALLOUTS: Record<string, { icon: typeof Info; color: string; label: string }> = {
  "NOTE:": { icon: Info, color: "var(--chart-3)", label: "Note" },
  "WARNING:": { icon: AlertTriangle, color: "var(--destructive)", label: "Warning" },
  "TRY THIS:": { icon: Lightbulb, color: "var(--brand)", label: "Try this" },
};

function renderTable(lines: string[], key: number) {
  const cells = (l: string) =>
    l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const header = cells(lines[0]!);
  const rows = lines.slice(2).map(cells);
  return (
    <div key={key} className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                className="border-b border-white/15 px-3 py-2 text-left font-display text-xs uppercase tracking-widest text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/5">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 align-top text-foreground/90">
                  <Linkify text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderTextBlock(raw: string, key: number): ReactNode {
  const block = raw.trim();
  const lines = block.split("\n").map((l) => l.trim());

  if (lines.length >= 2 && lines[0]!.includes("|") && /^\|?[\s:-]+\|/.test(lines[1]!)) {
    return renderTable(lines, key);
  }

  if (block.startsWith("### ")) {
    const t = block.slice(4);
    return (
      <h3 key={key} id={slugifyHeading(t)} className="pt-3 font-display text-xl font-bold tracking-tight">
        {t}
      </h3>
    );
  }
  if (block.startsWith("## ")) {
    const t = block.slice(3);
    return (
      <h2 key={key} id={slugifyHeading(t)} className="scroll-mt-24 pt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {t}
      </h2>
    );
  }
  if (block.startsWith("> ")) {
    const inner = block.replace(/^> ?/gm, "");
    const marker = Object.keys(CALLOUTS).find((m) => inner.toUpperCase().startsWith(m));
    if (marker) {
      const { icon: Icon, color, label } = CALLOUTS[marker]!;
      const text = inner.slice(marker.length).trim();
      return (
        <div
          key={key}
          className="my-6 rounded-xl border p-4"
          style={{ borderColor: `color-mix(in oklch, ${color} 45%, transparent)`, background: `color-mix(in oklch, ${color} 8%, transparent)` }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
            <Linkify text={text} />
          </p>
        </div>
      );
    }
    return (
      <blockquote key={key} className="border-l-2 border-[color:var(--brand-2)]/50 pl-4 italic text-muted-foreground">
        <Linkify text={inner} />
      </blockquote>
    );
  }

  if (lines.every((l) => /^[-•*]\s+/.test(l))) {
    return (
      <ul key={key} className="list-disc space-y-2 pl-5 marker:text-[color:var(--brand-2)]">
        {lines.map((l, j) => (
          <li key={j}>
            <Linkify text={l.replace(/^[-•*]\s+/, "")} />
          </li>
        ))}
      </ul>
    );
  }
  if (lines.every((l) => /^\d+\.\s+/.test(l))) {
    return (
      <ol key={key} className="list-decimal space-y-2 pl-5 marker:text-[color:var(--brand-2)]">
        {lines.map((l, j) => (
          <li key={j}>
            <Linkify text={l.replace(/^\d+\.\s+/, "")} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p key={key} className="whitespace-pre-wrap">
      <Linkify text={block} />
    </p>
  );
}

export function LabProse({
  content,
  postSlug,
  midSlot,
}: {
  content: string;
  postSlug: string;
  midSlot?: ReactNode;
}) {
  const blocks = splitBlocks(content);
  const midpoint = Math.floor(blocks.length / 2);
  let insertAt = -1;
  if (midSlot && blocks.length >= 4) {
    insertAt = blocks.findIndex(
      (b, i) => i >= midpoint && b.kind === "text" && b.body.trim().startsWith("## "),
    );
    if (insertAt === -1) insertAt = midpoint;
  }

  let n = 0;
  return (
    <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground/90">
      {blocks.map((b, i) => (
        <Fragment key={i}>
          {i === insertAt ? midSlot : null}
          {b.kind === "fence" ? renderFence(b, postSlug, n++) : renderTextBlock(b.body, n++)}
        </Fragment>
      ))}
    </div>
  );
}
