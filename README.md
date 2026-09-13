# OWL1000 — v1.3.0

Private challenge signup simplification release.

## What changed
Participants no longer need a per-person invite code. The site URL is shared only inside the challenge community, and signup identifies each participant by their **톡방 닉네임** plus email.

The database field remains `profiles.display_name`; only its product meaning/UI label changes to 톡방 닉네임. Legacy `invite_codes` tables/migrations are retained for historical compatibility but are no longer used by ordinary signup or the admin overview.

## Database
No new SQL migration for v1.3.0. Do not rerun migrations 001–006.

## Deploy verification
After Vercel deploy, create one disposable participant using 톡방 닉네임 / email / password and confirm it appears in Admin.
