# Ticket 15: Visual Polish and Brand Consistency

## Problem
Mobile UI can drift from triage-web in color, typography, spacing, and iconography, leading to an unprofessional feel.

## Proposal
Audit and align UI elements with web branding: apply tokenized colors/typography, consistent spacing, and icon usage; clean gradients and backgrounds.

## Tasks
- [ ] Create a quick visual audit comparing key screens (welcome, onboarding, inbox, assistant, subscription, profile) to web branding.
- [ ] Apply shared design tokens for colors/typography and reduce ad-hoc inline styles.
- [ ] Standardize button styles, cards, and empty states; ensure backgrounds/gradients feel intentional.
- [ ] Capture before/after screenshots for approval and App Store assets reuse.

## Dependencies / Notes
- Works with Ticket 01 (tokens/env) and Ticket 13 (contrast/a11y).
- Reuse existing icon sets; avoid introducing new fonts without approval.

## Success Criteria
- UI visually matches web tone; reviewers and stakeholders agree it looks production-ready.
- Screenshots from the app are acceptable for App Store submission.

## Notes
- No visual audit or token cleanup done yet; gradients/buttons remain ad-hoc across onboarding/assistant/inbox. Requires design pass.
