-- v1.1.2 production stabilization migration.
-- Safe to run once on a v1.1.x database that already has 001_init.sql.

create type public.account_status as enum ('active', 'suspended');

alter table public.profiles
  add column status public.account_status not null default 'active',
  add column suspended_at timestamptz,
  add column suspended_by uuid references auth.users(id) on delete set null,
  add column suspension_reason text;

alter table public.profiles
  add constraint profile_suspension_state check (
    (status = 'active' and suspended_at is null and suspended_by is null and suspension_reason is null)
    or
    (status = 'suspended' and suspended_at is not null and char_length(trim(coalesce(suspension_reason, ''))) between 3 and 500)
  );

alter table public.invite_codes
  add column revoked_at timestamptz,
  add column revoked_by uuid references auth.users(id) on delete set null,
  add column revoke_reason text;

alter table public.invite_codes
  add constraint invite_code_revocation_state check (
    (revoked_at is null and revoked_by is null and revoke_reason is null)
    or
    (revoked_at is not null and char_length(trim(coalesce(revoke_reason, ''))) between 3 and 500)
  ),
  add constraint invite_code_used_or_revoked check (
    not (used_at is not null and revoked_at is not null)
  );

-- Audit action was an enum in 001. Operations expand over time, so v1.1.2
-- converts it to constrained text to avoid enum migration friction on future patches.
alter table public.audit_logs alter column action type text using action::text;
drop type public.audit_action;
alter table public.audit_logs add constraint audit_action_allowed check (action in (
  'weekly_result_corrected', 'invite_code_revoked', 'user_suspended', 'user_reactivated'
));

create index profiles_status_created_idx on public.profiles(status, created_at);
create index invite_codes_state_idx on public.invite_codes(used_at, revoked_at, expires_at, created_at desc);

create or replace function public.claim_invite_code(
  p_code text,
  p_user_id uuid,
  p_display_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_code));
  v_invite public.invite_codes%rowtype;
begin
  select * into v_invite
  from public.invite_codes
  where code = v_code
  for update;

  if not found then
    raise exception 'INVITE_NOT_FOUND';
  end if;
  if v_invite.used_at is not null then
    raise exception 'INVITE_ALREADY_USED';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'INVITE_REVOKED';
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'INVITE_EXPIRED';
  end if;

  insert into public.profiles(id, display_name)
  values (p_user_id, trim(p_display_name));

  update public.invite_codes
  set used_by = p_user_id, used_at = now()
  where code = v_code;
end;
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'
  );
$$;

