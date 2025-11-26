# Ticket 15: Visual Polish and Brand Consistency

## Problem
Mobile UI can drift from triage-web in color, typography, spacing, and iconography, leading to an unprofessional feel.

## Proposal
Audit and align UI elements with web branding: apply tokenized colors/typography, consistent spacing, and icon usage; clean gradients and backgrounds.

## Tasks
- [ ] Create a quick visual audit comparing key screens (welcome, onboarding, inbox, assistant, subscription, profile) to web branding.
- [x] Apply shared design tokens for colors/typography/radii/shadows; reduce ad-hoc gradients and inline styles (token file added; applied to profile/actions/inbox cards/request actions/assistant cards).
- [ ] Standardize buttons/cards/inputs and empty states; ensure backgrounds feel intentional and tradie-friendly (in progress: profile/action buttons, inbox cards, assistant cards, request actions using shared button).
- [ ] Add micro-interactions (press scale, toasts for success) and haptics aligned with a11y.
- [ ] Capture before/after screenshots for approval and App Store assets reuse.

## Dependencies / Notes
- Works with Ticket 01 (tokens/env) and Ticket 13 (contrast/a11y).
- Reuse existing icon sets; avoid introducing new fonts without approval.

## Success Criteria
- UI visually matches web tone; reviewers and stakeholders agree it looks production-ready.
- Screenshots from the app are acceptable for App Store submission.

## Notes
- Tokens added (`lib/theme.ts`) with palette/radii/shadows; profile + action buttons and inbox cards now use the shared surface/border/shadow and press-scale micro-interaction.
- Remaining: apply tokens to assistant/onboarding/subscription screens, unify empty states, add toast patterns, and capture before/after screens.
- Proposed direction: sturdy palette (charcoal base, orange primary, amber accent, cool grays), single typeface (e.g., Sora/Manrope), 8px spacing grid, consistent radii (12/24), subtle shadows, limited gradients for hero CTAs, consistent card/button/input styles, and small motion (press scale, toast on success). Empty states should use a unified card pattern with CTA; inbox/assistant/profile to adopt shared card/button components first.
