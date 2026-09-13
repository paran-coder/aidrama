# OWL1000 v1.3.2 QA Report

## Result
PASS for the implemented personal rolling-week change within the available local verification scope.

## Verified
- Challenge rule parity: 8,190 success/failure sequences passed.
- Existing v1.1.2 operations regression passed.
- Existing v1.2.0 growth/milestone regression passed.
- Existing v1.2.1 hotfix regression passed.
- Submission UX regression passed with the new personal-period schedule.
- Existing v1.2.3 UI system regression passed.
- Existing v1.2.4 navigation/admin resilience regression passed.
- Existing v1.2.5 navigation typography regression passed.
- Existing v1.2.9 admin deletion regression passed.
- Existing v1.2.10 cleanup regression passed.
- Existing v1.2.11 build-compat regression passed.
- Existing v1.2.12 public-auth regression passed.
- Existing v1.3.0 signup simplification regression passed.
- Existing v1.3.1 KST elapsed-day/admin-link regression passed.
- New v1.3.2 rolling-window source/migration checks passed.
- Rolling-window calendar arithmetic tested for all seven possible start weekdays: start through day 6 stays in the current window; day 7 opens the next window.
- Legacy Monday week keys were tested for deterministic remapping to the participant anchor without changing seven-day spacing.
- TS/TSX syntax transpile: 56 files, 0 syntax errors.
- Active source audit found no remaining Monday-Sunday fixed-window copy or `kst_week_start(now())` usage in v1.3.2 application code / migration 008.

## Migration safety design
`008_v1_3_2_rolling_weeks.sql` runs in one transaction. It temporarily removes the composite official-submission FK, remaps existing submissions/results/audit week keys, updates each challenge anchor to its KST start date, recreates the FK, replaces rolling-window database functions, reconciles counters, and commits.

Existing row IDs, submission URLs, weekly-result IDs, badge references, user accounts, and challenge IDs are not deleted by migration 008.

## Environment limitation
A dependency-aware `next build` was not completed in this workspace because project dependencies are not installed locally. Vercel build remains the final framework/type/dependency validation step.
