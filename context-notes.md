# context-notes.md — v1.2.11

## 목표
Vercel에서 발생한 legacy self-service deletion 파일의 type-check 실패를 막고, 관리자 삭제 방식으로 정리된 현재 운영 구조를 유지한다.

## 확인된 현상
- Vercel: `lib/actions/account-deletion.ts(5,10)`에서 `clearSupabaseAuthCookies` export를 찾지 못해 build 실패.
- 로컬 v1.2.10 clean package에는 이미 `lib/actions/account-deletion.ts`와 `components/account-deletion-panel.tsx`가 없음.
- 따라서 GitHub 업데이트 시 삭제 파일이 저장소에 잔존한 것으로 판단.

## 수정
- `lib/supabase/server.ts`에 legacy compatibility export 추가.
- clean package에서는 사용자 직접 탈퇴 파일을 계속 제외.
- 관리자 전용 account deletion은 유지.

## DB
변경 없음. 001~006 재실행 금지.
