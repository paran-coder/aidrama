# Development Checklist — ai-drama-challenge-v1.0.0

## 0. Project foundation — 10/10
- [x] Planning documents imported
- [x] `context-notes.md` created
- [x] `checklist.md` created
- [x] `README.md` created
- [x] `User manual.md` created
- [x] Next.js project scaffold
- [x] Environment template
- [x] Git ignore / Node 22 config
- [x] GitHub verification workflow

## 1. Database / Auth — 9.3/10
- [x] Supabase migration schema
- [x] RLS policies
- [x] Atomic invite-code claim function
- [x] Atomic weekly success/failure functions
- [x] Admin bootstrap script
- [x] Email/password signup using invitation code
- [x] Login/logout/session refresh
- [x] Password reset flow
- [x] Server-only service-role writes

## 2. Challenge domain — 9.5/10
- [x] Onboarding/start challenge
- [x] KST week boundary calculation
- [x] Elapsed day calculation
- [x] Weekly success processing
- [x] Missed-week failure processing
- [x] 1st/2nd/3rd failure penalties
- [x] Recovery-on-next-success
- [x] 1000-day completion state
- [x] Stop judging weeks after completion
- [x] Stale Sunday form cannot become Monday submission

## 3. UI / Pages — 8.8/10
- [x] Landing
- [x] Login
- [x] Signup
- [x] Forgot/reset password
- [x] Onboarding
- [x] Dashboard
- [x] Submission
- [x] History
- [x] Community
- [x] Community profile
- [x] My page
- [x] Completion archive
- [x] Admin invite-code page
- [x] Responsive navigation
- [x] Owl growth visual
- [x] Warning dialog with keyboard close
- [x] Verification badges
- [x] `prefers-reduced-motion` support

## 4. QA / Delivery — 8.5/10
- [x] Strict TypeScript static QA with local compiler stubs
- [x] TS/TSX syntax transpilation check — 42 files, 0 errors
- [x] KST/date/growth critical logic tests
- [x] Client bundle service-role import scan — 0 findings
- [x] RLS/write-permission review
- [x] Deployment docs
- [x] GitHub verification workflow for clean runner
- [ ] Full `npm install && npm run build` in this runtime (package-registry access unavailable here; GitHub workflow executes it after push)
- [ ] Supabase live-project integration smoke test (requires project credentials)
- [ ] Browser visual regression pass on deployed URL

## v1.0.0 follow-up candidates
- Platform API/OEmbed based real post verification
- Vercel Cron or Supabase scheduled job for proactive weekly settlement at scale
- Share-card image generation
- Reactions/comments
- Notification reminders
