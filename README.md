# OWL1000 v1.3.3

OWL1000 is a private creator challenge web app. v1.3.3 is a UI-only admin table layout patch on top of v1.3.2.

## What changed
- Admin participant overview uses a wider desktop shell.
- Participant table is compacted so the right-side actions stay visible on common desktop widths.
- Proof period + deadline and streak + success/failure are grouped into clearer columns.
- Nickname/email remain easy to scan.
- No DB or challenge-rule changes.

## Deployment
1. Replace the current app code with v1.3.3.
2. Push to GitHub.
3. Let Vercel build and deploy.
4. Open Admin > 운영 관리 and verify the participant table at your usual desktop width.

## Database
No new SQL. Do not rerun migrations 001-008.
