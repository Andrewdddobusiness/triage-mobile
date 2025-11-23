# Ticket 19: Data Deletion/Export and Account Lifecycle

## Problem
Apple requires in-app account deletion (and export where applicable). Mobile lacks a clear entry point and backend flow to delete user data and revoke linked resources (assistant, phone number).

## Proposal
Expose an in-app path to request deletion (and export if offered), wire it to a backend/Supabase function that deletes or queues deletion of user data, and confirm status to the user. Align with web handling for consistency.

## Tasks
- [ ] Add “Delete Account” entry (Profile/Help) with confirmation and legal copy; optional “Export data” link if supported.
- [ ] Implement backend function to handle deletion: disable assistant, release/mark Twilio number, delete Supabase auth/user data per policy, and log audit trail.
- [ ] Surface deletion status and support contact; handle cooldown/undo policy if any.
- [ ] Update privacy policy link/copy to reference deletion flow; add reviewer note for App Store.
- [ ] QA deletion on a test user; verify tokens revoked and app access removed.

## Dependencies / Notes
- Coordinate with triage-web deletion flow for consistent behavior.
- Ensure telemetry and crash logs stop including deleted user identifiers post-deletion.

## Success Criteria
- Users can initiate deletion in-app; backend processes or queues deletion and confirms status.
- Deleted accounts lose access; related resources are cleaned up or clearly marked for cleanup.
- App Review-compliant deletion flow documented.

