# Ticket 02: Harden Email/Password and Google Sign-In

## Problem
Auth flows risk breaking in production: password reset is missing, Google client IDs/scheme need validation, and session refresh after backgrounding must be reliable.

## Proposal
Polish sign-in/up UX, add forgot-password entry, harden Google sign-in (iOS scheme, webClientId, iosClientId), and confirm session refresh works across app restarts and backgrounding.

## Tasks
- [ ] Add a “Forgot password” flow matching triage-web (Supabase reset email) and surface error/loading states.
- [ ] Validate Google Sign-In config against production bundle ID/scheme; test on a TestFlight build.
- [ ] Ensure `supabase.auth.startAutoRefresh`/`stopAutoRefresh` and token storage survive background/kill.
- [ ] Add clear error copy for common auth failures and network issues (parity with web).

## Dependencies / Notes
- Google OAuth client IDs already in `app.json` extra; confirm against Google Console for prod.
- Consider adding minimal analytics events for auth success/failure to align with web taxonomy.

## Success Criteria
- Email/password and Google sign-in succeed on device/TestFlight; failure states show actionable copy.
- Sessions persist for at least 24h of background/foreground without forced logout.

