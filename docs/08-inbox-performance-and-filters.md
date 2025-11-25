# Ticket 08: Inbox Performance, Filters, and Search

## Problem
Inbox relies on `get-inquiries` and client-side filtering; performance, empty states, and search behavior may be inconsistent with web expectations.

## Proposal
Optimize list loading, implement reliable status/job-type filters, define search behavior (client vs server), and provide solid loading/empty/error states.

## Tasks
- [x] Benchmark list load and add lightweight caching to avoid refetch within 30s; keep refresh control to force reload.
- [x] Validate status/job-type filters for correctness and fast toggling.
- [x] Implement search (client-side) with clear UI and debounce-friendly input.
- [x] Improve loading/empty/error states with web-aligned copy and refresh/retry controls.

## Dependencies / Notes
- Currently uses `get-inquiries` edge function + 30s cache; server-side pagination/search can be added if web moves to direct RLS queries.
- Copy aligns with web: empty state encourages sharing the business number; error state offers retry/pull-to-refresh.

## Success Criteria
- Inbox loads quickly, filters are accurate, and search behaves per spec.
- Empty/loading/error states are polished and consistent with web.
