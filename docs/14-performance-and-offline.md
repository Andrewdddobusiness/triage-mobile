# Ticket 14: Performance, Offline/Error Resilience, and Caching

## Problem
Cold start, list rendering, and network failure handling are undefined; offline behavior can degrade UX and increase support load.

## Proposal
Benchmark performance, add lightweight caching for inbox/onboarding data, and implement consistent offline/error states with retries.

## Tasks
- [ ] Measure cold start and tab switch latency; address obvious bottlenecks (bundle size, heavy hooks).
- [x] Add caching/pagination for inquiries; avoid blocking UI while fetching. *(30s cache in store; pagination still to add if needed)*
- [ ] Implement offline detection and show a standard banner + retry controls for Supabase function failures.
- [ ] Ensure onboarding/inbox actions handle timeouts gracefully without app-wide spinners.
- [ ] Document performance metrics and offline QA steps.

## Dependencies / Notes
- Relates to Ticket 08 (Inbox) and 04 (Onboarding persistence).
- Consider using query caching or lightweight state persistence; avoid overfetching on focus.
- Inbox now caches for 30s and supports pull-to-refresh + error retry; add pagination/offline banner next if scale requires.

## Success Criteria
- Acceptable load times on target devices; smooth scroll with large lists.
- Offline/poor network states show clear messaging and recover with retry.
