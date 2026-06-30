INSERT INTO public.lessons (module_id, slug, title, order_index, duration_minutes, content, action_steps)
VALUES (
  '22222222-2222-2222-2222-000000000007',
  'ai-video-and-image-creative',
  'AI video & image creative for faceless content and ads',
  8,
  22,
$MD$
## Why this lesson exists

You can have the best offer in the world, but if your **creative** (the video, the thumbnail, the ad image) doesn't stop the scroll, no one will ever see it. Faceless video + AI image generation is the unlock — you can ship a week of TikToks, Reels, YouTube Shorts, and paid ads in an afternoon, with **zero on-camera time**.

This lesson goes deep on the full stack: scripting, voice, visuals, motion, editing, and the exact tools that win for each job in 2026.

---

## Part 1 — The faceless video stack

A faceless video has 5 layers. Get each one right and you have a piece of content that performs.

| Layer | Job | Best tools (2026) |
|---|---|---|
| **Script** | The hook + payoff in 30–90s | ChatGPT, Claude, Perplexity (research) |
| **Voice** | Human-sounding narration | ElevenLabs, OpenAI TTS, PlayHT |
| **B-roll / visuals** | What's on screen | Sora 2, Runway Gen-4, Kling 2, Pika, Veo 3, Pexels (stock) |
| **Motion / editing** | Cuts, captions, zooms | CapCut, Descript, Opus Clip, Submagic |
| **Distribution** | Posting + analytics | Metricool, Buffer, Later, native schedulers |

### 1. The script (this is 80% of the win)

Faceless content lives or dies on the **first 3 seconds**. Use this prompt:

> You are a short-form video scriptwriter. Write a 45-second faceless video script for [TOPIC]. Audience: [WHO]. Format: hook (3s) → context (5s) → 3 punchy points (10s each) → CTA (4s). Use 2nd person. No fluff. Each line under 12 words. Output as numbered scenes with on-screen text suggestions and b-roll cues in brackets.

Run the same brief in **ChatGPT (GPT-5)** and **Claude (Sonnet 4.5)** and pick the better hook. They genuinely write differently.

### 2. The voice

- **ElevenLabs** — still the gold standard. Use the "Eleven v3" model + a custom cloned voice or one of the curated library voices (Adam, Rachel, Bill). Add SSML `<break time="0.4s"/>` tags for natural pauses.
- **OpenAI TTS HD** — cheaper, very good, less emotional range. Great for explainer content.
- **PlayHT** — best for long-form (podcasts, YouTube essays).

Pro move: generate the voice **first**, then time your visuals to it. Never do it the other way.

### 3. The visuals — AI video models compared

| Model | Best for | Length | Strengths | Weaknesses |
|---|---|---|---|---|
| **Sora 2** | Realistic scenes, people, complex prompts | up to 20s | Physics, lighting, faces | Pricey, slower |
| **Runway Gen-4** | Cinematic b-roll, image-to-video | 10s | Camera control, consistency | Costs credits fast |
| **Kling 2.1** | Action, motion, anime, fight scenes | 10s | Wild creativity, cheap | Less photoreal |
| **Veo 3** | Long takes, sound-included clips | 8s | Native audio, great prompt adherence | Google ecosystem only |
| **Pika 2.2** | Quick social b-roll, effects | 10s | Speed, ingredients feature | Lower fidelity |
| **Hailuo 02** | Free-tier explorer | 6s | Free credits, decent quality | Watermarked |

**Workflow that works:**
1. Generate 3–4 reference images in Midjourney or GPT-Image-2 (consistent style + character).
2. Feed each image into Runway/Kling as **image-to-video** with a motion prompt ("slow dolly in, soft camera shake").
3. Stitch the 6–10s clips together in CapCut, cut to the voiceover beat.

### 4. The edit (where mediocre becomes scroll-stopping)

- **CapCut** — free, fast, has auto-captions, beat sync, and AI b-roll suggestions. Default tool.
- **Submagic** — best AI captions on the market. Emoji, word-by-word highlight, b-roll suggestion. ~$20/mo.
- **Opus Clip** — paste a long YouTube video, get 10 viral shorts auto-cut with captions and virality scores.
- **Descript** — edit video by editing the transcript. Best for talking-head + b-roll hybrids.

**Caption rules that 10x retention:**
- 2–4 words per frame, never more.
- Highlight the key word in yellow or your brand color.
- Place captions in the **upper third** for TikTok (the bottom is covered by UI).

### 5. Distribution

- Repost the **same** video to TikTok, Reels, Shorts, LinkedIn, Pinterest, X. Reformat captions to fit each.
- Post 3–5x per day for the first 30 days on at least one platform. Volume builds the algorithm signal.
- Use Metricool or Buffer to schedule. Native first if you can — algorithms favor it.

---

## Part 2 — AI image generation for ads & posts

For static creative (carousels, ad images, thumbnails, Pinterest pins), image gen is your unfair advantage.

### Tool comparison (2026)

| Tool | Best for | Notes |
|---|---|---|
| **GPT-Image-2** (in ChatGPT) | Ads with text on them, accurate typography | The only model that reliably renders legible words. Use for headlines on ad creative. |
| **Midjourney v7** | Premium aesthetic, mood, art direction | Use `--sref` for consistent brand style across all assets. |
| **Flux 1.1 Pro Ultra** | Photorealistic product shots | Best skin/material rendering. Cheap on Replicate. |
| **Nano Banana (Gemini 3 Image)** | Edits, character consistency | Best image editor right now — change one element, keep everything else. |
| **Ideogram 3** | Logos, text-heavy posters | Strong typography, free tier. |
| **Recraft v3** | Vector + brand systems | Generate SVG assets directly. |

### The "5-asset pack" workflow

For any new offer, generate this set in one sitting:

1. **3 ad images** (1:1 for Meta, 9:16 for Reels/TikTok, 1.91:1 for LinkedIn)
2. **3 Pinterest pins** (1000×1500, text-heavy)
3. **1 hero / OG image** (1200×630)
4. **1 thumbnail** for YouTube/Shorts (1280×720, big face or emoji)
5. **1 carousel set** (5–10 slides, 1:1)

Use **GPT-Image-2** when the image needs words on it. Use **Midjourney + Nano Banana** when it's pure aesthetic + edits.

### Prompt template for high-converting ad images

```
Editorial-style social ad. Subject: [SUBJECT].
Composition: [center / rule-of-thirds / negative space top-right for headline].
Style: [bold flat color / cinematic photo / collage / 3D render].
Color palette: [hex 1], [hex 2], [hex 3].
Mood: [confident / urgent / aspirational / playful].
Headline text on image (exact, render legibly): "[YOUR HEADLINE — under 6 words]".
Aspect ratio: [1:1 / 9:16 / 1.91:1].
No watermark. No people unless specified.
```

Run this in GPT-Image-2 with **quality: high** for production assets, **medium** for tests.

### Character + brand consistency (the hardest problem)

Three ways to keep your "AI creator" looking the same across 50 posts:

1. **Midjourney `--sref` + `--cref`** — paste a seed image URL after your prompt; the model locks aesthetic + character.
2. **Nano Banana editing** — generate the base, then **edit** ("same person, blue jacket, in a coffee shop") instead of regenerating.
3. **Train a LoRA on Replicate** — upload 15–20 images of your character/brand, train a custom model for ~$3, use it forever. This is the pro move.

---

## Part 3 — Putting it together: a faceless content system

A real, repeatable weekly system (4 hours/week):

**Monday — Plan (30 min)**
- ChatGPT: "Give me 10 hook ideas for [niche] this week, based on trending topics from [Perplexity search]."
- Pick the 5 strongest.

**Tuesday — Script + voice (60 min)**
- Write 5 scripts in Claude with the prompt above.
- Generate all 5 voiceovers in ElevenLabs in one batch.

**Wednesday — Visuals (90 min)**
- Generate 4–6 b-roll clips per script in Runway + Kling.
- Generate any needed images in GPT-Image-2 / Midjourney.

**Thursday — Edit (60 min)**
- Assemble in CapCut, add captions in Submagic.
- Export 5 videos in 9:16 + 1:1.

**Friday — Schedule (20 min)**
- Drop into Metricool — 5 posts × 4 platforms = 20 pieces of content for the week.

That's **20 posts/week** from one person, no camera, no editor.

---

## Part 4 — The traps to avoid

1. **Don't chase every new model.** Pick 2 video tools and 2 image tools and learn them deeply. The output is 90% prompt quality, 10% model.
2. **Don't post raw AI video.** Always layer a voiceover, captions, and 2–3 cuts. Raw clips read as slop.
3. **Don't ignore the hook.** If the first 1.5 seconds doesn't stop the scroll, the other 28.5 don't matter.
4. **Don't fake faces of real people.** Beyond the ethics, every platform now detects and demotes it.
5. **Don't pay for everything.** ElevenLabs free tier + Kling free credits + CapCut free + GPT-Image-2 (already in your ChatGPT sub) gets you to 80% with $0 in new spend.

---

## Toolstack cheat sheet

- **Script:** ChatGPT (GPT-5) + Claude (Sonnet 4.5)
- **Voice:** ElevenLabs (v3)
- **Video gen:** Runway Gen-4 + Kling 2.1 (use both, pick the better take)
- **Image gen:** GPT-Image-2 (text on image) + Midjourney v7 (aesthetic) + Nano Banana (edits)
- **Edit:** CapCut + Submagic
- **Repurpose:** Opus Clip (long → short)
- **Schedule:** Metricool

Master these eight and you can run a faceless content brand at agency scale, solo.
$MD$,
$STEPS$
1. Pick a niche or product you want to make a faceless video for.
2. Write your first 45-second script using the prompt template above in ChatGPT or Claude.
3. Generate the voiceover in ElevenLabs (use the free tier — 10,000 chars/month is plenty).
4. Open Runway or Kling and generate 4 b-roll clips at 9:16, ~6 seconds each.
5. Use GPT-Image-2 to create one matching ad image with your headline rendered on it.
6. Import everything into CapCut, time visuals to the voiceover, add captions with Submagic.
7. Export 9:16 + 1:1 versions and schedule across TikTok, Reels, and Shorts.
8. Save your final tool stack (model + settings) so next week's production takes half the time.
$STEPS$
);