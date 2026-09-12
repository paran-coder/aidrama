# AI Drama Challenge v1.1.0 — Checklist

## 0. Regression contract (must not change)
- [x] `/`, `/login`, `/signup`, `/onboarding`, `/dashboard`, `/dashboard/submit`, `/dashboard/history`, `/community`, `/community/[userId]`, `/mypage`, `/complete/[userId]`, `/admin` remain available.
- [x] Invitation code is required for signup and is single-use.
- [x] Email/password login/logout/reset flows remain available.
- [x] First judged week begins the next Monday after challenge start.
- [x] KST Monday–Sunday weekly boundaries remain unchanged.
- [x] One official successful outcome per week is preserved.
- [x] URL verification fallback (`unverified` accepted) remains unchanged.
- [x] Streak / longest streak behavior remains unchanged.
- [x] Consecutive-failure warning / penalty / reset / recovery behavior remains unchanged.
- [x] 1000-day completion boundary remains unchanged.
- [x] Owl visual stages and user-facing growth behavior remain unchanged.
- [x] History, community, mypage, completion behavior remain unchanged.
- [x] Admin can still issue and copy invitation codes.

## 1. Data architecture
- [x] Keep `profiles` focused on account metadata.
- [x] Keep `challenges` as current-state summary/cache.
- [x] Make `weekly_results` the official weekly outcome history.
- [x] Allow `submissions` to preserve attempt history (remove one-submission-per-week uniqueness).
- [x] Add `weekly_results.final_submission_id` semantics.
- [x] Add `audit_logs` for meaningful admin/system corrections.
- [x] Remove `analytics_events` and operational analytics writes.
- [x] Add practical indexes and cross-table integrity constraints.
- [x] Keep RLS/service-role permissions least-privilege.
- [x] Preserve consumed invite-code state even if a user account is later deleted.

## 2. Domain/service layer
- [x] Centralize dashboard/history/community data access behind service helpers.
- [x] Keep missed-week processing idempotent and batch missed weeks in one DB transaction/RPC.
- [x] Keep weekly submit transaction atomic.
- [x] Add challenge summary rebuild/reconciliation from weekly history.
- [x] Preserve completion boundary and stale-open-form deadline protection.
- [x] Add DB-level current-week/deadline/completion guards for ordinary submissions.

## 3. Admin operations
- [x] Preserve invite-code management.
- [x] Add participant/challenge overview without changing participant UI.
- [x] Add submission-attempt inspection.
- [x] Add controlled weekly result correction.
- [x] Record corrections in `audit_logs` with actor, target, before/after and reason.
- [x] Recompute challenge summary after correction.
- [x] Prevent an open current week from being finalized as failure.

## 4. Security
- [x] No service-role key in client code.
- [x] Users cannot mutate role/challenge/results directly.
- [x] Admin mutation actions require server-side admin authorization.
- [x] Invite claim remains atomic and one-time.
- [x] Audit log writes are service-role only.

## 5. Verification
- [x] `npm run test:rules` passes: 10,230 legacy-vs-reconciliation transition cases.
- [x] TypeScript transpile/syntax QA passes across 42 TS/TSX source files.
- [x] Strict local type QA passes using temporary external-library stubs.
- [ ] Official `npm run typecheck` with installed project dependencies — pending because npm registry access timed out in the current execution environment.
- [ ] Official `npm run build` — pending for the same dependency-install limitation; GitHub CI runs this after push.
- [x] Search confirms `analytics_events`, `challenge_events`, and `AnalyticsEvent` operational writes/usages are removed.
- [x] Regression route inventory has no removed v1.0.1 page; only `/admin/participants/[userId]` is added.
- [x] `lib/challenge.ts` and ordinary participant challenge server action remain unchanged from v1.0.1.
- [x] Static SQL structure check confirms all public table references resolve and only the six intended operational tables exist.
- [x] README and User manual describe production setup and admin correction behavior.

## Release gate after GitHub push
- [ ] GitHub Verify workflow passes `npm install`, `npm run test:rules`, `npm run typecheck`, and `npm run build`.
- [ ] Fresh Supabase project successfully executes `supabase/migrations/001_init.sql`.
- [ ] Vercel Production environment variables are configured and the deployment is redeployed.
- [ ] Browser smoke test: invite signup → onboarding → dashboard → weekly submit → history → community → admin operations.
