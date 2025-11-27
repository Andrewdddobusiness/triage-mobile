# Ticket 16: Permissions, Consent Copy, and Privacy Compliance

## Problem
Microphone/speech/camera permissions and any call recording need clear copy and compliance with Apple guidelines; missing or unclear disclosures can trigger rejection.

## Proposal
Review all permissions, ensure only necessary ones remain in `app.json`, add in-app consent/explanation where needed, and align privacy statements with data usage.

## Tasks
- [x] Audit requested permissions/background modes; remove unused ones (Android storage perms removed; no background modes set).
- [x] Update permission prompts with clear purpose-aligned copy (microphone/speech/camera/notifications if added).
- [x] Add in-app consent/disclosure for call recording/voice features if shipped (current: native dialer, copy clarifies no in-app recording).
- [x] Align App Privacy answers and privacy policy references with actual data handling (documented in reviewer notes).
- [x] Prepare reviewer notes describing permission usage and how to trigger flows.

## Dependencies / Notes
- Coordinates with Ticket 07 (call/recording UX) and Ticket 12 (submission).
- Ensure ITSAppUsesNonExemptEncryption and ATT stance are correct.
- Current behavior: calls use native dialer (no in-app recording). Camera/photo access only for future uploads; speech recognition optional. No background modes requested.
- Reviewer notes: “Calls open the native dialer; the app does not record audio in-app. Microphone/camera/photo access is requested only when initiating a call or attaching media; speech recognition supports optional voice interactions. No background modes are enabled.”

## In-app disclosures (T8.3 alignment)
- Call/recording: Request detail and Help copy clarify that calls open the native dialer and recordings are only available on the web dashboard; no in-app recording happens.
- Microphone/speech: `app.json` strings explain usage; no background audio/VoIP entitlements.
- Privacy policy link in Help points to deletion section; reviewer note covers permission usage above.

## Success Criteria
- Only necessary permissions are requested with compliant copy.
- App Review notes and in-app disclosures cover voice/recording behavior; no permission-related rejections.
