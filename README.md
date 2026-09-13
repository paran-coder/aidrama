# AI Drama Challenge v1.2.1

100일을 첫 목표로 시작해 300 / 600 / 900 / 1000일로 성장하는 초대제 AI 드라마 크리에이터 챌린지입니다.

## Stack
- Next.js 16 / React 19 / TypeScript
- Vercel
- Supabase Auth + PostgreSQL

## Current growth model
- Lv.1 크리에이터: 시작 즉시
- Lv.2 루틴 크리에이터: 100일 배지
- Lv.3 스토리 크리에이터: 300일 배지
- Lv.4 시그니처 크리에이터: 600일 배지
- Lv.5 마스터 크리에이터: 900일 배지
- OWL1000: 1000일 완주 배지

배지는 목표 날짜를 지난 뒤 정상 주간 인증 성공 시 순서대로 하나씩 획득하며, 한번 획득한 레벨/배지는 실패해도 하락하지 않습니다.

## v1.2.1 highlights
- 랜딩 Hero/썸네일 크롭 수정
- 잘못된 선행 마일스톤 배지 정리 및 날짜 기반 UI 방어
- 관리자/커뮤니티 자동 전체 동기화 제거
- 관리자 이메일 캐시로 Auth `listUsers` 제거
- 관리자 참여자 `접근 관리` 개선
- 관리자 사용자 화면 미리보기 안정화
- 세션 일시 오류 재시도 + 프록시/화면 오류 방어

## Existing production migration
이미 v1.2.0 DB를 사용 중이면 다음 SQL **하나만** 실행합니다.

```text
supabase/migrations/004_v1_2_1_hotfix.sql
```

자세한 내용은 `MIGRATION-GUIDE.md`를 확인하십시오.

## Environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
ADMIN_EMAIL=admin@example.com
```

## Local verification
```bash
npm install
npm run test:rules
npm run test:ops
npm run test:growth
npm run test:hotfix
npm run typecheck
npm run build
```

`.env.local`은 GitHub에 올리지 않습니다.
