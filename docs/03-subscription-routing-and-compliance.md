# Ticket 03: Subscription Routing and Payment Compliance

## Problem
Navigation depends on `hasActiveSubscription/hasSubscriptionHistory`, but routing and verification can drift; payment flows must also comply with Apple’s in-app purchase policies.

## Proposal
Define and implement a routing matrix for new, trialing, lapsed, and active users; ensure payment success updates state consistently; document the compliance stance (IAP vs allowed external payments) with reviewer notes.

## Tasks
- [x] Map and codify navigation states in `_layout.tsx` and onboarding payment screens with tests.
- [x] Ensure `checkSubscription` (or equivalent) returns a status consumed consistently by payment and routing.
- [x] Handle lapsed/failed payments with clear retry messaging; surface subscription history appropriately.
- [ ] Replace the “reload until active” loop with a visible activation state (progress/backoff, timeout) and provide retry checkout + “contact support” CTAs while polling Stripe.
- [ ] Document payment compliance choice and add reviewer note template if external payments are used.

## Notes
- `checkSubscription` now returns structured status (`hasActiveSubscription`, `hasSubscriptionHistory`, `subscription`) and callers (payment/paymentRenew) branch on that value instead of assuming a boolean.
- Added simple in-flight dedupe in `checkSubscription` to avoid overlapping calls from app state/deep link listeners.
- Added retry/“I already paid — check status” actions to payment and paymentRenew screens so lapsed/returning users can manually verify without re-paying.
- Routing matrix: unauth → welcome/signIn/signUp; new w/out history → onboarding-assistant/payment; lapsed (history, inactive) → subscription screen with CTA to paymentRenew/portal; active → tabs. `_layout.tsx` gates accordingly.
- Add activation feedback loop (parity with web Ticket 19): show “activating…” with attempt counts, back off after ~20–30s, then surface retry checkout and support CTA instead of reloading the app; log poll attempts/timeouts for support/analytics.

## Payment compliance (to document)
- Current flow uses external Stripe checkout. Decide/record App Review stance (external payments for business SaaS) and include a reviewer note template:
  - “Payments are for B2B SaaS (assistant/telephony). Purchase flow uses Stripe-hosted checkout in the browser; no digital goods for consumers. To verify: sign in with test account, start subscription, complete checkout, return to app and tap ‘I already paid — check status’ if needed.”


## Dependencies / Notes
- Stripe + Supabase functions; align naming/typing with triage-web subscription handling.
- Legal/compliance input on IAP vs external billing for AI assistant.

## Success Criteria
- Deterministic navigation for all subscription states in TestFlight.
- Payment success promotes the user into the app; failures retain them on retry with clear guidance.
- Compliance stance documented for App Review.
