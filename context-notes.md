# Context Notes — v1.3.0

## Goal
Simplify participant signup for a private OWL1000 challenge community.

## Product decisions
- Remove invite-code requirements from participant signup.
- Remove invite-code issuance/history UI from admin operations.
- Keep the existing `profiles.display_name` database field; present it as **톡방 닉네임** in participant-facing/admin UI.
- Signup copy must say: `챌린지 톡방에서 사용 중인 닉네임을 정확히 입력해 주세요. 운영자가 참여자를 확인할 때 사용됩니다.`
- Do not drop `invite_codes` or historical migrations. Legacy data remains untouched and unused by the normal signup/admin UI.
- Admin account deletion may continue to anonymize any old invite-code history if such legacy rows exist.
- No new SQL migration is expected for v1.3.0.

## Safety / compatibility
- Preserve all existing user/challenge/submission/badge data.
- Preserve admin suspension/reactivation and permanent-delete controls.
- Keep public unauthenticated landing/login/signup access behavior fixed in v1.2.12.
