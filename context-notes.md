# OWL1000 v1.3.1 context notes

## Scope
- Fix elapsed-day/progress calculations to use KST calendar-day boundaries consistently.
- Keep weekly streak semantics unchanged.
- Align dashboard, community, admin, milestone eligibility and badge timing to the same KST day calculation.
- Add admin visibility for participant-submitted URLs using existing submissions data.
- No destructive data migration. Preserve all participant records.

## Product rules
- Weekly proof window remains Monday 00:00–Sunday 23:59 KST.
- Milestones remain 100/300/600/900/1000 days.
- Badge awards still happen only on the next normal successful weekly verification after the milestone date is reached.
- Submitted links are participant data and should be visible only in authenticated admin operations pages.
