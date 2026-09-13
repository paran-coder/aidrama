# Production Upgrade Guide — v1.1.1 → v1.2.0

This guide matches the current live setup: Vercel is running the v1.1.x app and Supabase has `001_init.sql` applied.

## 1. Keep the existing Supabase project
Do not create a new database. Existing admin/test accounts, invite history, challenge and submission records are preserved.

## 2. Apply migration 002
Open Supabase → SQL Editor → New query. Paste the full contents of:

```text
supabase/migrations/002_v1_1_2_ops.sql
```

Run it once and confirm success.

This adds invite revocation history, participant suspension/reactivation, audit actions and batch synchronization.

## 3. Apply migration 003
In a new SQL Editor query, paste and run:

```text
supabase/migrations/003_v1_2_0_growth.sql
```

Run it once and confirm success.

This adds permanent milestone badges, sequential milestone awarding and the non-regressing creator-level model. Existing weekly history is retained and eligible historical successes are backfilled sequentially.

## 4. Update GitHub
Replace the repository code with the v1.2.0 release. Never commit `.env.local`.

## 5. Vercel deploy
Git push should trigger deployment automatically. The existing five environment variables remain unchanged.

For latency, confirm Vercel Function Region is close to the Supabase database region.

## 6. Smoke test after deployment
Use the existing admin account and one test participant:

1. Admin login opens `/admin` directly.
2. Create an invite code and confirm immediate pending feedback.
3. Confirm used invite code displays participant email + use time.
4. Confirm unused code can be revoked but used code remains history.
5. Confirm participant login/dashboard/community/mypage still work.
6. Confirm current first target is 100 days and Lv.1 Creator is shown.
7. Confirm existing earned milestone rows (if any) display correctly.
8. Confirm admin preview is read-only.

## 7. Do not do these
- Do not rerun `001_init.sql` on the live database.
- Do not rerun 002/003 after successful execution.
- Do not delete used invite codes to block users; use participant suspension instead.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY`.
