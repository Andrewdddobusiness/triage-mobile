# Ticket 12: App Store Submission Package

## Problem
App Store submission needs metadata, assets, privacy disclosures, and reviewer notes specific to mobile features (telephony, AI assistant).

## Proposal
Prepare all submission artifacts: metadata, screenshots, privacy responses, reviewer notes, and ensure the binary is built with correct identifiers.

## Tasks
- [ ] Collect metadata (name, subtitle, description, keywords, support/marketing URLs) aligned with web positioning.
- [ ] Prepare required screenshots (6.7”, 6.5”, 5.5” or 6.1”) covering welcome, onboarding, subscription, assistant setup, inbox, request detail, profile.
- [ ] Complete App Privacy questionnaire (data types, purposes), ATT stance, and encryption answers.
- [ ] Draft reviewer notes including demo credentials, call/recording behavior, and payment compliance stance.
- [ ] Validate production EAS build (bundle id/team id/merchant id) and upload to App Store Connect.

## Dependencies / Notes
- Relies on Ticket 07 for call/recording behavior and Ticket 03 for payment compliance.
- Use `ios-app-store-submission.md` (root docs) as a reference checklist.

## Success Criteria
- Submission-ready metadata/assets complete and reviewed.
- App Store Connect binary uploaded and passes initial validation; reviewer notes prepared.

