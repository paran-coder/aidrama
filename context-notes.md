# Context Notes — AI Drama Challenge v1.2.0

## Release intent
v1.2.0 changes the motivation model while preserving the single continuous OWL1000 journey. The product no longer asks a new participant to psychologically commit to 1000 days at once. The first visible target is 100 days, followed by 300, 600, 900 and 1000.

## Confirmed product decisions
- One continuous challenge; milestones do not create new challenge records.
- Current targets: 100 → 300 → 600 → 900 → 1000 days.
- Badge is awarded only after its day threshold has been reached and a qualifying weekly success is recorded.
- **One successful weekly proof can award at most the next unearned milestone.** Long inactivity never causes mass-unlock.
- Earned badges are permanent.
- User identity starts at **Lv.1 Creator** on day zero. Nobody waits until day 1000 to become a creator.
- Levels are badge-driven: no badge = Lv.1, 100 = Lv.2, 300 = Lv.3, 600 = Lv.4, 900 = Lv.5. The 1000 badge is completion, not Lv.6.
- Weekly failure never lowers creator level or mascot stage.
- A failure still breaks the current streak and increments consecutive-failure status. 2 failures show a warning; 3 failures show a restart prompt, but earned identity/progress is never removed.
- Existing historical v1.1 stage-drop/reset columns remain for schema compatibility only. v1.2 canonical reconciliation clears active stage overrides and reset counts.

## Approved owl direction
Five-stage warm floral owl mascot, same character growing in confidence and visual richness. No egg stage.
1. Lv.1 Creator — small complete young owl.
2. Lv.2 Routine Creator — notebook/pencil, stable habit cues.
3. Lv.3 Story Creator — expressive storytelling/book cues.
4. Lv.4 Signature Creator — refined personal style, signature detail.
5. Lv.5 Master Creator — premium hero form with richest floral treatment.

Approved concept reference: `spec/owl-v1.2-concept.png`.
Production assets are cropped for app readability, with separate stage and compact thumbnail files.

## UI direction
- Landing leads with "already a creator" + first 100-day promise.
- Dashboard makes the current milestone the primary progress bar and keeps full 1000-day progress secondary.
- When threshold is reached before the qualifying success, progress stays visually complete at target rather than showing values such as 120/100.
- Newly earned milestone shows a small non-blocking celebration; animation is disabled under reduced-motion preferences.
- Community card shows level, compact owl, streak and earned badges.
- My Page shows permanent creator identity and milestone badges.
- Completion remains a distinct 1000-day archive state.

## Operations carried forward from v1.1.2
- Admin defaults to `/admin`; participant challenge routes redirect admins away from mutation flows.
- Invite revocation is separate from participant suspension.
- Used invite codes are historical records, not deletable access switches.
- Participant status supports active/suspended and is audited.
- Admin/community list synchronization uses one batch missed-week RPC instead of per-participant RPC calls.

## Database approach
- `challenge_badges` is the milestone source-of-truth: one row per challenge + milestone.
- Do not store mutable current-goal or current-level columns; derive them from earned badges.
- `challenges` remains a current summary cache for streak/count rendering; official history remains in `weekly_results`.

## Migration strategy for the current live project
The user's live Supabase project was initialized with `001_init.sql` and has not yet applied v1.1.2/v1.2 migrations. Apply:
1. `002_v1_1_2_ops.sql`
2. `003_v1_2_0_growth.sql`

Then deploy v1.2.0 code. Fresh projects run 001 → 002 → 003.
