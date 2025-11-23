# Ticket 07: Call and Recording UX, Permissions, and Policies

## Problem
Call actions and call recording handling are undefined on mobile; missing permissions or unclear UX could block App Review or confuse users.

## Proposal
Define and implement call behavior (CallKeep/Twilio integration or defer), recording playback/access, and ensure permissions/consent copy are App Store compliant.

## Tasks
- [ ] Decide call action behavior in request detail (open dialer vs VoIP integration) and implement/feature-flag.
- [ ] If VoIP/recordings are exposed, ensure required permissions/background modes are set or removed from `app.json`.
- [ ] Add UI/copy for recording availability/access if provided.
- [ ] Document consent and reviewer notes for any recording/voice features.

## Dependencies / Notes
- Twilio Voice SDK setup if VoIP is shipped; otherwise use native dialer.
- Legal/privacy review for recording consent.

## Success Criteria
- Call button has a clear, tested behavior; App Review-ready permissions/copy are present.
- No unused permissions remain; reviewer notes prepared if needed.

