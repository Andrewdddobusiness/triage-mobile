# Ticket 22: Read-Only Preview Mode with Inline Upsells

## Problem
Full paywalling blocks value discovery on mobile. Users can’t see what they get with Pro, which hurts conversion and makes the experience inconsistent with triage-web where read-only views are allowed pre-upgrade.

## Proposal
Allow non-subscribed users to browse key screens in a read-only/preview mode (inbox, assistant presets, profile highlights) while gating high-value actions (assign number, enable assistant, calls) with contextual upsells. Keep pricing/benefits clear (59 AUD/month) and ensure routing and copy match triage-web.

## Tasks
- [x] Define capabilities for unauthenticated vs no-subscription vs lapsed states; align with `_layout.tsx` routing.
- [x] Add read-only states to inbox/request detail: show demo/empty content and gate actions (call/message/status change) with an upsell modal.
- [x] Add inline upsell CTAs on assistant settings, number assignment, and profile to explain Pro benefits; keep price set to 59 AUD/month and “cancel anytime”.
- [x] Ensure upgrade entry points are consistent: onboarding payment, subscription screen, gated action modals.
- [x] Sync copy/benefits with triage-web and update pricing displays in mobile (payment screen already at 59 AUD).
- [x] Provide a preview exit on paywalls so new users can continue without subscribing (skip CTA on payment/paymentRenew screens).

## Implementation
- **Routing/capabilities**: `_layout.tsx` continues to route lapsed users to `subscription` and net-new to `payment`; active users land in tabs. Non-Pros can still view requests/assistant/profile but Pro actions are gated.
- **Gated request actions**: Request detail now runs in a preview state when telephony is off (flag/kill switch). Call/message/status buttons show disabled labels and trigger an upsell modal instead of performing the action.
- **Inline upsells**: Reusable `UpsellModal` component added. Assistant Settings shows an upgrade modal when a non-Pro tries to toggle the assistant; Profile includes an “Upgrade to Pro” action; request detail uses the same modal for calls/messages/status changes. Copy highlights 59 AUD/month, cancel anytime.
- **Consistency**: Upgrade CTAs point to `/onboarding-assistant/payment` (or `subscription` for lapsed users). Payment/renew screens already include “continue without Pro” to exit preview.
- **Defaults**: Pricing kept at 59 AUD/month; messaging mirrors triage-web benefits (AI assistant, calling, notifications).

## Dependencies / Notes
- Uses subscription state from `useSession` (`hasActiveSubscription`, `hasSubscriptionHistory`) and routing in `_layout.tsx`.
- Coordinate with Ticket 03 (subscription routing/compliance) and Ticket 15 (UI polish/brand consistency).
- Consider feature flags (Ticket 21) to toggle preview mode if needed.

## Success Criteria
- Users without Pro can browse core screens without crashes but cannot perform Pro actions; they see targeted upsells instead.
- Upgrade CTAs are available from gated actions and profile; price and benefits match web.
- Routing remains deterministic for new/lapsed/active users.
