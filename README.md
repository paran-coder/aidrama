# AI Drama Challenge v1.2.2

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

## v1.2.2 highlights
- 상단 메뉴에 `이번 주 제출` 진입점을 항상 노출
- 준비기간에도 비활성 제출 CTA를 보여 제출 위치를 명확히 안내
- 제출 가능 시간을 `월요일 00:00 ~ 일요일 23:59 KST`로 명시
- 준비기간 `/dashboard/submit`에서 첫 제출 가능 날짜와 비활성 URL 입력 상태를 안내
- 기존 서버측 제출 가능 판정과 DB 구조는 변경하지 않음

## Database migration
v1.2.1 DB를 이미 사용 중이라면 **추가 SQL은 없습니다.**

기존 migration은 그대로 유지합니다.

```text
001_init.sql
002_v1_1_2_ops.sql
003_v1_2_0_growth.sql
004_v1_2_1_hotfix.sql
```

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
npm run test:submit-ux
npm run typecheck
npm run build
```

`.env.local`은 GitHub에 올리지 않습니다.
