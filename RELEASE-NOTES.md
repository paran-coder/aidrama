# OWL1000 v1.3.1 Release Notes

## Fixed
- Elapsed day/progress now changes at KST calendar midnight instead of after rolling 24-hour blocks.
- Dashboard, community, mypage and admin use the same shared day calculation.
- Milestone badge eligibility and calendar-completion helpers are aligned to the same KST date rule through migration 007.

## Admin operations
- Added a visible `제출 내역` action in the participant table.
- Added an admin-only `참여자 제출 링크` section showing week, submitted time, original URL, verification status and whether the URL is the official accepted proof.

## Data safety
- Existing submissions, streaks, profiles and badges are preserved.
- No table/column deletion or participant data reset.
