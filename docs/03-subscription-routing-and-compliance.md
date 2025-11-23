# Ticket 03: Subscription Routing and Payment Compliance

## Problem
Navigation depends on `hasActiveSubscription/hasSubscriptionHistory`, but routing and verification can drift; payment flows must also comply with Apple’s in-app purchase policies.

## Proposal
Define and implement a routing matrix for new, trialing, lapsed, and active users; ensure payment success updates state consistently; document the compliance stance (IAP vs allowed external payments) with reviewer notes.

## Tasks
- [ ] Map and codify navigation states in `_layout.tsx` and onboarding payment screens with tests.
- [x] Ensure `checkSubscription` (or equivalent) returns a status consumed consistently by payment and routing.
- [ ] Handle lapsed/failed payments with clear retry messaging; surface subscription history appropriately.
- [ ] Document payment compliance choice and add reviewer note template if external payments are used.

## Notes
- `checkSubscription` now returns structured status (`hasActiveSubscription`, `hasSubscriptionHistory`, `subscription`) and callers (payment/paymentRenew) branch on that value instead of assuming a boolean.
- Added simple in-flight dedupe in `checkSubscription` to avoid overlapping calls from app state/deep link listeners.

## Dependencies / Notes
- Stripe + Supabase functions; align naming/typing with triage-web subscription handling.
- Legal/compliance input on IAP vs external billing for AI assistant.

## Success Criteria
- Deterministic navigation for all subscription states in TestFlight.
- Payment success promotes the user into the app; failures retain them on retry with clear guidance.
- Compliance stance documented for App Review.
