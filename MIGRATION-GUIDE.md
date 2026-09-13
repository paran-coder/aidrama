# v1.2.1 Migration Guide

## 현재 운영 DB가 이미 v1.2.0인 경우
사용자가 이미 `001_init.sql` → `002_v1_1_2_ops.sql` → `003_v1_2_0_growth.sql`을 적용했으므로, **이번에는 아래 파일 하나만** Supabase SQL Editor에서 실행합니다.

```text
supabase/migrations/004_v1_2_1_hotfix.sql
```

`001`, `002`, `003`은 다시 실행하지 않습니다.

## 004가 하는 일
- `profiles.email` 운영용 캐시 컬럼 추가
- 기존 Auth 이메일을 `profiles.email`로 백필
- 신규 초대 가입 시 이메일 캐시 동기화
- 관리자 목록에서 느린 Auth Admin `listUsers` 호출 제거를 위한 기반 제공
- 유효한 성공 기록 없이 잘못 생성된 마일스톤 배지 제거
- 시작일 + 마일스톤 일수보다 이른 잘못된 배지 제거

## 실행 후 확인
1. SQL Editor 결과가 `Success. No rows returned`인지 확인합니다.
2. Table Editor → `profiles`에 `email` 컬럼이 생성됐는지 확인합니다.
3. 기존 테스트 사용자 `roent`가 아직 Day 0이라면 `challenge_badges`의 잘못된 100일 배지가 제거되어야 합니다.
4. GitHub에 v1.2.1 코드를 올리고 Vercel 배포 후 실환경 스모크 테스트를 진행합니다.

## Fresh install
새 프로젝트는 아래 순서로 한 번씩 실행합니다.

```text
001_init.sql
002_v1_1_2_ops.sql
003_v1_2_0_growth.sql
004_v1_2_1_hotfix.sql
```
