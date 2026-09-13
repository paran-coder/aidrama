# QA Report — v1.2.1

## 실환경에서 확인된 문제와 대응
- Hero 부엉이 크롭 → contain + Hero 프레임 확대
- 관리자 미리보기 후 세션 혼동 → 새 탭 미리보기, 인증 일시 오류 재시도
- 시작 전 Lv.2 / 100일 배지 → 날짜 기반 UI 방어 + DB 무효 배지 cleanup migration
- 사용자 정지 위치가 불명확 → 관리자 목록에 `접근 관리` 노출
- 미사용 코드 취소와 기존 사용자 차단 개념 혼동 → 화면 설명 추가
- 관리자/전체현황 체감 속도 저하 → 자동 전체 동기화 제거, Auth listUsers 제거
- 간헐적 Internal Server Error → proxy 세션 갱신 방어 + app/global error boundary

## Automated/static checks
- Challenge state rule parity: 8,190 sequences PASS
- v1.1.2 operations structure check PASS
- v1.2 growth structure check PASS
- v1.2.1 hotfix structure check PASS
- TS/TSX syntax/transpile check: 52 files, 0 syntax errors

## Remaining deployment-time verification
현재 실행환경에는 프로젝트 npm dependencies가 설치되어 있지 않아 공식 `tsc --noEmit` / `next build`는 Vercel 빌드 또는 의존성 설치 후 최종 확인해야 합니다.

## Production smoke checklist
1. `004_v1_2_1_hotfix.sql` 적용
2. 관리자 로그인 → `/admin`
3. roent 계정 Day 0 → Lv.1 / 배지 미획득
4. Hero 전체 몸이 프레임 안에 표시
5. 관리자 초대코드 발급 체감 속도
6. 전체현황 로딩 체감 속도
7. 참여자 `접근 관리` → 정지 → 해당 계정 접근 차단 → 재활성화
8. 관리자 사용자 화면 미리보기 새 탭 동작 및 세션 유지
9. 간헐적 오류 재현 여부
