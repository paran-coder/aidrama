# OWL1000 v1.3.1

OWL1000 is a private 1000-day creator challenge web service.

## v1.3.1
- KST calendar-day progress (`9/13 → 9/14` becomes day `0 → 1` at midnight KST).
- Shared progress calculation across dashboard, community, mypage and admin.
- KST-aligned milestone/badge eligibility through Supabase migration 007.
- Admin-only participant submission-link history with direct URL access and official-proof marking.

## Database
Run `007_v1_3_1_kst_day_alignment.sql` once before/with deployment. Do not rerun 001–006.
