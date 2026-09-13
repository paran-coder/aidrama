# v1.2.8 QA Report

## Result
PASS — account-deletion session resilience patch is structurally verified.

## Regression checks
- Challenge rule parity: 8,190 sequences passed.
- v1.1.2 operations structure: passed.
- v1.2.0 growth/milestone structure: passed.
- v1.2.1 hotfix checks: passed.
- v1.2.2 submission UX checks: passed.
- v1.2.3 UI system checks: passed.
- v1.2.4 navigation/admin resilience: passed.
- v1.2.5 active-nav typography: passed.
- v1.2.6 account deletion checks: 13/13 passed.
- v1.2.7 dedicated account-action module: 9/9 passed.
- v1.2.8 account-deletion session checks: 10/10 passed.

## v1.2.8 specific verification
- Deleted-user JWT error (`User from sub claim in JWT does not exist`) is classified as signed-out state.
- Missing/invalid refresh-token and missing-session patterns are classified as signed-out state.
- Network/unknown errors are not blanket-swallowed by the classifier.
- Account deletion still attempts Supabase sign-out.
- Supabase auth cookies are explicitly removed before the success redirect.
- Landing success message remains present.

## Dependency-aware validation limit
The working package intentionally does not include `node_modules`. `tsc --noEmit` therefore cannot resolve Next.js, React, Supabase, or Node type packages in this runtime. The reported errors are dependency-resolution failures rather than a completed project typecheck. Vercel build remains the final dependency-aware validation point.

## Required production check
Use one disposable normal-user account:
1. Sign in.
2. Open My Page and delete the account.
3. Confirm redirect to landing page with the account-deleted success message.
4. Confirm the generic temporary connection error is not shown.
5. Confirm the deleted account cannot sign in again.
6. Confirm admin invite history shows anonymized deleted-user history.
