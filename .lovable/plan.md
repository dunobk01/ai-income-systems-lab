# Audit: xbhiblackbox@gmail.com, 13 Sep 2026 ~19:00 UTC

No code was changed. Findings below come from reading the live code and querying the production database.

## What the records show

- Account created 13 Sep 2026 19:00:25 UTC via Google sign-in. Profile exists, plan level `none`, onboarding never completed.
- No subscription record, and no entry in the lead/marketing table for that address.
- The only lead captured in that whole evening window (18:00-21:00 UTC) was a different address at 20:01 UTC.
- Server logs only retain roughly the last hour, so nothing from 13 September is still available to inspect.

## Question 1: does opening checkout create a Stripe customer before payment?

Yes. Confirmed.

The checkout page is behind sign-in and immediately asks the server for a payment form. Before the payment form can be shown, the server code (`src/lib/payments.functions.ts`, `createCheckoutSession`) does this in order:

1. Looks for an existing Stripe customer matching the signed-in account.
2. If none exists, **creates a new Stripe customer** with the person's email attached.
3. Only then creates the checkout session and returns the form.

So simply landing on the checkout page after signing up is enough to produce a brand-new Stripe customer with no payment attached. A customer appearing at 19:01 UTC — about 35 seconds after the 19:00:25 account creation — matches exactly this behaviour: sign up, get sent to checkout, abandon before entering card details. Nothing is wrong or missing here; this is how the code is written.

## Question 2: is normal signup synced to the mailing list?

No. Confirmed.

The mailing-list sync only runs from two places:

- **Lead forms** — the free guide pages, the AI Business Engine page, the operating-system page, the newsletter box, and the exit-intent popup. All of these call one shared submission function that both stores the lead and pushes the address to the mailing list.
- **Paid upgrades** — the payment webhook pushes buyers into the customers group after a successful charge.

Creating an account (email/password or Google) touches neither path. The signup screens call the authentication service directly and never record a lead or contact the mailing-list provider. So an account-only signup, with no plan purchased and no lead form filled in, will never appear in the mailing list. That fully explains this address being absent.

## Conclusion

Both observed behaviours are expected outcomes of the current code, not faults:

- The Stripe customer with no transaction = abandoned checkout, customer created up front by design.
- Missing from the mailing list = account signups were never wired into it.

## Optional follow-ups (not implemented)

1. Sync new account signups into a dedicated "members" group on the mailing list, so every registered person is reachable.
2. Delay Stripe customer creation until payment is actually submitted, to stop empty customer records accumulating — or accept them and filter the Stripe view by customers with transactions.
3. Add an abandoned-checkout follow-up email, since these records identify exactly who reached the payment step and stopped.

### Technical notes

- Customer creation: `resolveOrCreateCustomer` in `src/lib/payments.functions.ts`, called before `stripe.checkout.sessions.create`.
- Mailing-list sync: `syncToMailerLite` in `src/lib/leads.functions.ts`, reachable only via `submitLead`; upgrade path via `mailerliteTrackUpgrade` in the payments webhook.
- Signup flows: `src/routes/signup.tsx` (`supabase.auth.signUp`, `lovable.auth.signInWithOAuth`) contain no lead or mailing-list call.
