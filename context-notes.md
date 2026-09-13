# Context Notes — v1.2.1

## Product invariants
- 초대 코드 가입 유지
- 사용된 초대코드는 가입 이력이며 이후 접근 권한과 분리
- 사용자 접근은 `profiles.status = active/suspended`로 관리
- 100 → 300 → 600 → 900 → 1000 마일스톤
- 레벨/배지는 영구 상승, 실패는 스트릭에만 영향
- 관리자 기본 진입 `/admin`

## v1.2.1 decisions
- 랜딩 Hero는 전체 캐릭터 노출을 우선해 `object-contain`
- 관리자/커뮤니티 읽기 페이지는 전체 참여자 상태를 자동 갱신하지 않음
- 관리자만 필요 시 `진행상태 동기화` 실행
- 운영용 이메일은 `profiles.email`에 캐시하되 일반 공개 RLS에는 노출하지 않음
- 마일스톤 UI는 `current day >= milestone` 조건도 동시에 확인해 잘못된 선행 배지를 방어
- 실환경의 잘못된 배지는 004 migration에서 정합성 검증 후 삭제
- 관리자 미리보기는 실제 사용자 화면으로 가장하지 않고 Lv.1 / Day 0 샘플로 표시
