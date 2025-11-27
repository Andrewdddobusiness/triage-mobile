# Ticket 20: PII Handling, Redaction, and Secure Storage

## Problem
Customer phone numbers, emails, and inquiry details appear in UI and could leak via logs, screenshots, or insecure storage; clipboard usage is manual and unguarded.

## Proposal
Audit PII handling end-to-end, ensure tokens and sensitive data use secure storage, redact PII from logs/analytics, and provide controlled copy-to-clipboard UX.

## Tasks
- [x] Audit all logging/console statements to remove phone/email/PII; ensure analytics events use hashed/truncated data where possible.
- [x] Store auth/session tokens in SecureStore; avoid persisting PII locally unless necessary and encrypted.
- [x] Add optional warning/toast when copying customer info; ensure clipboard is used intentionally.
- [x] Mask/shorten phone/email in UI where full values aren’t needed; protect from accidental screenshots where feasible.
- [x] Document PII handling policy and include in privacy/compliance notes.

## What Changed
- Added `secureStorage` (expo SecureStore with web-safe fallback) and pointed Supabase auth + onboarding persistence at it to keep auth tokens and form PII off AsyncStorage/local files.
- Introduced PII utilities (`maskPhone`, `maskEmail`, `scrubPII`) and wired analytics logging to automatically redact likely phone/email values.
- Removed Twilio token/identity console logging and other console prints that could carry identifiers; archive/demo screens now mask contact details when logged.
- Reworked copy buttons (requests, profile, assistant settings, phone assignment) to gate copying behind a one-time warning and haptic feedback so clipboard usage is deliberate.
- Masked phone/email display in request detail, profile, assistant settings, and call UI; location/address is truncated. Added UI hints to avoid screenshots when full values are needed.

## PII Handling Notes / QA
- Auth/session tokens and onboarding form drafts live in SecureStore; no plain-text persistence of phone/email tokens. Web/test fallback keeps data in-memory only.
- Console/analytics logs are redacted automatically; avoid adding raw phone/email to new logs or analytics props.
- Copying customer info shows a confirmation the first time per session; Android receives a toast reminder to clear clipboard. Use copy/call actions to access full values (UI shows masked versions).
- Screenshot risk reduced by masking; if a flow requires full values visible, ensure surrounding copy warns users.
- QA: sign-in persistence across app restarts (SecureStore), copy buttons still work after warning, call/message flows operate with masked UI, and no console output reveals PII.

## Dependencies / Notes
- Coordinate with Ticket 11 (analytics) and Ticket 16 (permissions/consent) to keep data use consistent.
- Some flows (call/message) require full numbers; avoid breaking functionality.

## Success Criteria
- No PII in logs or analytics; clipboard usage is deliberate with feedback.
- Tokens securely stored; no plaintext sensitive data persisted.
- QA signoff on PII handling checklist.
