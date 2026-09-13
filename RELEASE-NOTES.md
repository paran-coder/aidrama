# Release Notes — v1.2.0

## Participant-facing changes
- First goal is 100 days while OWL1000 remains one continuous journey.
- Permanent milestones: 100 / 300 / 600 / 900 / 1000.
- Creator identity begins at Lv.1 on day zero.
- Permanent creator levels: Creator → Routine → Story → Signature → Master.
- Weekly failure can break streak but cannot take away creator level or badges.
- New warm floral five-stage owl mascot across landing, dashboard and community.
- Dashboard now prioritizes the current milestone and shows overall 1000-day progress secondarily.
- New one-time milestone celebration after a badge-winning submission.

## Admin / operations changes included from v1.1.2
- Correct admin post-login routing.
- Invite revoke/history/user email tracking.
- Participant suspension/reactivation.
- Audit log support.
- Batch list synchronization and pending UI states.

## Database changes
Apply migrations `002` then `003` to the current live database before deploying this code. See `MIGRATION-GUIDE.md`.
