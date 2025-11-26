# Ticket 18: Push Notifications for Inquiries and Assistant Events

## Problem
Users receive no push notifications for new inquiries, status changes, or assistant/number events, reducing responsiveness and perceived value.

## Proposal
Add push notifications using Expo Notifications (or bare APNs/FCM if preferred): request permission with compliant copy, register device tokens, send notifications on key events (new inquiry, assigned number, assistant status), and handle foreground/background delivery.

## Tasks
- [ ] Decide notification scope (new inquiries, status updates, number assignment success/failure, assistant enabled/disabled).
- [x] Implement permission prompt with clear value proposition; handle denial gracefully.
- [x] Register and store Expo push token (or APNs/FCM token) tied to the authenticated user/service provider.
- [ ] Implement server-side trigger (Supabase function or backend) to send notifications for chosen events.
- [x] Add in-app handlers for foreground notifications and deep links into screens (inquiry detail, assistant settings).
- [ ] QA on device/TestFlight for foreground, background, and tapped notifications.

## Dependencies / Notes
- Requires Expo Notifications setup with proper APNs key and FCM config; coordinate with existing Apple key (`AuthKey_WYTWHJ77F7.p8`) and bundle ID.
- Ensure copy aligns with permissions/compliance (Ticket 16) and analytics capture opt-in/opt-out (Ticket 11).
- Expo Notifications wired; tokens upserted to `push_tokens` (platform + auth_user/service_provider). Notification responses route to inquiry detail (`requestId`) or assistant settings. Server-side triggers still needed for real events.

## Success Criteria
- Users receive timely notifications for selected events; tapping opens the relevant screen.
- Permissions prompt is clear; denial does not block app usage.
- No crashes or missing notifications in background/terminated states during TestFlight QA.
