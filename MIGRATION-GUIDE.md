# Migration Guide — v1.2.10

## DB 변경 여부
스키마 변경은 없습니다. 다만 테스트 초대 코드 이력을 지우기 위한 **일회성 데이터 정리 SQL**이 있습니다.

## 실행할 파일
`supabase/migrations/006_v1_2_10_test_data_cleanup.sql`

이 SQL은 아래 테스트 코드 11개만 exact match로 삭제합니다.

- OWL-3Q4SQ-25W3P
- OWL-AXSMH-KUZ4A
- OWL-XJHXD-2U8FW
- OWL-9NYFH-SK7RA
- OWL-B5J9G-S6LXE
- OWL-JYRRV-39ZFU
- OWL-DN328-7Y2NL
- OWL-JXTWD-SV3V2
- OWL-5TNUW-F2AVS
- OWL-PE7WK-Z2BWD
- OWL-WQ97D-7NZXD

## 적용 순서
1. Supabase SQL Editor에서 006 파일 전체 실행
2. 결과에 삭제된 테스트 코드가 표시되는지 확인
3. GitHub에 v1.2.10 코드 반영
4. Vercel 배포
5. `/admin` 확인
   - 참여자 목록에 admin이 없어야 함
   - 현재 실제 참여자가 없다면 `0명`이어야 함
   - 위 테스트 초대 코드 11개가 없어야 함

## 주의
- `001`~`005`는 다시 실행하지 않습니다.
- 006은 exact-match delete라 재실행해도 이미 삭제된 코드에는 추가 영향이 없습니다.
- 새 운영용 초대 코드는 삭제하지 않습니다.
