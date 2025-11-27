# Ticket 2: Subscription Routing & Payment Compliance

## Routing Matrix (T2.1)
- New user (no subscription history): send to `/onboarding-assistant/payment`.
- Lapsed user (has history, no active sub): send to `/subscription`.
- Active sub: proceed to onboarding flow, then tabs.
- Implemented in `app/_layout.tsx` via `hasActiveSubscription`/`hasSubscriptionHistory`.

## Payment Compliance Decision (T2.2)
- Using external Stripe Checkout/Customer Portal (no in-app purchases) because the app serves business users and requires phone/assistant provisioning tied to server-side onboarding.
- Reviewer note template:
  - “Subscription upgrades are handled via Stripe on the web (external purchase, B2B). The app provides account management and uses the Stripe customer portal for existing subscribers. No digital goods are sold via IAP.”

## Customer Portal (T2.3)
- `openCustomerPortal` in `lib/auth/ctx.tsx`:
  - Validates session, invokes `stripe-customer-portal` Edge Function, opens returned URL.
  - Handles missing/expired session or network errors with user-friendly alerts and telemetry (`customer_portal_*` events).

## QA Checklist
- New → payment screen reachable from fresh account; cancel/continue buttons work.
- Lapsed → subscription screen; “Manage Subscription” opens portal or shows error gracefully when offline/unauthenticated.
- Active → onboarding/tabs without looping.
- Portal deep link works on device; errors surface with the new copy.
