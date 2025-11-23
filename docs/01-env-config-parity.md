# Ticket 01: Mobile Env & EAS Config Parity with Web

## Problem
The Expo app depends on shared Supabase/Twilio/Stripe config, but mobile-specific env, `app.json`, and `eas.json` can drift from triage-web, causing build breaks or mis-pointed services in TestFlight/production.

## Proposal
Audit and document all required environment values and EAS secrets; align bundle identifiers, schemes, OAuth client IDs, and Stripe config with web. Produce a single source of truth for local `.env`, EAS secrets, and runtime `extra`.

## Tasks
- [x] Inventory required env vars for mobile runtime (Supabase URL/key, API URLs, Google Maps/Auth) and capture optional server-side-only secrets separately.
- [x] Update `.env.example` (mobile) and README with keys, sources, and how to load for Expo/EAS.
- [ ] Verify `app.json` / `extra` (router initial route, scheme, googleClientId, merchant id) match provisioned credentials.
- [ ] Verify `eas.json` build/submit profiles (bundle id, team id, ascAppId) are correct and autoIncrement is desired.
- [x] Add a “sanity check” script or checklist to validate env presence before running `expo start` or `eas build`.

## Notes
- Added `.env.example` with required public runtime variables and clearly separated server-side-only secrets that must not ship in mobile builds.
- Added `npm run env:check` to validate required public variables; it loads `.env.local` if present, otherwise `.env`.
- README now documents required variables and the safety note about keeping service-role/Twilio secrets out of mobile builds.

## Dependencies / Notes
- Coordinate with Supabase project at repo root; ensure no per-app overrides.
- Keep secrets out of VCS; prefer EAS secrets and local `.env`.

## Success Criteria
- Fresh clone can run mobile with documented steps and no missing env errors.
- EAS production build uses correct bundle ID/team ID and points to the shared Supabase/Stripe/Twilio services.
