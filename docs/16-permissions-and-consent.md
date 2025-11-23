# Ticket 16: Permissions, Consent Copy, and Privacy Compliance

## Problem
Microphone/speech/camera permissions and any call recording need clear copy and compliance with Apple guidelines; missing or unclear disclosures can trigger rejection.

## Proposal
Review all permissions, ensure only necessary ones remain in `app.json`, add in-app consent/explanation where needed, and align privacy statements with data usage.

## Tasks
- [ ] Audit requested permissions/background modes; remove unused ones.
- [ ] Update permission prompts with clear purpose-aligned copy (microphone/speech/camera/notifications if added).
- [ ] Add in-app consent/disclosure for call recording/voice features if shipped.
- [ ] Align App Privacy answers and privacy policy references with actual data handling.
- [ ] Prepare reviewer notes describing permission usage and how to trigger flows.

## Dependencies / Notes
- Coordinates with Ticket 07 (call/recording UX) and Ticket 12 (submission).
- Ensure ITSAppUsesNonExemptEncryption and ATT stance are correct.

## Success Criteria
- Only necessary permissions are requested with compliant copy.
- App Review notes and in-app disclosures cover voice/recording behavior; no permission-related rejections.

