# OWL1000 v1.3.2

OWL1000 is a 1000-day creator challenge web app. v1.3.2 changes the weekly proof cadence from a shared Monday-Sunday calendar week to a participant-specific 7-day proof window anchored on each participant's challenge start date.

## v1.3.2 highlights
- Personal 7-day proof windows starting on the participant's KST challenge start date.
- KST calendar-day elapsed progress and 100/300/600/900/1000 milestones remain unchanged.
- Participant UI shows the exact current proof period and deadline.
- Admin views show each participant's current proof period and next deadline.
- Existing submissions/results are preserved by migration 008 and remapped to the new personal window keys.

## Deployment
1. Apply migrations through `008_v1_3_2_rolling_weeks.sql` in order. If 001-007 are already applied, run only 008.
2. Deploy this project to Vercel with the existing Supabase environment variables.
3. Verify one existing participant's current period, existing submitted link, streak, and admin detail view.

See `MIGRATION-GUIDE.md` and `QA-report.md` for details.
