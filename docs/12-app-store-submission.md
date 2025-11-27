# Ticket 12: App Store Submission Package

## Problem
App Store submission needs metadata, assets, privacy disclosures, and reviewer notes specific to mobile features (telephony, AI assistant).

## Proposal
Prepare all submission artifacts: metadata, screenshots, privacy responses, reviewer notes, and ensure the binary is built with correct identifiers.

## Tasks
- [x] Collect metadata (name, subtitle, description, keywords, support/marketing URLs) aligned with web positioning. *(reuse web metadata; URLs: support https://spaak.vercel.app/support, marketing https://spaak.ai)*
- [ ] Prepare required screenshots (6.7”, 6.5”, 5.5” or 6.1”) covering welcome, onboarding, subscription, assistant setup, inbox, request detail, profile.
- [x] Complete App Privacy questionnaire (data types, purposes), ATT stance, and encryption answers.
- [x] Draft reviewer notes including demo credentials, call/recording behavior, and payment compliance stance.
- [ ] Validate production EAS build (bundle id/team id/merchant id) and upload to App Store Connect.

## Reviewer notes draft (to finalize)
- Purpose: B2B SaaS for tradies. Calls open the native dialer; no in-app VoIP. Recordings are not playable in-app; they are viewed via the web dashboard.
- Payments: external Stripe checkout for business SaaS (no in-app purchases). Price: 59 AUD/month. After checkout, tap “I already paid — check status” if needed.
- Test account: \<provide email/pass> (Pro) and \<provide email/pass> (no subscription) for reviewer use.
- Flows to verify: sign in → onboarding → assistant preset (gated until business number) → assign number (waitlist shown if none) → enable assistant (requires subscription + number) → inbox read-only + call via native dialer → profile shows plan badge/number.
- Permissions: microphone/camera requested but no background modes; no call recording in-app. No ads. Encryption non-exempt.
- Privacy: account deletion in Profile → Delete Account; privacy policy https://spaak.vercel.app/privacy#mobile-deletion references the flow.

## Dependencies / Notes
- Relies on Ticket 07 for call/recording behavior and Ticket 03 for payment compliance.
- Use `ios-app-store-submission.md` (root docs) as a reference checklist.

## Success Criteria
- Submission-ready metadata/assets complete and reviewed.
- App Store Connect binary uploaded and passes initial validation; reviewer notes prepared.
