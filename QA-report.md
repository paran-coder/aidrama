# QA Report — v1.2.6

## Scope
Self-service account withdrawal, admin protection, irreversible-delete guidance, anonymized invite-code history.

## Automated regression
- Challenge rule parity: PASS — 8,190 sequences
- v1.1.2 operations checks: PASS
- v1.2.0 growth checks: PASS
- v1.2.1 hotfix checks: PASS
- v1.2.2 submit UX checks: PASS
- v1.2.3 UI checks: PASS
- v1.2.4 navigation/admin checks: PASS
- v1.2.5 navigation typography checks: PASS
- v1.2.6 account deletion checks: PASS — 13 checks

## v1.2.6 checks
- Server action exists: PASS
- Admin self-delete blocked: PASS
- Confirmation phrase enforced server-side: PASS
- Supabase Auth hard delete configured: PASS
- Session sign-out attempted: PASS
- User danger zone mounted: PASS
- Admin protection message: PASS
- Irreversible deletion guidance: PASS
- Deleted-data list shown: PASS
- Typed confirmation UI: PASS
- Anonymous invite history migration: PASS
- Admin service reads deletion marker: PASS
- Admin UI anonymizes withdrawn user: PASS

## Remaining environment-dependent validation
This package does not include `node_modules`, so the full dependency-aware Next.js build must be verified by the Vercel deployment. The actual live deletion cascade should be smoke-tested once with a disposable user after migration 005 is applied.

## Self-score
9.6 / 10 before live disposable-account deletion test.
