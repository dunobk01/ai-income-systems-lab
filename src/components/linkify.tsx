import React from "react";

export function Linkify({ text }: { text: string }) {
  const matches = Array.from(text.matchAll(/https?:\/\/[^\s)]+/g));
  if (!matches.length) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const m of matches) {
    const idx = m.index!;
    const raw = m[0];
    nodes.push(text.slice(cursor, idx));
    let url = raw;
    while (/[.,;:!?]$/.test(url)) url = url.slice(0, -1);
    nodes.push(
      <a
        key={idx}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[color:var(--brand)] hover:underline break-all"
      >
        {url}
      </a>
    );
    cursor = idx + url.length;
    // Handle trailing punctuation that was stripped
    if (url.length < raw.length) {
      nodes.push(raw.slice(url.length));
      cursor = idx + raw.length;
    }
  }
  nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
