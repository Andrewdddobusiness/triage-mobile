# Ticket 22: Read-Only Preview Mode with Inline Upsells

## Problem
Full paywalling blocks value discovery on mobile. Users can’t see what they get with Pro, which hurts conversion and makes the experience inconsistent with triage-web where read-only views are allowed pre-upgrade.

## Proposal
Allow non-subscribed users to browse key screens in a read-only/preview mode (inbox, assistant presets, profile highlights) while gating high-value actions (assign number, enable assistant, calls) with contextual upsells. Keep pricing/benefits clear (59 AUD/month) and ensure routing and copy match triage-web.

## Tasks
- [ ] Define capabilities for unauthenticated vs no-subscription vs lapsed states; align with `_layout.tsx` routing.
- [ ] Add read-only states to inbox/request detail: show demo/empty content and gate actions (call/message/status change) with an upsell modal.
- [ ] Add inline upsell CTAs on assistant settings, number assignment, and profile to explain Pro benefits; keep price set to 59 AUD/month and “cancel anytime”.
- [ ] Ensure upgrade entry points are consistent: onboarding payment, subscription screen, gated action modals.
- [ ] Sync copy/benefits with triage-web and update pricing displays in mobile (payment screen already at 59 AUD).
- [x] Provide a preview exit on paywalls so new users can continue without subscribing (skip CTA on payment/paymentRenew screens).

## Dependencies / Notes
- Uses subscription state from `useSession` (`hasActiveSubscription`, `hasSubscriptionHistory`) and routing in `_layout.tsx`.
- Coordinate with Ticket 03 (subscription routing/compliance) and Ticket 15 (UI polish/brand consistency).
- Consider feature flags (Ticket 21) to toggle preview mode if needed.

## Success Criteria
- Users without Pro can browse core screens without crashes but cannot perform Pro actions; they see targeted upsells instead.
- Upgrade CTAs are available from gated actions and profile; price and benefits match web.
- Routing remains deterministic for new/lapsed/active users.
