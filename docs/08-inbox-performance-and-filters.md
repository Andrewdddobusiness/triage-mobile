# Ticket 08: Inbox Performance, Filters, and Search

## Problem
Inbox relies on `get-inquiries` and client-side filtering; performance, empty states, and search behavior may be inconsistent with web expectations.

## Proposal
Optimize list loading, implement reliable status/job-type filters, define search behavior (client vs server), and provide solid loading/empty/error states.

## Tasks
- [ ] Benchmark list load and scrolling; add pagination or caching if needed.
- [ ] Validate status/job-type filters for correctness and fast toggling.
- [ ] Specify and implement search (client or server) with debouncing and clear UI.
- [ ] Improve loading/empty/error states with web-aligned copy and refresh controls.

## Dependencies / Notes
- Supabase function `get-inquiries`; consider server-side filter/search for scale.
- Align copy with triage-web inbox.

## Success Criteria
- Inbox loads quickly, filters are accurate, and search behaves per spec.
- Empty/loading/error states are polished and consistent with web.

