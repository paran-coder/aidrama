# QA Report — v1.3.0

## Scope
Private-challenge signup simplification:
- per-person invite-code requirement removed from signup,
- `profiles.display_name` presented as 톡방 닉네임,
- admin invite-code UI/query path removed,
- legacy invite-code schema/data preserved but inactive.

## Automated regression results
- Challenge rule parity: **8,190 sequences passed**
- v1.1.2 operations regression: passed
- v1.2.0 growth regression: passed
- v1.2.1 hotfix regression: passed
- v1.2.2 submission UX regression: passed
- v1.2.3 UI system regression: passed
- v1.2.4 navigation/admin resilience: passed
- v1.2.5 navigation typography: passed
- v1.2.9 admin account deletion: **15/15 passed**
- v1.2.10 admin cleanup compatibility: **8/8 passed**
- v1.2.11 build-compat regression: **6/6 passed**
- v1.2.12 public-auth regression: **9/9 passed**
- v1.3.0 signup simplification: **16/16 passed**
- TS/TSX syntax transpile: **56 files, 0 syntax errors**

## v1.3.0 checks
Confirmed:
- signup page contains no invite-code input,
- signup action performs no invite-code lookup/claim,
- Auth user creation is followed by direct `profiles` insertion,
- an orphaned Auth user is deleted if profile creation fails,
- signup guidance explicitly asks for the challenge chat-room nickname,
- admin overview contains no invite-code issuance/history UI,
- admin overview no longer queries `invite_codes`,
- participant table prioritizes 톡방 닉네임 + email,
- landing/login copy no longer requires an invite code,
- legacy `invite_codes` schema remains untouched,
- no v1.3.0 SQL migration was added.

## Dependency-aware build
A local full `next build` could not be completed because `npm install --prefer-offline` did not finish within the available 90-second execution window and no project `node_modules` is present in this workspace.

Vercel build remains the final dependency-aware compile check.

## Production verification after deploy
1. Open the site in a private/incognito browser.
2. Open `/signup` without being logged in.
3. Confirm the fields are 톡방 닉네임 / 이메일 / 비밀번호 only.
4. Create one disposable participant account.
5. Confirm automatic sign-in and onboarding.
6. Confirm the new account appears in Admin with the entered 톡방 닉네임 and email.
7. Confirm existing participants, records, badges, and admin controls remain intact.
