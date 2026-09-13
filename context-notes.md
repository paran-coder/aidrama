# v1.2.8 Context Notes

## Trigger
A real account-deletion test successfully reached the deletion path but then rendered the global temporary connection error screen.

## Root path addressed
The browser can retain a Supabase auth token after the corresponding Auth user is hard-deleted. `getUser()` previously retried and then threw this deleted-user auth error, which caused the landing page to enter the generic error boundary.

## Changes
- Added narrow stale/signed-out auth error classification in `lib/auth.ts`.
- Added explicit Supabase auth-cookie cleanup in `lib/supabase/server.ts`.
- Account deletion now attempts sign-out, forcibly clears auth cookies, then redirects to `/?accountDeleted=1`.
- Added v1.2.8 structural regression checks.

## Safety
Unknown/network auth failures still throw; only known signed-out/stale-session signals are downgraded to logged-out state.

## Database
No schema change. Do not rerun migrations 001-005.
