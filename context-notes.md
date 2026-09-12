# AI Drama Challenge v1.1.0 — Context Notes

## Release intent
v1.1.0 is an operations-oriented data refactor. The user-facing product, routes, UI, invitation flow, challenge rules, owl growth experience, and completion experience are frozen to v1.0.1 unless a bug must be fixed to preserve existing behavior.

## Non-negotiable compatibility contract
- Invitation-code signup remains mandatory and one-time.
- Email/password authentication remains Supabase Auth.
- Onboarding and challenge start flow remain unchanged.
- Challenge duration remains 1000 days.
- Weekly judging remains Monday–Sunday in Asia/Seoul (KST).
- The first judged week begins on the first Monday after challenge start.
- Weekly submission, verification fallback, streak, consecutive-failure penalties, reset/recovery rules, owl growth, history, community, mypage, completion, and admin invite-code flows must retain v1.0.1 behavior.
- Existing public routes remain stable.

## v1.1.0 data architecture
Supabase Auth remains the identity/session source. Public data is organized by responsibility:
1. `profiles`: user-facing identity metadata and role.
2. `challenges`: current challenge state/cache.
3. `weekly_results`: authoritative weekly outcome history.
4. `submissions`: immutable-ish submission attempts; re-submission history is possible.
5. `invite_codes`: one-time signup authorization.
6. `audit_logs`: important administrator/system corrections only.

`analytics_events` and first-party page/click analytics storage are removed from the operational database.

## Source-of-truth rules
- Authentication truth: Supabase Auth.
- User metadata truth: `profiles`.
- Historical challenge truth: `weekly_results` + `submissions`.
- Current challenge summary/cache: `challenges`.
- Signup authorization truth: `invite_codes`.
- Administrative correction trace: `audit_logs`.
- Derived values such as visual owl stage and challenge completion date should be calculated where practical rather than redundantly persisted.

## Operational principles
- A weekly official result is unique per `(challenge_id, week_start)`.
- Submission attempts are separate from weekly official results so incorrect/replaced submissions can be traced.
- Important state changes occur transactionally in database functions using row locks where needed.
- Challenge summary values must be rebuildable from weekly history.
- Client users have read access only where product behavior requires it; state-changing challenge operations are server/service-role only.
- Audit logs do not collect routine page views or button clicks.

## Release policy
Semantic version: 1.1.0 (minor release because internal data behavior and admin capabilities expand while user product behavior is intentionally preserved).

## v1.1.1 patch note
The admin bootstrap command now explicitly loads `.env.local`. The previous command used plain Node, which does not inherit Next.js `.env.local` loading behavior. Real secret values remain local-only and are excluded by `.gitignore`.
