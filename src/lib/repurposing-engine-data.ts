/** Template engine for the Content Repurposing Engine. Deterministic, no AI call. */

export type RepurposeInput = {
  content: string;
  angle: string;
};

export type Repurposed = {
  sourceTitle: string;
  keyPoints: string[];
  pinterest: { title: string; description: string }[];
  videoScripts: { title: string; hook: string; beats: string[]; cta: string }[];
  socialPosts: { platform: string; text: string }[];
  email: { subject: string; body: string };
  carousel: { slide: number; text: string }[];
  seoDescription: string;
  ctas: string[];
};

const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "to", "of", "in", "on",
  "for", "with", "that", "this", "it", "as", "at", "by", "from", "be", "have", "has", "you",
  "your", "we", "i", "my", "they", "their", "if", "not", "will", "can", "do", "don't",
]);

function keywords(text: string, n: number): string[] {
  const freq = new Map<string, number>();
  for (const w of text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
    if (w.length < 4 || STOP.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function repurpose(input: RepurposeInput): Repurposed {
  const text = input.content.trim();
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const sourceTitle = (lines[0] || "Your content").replace(/^#+\s*/, "").slice(0, 80);
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 220);
  const kws = keywords(text, 5);
  const topic = kws[0] ? cap(kws[0]) : "this topic";
  const topic2 = kws[1] ? cap(kws[1]) : "results";
  const angle = input.angle.trim() || "small business owners";

  const keyPoints = sentences.slice(0, 4).map((s) => s.slice(0, 140));

  return {
    sourceTitle,
    keyPoints,
    pinterest: [
      {
        title: `${sourceTitle.split(":")[0].slice(0, 60)}`.trim() || `${topic} tips that actually work`,
        description: `The key ideas from our guide on ${kws[0] ?? "getting started"} — plus what to do first. ${kws.slice(0, 3).join(" ")}`.slice(0, 480),
      },
      {
        title: `${topic} mistakes to avoid (and what to do instead)`,
        description: `If you're working on ${kws[1] ?? "your business"}, these are the mistakes that cost the most time. Saved from our full guide.`.slice(0, 480),
      },
      {
        title: `Save this: ${topic} checklist`,
        description: `A simple starting point for ${angle}. Full breakdown on the site — link in pin.`.slice(0, 480),
      },
    ],
    videoScripts: [
      {
        title: "30-second tip video",
        hook: `Most people get ${topic.toLowerCase()} wrong in the first five minutes.`,
        beats: [
          `Hook (0–3s): "${`Most people get ${topic.toLowerCase()} wrong in the first five minutes.`}" — say it to camera, no intro.`,
          `Point (3–15s): "${keyPoints[0] ?? `The one change that matters with ${topic.toLowerCase()}`}" — cut any filler words.`,
          `Proof (15–25s): "${keyPoints[1] ?? 'Show the before/after on screen'}" — show, don't tell.`,
          `Close (25–30s): "Full guide is on my site — link in bio."`,
        ],
        cta: "Full guide is on my site — link in bio.",
      },
      {
        title: "60-second myth-buster",
        hook: `Stop doing this if you're serious about ${topic2.toLowerCase()}.`,
        beats: [
          `Hook (0–3s): "Stop doing this if you're serious about ${topic2.toLowerCase()}."`,
          `Myth (3–18s): State the common advice, then why it fails for ${angle}.`,
          `Fix (18–45s): "${keyPoints[2] ?? keyPoints[0] ?? `The simpler approach that works`}" — one clear step, shown on screen.`,
          `Recap (45–60s): Repeat the one-step fix, then: "Save this one — you'll need it."`,
        ],
        cta: "Save this one — you'll need it.",
      },
    ],
    socialPosts: [
      {
        platform: "Facebook — story post",
        text: `${sourceTitle}.\n\nHere's the part nobody tells you: ${keyPoints[0] ?? `the basics of ${topic.toLowerCase()} matter more than the advanced tactics`}.\n\nI wrote the full breakdown here (no email needed to read it): [LINK]`,
      },
      {
        platform: "Facebook — tip post",
        text: `One thing I'd tell anyone starting with ${topic.toLowerCase()}:\n\n${keyPoints[1] ?? "Pick one small thing and finish it today."}\n\nThat's it. The rest gets easier once the first thing is done. Full guide in the comments.`,
      },
      {
        platform: "Facebook — discussion post",
        text: `Quick question for ${angle}: what's the single biggest thing slowing you down with ${topic.toLowerCase()} right now?\n\nAsking because I'm putting together the next guide and I want to solve the real problem, not the obvious one.`,
      },
    ],
    email: {
      subject: `${sourceTitle.split(":")[0].slice(0, 50)}`,
      body: `Hey —\n\n${keyPoints[0] ?? `Quick note today about ${topic.toLowerCase()}.`}\n\n${keyPoints[1] ?? "The short version: one small finished thing beats a month of planning."}\n\nIf you want the full walkthrough, it's here:\n[LINK]\n\nReply and tell me which part hit hardest — I read everything.\n\n— [Your name]`,
    },
    carousel: [
      { slide: 1, text: `Cover: ${sourceTitle}` },
      { slide: 2, text: keyPoints[0] ?? "Start with the smallest useful step." },
      { slide: 3, text: keyPoints[1] ?? "Finish it today, not someday." },
      { slide: 4, text: keyPoints[2] ?? "Consistency beats intensity." },
      { slide: 5, text: keyPoints[3] ?? "Track what actually happens." },
      { slide: 6, text: "Save this + follow for practical breakdowns." },
    ],
    seoDescription: `${cap(sourceTitle.replace(/^(#+\s*)/, ""))} — a practical guide for ${angle}. ${kws.slice(0, 4).join(", ")}. No fluff, just what works.`.slice(0, 155),
    ctas: [
      "Read the full guide — link in bio / comments.",
      "Want the step-by-step version? It's on the site — free.",
      "Save this for when you actually do the thing.",
    ],
  };
}
