# v1.2.8 Checklist

- [x] Create isolated v1.2.8 working copy
- [x] Create/update release context documents before code edits
- [x] Harden auth lookup for deleted-user stale sessions
- [x] Strengthen account deletion sign-out/session cleanup
- [x] Preserve account-deleted success landing
- [x] Add v1.2.8 regression tests
- [x] Run existing regression suite
- [x] Run v1.2.8 session regression checks (10/10)
- [x] Record dependency-aware typecheck limitation (`node_modules` absent)
- [x] Update QA/release/migration/user documentation
- [x] Package v1.2.8 zip

## Production acceptance pending
- [ ] Vercel build succeeds
- [ ] Disposable-user deletion redirects to landing success message without temporary connection error
- [ ] Deleted user cannot log in again
- [ ] Admin invite history remains anonymized
