# Ticket 05: Assistant Presets and Enablement Gating

## Problem
Assistant preset selection and enablement are dependent on having a business number; inconsistencies can leave users stuck or misconfigured.

## Proposal
Ensure preset catalog matches triage-web, selection persists to Supabase, and assistant toggles remain disabled until prerequisites (business number) are met with clear copy.

## Tasks
- [x] Load assistant preset list from Supabase and render parity with web (name/description/avatar).
- [x] Update assistant preset selection to persist `assistant_preset_id` and confirm state on reload.
- [x] Gate the assistant enable toggle on having an assigned business number; show informative messaging.
- [x] Add upgrade gate: disable toggle when no active subscription with upsell CTA.
- [x] Add confirmation/success feedback and error handling for preset updates and toggle changes.
- [x] Instrument preset/toggle changes and gated-action upsell CTAs (impression/click/error) to match web empty/gated analytics.

## Remaining to close
- Add user feedback for preset/toggle changes (success toast, error state, optimistic update with rollback).
- Instrument analytics for preset/toggle changes and gated upsells: impressions, clicks, success/error, subscription state.

## Dependencies / Notes
- Supabase tables: `assistant_presets`, `service_provider_assistants`, `twilio_phone_numbers`.
- Coordinate copy with web for consistency.

## Success Criteria
- Preset changes are reflected in Supabase and persist across app restarts.
- Assistant cannot be enabled without a business number; users see clear guidance.
