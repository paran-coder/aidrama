# Migration Guide — v1.2.5

No Supabase migration is required.

Deployment order:
1. Replace the GitHub project files with v1.2.5.
2. Keep `.env.local` out of GitHub.
3. Push to the connected branch.
4. Let Vercel build and deploy.
5. Verify active navigation styling on `/dashboard`, `/dashboard/submit`, `/community`, and `/mypage`.

Do not rerun migrations `001` through `004` for this release.
