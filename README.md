# AI Drama Challenge v1.2.9

Stabilization release that removes user self-service deletion and moves irreversible account deletion to admin-only participant access management.

## What changed
- Removed the My Page self-delete panel and self-delete Server Action.
- Added admin-only permanent deletion inside `/admin/participants/[userId]#access`.
- The destructive button stays disabled until the administrator types the participant's exact display name.
- The server re-checks the display name and blocks deleting the current admin or any admin profile.
- Supabase Auth deletion remains a hard delete. Existing foreign-key cascades remove profile/challenge/submission/result/badge data.
- Used invite codes remain used and are shown as anonymous deleted-user history.

## Database
No new migration is required for v1.2.9.

Migration `005_v1_2_6_account_deletion.sql` remains part of the current schema. If it has already been applied, do not run it again.

## Deployment
1. Replace application code with v1.2.9.
2. Push to GitHub and let Vercel build/deploy.
3. Sign in as admin.
4. Open one disposable participant under `운영 관리 → 접근 관리`.
5. Type the participant's exact display name and delete the account.
6. Confirm the participant disappears from the participant list and the used invite code remains as anonymous deleted-user history.

No SQL should be run for this release.
