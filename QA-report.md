# QA Report — AI Drama Challenge v1.2.0

## Scope
v1.2.0 combines the approved creator-growth redesign with the v1.1.2 production-stabilization work. The release keeps the single OWL1000 journey while changing the participant-facing motivation model to 100 → 300 → 600 → 900 → 1000 permanent milestones.

## Automated / static checks completed
- v1.2 challenge rule parity: **8,190 / 8,190 success/failure sequences passed** via `npm run test:rules`.
- v1.1.2 operations structure checks: **passed** via `npm run test:ops`.
- v1.2 milestone/creator-growth structure checks: **passed** via `npm run test:growth`.
- TypeScript/TSX syntax transpilation: **51 files checked, 0 syntax diagnostics** using the available global TypeScript compiler.
- Route inventory: **17 page routes present**, including admin preview and suspended-account routes.
- Production mascot assets: **11 owl WebP assets** (hero + 5 stage + 5 thumbnail) present.
- Milestone assets: **5 badge WebP assets** present.
- Secret scan: no embedded `sb_secret_...`/JWT-like credential values found in source files.
- `.env`, `.env.local`, `.env.*.local` remain ignored by Git.

## Growth model verified
- First visible target is 100 days.
- Milestones are exactly 100, 300, 600, 900, 1000.
- One successful weekly proof can award **at most the next unearned milestone**.
- Long inactivity cannot mass-unlock several badges with one success.
- Lv.1 Creator is granted from challenge start; there is no egg stage.
- 100/300/600/900 badges drive Lv.2/Lv.3/Lv.4/Lv.5 respectively.
- 1000 is completion, not Lv.6.
- Earned levels/badges never regress on failure.
- Two/three consecutive failures still produce warning/restart UX while preserving identity.

## Celebration / accessibility verified in source
- Newly awarded milestone is detected after the submission RPC and surfaced once through the dashboard redirect.
- The dashboard shows a non-blocking milestone celebration with new creator level and badge.
- The milestone query parameter is removed from browser history after render so refresh does not replay the celebration.
- `prefers-reduced-motion` disables celebration animation.
- Milestone progress caps its display at the target while waiting for the qualifying success (no `120 / 100` display).

## Mascot QA
- The approved floral owl concept is used as the common design language.
- Production stage assets were re-cropped to remove excessive whitespace and improve dashboard/card readability.
- Dedicated 320×320 thumbnail assets are used for compact cards.
- Hero/stage/thumb paths are centralized in `lib/owl-assets.ts`.
- Production preview: `spec/owl-v1.2-production-preview.jpg`.

## v1.1.2 operations retained
- Admin login defaults to `/admin`.
- Participant mutation routes redirect administrators away from challenge flows.
- Invite lifecycle: issue → used/revoked/expired history; used codes are retained.
- Admin sees invite user display name, email and usage time.
- Participant access can be suspended/reactivated independently of invite history.
- Admin correction and suspension/revocation actions are audited.
- Community/admin list synchronization uses one batch missed-week RPC instead of participant-by-participant RPC calls.
- Form buttons show immediate pending state.

## Performance changes
- Admin/community removed participant-level N+1 missed-week synchronization.
- Dashboard badge/current-week result reads run in parallel after challenge synchronization.
- Submission adds only one post-write badge read to determine whether a celebration is necessary.
- Deployment should place Vercel Functions near the Supabase database region to reduce network round trips.

## Migration review
Current live project upgrade path is:
1. `002_v1_1_2_ops.sql`
2. `003_v1_2_0_growth.sql`
3. deploy v1.2.0 code

Migrations have **not** been executed against the user's live Supabase project from this environment.

## Verification limitation
`npm install --no-audit --no-fund` timed out in this execution environment, so dependency-backed `npm run typecheck` and `npm run build` could not be completed locally. GitHub CI is configured to install dependencies and run rule/ops/growth tests, TypeScript checking and the production Next.js build. Vercel build remains the final integration gate.

## Self-assessment
**9.5 / 10**. Product rules, operational model, mascot assets, accessibility behavior and static regression checks are complete. Remaining risk is limited to live SQL migration execution plus dependency-backed Vercel/CI integration.
