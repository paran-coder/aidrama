# QA Report — v1.2.4

## 결과
- Challenge rule parity: **8,190 sequences PASS**
- v1.1.2 operations regression: **PASS**
- v1.2.0 growth regression: **PASS**
- v1.2.1 hotfix regression: **PASS**
- v1.2.2 submit UX regression: **PASS**
- v1.2.3 UI system regression: **PASS**
- v1.2.4 navigation/admin resilience: **PASS**
- TS/TSX syntax transform: **53 files, 0 syntax errors**

## v1.2.4 확인 내용
1. 현재 URL 기반 active navigation이 데스크톱/모바일 모두 존재함.
2. submit 메뉴가 모든 화면에서 고정 강조되지 않음.
3. community 스트릭은 `연속 인증 N주`로 표시함.
4. admin overview는 `profiles.email` 누락 시 legacy select로 폴백함.
5. 이메일 캐시 폴백은 primary path가 아니라 schema compatibility path에서만 Auth Admin listUsers를 사용함.
6. admin overview의 invite/challenge/badge read failure는 전체 페이지 throw 대신 warning/partial data로 격리함.
7. admin participant detail은 화면 진입 시 `processMissedWeeks`를 호출하지 않음.

## 제한
현재 연결된 Vercel connector에서 `aidrama` 프로젝트가 프로젝트 목록에 노출되지 않아 해당 production deployment의 runtime error stack을 직접 읽지는 못했습니다. 따라서 `/admin` 장애의 단일 원인을 확정한 것이 아니라, 코드에서 확인된 admin-only hard-failure 경로와 DB schema compatibility 경로를 함께 방어했습니다.

전체 dependency-aware `next build`는 이 작업 환경에 로컬 node_modules가 없어 수행하지 않았습니다. Vercel Production build를 최종 compile 검증 지점으로 사용합니다.
