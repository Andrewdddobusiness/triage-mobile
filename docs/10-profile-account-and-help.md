# Ticket 10: Profile, Account, and Help Parity

## Problem
Profile/help screens may omit key account management from web (email/password changes, business info) and lack consistent copy/help links.

## Proposal
Align profile/account/help with triage-web: show plan badge and business number, expose account management or document deferral, and ensure help links work.

## Tasks
- [ ] Ensure profile shows user name, plan badge, and business number with copy-to-clipboard feedback.
- [ ] Add navigation to account settings (email/password/business details) or document planned defer.
- [ ] Align help/FAQ content and external links; verify they open correctly on iOS.
- [ ] Confirm logout clears auth state and resets navigation.

## Dependencies / Notes
- Supabase profile data and twilio_phone_numbers; reuse copy from web.
- May depend on Ticket 02 for password reset.

## Success Criteria
- Profile/help parity with web validated on device; links and logout behave correctly.
- Any deferred account features are documented with rationale.

