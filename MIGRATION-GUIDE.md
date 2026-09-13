# OWL1000 v1.3.2 Migration Guide

## Required migration
Run `supabase/migrations/008_v1_3_2_rolling_weeks.sql` once after 007.

Do not rerun 001-007 if they have already been applied.

## What 008 does
- Changes the canonical weekly window from Monday-Sunday to participant-specific 7-day windows anchored on the KST challenge start date.
- Remaps existing `submissions.week_start`, `weekly_results.week_start`, `audit_logs.week_start`, `challenges.first_judgement_week_start`, and `challenges.last_processed_week_start` to the new anchor while preserving records.
- Updates submission, missed-window, admin-correction, and batch-sync functions to use the participant anchor.
- Keeps milestone eligibility on KST calendar-day rules.

## Verification after deployment
- Existing submitted URLs are still present.
- Existing streaks/results are preserved after reconciliation.
- A participant's current proof window begins on their challenge start weekday, not Monday.
- The admin participant page shows the same period and deadline as the participant dashboard.
