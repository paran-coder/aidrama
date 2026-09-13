# v1.2.2 Migration Guide

## 기존 v1.2.1 운영 DB
**추가 Supabase SQL migration은 없습니다.**

이미 아래 migration을 적용했다면 그대로 사용합니다.

```text
001_init.sql
002_v1_1_2_ops.sql
003_v1_2_0_growth.sql
004_v1_2_1_hotfix.sql
```

`001`~`004`를 다시 실행할 필요가 없습니다.

## 배포 순서
1. GitHub에 v1.2.2 코드를 반영합니다.
2. Vercel Production 배포가 성공하는지 확인합니다.
3. 일반 사용자로 로그인합니다.
4. 준비기간이면 대시보드의 비활성 제출 CTA와 상단 `이번 주 제출` 메뉴를 확인합니다.
5. `/dashboard/submit`에서 첫 제출 가능 날짜와 KST 제출 시간을 확인합니다.
