-- v1.2.6: preserve anonymous invite-code history after member withdrawal.
-- Run once after 004_v1_2_1_hotfix.sql.

alter table public.invite_codes
  add column if not exists used_account_deleted_at timestamptz;

create index if not exists invite_codes_deleted_user_history_idx
  on public.invite_codes(used_account_deleted_at)
  where used_account_deleted_at is not null;
