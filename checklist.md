# Checklist — v1.2.0 growth system + mascot redesign

## Product model
- [x] Single 1000-day challenge remains intact.
- [x] Current milestones are exactly 100, 300, 600, 900, 1000.
- [x] First visible goal for a new participant is 100 days.
- [x] Badge award requires threshold reached + qualifying weekly success.
- [x] One success awards at most the next unearned milestone.
- [x] Earned badges never regress.
- [x] 1000 is completion badge, not a sixth creator level.

## Creator levels
- [x] Lv.1 Creator from start.
- [x] 100 badge → Lv.2 Routine Creator.
- [x] 300 badge → Lv.3 Story Creator.
- [x] 600 badge → Lv.4 Signature Creator.
- [x] 900 badge → Lv.5 Master Creator.
- [x] Failure cannot lower creator level.
- [x] Old egg/reset visual model is removed from participant UI.

## Failure rules
- [x] Failure resets current streak to 0.
- [x] Consecutive failures still tracked.
- [x] 2 failures show warning.
- [x] 3 failures show restart prompt without level reset.
- [x] Success clears consecutive failures.
- [x] v1.2 reconciliation neutralizes legacy active stage override/reset summary fields.

## Badge data
- [x] `challenge_badges` migration exists.
- [x] Unique challenge + milestone constraint exists.
- [x] Badge award points to triggering weekly result/submission when available.
- [x] User can read own badges under RLS.
- [x] Community/admin use server-safe badge summary reads.
- [x] Historical v1.1 data has sequential backfill logic.

## UI
- [x] Landing leads with 100-day start and creator identity.
- [x] Dashboard primary progress is current milestone.
- [x] Dashboard secondary progress retains overall 1000-day context.
- [x] Threshold-waiting progress does not exceed target label.
- [x] Earned badges visible on dashboard/mypage.
- [x] Community cards show creator level + milestone badges.
- [x] Community profile shows earned badges.
- [x] Completion page shows 1000 badge.
- [x] New milestone triggers one-time non-blocking celebration.
- [x] Celebration respects reduced-motion preference.

## Mascot
- [x] 5 production stage assets are present.
- [x] Hero asset is present.
- [x] 5 compact thumbnail assets are present.
- [x] Stage assets are cropped for app readability.
- [x] Asset lookup is centralized, not hard-coded per screen.
- [x] Landing/dashboard/community use consistent mascot identity.

## v1.1.2 operations
- [x] Admin login/routes separated from participant mutation flows.
- [x] Invite revocation and used-code history retained.
- [x] Invite usage shows user email/time to admin.
- [x] Participant suspension/reactivation exists and is audited.
- [x] Community/admin batch missed-week sync removes participant N+1 RPC pattern.
- [x] Long-running form actions expose pending state.

## Regression / verification
- [x] Existing routes remain; new operations routes are additive.
- [x] `npm run test:rules` passes (8,190 sequences).
- [x] `npm run test:ops` passes.
- [x] `npm run test:growth` passes.
- [x] TS/TSX syntax check passes (51 files, 0 syntax diagnostics).
- [x] Source secret scan passes.
- [ ] Dependency-backed `npm run typecheck` passes in CI/Vercel.
- [ ] Production `npm run build` passes in CI/Vercel.
- [ ] Live Supabase migration 002 applied successfully.
- [ ] Live Supabase migration 003 applied successfully.
- [ ] Post-deploy smoke test completed on production URL.
