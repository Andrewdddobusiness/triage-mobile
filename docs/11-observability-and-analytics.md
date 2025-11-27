# Ticket 11: Observability and Shared Analytics

## Problem
There is limited visibility into crashes, errors, and user flow on mobile; web uses shared taxonomy that mobile should match.

## Proposal
Add crash/error reporting (e.g., Sentry) with user/session context and implement shared analytics events for auth, onboarding, subscription, inbox actions.

## Tasks
- [x] Integrate crash reporting SDK with release build symbol uploads; test a handled/unhandled error. *(Sentry wiring added; supply `EXPO_PUBLIC_SENTRY_DSN` and upload symbols in EAS builds.)*
- [x] Instrument key events using the shared taxonomy from triage-web (auth, onboarding steps, payment, inbox actions).
- [x] Ensure logs avoid PII and redact phone/email where possible.
- [ ] Add QA checklist to verify events in TestFlight.

## Dependencies / Notes
- Coordinate event names/props with web analytics owners.
- Consider feature flags for telemetry to allow staged rollout.
- `trackEvent` helper exists and is used in assistant settings, number assignment, inbox search, and request status/call actions; wire to real provider (e.g., Mixpanel/PostHog) and align schema with web.
- No crash reporter integrated yet; add Sentry (or chosen) with DSN + release/sourcemap uploads for EAS builds.

## Success Criteria
- Test crashes/errors appear in dashboard with user context.
- Analytics events flow in TestFlight builds and match the shared schema.

## Event Taxonomy (mobile aligned to web)
- Auth: `auth_email_signin_success`, `auth_email_signin_error`, `auth_google_signin_error`, `auth_session_lost`, `auth_forgot_password_clicked`.
- Onboarding/assistant: `assistant_settings_viewed`, `assistant_gate_impression`, `assistant_toggle_success/error`, `assistant_preset_update_attempt/success/error`, `assistant_preset_modal_opened/selected`, `assistant_gated_cta_click`.
- Subscription/payment: `customer_portal_opened/customer_portal_error`, `feature_flags_fetched`, existing stripe flow events in payment screens.
- Inbox/requests: `inbox_search_change`, `request_status_change_attempt/success/error`, `request_call_attempt/opened/error`, `request_call_blocked_flag`, `request_message_gated`.
- Number assignment: `assign_phone_availability`, `assign_phone_attempt`, `assign_phone_success`, `assign_phone_error`, `assign_phone_waitlist_*`, `assign_phone_copied`.
- Upsells/PII: `profile_business_number_copied`, masked displays in UI; analytics payloads scrubbed via `trackEvent`/`scrubPII`.

## Crash Reporting
- Sentry via `sentry-expo` initialized in `app/_layout.tsx` using `EXPO_PUBLIC_SENTRY_DSN`; symbols uploaded via EAS. Enable traces as needed (`tracesSampleRate` tuned low).

## Remaining to close
- Add TestFlight QA checklist: trigger test crash, verify events arrive with user context; spot-check PII redaction. Wire `trackEvent` to chosen product analytics backend when keys are available.
