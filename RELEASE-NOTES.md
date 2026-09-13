# OWL1000 v1.3.3 Release Notes

## Admin participant table polish
- Expanded admin shell max width on desktop without changing participant pages.
- Reduced the participant overview from nine wide columns to seven grouped columns.
- Grouped current/longest streak and success/failure counts under `인증 현황`.
- Grouped current proof range and next deadline under `인증 기간`.
- Kept nickname/email in a stable two-line identity cell with truncation protection.
- Stacked `제출 내역` and `접근 관리` actions so the last column stays inside the rounded card.
- Kept horizontal scrolling only as a fallback for narrower screens.

No DB, auth, submission, streak, badge, or rolling-week logic changes.
