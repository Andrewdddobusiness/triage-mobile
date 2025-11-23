# Ticket 11: Observability and Shared Analytics

## Problem
There is limited visibility into crashes, errors, and user flow on mobile; web uses shared taxonomy that mobile should match.

## Proposal
Add crash/error reporting (e.g., Sentry) with user/session context and implement shared analytics events for auth, onboarding, subscription, inbox actions.

## Tasks
- [ ] Integrate crash reporting SDK with release build symbol uploads; test a handled/unhandled error.
- [ ] Instrument key events using the shared taxonomy from triage-web (auth, onboarding steps, payment, inbox actions).
- [ ] Ensure logs avoid PII and redact phone/email where possible.
- [ ] Add QA checklist to verify events in TestFlight.

## Dependencies / Notes
- Coordinate event names/props with web analytics owners.
- Consider feature flags for telemetry to allow staged rollout.

## Success Criteria
- Test crashes/errors appear in dashboard with user context.
- Analytics events flow in TestFlight builds and match the shared schema.

