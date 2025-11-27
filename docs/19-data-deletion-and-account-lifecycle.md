# Ticket 19: Data Deletion/Export and Account Lifecycle

## Problem
Apple requires in-app account deletion (and export where applicable). Mobile lacks a clear entry point and backend flow to delete user data and revoke linked resources (assistant, phone number).

## Proposal
Expose an in-app path to request deletion (and export if offered), wire it to a backend/Supabase function that deletes or queues deletion of user data, and confirm status to the user. Align with web handling for consistency.

## Tasks
- [x] Add “Delete Account” entry (Profile/Help) with confirmation and legal copy; optional “Export data” link if supported (entry in Profile → Delete Account).
- [x] Implement backend function to handle deletion request queue and cleanup (Edge function `request-account-deletion` disables assistant, releases number, deletes auth user, logs status in `account_deletion_requests`).
- [x] Surface deletion status and support contact; handle cooldown/undo policy if any (status shown on Profile if a deletion request exists).
- [ ] Update privacy policy link/copy to reference deletion flow; add reviewer note for App Store.
- [ ] QA deletion on a test user; verify tokens revoked and app access removed.

## Dependencies / Notes
- Coordinate with triage-web deletion flow for consistent behavior.
- Ensure telemetry and crash logs stop including deleted user identifiers post-deletion.
- Requires Supabase table `account_deletion_requests` (auth_user_id, service_provider_id, email, status, requested_at) and follow-up worker to perform actual deletion (disable assistant, release number, delete auth user).

## Success Criteria
- Users can initiate deletion in-app; backend processes or queues deletion and confirms status.
- Deleted accounts lose access; related resources are cleaned up or clearly marked for cleanup.
- App Review-compliant deletion flow documented.
