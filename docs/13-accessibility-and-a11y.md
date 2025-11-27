# Ticket 13: Accessibility, Haptics, and Assistive Tech Support

## Problem
Key flows (auth, onboarding, inbox, assistant setup) may lack VoiceOver labels, focus order, and contrast compliance. Haptic feedback is inconsistent, risking App Store rejection and poor UX.

## Proposal
Audit and fix accessibility for critical screens, ensure gradients/buttons meet contrast, add meaningful accessibility labels, and standardize haptics where appropriate.

## Tasks
- [x] Add accessibility labels to shared components (Button, ProfileActionButton, FilterDropdown, InquiryCard) and key flows (sign-in, request detail call/copy buttons).
- [ ] Run full VoiceOver audit on sign-in, onboarding, inbox, assistant settings, subscription; add hints where missing.
- [ ] Ensure focus order and keyboard navigation (where applicable) are logical; avoid trapping focus inside modals.
- [ ] Check color contrast on gradients/buttons/text; adjust tokens or add alternate styles for dark/light modes.
- [ ] Standardize haptics: use consistent feedback for success, errors, and toggles; allow disable if needed.
- [ ] Add accessibility QA checklist to regression suite.

## Dependencies / Notes
- Use existing design tokens; avoid bespoke colors that diverge from triage-web.
- Coordinate with Ticket 15 for visual adjustments.

## Success Criteria
- VoiceOver can navigate and activate all primary flows with meaningful labels.
- Contrast/haptic guidance passes manual QA; no accessibility-related App Review blockers.

## Notes / current state
- Haptics added on key flows (assistant toggle/preset, phone assignment, call gating) but not yet standardized app-wide.
- No explicit accessibility labels audit has been done; gradients/buttons need contrast review across onboarding, assistant, subscription, inbox.
- Added accessibilityRole/labels to shared Button, ProfileActionButton, FilterDropdown, and InquiryCard; still need a broader audit and contrast pass.
- Add a11y checklist to regression suite once audit fixes land.
