# Ticket 21: Remote Feature Flags and Kill Switch

## Problem
Risky features (telephony, payments, notifications) need remote control to mitigate production incidents without new builds. Currently there is no kill switch or staged rollout mechanism.

## Proposal
Introduce a remote configuration/feature flag system (e.g., Supabase table or config endpoint) to toggle features and apply a global kill switch for critical services.

## Tasks
- [x] Define flag schema (e.g., `feature_flags` in Supabase) with rollout strategy (global/percentage/user-scoped).
- [x] Implement client-side flag fetching with caching and TTL; expose a hook/store for consumption.
- [x] Gate high-risk features (telephony, payment, notifications, analytics) behind flags; add a global “safe mode” to disable them quickly.
- [x] Add admin/update path (could reuse web tooling) and document operational playbooks.
- [x] Add telemetry around flag evaluations for debugging.

## Implementation
- **Schema**: `feature_flags` table (columns: `key` (text, primary), `enabled` (bool), `rollout_percentage` (int 0-100), `safe_mode_message` (text), `updated_at`). Keys used: `kill_switch`, `telephony`, `payments`, `notifications`, `analytics`. `kill_switch` forces all others off and propagates `safe_mode_message`.
- **Client**: `lib/featureFlags.ts` handles fetch + rollout bucketing (hash on `key:userId`), caches for 5 minutes, and falls back to safe defaults if fetch fails. Context hook `useFeatureFlags` (in `FeatureFlagProvider`) exposes `{ flags, loading, error, refresh }`.
- **Gating**:
  - Telephony: `useTwilio` short-circuits when disabled/kill switch; call screens and request detail buttons show “calls unavailable” messaging and block dial attempts.
  - Payments: onboarding payment/renew screens show a safe-mode message and skip Stripe flows when `payments` is off or kill switch is on.
  - Notifications: push registration in `_layout` is suppressed when notifications flag is off or kill switch is on.
  - Analytics: `trackEvent` no-ops when analytics flag is off or kill switch is on; payloads still scrubbed for PII.
- **Telemetry**: `feature_flags_fetched` event emitted on refresh with the evaluated state.

## Operational notes / playbook
- To disable everything quickly: set `kill_switch.enabled = true` and (optionally) `safe_mode_message`. Clients will stop calls, payments, push registration, and analytics; UI shows the message where relevant.
- Targeting/rollouts: set `rollout_percentage` (0–100). Bucketing is deterministic per `key:userId`, so gradual rollouts work per-user.
- Cache/TIL: 5 minute TTL. Use `refresh()` from `useFeatureFlags` for immediate pulls after changes (or re-open app).
- Admin/update path: update `feature_flags` in Supabase (or reuse web-admin). Keep defaults in table aligned with mobile defaults (telephony/payments/notifications/analytics enabled, kill switch off).

## Success criteria check
- Remote updates: flags pull from Supabase and respect rollout; clients default-safe when fetch fails.
- Kill switch: forces telephony/payments/notifications/analytics off; UI surfaces “unavailable” messaging instead of crashing.
- Docs/playbook: above notes cover schema, rollout, and incident steps.

## Dependencies / Notes
- Coordinate with triage-web flags for consistency if they exist.
- Ensure defaults are safe and app can operate in degraded mode gracefully.

## Success Criteria
- Flags can be updated server-side and take effect without app update.
- Kill switch disables scoped features without crashes; users see clear messaging.
- Operational docs exist for incident response.
