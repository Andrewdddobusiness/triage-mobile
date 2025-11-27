Ordered ticket list to get triage-mobile production-ready and aligned with triage-web. Keep tickets small; each includes a suggested acceptance check.

Recent completions:
- Ticket 18 Push Notifications: client handlers + edge sender wired; QA checklist remaining for release device runs.
- Ticket 19 Data Deletion: Profile entry, edge function, privacy link/reviewer note, and QA on test user.
- Ticket 20 PII Handling: secure storage, masking, clipboard warnings, and docs done.
- Ticket 21 Feature Flags: Supabase-backed flags with kill switch and client gating.
- Ticket 22 Read-only Preview/Upsells: preview gating on calls/status/messages with upgrade CTAs.

0) Foundations
- T0.1 Env/config parity: Document mobile .env values/EAS secrets and confirm Supabase/Twilio/Stripe keys match triage-web; app boots with no local hacks. AC: fresh clone runs with documented steps. ✅ see docs/00-env-and-brand-tokens.md
- T0.2 Brand tokens: Centralize colors/typography/icons to match web; replace ad-hoc values. AC: design tokens applied; spot-check key screens for consistency. ✅ tokens in lib/theme.ts; applied to Help/Profile; expand as you touch other screens.
- T0.3 Secret hygiene: Verify no secrets in repo; ensure SecureStore usage for auth tokens; audit app.json/eas.json extra for correctness. AC: audit log with fixes applied. ✅ audit logged in docs/00-env-and-brand-tokens.md (no private keys in repo; app.json extras are public client IDs).

1) Auth and session
- T1.1 Email/password flow polish: Validate loading/error states, copy, and forgot-password entry. AC: happy/sad paths covered; reset email sent via Supabase.
- T1.2 Google sign-in hardening: Confirm client IDs and iOS scheme; TestFlight sign-in works. AC: successful device sign-in; error fallback copy.
- T1.3 Session persistence: Ensure refresh after background/kill; no surprise logouts. AC: 24h soak without reauth; telemetry on refresh errors.

2) Subscription/paywall
- T2.1 Routing matrix: Validate hasActiveSubscription/hasSubscriptionHistory navigation (payment/subscription/onboarding). AC: deterministic paths for new, lapsed, active users. ✅ see docs/02-subscription-routing-and-payment.md
- T2.2 Payment compliance: Decide IAP vs external; align with App Store rules. AC: documented decision and reviewer note template. ✅ external Stripe, reviewer note in docs/02-subscription-routing-and-payment.md
- T2.3 Customer portal: Ensure portal link opens and handles expired sessions. AC: works online; graceful offline failure. ✅ portal flow hardened with telemetry/alerts; see docs/02-subscription-routing-and-payment.md

3) Onboarding data
- T3.1 Form completeness: Required fields, custom specialty/service, validation matching web; data persists to Supabase. AC: reload shows saved data.
- T3.2 Resume behavior: Persist progress across app restart/background. AC: resume to last step with data intact.
- T3.3 Analytics: Emit step start/complete/drop-off events using shared taxonomy. AC: events visible in analytics tool.

4) Assistant setup and telephony
- T4.1 Preset selection: Load presets, update assistant_preset_id, align catalog with web. AC: change reflected in Supabase and UI. ✅ see docs/05-assistant-presets-and-gating.md
- T4.2 Number assignment: Harden assign-phone-number function calls with retries/errors; confirm success writes number. AC: assigned number shown; failure copy and retry. ✅ see docs/06-phone-number-assignment-resilience.md
- T4.3 Enablement gating: Toggle disabled until business number exists; copy matches web. AC: cannot enable without number; state persists after relaunch. ✅ gated + analytics (docs/05-assistant-presets-and-gating.md)
- T4.4 Call/recording UX decision: Define/implement call button behavior (CallKeep/Twilio) and recording access; ensure permissions cover chosen behavior. AC: signed-off UX doc and implementation or feature flag. ✅ native dialer + recording deferral, reviewer note in docs/07-call-and-recording-ux.md
- T4.5 Clipboard/haptics: Ensure copy buttons (numbers/emails) work and provide feedback. AC: manual QA on iOS device. ✅ copy-to-clipboard with haptics/toasts and masking in request/profile/assistant/assignment; device QA recommended.

5) Inbox and requests
- T5.1 List fetch performance: get-inquiries function wired; loading/empty states; pull-to-refresh. AC: list renders with caching; empty state copy. ✅ 30s cache + refresh control + offline/error states (docs/08-inbox-performance-and-filters.md)
- T5.2 Filters/search: Status/job type filters accurate; decide on search (client vs server). AC: filter correctness verified; search spec implemented or deferred. ✅ client-side filters/search implemented (docs/08-inbox-performance-and-filters.md)
- T5.3 Request actions: Implement/decide message and call buttons; format currency/date/location per locale. AC: actions active or intentionally removed with rationale. ✅ call uses native dialer; messaging gated/coming soon; locale formatting present (docs/09-request-actions-and-status.md)
- T5.4 Status updates: Add UI to change status using updateInquiryStatus with optimistic update and rollback. AC: Supabase reflects changes; errors surfaced. ✅ implemented; tests/manual QA still TODO (docs/09-request-actions-and-status.md)

6) Profile, account, help
- T6.1 Profile data: Name, plan badge, business number display; copy to clipboard. AC: matches web; handles missing data.
- T6.2 Account settings: Surface account/email/password/business info management or document gap. AC: navigation present or PO-approved defer note.
- T6.3 Help/FAQ: Ensure help.tsx links/content align with web; external links open correctly. AC: links work on device.
- T6.4 Logout reliability: Clears tokens and resets nav state. AC: no access to tabs after logout.

7) UX polish and accessibility
- T7.1 Visual audit: Close punch list for colors/spacing/icons/typography vs web; archive screenshots. AC: punch list resolved.
- T7.2 Accessibility: VoiceOver labels, focus order, contrast on gradients/buttons. AC: pass on critical flows.
- T7.3 Error/offline UX: Standardize offline/retry messaging for Supabase calls/functions. AC: reproducible offline tests pass.

8) Observability and privacy
- T8.1 Crash reporting: Add Sentry (or chosen) with user/session context; upload symbols. AC: test crash visible in dashboard.
- T8.2 Analytics alignment: Implement shared taxonomy for auth/onboarding/subscription/inbox events. AC: events flowing in TestFlight.
- T8.3 Privacy/consent: In-app disclosures for microphone/speech/call recording; data deletion/export entry point for Apple 5.1. AC: legal signoff or reviewer note.

9) Release engineering and submission
- T9.1 EAS build reliability: Green production build (ios distribution: store) with correct bundle id/merchant id. AC: build artifact produced.
- T9.2 Config sanity: app.json permissions/background modes trimmed to what’s needed; icons/splash correct. AC: linted config; unused permissions removed.
- T9.3 Feature flags: Flags for telephony/payments to allow phased rollout. AC: defaults documented; toggles stored in Supabase/config.
- T9.4 App Store package: Metadata, privacy answers, reviewer notes, and screenshots prepared (see ios-app-store-submission.md). AC: submission ready checklist complete.