-- Synchronize every participant that is actually behind, inside one database RPC.
-- This removes the N+1 Vercel -> Supabase call pattern from admin/community pages.
create or replace function public.process_all_missed_weeks(p_last_closed_week date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_target date := least(p_last_closed_week, public.kst_week_start(now()) - 7);
  v_processed integer := 0;
begin
  for v_row in
    select c.user_id
    from public.challenges c
    where c.first_judgement_week_start <= v_target
      and coalesce(c.last_processed_week_start, c.first_judgement_week_start - 7) < v_target
  loop
    perform public.process_missed_weeks(v_row.user_id, v_target);
    v_processed := v_processed + 1;
  end loop;

  return v_processed;
end;
$$;

create or replace function public.admin_revoke_invite_code(
  p_actor_user_id uuid,
  p_code text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invite_codes%rowtype;
  v_reason text := trim(coalesce(p_reason, ''));
begin
  if not exists(select 1 from public.profiles where id = p_actor_user_id and role = 'admin') then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if char_length(v_reason) < 3 then
    raise exception 'REVOCATION_REASON_REQUIRED';
  end if;

  select * into v_invite
  from public.invite_codes
  where code = upper(trim(p_code))
  for update;

  if not found then raise exception 'INVITE_NOT_FOUND'; end if;
  if v_invite.used_at is not null then raise exception 'INVITE_ALREADY_USED'; end if;
  if v_invite.revoked_at is not null then return; end if;

  update public.invite_codes
  set revoked_at = now(), revoked_by = p_actor_user_id, revoke_reason = v_reason
  where code = v_invite.code;

  insert into public.audit_logs(
    actor_user_id, target_user_id, challenge_id, week_start, action, reason, before_data, after_data
  ) values (
    p_actor_user_id,
    null,
    null,
    null,
    'invite_code_revoked',
    v_reason,
    to_jsonb(v_invite),
    jsonb_build_object('code', v_invite.code, 'revoked', true)
  );
end;
$$;

create or replace function public.admin_set_user_status(
  p_actor_user_id uuid,
  p_target_user_id uuid,
  p_status public.account_status,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_after public.profiles%rowtype;
  v_reason text := trim(coalesce(p_reason, ''));
  v_action text;
begin
  if not exists(select 1 from public.profiles where id = p_actor_user_id and role = 'admin') then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if p_actor_user_id = p_target_user_id then raise exception 'SELF_STATUS_CHANGE_NOT_ALLOWED'; end if;
  if char_length(v_reason) < 3 then raise exception 'STATUS_REASON_REQUIRED'; end if;

  select * into v_profile
  from public.profiles
  where id = p_target_user_id
  for update;

  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  if v_profile.role = 'admin' then raise exception 'ADMIN_ACCOUNT_PROTECTED'; end if;
  if v_profile.status = p_status then return; end if;

  if p_status = 'suspended' then
    update public.profiles
    set status = 'suspended',
        suspended_at = now(),
        suspended_by = p_actor_user_id,
        suspension_reason = v_reason
    where id = p_target_user_id
    returning * into v_after;
    v_action := 'user_suspended';
  else
    update public.profiles
    set status = 'active',
        suspended_at = null,
        suspended_by = null,
        suspension_reason = null
    where id = p_target_user_id
    returning * into v_after;
    v_action := 'user_reactivated';
  end if;

  insert into public.audit_logs(
    actor_user_id, target_user_id, challenge_id, week_start, action, reason, before_data, after_data
  ) values (
    p_actor_user_id,
    p_target_user_id,
    null,
    null,
    v_action,
    v_reason,
    to_jsonb(v_profile),
    to_jsonb(v_after)
  );
end;
$$;

-- Suspended users should not keep reading operational data through a previously
-- issued browser session. Service-role/admin operations still bypass RLS.
drop policy if exists "authenticated profiles readable" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "authenticated challenges readable" on public.challenges;
drop policy if exists "users read own submissions" on public.submissions;
drop policy if exists "users read own weekly results" on public.weekly_results;

create policy "active authenticated profiles readable" on public.profiles
for select to authenticated using (public.is_active_user());
create policy "active users update own profile" on public.profiles
for update to authenticated using (auth.uid() = id and public.is_active_user())
with check (auth.uid() = id and public.is_active_user());
create policy "active authenticated challenges readable" on public.challenges
for select to authenticated using (public.is_active_user());
create policy "active users read own submissions" on public.submissions
for select to authenticated using (auth.uid() = user_id and public.is_active_user());
create policy "active users read own weekly results" on public.weekly_results
for select to authenticated using (auth.uid() = user_id and public.is_active_user());

-- Do not expose operational suspension metadata through the public profile API.
revoke select on public.profiles from authenticated;
grant select(id, display_name, role, created_at, updated_at) on public.profiles to authenticated;

revoke all on function public.is_active_user() from public, anon;
grant execute on function public.is_active_user() to authenticated, service_role;

revoke all on function public.process_all_missed_weeks(date) from public, anon, authenticated;
revoke all on function public.admin_revoke_invite_code(uuid, text, text) from public, anon, authenticated;
revoke all on function public.admin_set_user_status(uuid, uuid, public.account_status, text) from public, anon, authenticated;

grant execute on function public.process_all_missed_weeks(date) to service_role;
grant execute on function public.admin_revoke_invite_code(uuid, text, text) to service_role;
grant execute on function public.admin_set_user_status(uuid, uuid, public.account_status, text) to service_role;
