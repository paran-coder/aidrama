# v1.2.4 Migration Guide

## Supabase
추가 SQL migration은 없습니다.

현재 DB에 이미 적용된 아래 migration을 그대로 유지합니다.

```text
001_init.sql
002_v1_1_2_ops.sql
003_v1_2_0_growth.sql
004_v1_2_1_hotfix.sql
```

**001~004를 다시 실행하지 않습니다.**

## 배포
1. 기존 운영 소스를 백업합니다.
2. GitHub 프로젝트 파일을 v1.2.4로 교체합니다.
3. `.env.local`은 GitHub에 올리지 않습니다.
4. push 후 Vercel Production build 성공을 확인합니다.
5. 관리자 로그인 후 `/admin`이 오류 화면 없이 열리는지 가장 먼저 확인합니다.
6. 일반 사용자로 `/dashboard`, `/dashboard/submit`, `/community`, `/mypage`를 이동하며 현재 메뉴만 활성 표시되는지 확인합니다.
7. 커뮤니티 카드에서 `연속 인증 0주` 형식을 확인합니다.

## 관리자 호환 모드
DB에서 `profiles.email`을 읽을 수 없는 경우 v1.2.4는 관리자 화면을 중단하지 않고 legacy profile query로 폴백합니다. 이 경우 운영 화면 상단에 호환 모드 안내가 나타날 수 있습니다.
