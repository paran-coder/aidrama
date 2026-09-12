# AI Drama Challenge v1.1.0 — QA Report

## Scope
This QA pass focuses on preserving v1.0.1 participant behavior while replacing the operational persistence model and expanding administrator recovery tooling.

## Passed checks
- No v1.0.1 participant page route was removed. One admin-only route was added: `/admin/participants/[userId]`.
- Core challenge time/stage utility code (`lib/challenge.ts`) is byte-for-byte unchanged.
- Ordinary participant challenge actions (`lib/actions/challenge.ts`) are byte-for-byte unchanged.
- Rule parity test compares legacy incremental state transitions with v1.1 chronological reconciliation over 10,230 success/failure/stage scenarios; all match.
- 42 TypeScript/TSX source files transpile with zero syntax diagnostics.
- Strict local TypeScript QA passes when unavailable external packages are represented by temporary type stubs.
- No application references remain to `analytics_events`, `challenge_events`, or the removed AnalyticsEvent component.
- `SUPABASE_SERVICE_ROLE_KEY` is referenced only in server/bootstrap/config contexts, not client components.
- Participant dashboard/history/community/complete pages no longer perform direct service-role queries; reads are routed through server service helpers.
- Static SQL scan confirms the intended operational tables are exactly: `profiles`, `invite_codes`, `challenges`, `submissions`, `weekly_results`, `audit_logs`.
- Cross-table constraints prevent a weekly result from accepting a submission belonging to another challenge/week.
- Used invite codes remain consumed even if the original account is later deleted.

## Operational invariants added
- Ordinary submissions are limited at DB level to the current KST week, before its deadline, and before the 1000-day completion point.
- Missed closed weeks are batch-created in one DB RPC and reconciled once, avoiding one server↔DB round trip per missed week.
- Automatic failure recording is limited to closed weeks and never creates failures beyond the 1000-day boundary.
- An administrator cannot mark the currently open week as failure.
- Every admin weekly-result correction requires a reason, writes an audit record, preserves old submission attempts, and runs full state reconciliation.

## Pending live checks
The current execution environment could not complete `npm install` because npm registry access timed out. Therefore the final release gate remains:
1. GitHub CI dependency install + official TypeScript check + Next.js production build.
2. Execution of the SQL on a fresh Supabase PostgreSQL project.
3. Vercel runtime smoke test with real environment variables.

These are deployment validation gates, not known code failures.
