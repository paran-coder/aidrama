-- v1.2.1 hotfix: operational read performance, profile email cache,
-- and cleanup of invalid milestone badges accidentally created before day 100.
-- Run once after 001_init.sql, 002_v1_1_2_ops.sql, and 003_v1_2_0_growth.sql.

alter table public.profiles
  add column email text;

update public.profiles p
set email = lower(u.email)
from auth.users u
where u.id = p.id
  and u.email is not null;

create index profiles_email_idx on public.profiles(lower(email));

-- Keep the signup RPC signature stable, but cache the Auth email in profiles so
-- admin overview does not need the much slower Auth Admin listUsers endpoint.
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
  v_email text;
begin
  select * into v_invite
  from public.invite_codes
  where code = v_code
  for update;

  if not found then raise exception 'INVITE_NOT_FOUND'; end if;
  if v_invite.used_at is not null then raise exception 'INVITE_ALREADY_USED'; end if;
  if v_invite.revoked_at is not null then raise exception 'INVITE_REVOKED'; end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then raise exception 'INVITE_EXPIRED'; end if;

  select lower(email) into v_email from auth.users where id = p_user_id;

  insert into public.profiles(id, display_name, email)
  values (p_user_id, trim(p_display_name), v_email);

  update public.invite_codes
  set used_by = p_user_id, used_at = now()
  where code = v_code;
end;
$$;

-- Defensive cleanup. A milestone is valid only when its recorded successful
-- weekly result actually qualified on/after that milestone day. This removes
-- any stray badge that could make a brand-new participant appear as Lv.2+.
delete from public.challenge_badges b
using public.challenges c
where b.challenge_id = c.id
  and (
    b.trigger_weekly_result_id is null
    or b.awarded_at < c.started_at + make_interval(days => b.milestone_days)
    or not exists (
      select 1
      from public.weekly_results wr
      left join public.submissions s on s.id = wr.final_submission_id
      where wr.id = b.trigger_weekly_result_id
        and wr.challenge_id = b.challenge_id
        and wr.status = 'success'
        and least(
          coalesce(s.submitted_at, wr.processed_at),
          public.week_deadline_at(wr.week_start)
        ) >= c.started_at + make_interval(days => b.milestone_days)
    )
  );
