# Migration Guide — v1.2.6

## 적용 대상
현재 운영 DB에 `001_init.sql` ~ `004_v1_2_1_hotfix.sql`이 이미 적용된 프로젝트입니다.

## 배포 순서
1. Supabase → SQL Editor → New query
2. `supabase/migrations/005_v1_2_6_account_deletion.sql` 전체 실행
3. `Success. No rows returned` 확인
4. GitHub 코드를 v1.2.6으로 교체 후 push
5. Vercel 자동 배포 완료 확인
6. 테스트 일반 계정으로 마이페이지 → 회원 탈퇴 검증

## 005에서 추가되는 것
`invite_codes.used_account_deleted_at timestamptz`

이 컬럼은 탈퇴자의 이름·이메일을 보존하지 않습니다. 사용된 초대코드가 탈퇴 계정에 의해 사용되었다는 익명 이력만 구분하기 위한 시각 정보입니다.

## 다시 실행하지 않는 파일
`001`, `002`, `003`, `004`는 다시 실행하지 않습니다.

## 실제 탈퇴 확인
탈퇴 후 아래를 확인합니다.
- 같은 이메일/비밀번호로 로그인되지 않음
- `profiles`에서 계정 행 삭제
- 연결된 `challenges`, `submissions`, `weekly_results`, `challenge_badges` 삭제
- 사용했던 `invite_codes` 행은 남아 있고 `used_at`도 유지
- 해당 코드의 `used_by`는 NULL, `used_account_deleted_at`은 기록됨
- 관리자 화면에서 `탈퇴한 사용자 / 개인 정보 삭제됨`으로 표시
