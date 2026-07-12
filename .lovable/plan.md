# Improvement Batch: Items 1, 5, 6, 7, 8, 9, 11, 12, 13

## 1. Exit-intent lead capture
- New component `src/components/exit-intent-modal.tsx` — listens for `mouseleave` toward top of viewport (desktop) and 30s inactivity + scroll-up (mobile fallback).
- Offers the Starter Kit PDF; reuses existing `leads.functions.ts` `captureLead`.
- Session-storage flag `exitIntentShown` so it fires once per session.
- Mount on `/pricing`, `/blog`, `/guides`, `/blog/$slug`, `/guides/$slug`. Skip when user is authenticated.

## 5. Programmatic comparison pages
- New routes: `src/routes/vs.skool.tsx`, `src/routes/vs.mighty-networks.tsx`, `src/routes/vs.circle.tsx`.
- Shared component `src/components/comparison-page.tsx` with hero, feature comparison table, "why we win" section, testimonial slot, pricing CTA.
- Each page gets unique title/description/OG + `Product` + `FAQPage` JSON-LD.
- Add all three to `sitemap.xml.ts`.

## 6. Internal linking — related guides
- New helper `getRelatedPosts(slug, pillarSlug, tags)` in `blog.functions.ts` — returns up to 3 posts matching pillar OR overlapping tags, excluding current.
- Render "Related guides" block at bottom of `blog.$slug.tsx` (if it exists — will check) and `guides.$slug.tsx`.
- Also add pillar-cross-link block to `newsletter.$slug.tsx`.

## 7. FAQ schema
- Extract existing FAQ Q&A on `/faq` and `/pricing` into a shared array.
- Emit `FAQPage` JSON-LD via `head()` scripts on both routes.

## 8. Image alt audit
- Grep for `<img`, `alt=""`, missing `alt`, and generic strings ("image", "photo").
- Fix hero, OG, avatar, and content images with descriptive alt.

## 9. Onboarding checklist on /dashboard
- New component `src/components/onboarding-checklist.tsx`.
- Steps: (a) Complete profile (display_name + avatar), (b) Post first Win, (c) Complete first lesson, (d) Join The Lab (first community post).
- Query existing tables: `profiles`, `wins`, `lesson_progress`, `community_posts`.
- Dismissible; stores dismissal in `profiles.onboarding_dismissed_at` (new column via migration).
- Auto-hides when all 4 complete.

## 11. Course progress persistence check
- Read `_authenticated/course.$moduleSlug.$lessonSlug.tsx` and verify `lesson_progress` is upserted on completion (not just view).
- If missing/wrong, add explicit "Mark complete" button that writes `completed_at`.

## 12. Referral system
- Migration: add `referral_code` (unique) and `referred_by` (uuid) to `profiles`; generate code in `handle_new_user()` trigger.
- Track `?ref=CODE` on landing routes → sessionStorage → attach to signup → write `referred_by` on profile.
- New `/settings` section: "Your referral link" with copy button + count of referrals.
- Reward mechanic (free month) will require Stripe coupon logic — I'll ship the tracking + display first, and note the coupon step for follow-up so it doesn't block the batch.

## 13. CSP headers
- Add CSP `<meta http-equiv="Content-Security-Policy">` in `__root.tsx` head — starts as report-only style but enforcing (script-src 'self' + Stripe + Pinterest + TikTok + GA + Lovable domains; img-src 'self' data: https:; connect-src 'self' + Supabase + Stripe + analytics).
- Include `frame-src` for Stripe embedded checkout.
- Verify checkout, analytics tags, and auth still work after applying.

## Also (quiet fix)
- Runtime hydration error on `/blog` — file changed between SSR and hydration. Will reload/verify.

## Tech notes
- All new routes ship with `head()` metadata + canonical + OG per `head-meta` rules.
- Referral tracking uses existing `handle_new_user` trigger extension, avoiding a separate write path.
- CSP list will be tuned against actual network requests observed on the site (Stripe, Supabase, Pinterest tag, TikTok pixel, GA4, Lovable analytics).

## Order of execution (parallel where possible)
1. Migration (referral + onboarding_dismissed_at column)
2. New files (comparison pages, exit-intent, onboarding, referral display) in parallel
3. Edits to existing routes (FAQ schema, related guides, alt audit, CSP, sitemap)
4. Verify build + smoke-test checkout under CSP

Estimated ~15-20 file writes/edits. Ready to execute on approval.