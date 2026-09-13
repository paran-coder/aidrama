# v1.2.9 Release Notes

## Changed
- Removed user self-service account deletion from My Page.
- Moved permanent deletion to admin-only Participant Access Management.
- Added exact display-name confirmation before the destructive action becomes available.
- Added server-side confirmation and protections against deleting the current admin or another admin profile.
- Split the destructive action into a dedicated `admin-account-deletion.ts` Server Action module.

## Preserved
- Existing suspend/reactivate behavior is unchanged.
- Existing challenge, submission, badge, navigation, and invite-code rules are unchanged.
- Migration 005 remains valid for anonymous deleted-account invite history.

## Database
No new migration in v1.2.9.
