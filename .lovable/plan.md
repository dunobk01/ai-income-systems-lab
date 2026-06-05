# All-Access Monthly — Implementation Plan

## 1. Stripe product

Create recurring price `ailab_monthly_subscription` — $14.99/mo USD, single quantity, on existing "AI Income Systems Lab" product family (new product `ailab_monthly`). Tax code `txcd_10000000` (digital goods).

## 2. Database

Migration:
- `ALTER TYPE subscription_tier ADD VALUE 'monthly'` (between 'none' and 'starter' for tier_rank).
- Update `tier_rank()`: `monthly → 1`, `starter → 2`, `builder → 3`, `pro → 4`. (Re-rank so curriculum gates of `>= starter` still allow monthly via a separate check, OR keep starter=1 and add `monthly=1` — see access logic below.)
- Update `apply_subscription_tier()`:
  - Walk `subscriptions` for the user.
  - For monthly price (`ailab_monthly_subscription`): count only when `status IN ('active','trialing','past_due')`.
  - For one-time prices: existing logic (skip `refunded`/`failed`).
  - Priority (highest wins): `pro` > `builder` > `starter` > `monthly` > `none`.
- Recompute tier for all existing users.

## 3. Access logic

Two access dimensions:
- **Curriculum access** (all 11 modules / 90+ lessons): `tier IN ('monthly','starter','builder','pro')` OR admin.
- **Builder/template access** (Digital Product Builder, Funnel Builder, n8n Library, Local Kit, Pro prompts): `tier IN ('builder','pro')` for Builder-tier items, `tier='pro'` for Pro-tier items. Unchanged.

Implement as helper in `src/lib/tier.ts` (or inline where needed):
```ts
export const hasCurriculumAccess = (tier?: string) =>
  ["monthly","starter","builder","pro"].includes(tier ?? "");
export const meetsTier = (tier: string|undefined, required: "starter"|"builder"|"pro") => {
  const rank = { none:0, monthly:0, starter:1, builder:2, pro:3 };
  return (rank[tier ?? "none"] ?? 0) >= rank[required];
};
```
Monthly counts as rank 0 for tier comparison (so it can't unlock Builder/Pro stuff), but `hasCurriculumAccess` short-circuits for lesson/module gates where `required_tier='starter'`.

Update every gate site (lessons, modules, prompts, builders, workflows, tools) to use these helpers.

## 4. Checkout

`payments.functions.ts`:
- Add `ailab_monthly_subscription → "monthly"` to `priceToTier`.
- Re-purchase guard: if user already has one-time tier (`starter`/`builder`/`pro`), block monthly. If user has active monthly, block re-buying monthly; one-time tiers remain available.
- Detect `stripePrice.type === 'recurring'` → `mode: "subscription"`, add `subscription_data.metadata.userId`.
- Skip `payment_intent_data.description` for subscriptions.

## 5. Webhook (`api/public/payments/webhook.ts`)

Add handlers:
- `customer.subscription.created` / `customer.subscription.updated`: upsert into `subscriptions` (by `stripe_subscription_id`), set `status`, `current_period_end`, `cancel_at_period_end`, `price_id` resolved via `lookup_key`, `environment`. Trigger recomputes tier.
- `customer.subscription.deleted`: mark row `status='canceled'` and `current_period_end` past → trigger downgrades tier.
- `invoice.payment_failed`: set status from event (`past_due`/`unpaid`), no manual grace — trust Stripe transitions.
- Keep existing `checkout.session.completed` for one-time payments.
- Send subscription receipt email on first activation; send cancellation email on `deleted`.

## 6. Pricing page

Add Monthly card ABOVE the 3 one-time tiers with "★ Most Flexible" badge:
- $14.99/month · Cancel anytime
- "Full curriculum access · No builders or bonus tools"
- Hide entirely if `profile.tier` ∈ `{starter,builder,pro}`.
- Show "Current plan" if `profile.tier === 'monthly'`.

Add divider header "Or own it forever — one-time payment" above existing trio.

## 7. Dashboard banner

In `_authenticated/dashboard.tsx`: if `profile.tier === 'monthly'`, show dismissible banner (`localStorage` key) with upgrade CTA → `/pricing`.

## 8. Locked-feature inline prompt

For builder/workflow/etc. pages: if `profile.tier === 'monthly'`, show inline upgrade card instead of generic locked screen: "This tool is included in the Builder Lab ($79 one-time). Upgrade to unlock it permanently."

## 9. Settings → cancel flow

In `_authenticated/settings.tsx`: if monthly active, add "Membership" section with Cancel button → retention modal:
> Cancel membership? You'll lose access to all 11 modules at the end of your billing period. Or grab lifetime Starter access for just $29.

Buttons: **Cancel anyway** (calls new `cancelMonthlySubscription` server fn → Stripe `subscriptions.update(id, {cancel_at_period_end:true})`) · **Get Lifetime Access — $29** (→ `/checkout?tier=starter`).

## 10. "Membership ended" notice

When `_authenticated` redirects a logged-in-but-no-access user, route to `/pricing?expired=1`. Pricing page reads search param and shows banner: "Your membership has ended — resubscribe anytime or grab lifetime access below."

## 11. Files touched

- New migration (enum + trigger update + tier_rank).
- New `src/lib/tier.ts` helpers.
- `src/lib/payments.functions.ts` (subscription mode, guard, cancel fn).
- `src/routes/api/public/payments/webhook.ts` (subscription events + emails).
- `src/routes/pricing.tsx` (monthly card, expired banner, hide/show logic).
- `src/routes/_authenticated/dashboard.tsx` (banner).
- `src/routes/_authenticated/settings.tsx` (cancel flow).
- `src/routes/_authenticated/checkout.tsx` (allow `tier=monthly`).
- Gating call sites: `course.index.tsx`, `course.$moduleSlug.$lessonSlug.tsx`, `prompts.tsx`, `builders/*`, `workflows.tsx`, `tools.tsx` (swap to helpers, add inline monthly-upgrade card for builder/pro-only items).
- Stripe product creation (one tool call).

## 12. Out of scope (not building)

- Separate `monthly_member` role in `user_roles`. `tier='monthly'` on `profiles` serves the same purpose with one source of truth (and the existing trigger already syncs it from Stripe). Adding a parallel role would create drift.
- Custom 3-day grace cron. Stripe's built-in dunning handles retries; access ends when Stripe marks the subscription `canceled`/`unpaid`.
