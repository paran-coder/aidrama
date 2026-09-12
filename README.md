# AI Drama Challenge — v1.0.1

1000일 동안 매주 AI드라마 영상 1개 업로드를 이어가는 **초대형 크리에이터 챌린지 서비스**입니다.

## Stack

- Next.js 16.3.4 / React 19 / TypeScript
- Tailwind CSS 4
- Supabase Auth + PostgreSQL
- GitHub → Vercel
- Node.js 22+

## Implemented

- 1회용 초대 코드 기반 가입
- 이메일/비밀번호 로그인 및 비밀번호 재설정
- 최초 온보딩 및 챌린지 시작
- Asia/Seoul 기준 월~일 주차 계산
- 일요일 23:59 제출 마감
- 주간 성공/실패 및 스트릭 처리
- 1회 실패 성장 하락 / 2회 경고 / 3회 알 리셋
- 실패 페널티 후 다음 성공 시 성장단계 즉시 회복
- SNS URL 검증 및 `검증됨` / `미검증` 상태
- 성장형 부엉이 SVG 비주얼
- 제출/실패/리셋 이력
- 참여자 커뮤니티와 프로필
- 1000일 완주 아카이브
- 마이페이지
- 관리자 초대 코드 발급 및 사용 현황
- 간단한 제품 이벤트 저장
- 반응형 모바일 내비게이션과 reduced-motion 대응

## 1. Supabase project

새 Supabase 프로젝트를 만든 뒤 SQL Editor에서 아래 파일을 실행합니다.

```text
supabase/migrations/001_init.sql
```

이 SQL은 테이블, enum, RLS 정책, 초대 코드 claim 함수, 주간 성공/실패 처리 함수를 생성합니다.

## 2. Environment variables

```bash
cp .env.example .env.local
```

필수 값:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용하며 `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다.

## 3. Install & local run

Node.js 22 이상을 사용합니다.

```bash
nvm use
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 4. First admin bootstrap

초대 코드를 발급할 최초 관리자 계정이 필요합니다. `.env.local`에 아래 값을 일시적으로 추가합니다.

```text
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=strong-password
BOOTSTRAP_ADMIN_NAME=관리자
```

그 다음 실행합니다.

```bash
set -a
source .env.local
set +a
npm run bootstrap:admin
```

완료 후 `BOOTSTRAP_ADMIN_PASSWORD`는 `.env.local`과 셸 환경에서 제거해도 됩니다. `ADMIN_EMAIL`은 유지합니다.

관리자 로그인 후 `/admin`에서 첫 사용자 초대 코드를 발급합니다.

## 5. Supabase Auth URL settings

Supabase Dashboard → Authentication → URL Configuration에서 설정합니다.

로컬:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/callback
```

Vercel 배포 후 production URL도 추가합니다.

```text
https://YOUR_DOMAIN/auth/callback
```

## 6. GitHub

```bash
git init
git add .
git commit -m "fix: release ai-drama-challenge v1.0.1"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

## 7. Vercel deployment

1. Vercel에서 `Add New → Project` 선택
2. GitHub repository import
3. Framework Preset은 Next.js 자동 감지
4. Environment Variables에 다음 값 등록
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = production URL
   - `ADMIN_EMAIL`
5. Deploy
6. 배포된 production URL의 `/auth/callback`을 Supabase Redirect URL에 추가

`BOOTSTRAP_ADMIN_PASSWORD`는 Vercel에 등록할 필요가 없습니다.

## Challenge rules

- 시작 즉시 0일차
- 시작한 주는 주간 판정에서 제외
- 다음 월요일부터 주간 판정 시작
- 월요일 00:00 ~ 일요일 23:59 KST
- 성공: 스트릭 +1, 연속 실패 0
- 1회 연속 실패: 성장 1단계 하락
- 2회 연속 실패: 경고
- 3회 연속 실패: 알로 리셋, 경과일 유지
- 다음 성공: 페널티 해제 및 경과일 기준 정상 성장단계 회복

## v1.0.1 patch notes

- Fixed Vercel TypeScript build error where Supabase nested relation inference resolved `submissions` as `never`.
- Replaced nested `weekly_results -> submissions` selects with explicit `submission_id` lookups on submit/history screens.
- Simplified the dashboard weekly-result query so it no longer depends on relationship inference.
- Re-ran syntax/transpile validation across all 42 TS/TSX source files.


## Link verification in v1.0.0

현재 자동 검증은 URL 형식과 알려진 SNS 호스트를 기준으로 합니다. YouTube, Instagram, TikTok 등은 `검증됨`, 정상 URL이지만 지원 목록 밖의 호스트는 제출을 인정한 뒤 `미검증`으로 저장합니다. 플랫폼 API 기반 게시물 실재 여부 검증은 후속 버전에서 교체할 수 있도록 검증 로직을 분리했습니다.

## Project documents

- `context-notes.md` — 제품·기술 결정
- `checklist.md` — 구현 체크리스트
- `User manual.md` — 사용자/관리자 사용법
- `spec/` — 원본 기획 및 화면 명세

## Version

`ai-drama-challenge-v1.0.1`
