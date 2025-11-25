# Ticket 02: Harden Email/Password and Google Sign-In

## Problem
Auth flows risk breaking in production: password reset is missing, Google client IDs/scheme need validation, and session refresh after backgrounding must be reliable.

## Proposal
Polish sign-in/up UX, add forgot-password entry, harden Google sign-in (iOS scheme, webClientId, iosClientId), and confirm session refresh works across app restarts and backgrounding.

## Tasks
- [x] Add a “Forgot password” flow (Supabase reset email) with error/loading states.
- [ ] Validate Google Sign-In config against production bundle ID/scheme; test on a TestFlight build.
- [ ] Ensure `supabase.auth.startAutoRefresh`/`stopAutoRefresh` and token storage survive background/kill.
- [ ] Add clear error copy for common auth failures and network issues (parity with web).

## Notes
- Added `app/resetPassword.tsx` with Supabase email reset; currently not linked in mobile UI—users should use the web reset flow.
- Removed reset route from the unauth stack to avoid surfacing it until we revisit.
- Google config validation and session persistence soak test remain TODO.

## Remaining to close
- Validate Google Sign-In on a TestFlight build with the current bundle ID/scheme and confirm fallback copy on error.
- Run a 24h session persistence soak (background/kill) to ensure `startAutoRefresh` + SecureStore survive.
- Add user-facing error copy for auth failures/network issues (parity with web) and decide whether to surface/reset route in-app or keep web-only.

## Dependencies / Notes
- Google OAuth client IDs already in `app.json` extra; confirm against Google Console for prod.
- Consider adding minimal analytics events for auth success/failure to align with web taxonomy.

## Success Criteria
- Email/password and Google sign-in succeed on device/TestFlight; failure states show actionable copy.
- Sessions persist for at least 24h of background/foreground without forced logout.
