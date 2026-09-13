# OWL1000 v1.3.1 Migration Guide

## DB change: YES — function-only migration

Run **only** `supabase/migrations/007_v1_3_1_kst_day_alignment.sql` once in Supabase SQL Editor.

Do **not** rerun `001` through `006`.

`007` does not delete or reset participant data and does not add/drop tables or columns. It updates the milestone/missed-week helper functions so elapsed-day eligibility uses KST calendar dates, matching the web UI.

## Recommended deployment order

1. Supabase SQL Editor → run `007_v1_3_1_kst_day_alignment.sql` once.
2. Confirm the query completes successfully.
3. Replace the GitHub project files with v1.3.1 and deploy through Vercel.
4. Open the participant dashboard and confirm the elapsed day changed as expected.
5. Open Admin → participant → `제출 내역` and verify the already-submitted URL is visible.

Existing URL submissions do not need to be submitted again.
