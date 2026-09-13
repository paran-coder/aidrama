# QA Report — v1.2.10

## 결과
- v1.2.10 관리자/테스트 데이터 정리 검사: 8/8 통과
- 챌린지 규칙 parity: 8,190 sequences 통과
- v1.1.2 운영 구조 회귀: 통과
- v1.2.0 성장/마일스톤 회귀: 통과
- v1.2.1 hotfix 회귀: 통과
- v1.2.2 제출 UX 회귀: 통과
- v1.2.3 UI 시스템 회귀: 통과
- v1.2.4 관리자/내비게이션 회귀: 통과
- v1.2.5 활성 탭 타이포그래피 회귀: 통과
- v1.2.9 관리자 영구 삭제 회귀: 15/15 통과
- TS/TSX 54개 파일 transpile syntax 검사: 오류 0

## v1.2.10 확인 사항
- 관리자 참여자 조회의 preferred/legacy 경로 모두 `role = user` 필터 확인
- 006 cleanup은 정확한 테스트 코드 11개만 `code in (...)`으로 삭제
- `revoked_at is not null`, `used_account_deleted_at is not null` 같은 광범위 삭제 조건 없음
- 삭제 결과를 SQL Editor에서 확인할 수 있도록 `returning` 포함

## 제한
- 작업 환경에 프로젝트 `node_modules`가 없어 dependency-aware `next build`는 실행하지 못했습니다.
- 최종 Next.js 빌드 검증은 Vercel에서 확인합니다.
