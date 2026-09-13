# AI Drama Challenge v1.2.3

UI 디자인 시스템과 캐릭터 자산을 정리한 polish 릴리스입니다. 기능과 DB 구조는 v1.2.2를 유지합니다.

## UI system
- 대표 CTA를 진한 OWL 녹색으로 통일
- 비활성 CTA를 연한 세이지 배경 + 회녹색 텍스트로 변경
- 상단 `이번 주 제출`을 강한 CTA 대신 조용한 세이지 내비게이션 강조로 변경
- success / warning / danger / neutral 상태 토큰 통일
- 상태 배지, 알림, 관리자 계정 상태 UI를 semantic color로 정리
- disabled/read-only input 스타일 통일

## Copy & layout
- 한국어 `word-break: keep-all` / pretty wrapping 적용
- 긴 안내문을 의미 단위 문장으로 분리
- 첫 제출 안내에서 `가능합니다.` 뒤 명시적 줄바꿈
- 대시보드 부엉이 카드의 불필요한 하단 빈 공간 제거
- Hero/Onboarding 부엉이 카드의 중첩 여백 감소

## Owl assets
- Hero 1종, Stage 5종, Thumb 5종을 투명 배경 자산으로 교체
- 투명 PNG 원본을 alpha WebP로 최적화
- 전체 owl asset 약 1.1MB 수준으로 축소
- 썸네일은 360px, Stage는 900px, Hero는 1024px 기준으로 제공

## Unchanged
- Supabase schema / RLS
- 초대코드 정책
- 사용자 정지 정책
- 제출 판정
- 성장/마일스톤/배지 규칙
