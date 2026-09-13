# Context Notes — v1.2.6

## Final scope
- Self-service account deletion for regular users.
- Admin self-deletion forbidden.
- Typed confirmation phrase `탈퇴` required both in UI and server action.
- Clear irreversible-delete guidance message.
- Supabase Auth hard delete.
- Existing FK cascades delete profile/challenge/submission/result/badge data.
- Used invite code stays consumed and is anonymized after withdrawal.
- `used_account_deleted_at` records the anonymous withdrawal state; no email/name snapshot is retained.

## Deployment dependency
Run migration `005_v1_2_6_account_deletion.sql` before deploying application code.

## Live test still required
Use a disposable regular account after deployment to verify the live Supabase cascade and session cleanup end-to-end.
