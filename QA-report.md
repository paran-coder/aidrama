# OWL1000 v1.3.3 QA Report

## Scope
Admin participant overview table layout patch only.

## Verified
- Challenge rule parity: 8,190 sequences passed.
- v1.1.2 operations regression passed.
- v1.2.0 growth regression passed.
- v1.2.1 hotfix regression passed.
- v1.2.2 submission UX regression passed.
- v1.2.3 UI system regression passed.
- v1.2.4 navigation/admin resilience regression passed.
- v1.2.5 navigation typography regression passed.
- v1.2.9 admin account deletion regression passed: 15/15.
- v1.2.10 admin cleanup regression passed: 8/8.
- v1.2.11 build compatibility regression passed: 6/6.
- v1.2.12 public-auth regression passed: 9/9.
- v1.3.0 signup simplification regression passed: 16/16.
- v1.3.1 KST/admin submission-link regression passed: 14 checks.
- v1.3.2 rolling 7-day window regression passed, including all seven possible start weekdays and legacy-key remapping cases.
- v1.3.3 admin table layout regression passed: 10/10.
- TS/TSX syntax transpile: 56 files, 0 errors.

## v1.3.3-specific checks
- Admin shell uses a wider desktop max width.
- Participant table fallback min width reduced to 980px and uses fixed column allocation.
- Nickname/email remain a stable two-line identity cell with truncation protection.
- Current/longest streak and success/failure are grouped under `인증 현황`.
- Proof period and deadline are grouped under `인증 기간`.
- Date labels and action buttons use nowrap where needed.
- Action column has explicit right padding.
- `제출 내역` and `접근 관리` remain available.

## Not run locally
A full dependency-aware `next build` was not run in this workspace. Vercel build remains the final integration/build verification point.

## Database
No migration for v1.3.3. Do not rerun 001-008.
