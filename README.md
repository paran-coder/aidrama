# AI Drama Challenge v1.2.0

OWL1000 is one continuous 1000-day creator journey with a believable first promise: **100 days**. Participants begin as creators on day zero, earn permanent milestone badges, and level up through five creator identities. Weekly failures affect the current streak, never identity already earned.

## Product model

- Milestones: `100 → 300 → 600 → 900 → 1000`
- A milestone is awarded only after its threshold is reached **and a later qualifying weekly success is recorded**.
- At most one next milestone is awarded per successful weekly proof. Long-inactive users cannot unlock several badges with one submission.
- Levels are badge-driven and permanent:
  1. Lv.1 Creator
  2. Lv.2 Routine Creator — after 100 badge
  3. Lv.3 Story Creator — after 300 badge
  4. Lv.4 Signature Creator — after 600 badge
  5. Lv.5 Master Creator — after 900 badge
- 1000 is the permanent OWL1000 completion badge, not Lv.6.
- New badge acquisition triggers a small accessible level-up celebration. Reduced-motion users receive the same message without animation.

## Operational model

The v1.1.2 stabilization features remain intact:
- admin login goes directly to `/admin`
- invite issuance, revocation and permanent usage history
- participant email/usage visibility for administrators
- participant suspension/reactivation independent from invite codes
- administrator corrections + audit logs
- batch missed-week synchronization for admin/community lists
- pending/loading states for long-running form actions

## Database migrations

### Your current live project (v1.1.0/v1.1.1 code with only `001_init.sql` applied)
Run these **once, in this order**, in Supabase SQL Editor:

```text
supabase/migrations/002_v1_1_2_ops.sql
supabase/migrations/003_v1_2_0_growth.sql
```

Then push the v1.2.0 code to GitHub and let Vercel redeploy.

### If 002 is already applied
Run only:

```text
supabase/migrations/003_v1_2_0_growth.sql
```

### Fresh project
Run `001 → 002 → 003` in numeric order.

Do not rerun a migration that has already completed successfully.

## Environment variables

Unchanged from v1.1.x:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
ADMIN_EMAIL=admin@example.com
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in browser code or commit `.env.local`.

## Performance deployment note

For lowest latency, set the Vercel Function Region as close as possible to the Supabase database region. The code also removes participant-by-participant synchronization from admin/community list rendering and uses one batch RPC instead.

## Verification

```bash
npm install
npm run test:rules
npm run test:ops
npm run test:growth
npm run typecheck
npm run build
```

GitHub CI runs the same verification flow. See `QA-report.md` and `MIGRATION-GUIDE.md` before production deployment.
