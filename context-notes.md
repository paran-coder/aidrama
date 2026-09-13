# Context Notes — v1.2.2

## Product invariants
- 초대 코드 가입 유지
- 100 → 300 → 600 → 900 → 1000 마일스톤
- 레벨/배지는 영구 상승, 실패는 스트릭에만 영향
- 관리자 기본 진입 `/admin`
- 주간 제출 가능 시간: 월요일 00:00 ~ 일요일 23:59 KST

## v1.2.2 decisions
- 제출 기능은 사용 가능 시점과 관계없이 항상 발견 가능해야 함
- 데스크톱 상단 메뉴에 `이번 주 제출` 고정
- 준비기간 대시보드에서도 비활성 CTA를 표시
- 준비기간 `/dashboard/submit`은 오류/빈 화면 대신 일정 설명을 표시
- 실제 제출 허용/차단은 기존 server-side `currentChallengeWeek` / action 규칙을 유지
- DB migration 없음
