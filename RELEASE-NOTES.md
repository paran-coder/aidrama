# OWL1000 v1.3.2 Release Notes

## Changed
- Weekly proof periods are now personalized 7-day windows anchored to each participant's KST challenge start date.
- Dashboard and submission pages show the exact current proof period and personal deadline.
- Admin participant views show current proof period and next deadline.

## Preserved
- KST calendar-day elapsed progress.
- 100/300/600/900/1000 milestone rules and permanent badges.
- Existing user, submission, weekly result, streak, and badge data.
- Admin submission-link review from v1.3.1.

## Database
- Requires one new migration: `008_v1_3_2_rolling_weeks.sql`.
