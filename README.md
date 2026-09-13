# AI Drama Challenge v1.2.8

Patch release focused on account-deletion session cleanup.

## What changed
When a Supabase Auth user is hard-deleted, a browser can briefly retain an old auth token. v1.2.8 recognizes deleted/invalid auth-session errors as signed-out state and explicitly clears Supabase auth cookies before redirecting to the landing page.

Expected successful flow:

`마이페이지 → 회원 탈퇴 → 영구 삭제 → 세션 정리 → 랜딩 페이지 → 회원 탈퇴 완료 안내`

## Database
No database migration is required for v1.2.8. If migration `005_v1_2_6_account_deletion.sql` was already applied, do not run it again.

## Deployment
Replace the application code with v1.2.8 and deploy through GitHub/Vercel. After the build succeeds, run one disposable-user account-deletion test before inviting all participants.
