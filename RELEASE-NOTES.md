# Release Notes — v1.2.10

## Fixed
- 운영 관리자(`role = admin`)가 참여자 현황과 참여자 수에 섞이던 문제를 수정했습니다.
- 참여자 조회는 DB 단계에서 `role = user`만 가져옵니다.

## Cleanup
- 테스트에 사용된 초대 코드 11개를 일회성으로 삭제하는 `006_v1_2_10_test_data_cleanup.sql`을 추가했습니다.
- exact code match만 사용하므로 이후 운영용 초대 코드에는 영향을 주지 않습니다.

## Database
- 스키마 변경 없음.
- 테스트 데이터 정리 SQL 1개 있음.
