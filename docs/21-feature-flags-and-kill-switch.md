# Ticket 21: Remote Feature Flags and Kill Switch

## Problem
Risky features (telephony, payments, notifications) need remote control to mitigate production incidents without new builds. Currently there is no kill switch or staged rollout mechanism.

## Proposal
Introduce a remote configuration/feature flag system (e.g., Supabase table or config endpoint) to toggle features and apply a global kill switch for critical services.

## Tasks
- [ ] Define flag schema (e.g., `feature_flags` in Supabase) with rollout strategy (global/percentage/user-scoped).
- [ ] Implement client-side flag fetching with caching and TTL; expose a hook/store for consumption.
- [ ] Gate high-risk features (telephony, payment, notifications, analytics) behind flags; add a global “safe mode” to disable them quickly.
- [ ] Add admin/update path (could reuse web tooling) and document operational playbooks.
- [ ] Add telemetry around flag evaluations for debugging.

## Dependencies / Notes
- Coordinate with triage-web flags for consistency if they exist.
- Ensure defaults are safe and app can operate in degraded mode gracefully.

## Success Criteria
- Flags can be updated server-side and take effect without app update.
- Kill switch disables scoped features without crashes; users see clear messaging.
- Operational docs exist for incident response.

