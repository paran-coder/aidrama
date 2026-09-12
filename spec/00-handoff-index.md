# Web Planning Handoff — AI드라마 챌린지 관리 서비스

모집형 크리에이터 커뮤니티를 위한 "1000일 매주 업로드 챌린지" 관리 서비스. GitHub → Vercel 배포 예정.

## 문서 목록

1. [결정 브리프](01-decision-brief.md)
2. [사용자와 핵심 과업](02-users-and-jobs.md)
3. [범위와 우선순위](03-scope-and-priorities.md)
4. [사용자 여정과 핵심 흐름](04-user-journey.md)
5. [정보구조와 사이트맵](05-sitemap.md)
6. [화면 인벤토리](06-screen-inventory.md)
7. [화면별 상세 명세 (S01~S11)](07-screen-specs.md)
8. [와이어프레임 명세](08-wireframes.md)
9. [UI 방향 (DESIGN-DIRECTION.md)](09-DESIGN-DIRECTION.md)

## 컴포넌트 후보 (문서 전반에서 추출)

- 부엉이 이미지 카드 (대시보드, 커뮤니티, 프로필, 완주 아카이브에서 재사용)
- 경고 팝업 / alert 공통 컴포넌트
- 검증 상태 배지 (검증됨 / 미검증 — 제출 화면, 이력 화면에서 재사용)

## 데이터·권한·분석 요구 요약

- 별도 데이터베이스 필요 (Vercel은 DB를 자체 제공하지 않음 — Supabase/Neon/Vercel Postgres 등 연동 필요)
- 권한: 일반 사용자 vs 관리자(본인 1인) 2단계만 존재
- 초대 코드는 1코드-1인 매칭, 1회 사용 후 만료
- 주요 분석 이벤트: `dashboard_view`, `submit_attempt`, `submit_verified`, `submit_unverified`, `signup_success`, `login_success`, `community_view`, `complete_view` 등 (07-screen-specs.md 각 화면 참고)

## 미해결 질문과 위험

| 항목 | 내용 | 상태 |
|---|---|---|
| 서비스 성공 지표 | 오픈 후 참여자 수 등 구체적 KPI 미정 | 미해결 |
| 자동 링크 검증 기술 구현 | SNS 플랫폼 API 제약으로 완전 자동 검증이 어려울 수 있음 | 위험 (완화책 반영됨: 실패 시 자기신고 전환) |
| 경고 단계 이탈 위험 | 연속실패 2회 경고에도 이탈 가능성 존재 | 위험 (완화책: 완전 리셋이 아닌 단계적 페널티로 설계) |
| 최초 관리자 계정 생성 방식 | 환경변수/시드 데이터로 가정, 구현 단계에서 확정 필요 | 가정 |
| 로그인 방식 세부사항 | 이메일/소셜 로그인 여부 미정 | 가정 (구현 단계 결정) |
| `/community` 정렬 기준 | 최장 스트릭순으로 가정 | 가정 |
| `/community` 데이터 공개 범위 | 전체 공개로 가정 | 가정 |

## 다음 단계 제안

1. DB 서비스(Supabase 등) 선정 및 스키마 설계
2. 위 미해결 항목 중 구현 착수 전 확정이 필요한 것(최초 관리자 계정 생성 방식 등) 결정
3. 핵심 루프 화면(S01, S02)부터 실제 구현 시작
