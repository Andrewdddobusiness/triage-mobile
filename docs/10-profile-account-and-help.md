# Ticket 10: Profile, Account, and Help Parity

## Problem
Profile/help screens may omit key account management from web (email/password changes, business info) and lack consistent copy/help links.

## Proposal
Align profile/account/help with triage-web: show plan badge and business number, expose account management or document deferral, and ensure help links work.

## Tasks
- [x] Ensure profile shows user name, plan badge, and business number with copy-to-clipboard feedback.
- [x] Add navigation to account settings (email/password/business details) or document planned defer.
- [x] Align help/FAQ content and external links; verify they open correctly on iOS.
- [x] Confirm logout clears auth state and resets navigation.

## Dependencies / Notes
- Supabase profile data and twilio_phone_numbers; reuse copy from web.
- May depend on Ticket 02 for password reset.

## Success Criteria
- Profile/help parity with web validated on device; links and logout behave correctly.
- Any deferred account features are documented with rationale.

## Remaining to close
- Account details/editing flows still deferred; document in release notes once shipped.
