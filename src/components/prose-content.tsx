import { Fragment, type ReactNode } from "react";
import { Linkify } from "./linkify";

/**
 * Renders stored post content. Blocks are separated by blank lines.
 * Supports a small, safe subset of markdown so posts get a real heading
 * hierarchy (important for SEO and screen readers) instead of a wall of <p>.
 *
 * - "## Heading"  -> <h2>
 * - "### Heading" -> <h3>
 * - "- item" lines (a whole block) -> <ul>
 * - "1. item" lines (a whole block) -> <ol>
 * - "> quote" -> <blockquote>
 * - anything else -> <p>
 */
function renderProseBlock(raw: string) {
  const block = raw.trim();

  if (block.startsWith("### ")) {
    return (
      <h3 className="pt-3 text-xl font-bold tracking-tight text-foreground">{block.slice(4)}</h3>
    );
  }
  if (block.startsWith("## ")) {
    return (
      <h2 className="pt-5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {block.slice(3)}
      </h2>
    );
  }
  if (block.startsWith("> ")) {
    return (
      <blockquote className="border-l-2 border-[color:var(--brand-2)]/50 pl-4 italic text-muted-foreground">
        <Linkify text={block.replace(/^> ?/gm, "")} />
      </blockquote>
    );
  }

  const lines = block.split("\n").map((l) => l.trim());
  if (lines.every((l) => /^[-•]\s+/.test(l))) {
    return (
      <ul className="list-disc pl-5 space-y-2 marker:text-[color:var(--brand-2)]">
        {lines.map((l, j) => (
          <li key={j}>
            <Linkify text={l.replace(/^[-•]\s+/, "")} />
          </li>
        ))}
      </ul>
    );
  }
  if (lines.every((l) => /^\d+\.\s+/.test(l))) {
    return (
      <ol className="list-decimal pl-5 space-y-2 marker:text-[color:var(--brand-2)]">
        {lines.map((l, j) => (
          <li key={j}>
            <Linkify text={l.replace(/^\d+\.\s+/, "")} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p className="whitespace-pre-wrap">
      <Linkify text={block} />
    </p>
  );
}

export function ProseContent({
  content,
  midSlot,
}: {
  content: string;
  /** Optional element dropped mid-article, at the closest heading to the middle. */
  midSlot?: ReactNode;
}) {
  const blocks = (content ?? "").split(/\n{2,}/).filter((b) => b.trim().length > 0);
  const midpoint = Math.floor(blocks.length / 2);
  let insertAt = -1;
  if (midSlot && blocks.length >= 4) {
    insertAt = blocks.findIndex((b, i) => i >= midpoint && b.trim().startsWith("## "));
    if (insertAt === -1) insertAt = midpoint;
  }

  return (
    <div className="mt-10 text-base leading-relaxed text-foreground/90 space-y-5">
      {blocks.map((raw, i) => (
        <Fragment key={i}>
          {i === insertAt ? midSlot : null}
          {renderProseBlock(raw)}
        </Fragment>
      ))}
    </div>
  );
}
