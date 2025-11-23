# Ticket 13: Accessibility, Haptics, and Assistive Tech Support

## Problem
Key flows (auth, onboarding, inbox, assistant setup) may lack VoiceOver labels, focus order, and contrast compliance. Haptic feedback is inconsistent, risking App Store rejection and poor UX.

## Proposal
Audit and fix accessibility for critical screens, ensure gradients/buttons meet contrast, add meaningful accessibility labels, and standardize haptics where appropriate.

## Tasks
- [ ] Run VoiceOver audit on sign-in, onboarding, inbox, request detail, assistant settings, subscription; add accessibilityLabel/hint where missing.
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

