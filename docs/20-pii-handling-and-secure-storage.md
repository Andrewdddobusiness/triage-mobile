# Ticket 20: PII Handling, Redaction, and Secure Storage

## Problem
Customer phone numbers, emails, and inquiry details appear in UI and could leak via logs, screenshots, or insecure storage; clipboard usage is manual and unguarded.

## Proposal
Audit PII handling end-to-end, ensure tokens and sensitive data use secure storage, redact PII from logs/analytics, and provide controlled copy-to-clipboard UX.

## Tasks
- [ ] Audit all logging/console statements to remove phone/email/PII; ensure analytics events use hashed/truncated data where possible.
- [ ] Store auth/session tokens in SecureStore; avoid persisting PII locally unless necessary and encrypted.
- [ ] Add optional warning/toast when copying customer info; ensure clipboard is used intentionally.
- [ ] Mask/shorten phone/email in UI where full values aren’t needed; protect from accidental screenshots where feasible.
- [ ] Document PII handling policy and include in privacy/compliance notes.

## Dependencies / Notes
- Coordinate with Ticket 11 (analytics) and Ticket 16 (permissions/consent) to keep data use consistent.
- Some flows (call/message) require full numbers; avoid breaking functionality.

## Success Criteria
- No PII in logs or analytics; clipboard usage is deliberate with feedback.
- Tokens securely stored; no plaintext sensitive data persisted.
- QA signoff on PII handling checklist.

