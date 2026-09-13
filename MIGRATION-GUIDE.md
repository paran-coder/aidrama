# OWL1000 v1.3.3 Migration Guide

## Database
No new migration is required.

Do not rerun migrations 001-008.

## Deploy
1. Replace the current source with v1.3.3.
2. Commit/push to GitHub.
3. Confirm the Vercel build succeeds.
4. Open Admin > 운영 관리.
5. Verify the participant overview fits within the card at your normal desktop width and the right-side action buttons are fully visible.

## Data safety
This release changes presentation only. Participant accounts, submissions, streaks, rolling 7-day windows, milestones, badges, and historical data are untouched.
