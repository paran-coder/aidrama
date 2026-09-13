# Release Notes — v1.2.4

## 관리자 안정성
- `/admin` overview 조회를 부분 실패 허용 구조로 변경했습니다.
- `profiles.email` 컬럼을 바로 읽을 수 없는 DB에서도 legacy profile select + Auth Admin 이메일 조회로 호환 동작합니다.
- 초대코드/챌린지/배지 중 일부 조회가 실패해도 관리자 전체 페이지가 error boundary로 떨어지지 않고 경고와 함께 가능한 영역을 표시합니다.
- 관리자 참여자 상세 진입 시 자동으로 missed-week 처리를 수행하지 않아 접근 관리 화면의 진입 의존성과 지연을 줄였습니다.
- 관리자 전용 error boundary를 추가했습니다.

## 내비게이션
- 현재 URL을 기준으로 데스크톱/모바일에서 현재 메뉴 한 개만 활성 표시합니다.
- `/dashboard`와 `/dashboard/history`는 `내 챌린지`, `/dashboard/submit`은 `이번 주 제출`, `/community/**`는 `전체 현황`, `/mypage`는 `마이페이지`가 활성화됩니다.
- 관리자 메뉴도 `/admin`, participant detail, `/mypage`에 맞게 활성 상태가 바뀝니다.

## 스트릭 문구
- 주간 제출 모델을 유지하므로 스트릭 단위는 `주`입니다.
- 커뮤니티 카드의 `N주 연속`을 `연속 인증 N주`로 변경했습니다.
- 대시보드에도 현재 연속 인증 값을 `N주`로 명확히 표시합니다.
- 관리자 표 헤더는 `현재/최장 인증(주)`로 정리했습니다.

## DB
- 신규 migration 없음.
- 001~004를 다시 실행하지 않습니다.
