/** Template engine for the Lead-Magnet Generator. Deterministic, no AI call. */

export type LeadMagnetInput = {
  niche: string;
  audience: string;
  offer: string;
};

export type LeadMagnet = {
  concepts: { name: string; type: string; why: string }[];
  chosen: string;
  outline: { heading: string; points: string[] }[];
  content: { heading: string; body: string }[];
  landingCopy: { headline: string; subhead: string; bullets: string[]; cta: string };
  thankyouCopy: { headline: string; body: string; nextStep: string };
  emails: { subject: string; preview: string; body: string }[];
};

const nicheOf = (i: LeadMagnetInput) => i.niche.trim() || "your niche";
const audOf = (i: LeadMagnetInput) => i.audience.trim() || "your audience";
const offerOf = (i: LeadMagnetInput) => i.offer.trim() || "your paid offer";

export function generateLeadMagnet(input: LeadMagnetInput): LeadMagnet {
  const niche = nicheOf(input);
  const aud = audOf(input);
  const offer = offerOf(input);
  const A = niche.charAt(0).toUpperCase() + niche.slice(1);

  return {
    concepts: [
      {
        name: `The ${A} Starter Checklist`,
        type: "Checklist (1–2 pages)",
        why: "Fastest to build, easiest to say yes to. Promises one clear outcome: nothing gets missed.",
      },
      {
        name: `The 5 Mistakes ${A.charAt(0).toUpperCase() + niche.slice(1).replace(/^\w/, (c) => c.toUpperCase())} Guide`,
        type: "Short guide (4–6 pages)",
        why: "Mistake-framing works because your audience already fears making them — the title pre-sells itself.",
      },
      {
        name: `The ${A} Templates Pack`,
        type: "Template pack (3–5 fill-in templates)",
        why: "Templates get used, and used freebies create the feeling of value that makes the paid offer an easy next step.",
      },
    ],
    chosen: "The 5 Mistakes Guide — the best mix of perceived value and build effort for most audiences.",
    outline: [
      {
        heading: "Cover + Promise",
        points: [
          `Title: The 5 Mistakes ${aud} Make With ${niche} (And the 10-Minute Fix for Each)`,
          "One-line promise under the title: what they'll be able to do after reading",
          "Your one-line credibility note (who you are, why you built this)",
        ],
      },
      {
        heading: "The 5 Mistakes — one per page",
        points: [
          "Name the mistake in the reader's words, not the expert's words",
          "A 2-sentence story of what it costs them (time, money, frustration)",
          "The fix: 3–5 numbered steps they can do today",
          "A checkbox at the end of each page: 'Done? ✓'",
        ],
      },
      {
        heading: "Next Step (the bridge to your offer)",
        points: [
          `One paragraph: doing all five by hand works, but this is exactly what ${offer} does for you`,
          "A single link to your offer — no button clutter, no second CTA",
        ],
      },
    ],
    content: [
      {
        heading: "Mistake 1 — Trying to do everything before doing anything",
        body: `Most ${aud} wait until they feel ready to start with ${niche}. Ready never comes. The fix: pick the single smallest useful action — one page, one post, one offer — and finish it today. In this guide, each mistake ends with steps you can complete in under ten minutes, and the checklist at the end keeps you moving.`,
      },
      {
        heading: "Mistake 2 — Copying what big players do",
        body: `The advice that works for a company with a team and a budget will bury a beginner. Instead, model their direction, not their execution: what they promise, not how they deliver it. Then do the small, personal version a big player can't: reply to every message, ship in a week, talk to your first ten ${aud.replace(/s$/, "")}s directly.`,
      },
      {
        heading: "Mistake 3 — Building the offer before the audience",
        body: `A finished product with no audience feels like failure, but it's just sequencing. Reverse it: share what you're learning while you build ${niche} skills. The people who respond become your first buyers — and they'll tell you what ${offer} should include before you've finished building it.`,
      },
      {
        heading: "Mistake 4 — Underpricing to feel safe",
        body: `A $5 price doesn't attract more buyers; it attracts fewer serious ones. Price at the level a real result is worth, keep your first version small, and let quality — not a discount — carry the sale. If ten people see your offer and nobody buys, the fix is the promise or the audience, almost never the price.`,
      },
      {
        heading: "Mistake 5 — Stopping after launch week",
        body: `Most people promote for three days and go quiet. The compounding wins come from boring consistency: one useful post a week, one email a week, one check-in with past customers a month. Six weeks of that beats any launch spike.`,
      },
    ],
    landingCopy: {
      headline: `The 5 Mistakes ${aud.charAt(0).toUpperCase() + aud.slice(1)} Make With ${A} — Free Guide`,
      subhead: `Ten minutes from now you'll know exactly what to fix first — and what to stop wasting time on.`,
      bullets: [
        "The 5 mistakes that quietly cost beginners the most (and the 10-minute fix for each)",
        "A one-page checklist so you can act as you read",
        "The exact next step to take after the guide — no guessing",
        `Written for ${aud}, not for experts`,
        "Instant download — no waiting, delivered to your email too",
      ],
      cta: "Send me the free guide",
    },
    thankyouCopy: {
      headline: "Your guide is ready — check your inbox",
      body: `It's on its way to your email right now. While you wait: the guide ends with one recommended next step. If you want to skip ahead, that step is ${offer} — built for exactly the problems this guide uncovers.`,
      nextStep: "Open the guide, do Mistake 1's fix today, and reply to my first email with your biggest sticking point — I read every reply.",
    },
    emails: [
      {
        subject: `Your ${A} guide is here (open + do step 1 today)`,
        preview: "The guide, plus the one thing to do first",
        body: `Here's your guide: [DOWNLOAD LINK]\n\nStart with Mistake 1 — its fix takes ten minutes and makes the rest easier.\n\nOver the next few days I'll send you the pieces most ${aud} miss. Nothing to buy; just reply if you have questions.\n\n— [Your name]`,
      },
      {
        subject: `Why I almost quit ${niche}`,
        preview: "The mistake that cost me six months",
        body: `When I started with ${niche}, I made Mistake 2 from the guide — copying people three sizes bigger than me. It cost me months.\n\nWhat actually worked was embarrassingly small: doing the personal, direct version the big players can't.\n\nThat experience is why I built ${offer}. If the guide resonated, it's worth a look: [LINK]\n\n— [Your name]`,
      },
      {
        subject: "The mistake nobody admits to",
        preview: "Mistake 4 in real life",
        body: `Quick story: I once dropped a price to $5 and got... silence. The problem was never the price — it was a vague promise pointed at the wrong people.\n\nThat's Mistake 4 in the guide. Re-read that page, then apply the same test to whatever you're building right now.\n\nIf the promise needs work, ${offer} walks through it step by step: [LINK]\n\n— [Your name]`,
      },
      {
        subject: `A shortcut for ${aud}`,
        preview: "If you want to skip the trial and error",
        body: `Everything in the guide, you can do by hand. It just takes longer.\n\n${offer} is the done-for-you version: [ONE-LINE WHAT IT IS AND THE RESULT]\n\nIf you're ready, it's here: [LINK]\n\nEither way — keep going. The guide plus consistency is enough.\n\n— [Your name]`,
      },
      {
        subject: "Last one from me (the guide, one more time)",
        preview: "Closing the loop",
        body: `Last note in this series. If you've been meaning to act on the guide, do Mistake 1's ten-minute fix today — momentum is the whole game.\n\nAnd if you want the shortcut: ${offer} → [LINK]\n\nI'll keep sending practical ${niche} emails now and then. Hit reply anytime — real person here.\n\n— [Your name]`,
      },
    ],
  };
}
