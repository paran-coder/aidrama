# OWL1000 v1.3.8 QA Report

## Scope
- Multiple URL submissions inside one participant-specific 7-day proof period
- First successful URL remains official
- Additional URLs are append-only records
- No duplicate streak/success/badge increase
- Admin view preserves all links and marks one official link

## Results
- Challenge rule parity: **8,190 sequences passed**
- Existing regression scripts v1.1.2 ~ v1.3.7: **passed**
- v1.3.8 multi-submission checks: **17/17 passed**
- TS/TSX syntax transpile: **56/56 passed**

## v1.3.8 checks
1. Existing weekly result state is captured before inserting an additional submission.
2. A finalized failure blocks normal participant submission.
3. Every valid in-window URL is inserted into `submissions`.
4. Additional submissions return before any new `weekly_results` row is created.
5. First submission creates the single official success result.
6. Additional submissions never update `final_submission_id`.
7. Streak/badge reconciliation runs only for the first official submission.
8. Server action distinguishes official vs additional by `final_submission_id`.
9. Additional submission redirects back to the submit page with confirmation.
10. Submit form remains available after official success.
11. UI explains that the first normal submission is official.
12. Dashboard exposes `추가 작업 URL 기록하기` after success.
13. Dashboard distinguishes a finalized failure from success.
14. Admin participant detail lists all submissions.
15. Admin marks only the official submission.
16. Admin official history groups all attempts by proof period.
17. Package/version alignment is v1.3.8.

## Build note
A full dependency-aware `next build` was not executed in this workspace because the project dependencies are not installed locally. Vercel build remains the final compile/type integration check.

## Database
Migration required: `009_v1_3_8_multi_submissions.sql`.
This migration changes only the `record_submission_success` function; it does not add/drop tables or columns and does not rewrite existing participant data.
