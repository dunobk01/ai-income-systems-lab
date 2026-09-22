import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

/** Tool name badges connected by arrows showing data flowing left to right. */
export function ToolChain({ tools }: { tools: string[] }) {
  return (
    <Reveal className="my-8">
      <ol className="flex flex-wrap items-center gap-2">
        {tools.map((t, i) => (
          <li key={`${t}-${i}`} className="flex items-center gap-2">
            <span className="glass rounded-lg px-3 py-2 font-mono text-xs text-foreground/90">{t}</span>
            {i < tools.length - 1 && (
              <ArrowRight className="h-4 w-4 text-[color:var(--brand)]" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
