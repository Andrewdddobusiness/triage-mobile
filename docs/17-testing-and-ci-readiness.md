# Ticket 17: Automated Tests, QA Scripts, and CI Readiness

## Problem
Limited automated coverage and no enforced lint/test gates risk regressions before release.

## Proposal
Add targeted tests (stores, hooks, components), lint/format checks, and QA scripts; wire them into CI to block regressions.

## Tasks
- [x] Add jest-expo unit tests for stores/hooks: `useCustomerInquiries` (happy/offline). Onboarding/subscription logic still TODO.
- [ ] Add component interaction/snapshot tests for filters, InquiryCard, onboarding forms, and assistant settings.
- [ ] Enable lint/format scripts and ensure they pass on CI; document local commands.
- [ ] Add manual QA scripts for critical flows (auth, subscription, onboarding, number assignment, inbox actions) and include in README.
- [ ] Configure CI (GitHub Actions or equivalent) to run lint/test on PR.

## Dependencies / Notes
- Use existing jest-expo setup; ensure mocks for Supabase/functions are available.
- Coordinate with Ticket 11 (observability) for event assertions if desired.

## Success Criteria
- CI pipeline runs lint + tests and blocks on failure.
- Key flows have automated coverage; QA scripts are available for release validation.

## Notes / Remaining
- Added jest tests for `useCustomerInquiries` (success + offline) with moduleNameMapper for `~/*` imports. Expand coverage to onboarding/subscription logic and UI components.
- CI workflow not set up yet; lint/format gating pending. Add manual QA checklist for auth/subscription/onboarding/number assignment/inbox.
