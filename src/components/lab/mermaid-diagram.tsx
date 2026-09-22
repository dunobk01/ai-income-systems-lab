import { useEffect, useRef, useState } from "react";

let idCounter = 0;

/** Mermaid is loaded from a CDN at runtime so it never enters the app bundle. */
const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

/** Renders a mermaid code fence as a real diagram. Client-only, loaded on demand. */
export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const mermaid = (await import(/* @vite-ignore */ MERMAID_URL)).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "transparent",
            primaryColor: "#241f14",
            primaryTextColor: "#f5f3ee",
            primaryBorderColor: "#d2b264",
            lineColor: "#d2b264",
            fontFamily: "DM Sans, sans-serif",
          },
        });
        const { svg } = await mermaid.render(`lab-mermaid-${++idCounter}`, chart);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (failed) {
    return (
      <pre className="glass my-6 overflow-x-auto rounded-xl p-4 font-mono text-[13px]">{chart}</pre>
    );
  }
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Diagram of the workflow described in this section"
      className="glass my-6 overflow-x-auto rounded-xl p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
    />
  );
}
