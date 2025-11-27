# Ticket 07: Call and Recording UX, Permissions, and Policies

## Problem
Call actions and call recording handling are undefined on mobile; missing permissions or unclear UX could block App Review or confuse users.

## Proposal
Define and implement call behavior (CallKeep/Twilio integration or defer), recording playback/access, and ensure permissions/consent copy are App Store compliant.

## Tasks
- [x] Decide call action behavior in request detail (open dialer vs VoIP integration) and implement/feature-flag.
- [x] If VoIP/recordings are exposed, ensure required permissions/background modes are set or removed from `app.json`.
- [x] Add UI/copy for recording availability/access if provided.
- [x] Document consent and reviewer notes for any recording/voice features.

## Dependencies / Notes
- Chosen path: native dialer via `tel:` link from request detail; no in-app VoIP shipped. Background modes remain empty in `app.json`; microphone/camera permissions retained for future but no CallKeep/VoIP entitlements.
- Recording playback is deferred: if `call_sid` exists, UI states that recordings are available in the dashboard; mobile playback is “coming soon.”
- Twilio Voice SDK remains in the repo but unused; feature-flag or remove when ready.
- Legal/privacy review for recording consent still needed for future playback; currently no recording access in-app.

## Reviewer/Consent Notes
- Calls: Request detail opens the native dialer (`tel:`). No VoIP/CallKeep shipped; no in-app audio capture. Microphone permission remains for future features; background modes empty.
- Recordings: Mobile does not play recordings. If `call_sid` exists, UI notes recordings are available in the dashboard; no recording UI in app.
- App Store reviewer note: “Call actions open the native phone dialer (no in-app VoIP). Call recordings are not accessible in the mobile app; users are directed to the web dashboard. No call audio is captured in-app.”

## Success Criteria
- Call button has a clear, tested behavior (opens native dialer); App Review-ready permissions/copy are present for current scope.
- No unused permissions remain; reviewer notes prepared if needed (pending).
