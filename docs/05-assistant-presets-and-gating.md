# Ticket 05: Assistant Presets and Enablement Gating

## Problem
Assistant preset selection and enablement are dependent on having a business number; inconsistencies can leave users stuck or misconfigured.

## Proposal
Ensure preset catalog matches triage-web, selection persists to Supabase, and assistant toggles remain disabled until prerequisites (business number) are met with clear copy.

## Tasks
- [ ] Load assistant preset list from Supabase and render parity with web (name/description/avatar).
- [ ] Update assistant preset selection to persist `assistant_preset_id` and confirm state on reload.
- [ ] Gate the assistant enable toggle on having an assigned business number; show informative messaging.
- [ ] Add confirmation/success feedback and error handling for preset updates and toggle changes.

## Dependencies / Notes
- Supabase tables: `assistant_presets`, `service_provider_assistants`, `twilio_phone_numbers`.
- Coordinate copy with web for consistency.

## Success Criteria
- Preset changes are reflected in Supabase and persist across app restarts.
- Assistant cannot be enabled without a business number; users see clear guidance.

