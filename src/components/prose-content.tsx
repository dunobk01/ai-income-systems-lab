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
export function ProseContent({ content }: { content: string }) {
  const blocks = (content ?? "").split(/\n{2,}/).filter((b) => b.trim().length > 0);

  return (
    <div className="mt-10 text-base leading-relaxed text-foreground/90 space-y-5">
      {blocks.map((raw, i) => {
        const block = raw.trim();

        if (block.startsWith("### ")) {
          return (
            <h3 key={i} className="pt-3 text-xl font-bold tracking-tight text-foreground">
              {block.slice(4)}
            </h3>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {block.slice(3)}
            </h2>
          );
        }
        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-[color:var(--brand-2)]/50 pl-4 italic text-muted-foreground"
            >
              <Linkify text={block.replace(/^> ?/gm, "")} />
            </blockquote>
          );
        }

        const lines = block.split("\n").map((l) => l.trim());
        if (lines.every((l) => /^[-•]\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-2 marker:text-[color:var(--brand-2)]">
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
            <ol key={i} className="list-decimal pl-5 space-y-2 marker:text-[color:var(--brand-2)]">
              {lines.map((l, j) => (
                <li key={j}>
                  <Linkify text={l.replace(/^\d+\.\s+/, "")} />
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap">
            <Linkify text={block} />
          </p>
        );
      })}
    </div>
  );
}
