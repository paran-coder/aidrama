# v1.2.8 Migration Guide

## Database migration
None.

Migration `005_v1_2_6_account_deletion.sql`을 이미 적용했다면 다시 실행하지 마십시오.

## Deployment order
1. Replace application code with v1.2.8.
2. Deploy through GitHub/Vercel.
3. Test with a disposable normal-user account: login -> mypage -> delete account -> landing success message.
4. Verify the deleted account cannot log in again and admin invite history remains anonymized.
