# Context Notes — v1.2.9

## Purpose
Stabilization release. Remove direct self-service account deletion and move irreversible account deletion to admin-only participant access management.

## Confirmed product decisions
- Regular users do not directly delete their own Auth account from My Page.
- Admin deletion is available only inside `/admin/participants/[userId]` access management.
- Admin accounts cannot be deleted through this participant flow.
- The administrator must type the participant's exact display name before the destructive button becomes enabled.
- Deleting an account removes Supabase Auth + profile/challenge/submission/result/badge data through existing cascades.
- A used invite code remains used. Before deletion, `used_account_deleted_at` is stamped so admin history can show an anonymous deleted-user record.
- Migration 005 remains valid. No new SQL migration is added in v1.2.9.

## Scope
1. Remove user self-delete panel/action and related success redirect UI.
2. Add admin-only hard-delete server action.
3. Add guarded delete UI to participant access management.
4. Keep suspend/reactivate workflow unchanged.
5. Add v1.2.9 regression checks and update docs/package version.
