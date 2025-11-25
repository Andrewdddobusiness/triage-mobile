# Ticket 09: Request Detail Actions and Status Updates

## Problem
Request detail actions (call/message) are stubbed/disabled, and status updates aren’t exposed in UI, limiting usefulness.

## Proposal
Implement or intentionally disable request actions with rationale, add status update controls using `updateInquiryStatus`, and ensure formatting (currency/date/location) matches locale expectations.

## Tasks
- [x] Decide on call/message actions; implement or hide with inline rationale/tooltips.
- [x] Add status update UI with optimistic update and rollback on failure.
- [x] Format budget/date/location per locale; ensure copy/clipboard actions work.
- [ ] Add tests for status update flow and manual QA scripts.

## Dependencies / Notes
- Uses `useCustomerInquiries` store and `updateInquiryStatus`; align statuses with web.
- Interaction with Ticket 07 for call behavior (native dialer); messaging is deferred with rationale in UI.

## Success Criteria
- Users can change status and see it persist; errors are surfaced cleanly.
- Request actions are either functional or clearly disabled with explanation.

## Remaining to close
- Add tests/manual QA script for status update flow (optimistic update + rollback on failure) and call action success/failure.
