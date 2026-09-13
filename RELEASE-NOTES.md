# v1.2.8 Release Notes

## Fixed
- Fixed the post-account-deletion path that could display the generic “잠시 연결이 불안정합니다” screen after a successful Supabase Auth user deletion.
- Deleted-user JWT and stale refresh/session errors are now treated as signed-out state instead of connectivity failures.
- Account deletion now performs an explicit cleanup of Supabase auth cookies after sign-out and before redirecting.

## Unchanged
- Account deletion policy remains unchanged.
- Invite-code anonymized history behavior remains unchanged.
- No challenge, badge, submission, admin, or navigation logic changes.
- No database migration is required.
