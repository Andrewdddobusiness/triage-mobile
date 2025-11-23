# Ticket 06: Reliable Business Number Assignment

## Problem
Assigning a business number via the `assign-phone-number` function can fail without clear retries, leaving onboarding blocked.

## Proposal
Harden the assignment flow with retries, clear error states, and confirmation UX; ensure the assigned number is stored and shown consistently.

## Tasks
- [ ] Add retry/backoff and user-facing errors around the Supabase function invoke.
- [ ] Persist assigned number to state and display it with copy-to-clipboard feedback.
- [ ] Handle “Skip” path intentionally (route decisions documented) and ensure routing consistency after assignment.
- [ ] Log failures for later support/debugging.

## Dependencies / Notes
- Supabase edge function `assign-phone-number`; Twilio inventory availability.
- Align visuals and copy with web number assignment/waitlist messaging if applicable.

## Success Criteria
- Successful assignment shows the number and routes correctly; failures present actionable retry messaging.
- QA can reproduce and log both success and failure cases on device.

