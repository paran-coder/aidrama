# AI Drama Challenge v1.2.6

v1.2.6 is the member-withdrawal release built on v1.2.5.

## Main change
Regular participants can permanently delete their own account from **마이페이지 → 회원 탈퇴**.

The confirmation UI explains exactly what is deleted and what remains, and requires the user to type `탈퇴` before the irreversible action is enabled.

## Withdrawal policy
Deleted:
- Supabase Auth account
- email / display name profile
- challenge state and streaks
- submitted URLs
- weekly results
- milestone badges

Retained anonymously:
- the already-used invite-code row
- used timestamp
- an anonymous withdrawn-account marker

The old invite code never becomes reusable.

## Admin protection
Admin accounts cannot self-delete from My Page.

## Deployment
1. Run `supabase/migrations/005_v1_2_6_account_deletion.sql` once.
2. Push v1.2.6 to GitHub.
3. Let Vercel deploy.
4. Test deletion with a disposable regular user.

See `MIGRATION-GUIDE.md` and `QA-report.md`.
