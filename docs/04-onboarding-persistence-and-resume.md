# Ticket 04: Onboarding Persistence and Resume

## Problem
Onboarding progress and form data may be lost on app kill/background, forcing users to restart and lowering activation.

## Proposal
Persist onboarding step and form data locally or via Supabase so users can resume where they left off; align validation rules and options with triage-web.

## Tasks
- [ ] Audit onboarding steps and required fields against web validation rules and Supabase schema (service providers, specialties, services offered).
- [ ] Add persistence (local storage or Supabase) for form data and current step; restore on launch.
- [ ] Ensure custom specialty/service fields save and rehydrate correctly; match web handling.
- [ ] Align copy/options with web (specialty/services lists, required fields, validation messages).
- [ ] Add analytics events for step start/complete/drop-off to shared taxonomy.

## Dependencies / Notes
- Coordinate with web onboarding fields for consistency.
- Ensure sensitive data is stored securely if persisted locally.

## Success Criteria
- User can quit/reopen and resume at the same step with data intact.
- Validation and options match web; analytics show completion/drop-off events.
