# AI Drama Challenge v1.1.1

A 1000-day weekly AI-drama creator challenge web app built with Next.js, Vercel and Supabase.

## What v1.1.1 changes
v1.1.1 keeps the v1.0.1 user product intact and includes the v1.1.0 persistence redesign and reorganizes the persistence layer for long-running operations. Submission attempts and official weekly outcomes are separated, unnecessary first-party analytics storage is removed, and meaningful administrator corrections are auditable and recoverable.

## User-facing compatibility
Invitation-code signup, email/password login, onboarding, weekly submissions, streak/failure rules, owl growth, history, community, mypage and completion screens are intentionally unchanged from v1.0.1.

## Recommended architecture
- Next.js 16 / React 19 / TypeScript
- Vercel deployment
- Supabase Auth
- Supabase PostgreSQL
- Operational tables: `profiles`, `challenges`, `weekly_results`, `submissions`, `invite_codes`, `audit_logs`

## Environment variables
Create these in Vercel Production (and Preview if needed):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
ADMIN_EMAIL=admin@example.com
```

`SUPABASE_SERVICE_ROLE_KEY` must remain server-only and must never use a `NEXT_PUBLIC_` prefix.

## Fresh Supabase setup
Use **this v1.1.1 repository's** `supabase/migrations/001_init.sql`. Do not mix it with the v1.0.x schema. If an older schema already contains real production data, migrate it deliberately instead of re-running this fresh initializer.

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/migrations/001_init.sql` in full.
4. Add the environment variables above to Vercel.
5. Set Supabase Authentication Site URL to your production Vercel URL.
6. Add `https://your-project.vercel.app/auth/callback` to allowed redirect URLs.
7. Run the admin bootstrap script locally with production credentials or promote the intended first account to admin using the documented bootstrap flow.
8. Redeploy the Vercel project after environment variables are saved.

## One-time admin bootstrap
Create a local `.env.local` from `.env.example`, fill in the production Supabase values and the `BOOTSTRAP_*` values, then run:

```bash
npm run bootstrap:admin
```

The npm script explicitly loads `.env.local`. After a successful bootstrap, remove `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, and `BOOTSTRAP_ADMIN_NAME` from your real `.env.local`. Keep the Supabase connection values only if you still use the local app or administration scripts. Never commit `.env.local`.

## Local commands
```bash
npm install
npm run test:rules
npm run typecheck
npm run build
npm run dev
```

## Operational model
- `weekly_results` is the official weekly outcome history.
- `submissions` preserves actual submission attempts and the official result points to the accepted attempt.
- `challenges` stores current summary values for fast dashboard/community rendering.
- Summary values can be reconciled from weekly history after an administrator correction.
- `audit_logs` stores important corrections, not page-view analytics.

## Deployment
Push the repository to GitHub and import it into Vercel. Every production environment-variable change requires a new deployment/redeploy before it is guaranteed to affect runtime code.

## Release verification
See `checklist.md` and `QA-report.md`. GitHub CI runs the rule-parity test, official TypeScript check and production build after dependencies are installed.
