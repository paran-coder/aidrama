# v1.3.0 Checklist

- [x] Create v1.3.0 working copy and update version metadata.
- [x] Remove invite-code field and validation from signup.
- [x] Create participant profile directly after Auth user creation.
- [x] Rename participant-facing `표시 이름` to `톡방 닉네임`.
- [x] Add chat-room nickname guidance to signup.
- [x] Remove invite-code issuance/history from admin UI.
- [x] Stop admin overview from querying invite-code data.
- [x] Remove unused invite-code issuance/revocation from active admin actions.
- [x] Update landing/login copy to direct signup language.
- [x] Update product/spec docs with v1.3.0 override decision.
- [x] Add v1.3.0 regression checks.
- [x] Run existing regression suite.
- [x] Run TS/TSX syntax checks: 56 files, 0 errors.
- [x] Confirm no DB migration is required.
- [ ] Confirm Vercel production build succeeds.
- [ ] Run one real new-participant signup after deployment.
