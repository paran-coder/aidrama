-- v1.2.0 growth system: permanent creator levels + milestone badges.
-- Run after 001_init.sql and 002_v1_1_2_ops.sql.

create table public.challenge_badges (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null,
  user_id uuid not null,
  milestone_days integer not null check (milestone_days in (100, 300, 600, 900, 1000)),
  awarded_at timestamptz not null default now(),
  trigger_weekly_result_id uuid references public.weekly_results(id) on delete set null,
  trigger_submission_id uuid references public.submissions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (challenge_id, milestone_days),
  foreign key (challenge_id, user_id) references public.challenges(id, user_id) on delete cascade
);

create index challenge_badges_user_milestone_idx on public.challenge_badges(user_id, milestone_days);
create index challenge_badges_challenge_awarded_idx on public.challenge_badges(challenge_id, awarded_at);

alter table public.challenge_badges enable row level security;
create policy "active users read own badges" on public.challenge_badges
for select to authenticated using (auth.uid() = user_id and public.is_active_user());

grant select on public.challenge_badges to authenticated;
grant all on public.challenge_badges to service_role;

-- A successful weekly proof unlocks at most the participant's next milestone.
-- This keeps 100 -> 300 -> 600 -> 900 -> 1000 sequential even when someone
-- returns after a long inactive period; one late success never mass-unlocks levels.
create or replace function public.award_milestone_badges(
  p_challenge_id uuid,
  p_weekly_result_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge public.challenges%rowtype;
  v_result public.weekly_results%rowtype;
  v_elapsed integer;
  v_qualifying_at timestamptz;
  v_milestone integer;
  v_awarded integer := 0;
begin
  select * into v_challenge
  from public.challenges
  where id = p_challenge_id;
  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;

  select * into v_result
  from public.weekly_results
  where id = p_weekly_result_id and challenge_id = p_challenge_id;
  if not found then raise exception 'WEEKLY_RESULT_NOT_FOUND'; end if;
  if v_result.status <> 'success' then return 0; end if;

  select least(
    coalesce(s.submitted_at, v_result.processed_at),
    public.week_deadline_at(v_result.week_start)
  ) into v_qualifying_at
  from (select 1) seed
  left join public.submissions s on s.id = v_result.final_submission_id;

  v_qualifying_at := coalesce(v_qualifying_at, least(v_result.processed_at, public.week_deadline_at(v_result.week_start)));
  v_elapsed := least(
    1000,
    greatest(0, floor(extract(epoch from (v_qualifying_at - v_challenge.started_at)) / 86400)::integer)
  );

  select min(candidate) into v_milestone
  from unnest(array[100,300,600,900,1000]) candidate
  where not exists (
    select 1 from public.challenge_badges b
    where b.challenge_id = v_challenge.id and b.milestone_days = candidate
  );

  if v_milestone is not null and v_elapsed >= v_milestone then
    insert into public.challenge_badges(
      challenge_id,
      user_id,
      milestone_days,
      awarded_at,
      trigger_weekly_result_id,
      trigger_submission_id
    ) values (
      v_challenge.id,
      v_challenge.user_id,
      v_milestone,
      v_qualifying_at,
      v_result.id,
      v_result.final_submission_id
    )
    on conflict (challenge_id, milestone_days) do nothing;
    if found then v_awarded := 1; end if;
  end if;

  return v_awarded;
end;
$$;

-- v1.2 removes visual identity regression. Failures still break current streak
-- and track consecutive misses, but stage_override/reset_count no longer drive
-- creator identity or mascot progression.
create or replace function public.reconcile_challenge_state(p_challenge_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge public.challenges%rowtype;
  v_result public.weekly_results%rowtype;
  v_streak integer := 0;
  v_longest integer := 0;
  v_failures integer := 0;
  v_previous_failures integer := 0;
  v_success_count integer := 0;
  v_failure_count integer := 0;
  v_effect public.weekly_effect;
begin
  select * into v_challenge
  from public.challenges
  where id = p_challenge_id
  for update;

  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;

  for v_result in
    select *
    from public.weekly_results
    where challenge_id = p_challenge_id
    order by week_start asc, processed_at asc, id asc
  loop
    if v_result.status = 'success' then
      v_effect := 'none';
      v_streak := v_streak + 1;
      v_longest := greatest(v_longest, v_streak);
      v_failures := 0;
      v_success_count := v_success_count + 1;
    else
      v_failure_count := v_failure_count + 1;
      v_streak := 0;
      v_previous_failures := v_failures;
      v_failures := least(v_failures + 1, 3);
      if v_failures = 2 then
        v_effect := 'warning';
      elsif v_failures = 3 and v_previous_failures < 3 then
        -- Internal legacy enum value retained for schema compatibility. In v1.2
        -- this means "restart prompt", not level/stage reset.
        v_effect := 'reset';
      else
        v_effect := 'none';
      end if;
    end if;

    update public.weekly_results
    set effect = v_effect,
        streak_after = v_streak,
        consecutive_failures_after = v_failures,
        stage_override_after = null,
        reset_count_after = 0
    where id = v_result.id;
  end loop;

  update public.challenges
  set streak = v_streak,
      longest_streak = v_longest,
      consecutive_failures = v_failures,
      stage_override = null,
      reset_count = 0,
      success_count = v_success_count,
      failure_count = v_failure_count
  where id = p_challenge_id;
end;
$$;

create or replace function public.record_submission_success(
  p_user_id uuid,
  p_week_start date,
  p_url text,
  p_platform_host text,
  p_verification public.verification_status
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge public.challenges%rowtype;
  v_submission_id uuid;
  v_result_id uuid;
begin
  select * into v_challenge
  from public.challenges
  where user_id = p_user_id
  for update;

  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;
  if p_week_start < v_challenge.first_judgement_week_start then raise exception 'WEEK_NOT_STARTED'; end if;
  if p_week_start <> public.kst_week_start(now()) then raise exception 'INVALID_SUBMISSION_WEEK'; end if;
  if now() > public.week_deadline_at(p_week_start) then raise exception 'SUBMISSION_DEADLINE_PASSED'; end if;
  if exists(select 1 from public.challenge_badges where challenge_id = v_challenge.id and milestone_days = 1000) then
    raise exception 'CHALLENGE_COMPLETED';
  end if;
  if exists(
    select 1 from public.weekly_results
    where challenge_id = v_challenge.id and week_start = p_week_start
  ) then
    raise exception 'WEEK_ALREADY_PROCESSED';
  end if;

  insert into public.submissions(
    challenge_id, user_id, week_start, url, platform_host, verification_status
  ) values (
    v_challenge.id, p_user_id, p_week_start, p_url, p_platform_host, p_verification
  ) returning id into v_submission_id;

  insert into public.weekly_results(
    challenge_id, user_id, week_start, status, final_submission_id, source
  ) values (
    v_challenge.id, p_user_id, p_week_start, 'success', v_submission_id, 'user_submission'
  ) returning id into v_result_id;

  perform public.reconcile_challenge_state(v_challenge.id);
  perform public.award_milestone_badges(v_challenge.id, v_result_id);
  return v_submission_id;
end;
$$;


-- Calendar-complete challenges no longer accumulate missed-week failures. The
-- participant can still submit one qualifying success after day 1000 to earn
-- the permanent OWL1000 completion badge.
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
      and c.started_at + interval '1000 days' > now()
      and coalesce(c.last_processed_week_start, c.first_judgement_week_start - 7) < v_target
  loop
    perform public.process_missed_weeks(v_row.user_id, v_target);
    v_processed := v_processed + 1;
  end loop;

  return v_processed;
end;
$$;

-- Admin correction keeps earned badges permanent. A corrected success can award
-- newly crossed badges; a later correction to failure never deletes an award.
create or replace function public.admin_correct_week_result(
  p_actor_user_id uuid,
  p_challenge_id uuid,
  p_week_start date,
  p_status public.weekly_status,
  p_submission_url text,
  p_platform_host text,
  p_verification public.verification_status,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge public.challenges%rowtype;
  v_existing public.weekly_results%rowtype;
  v_after public.weekly_results%rowtype;
  v_submission_id uuid;
  v_result_id uuid;
  v_current_week_start date;
  v_before jsonb := '{}'::jsonb;
  v_trimmed_url text := nullif(trim(coalesce(p_submission_url, '')), '');
begin
  if not exists(select 1 from public.profiles where id = p_actor_user_id and role = 'admin') then raise exception 'ADMIN_REQUIRED'; end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'CORRECTION_REASON_REQUIRED'; end if;

  v_current_week_start := public.kst_week_start(now());
  if p_week_start > v_current_week_start then raise exception 'FUTURE_WEEK_NOT_ALLOWED'; end if;
  if p_status = 'failure' and p_week_start = v_current_week_start then raise exception 'OPEN_WEEK_FAILURE_NOT_ALLOWED'; end if;

  select * into v_challenge from public.challenges where id = p_challenge_id for update;
  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;
  if p_week_start < v_challenge.first_judgement_week_start then raise exception 'WEEK_NOT_STARTED'; end if;

  select * into v_existing
  from public.weekly_results
  where challenge_id = p_challenge_id and week_start = p_week_start
  for update;

  if found then
    v_before := to_jsonb(v_existing);
    v_submission_id := v_existing.final_submission_id;
    v_result_id := v_existing.id;
  end if;

  if p_status = 'success' then
    if v_trimmed_url is not null then
      insert into public.submissions(challenge_id,user_id,week_start,url,platform_host,verification_status)
      values (v_challenge.id,v_challenge.user_id,p_week_start,v_trimmed_url,p_platform_host,coalesce(p_verification,'unverified'))
      returning id into v_submission_id;
    end if;
    if v_submission_id is null then raise exception 'SUCCESS_SUBMISSION_REQUIRED'; end if;
  else
    v_submission_id := null;
  end if;

  insert into public.weekly_results(challenge_id,user_id,week_start,status,final_submission_id,source)
  values (v_challenge.id,v_challenge.user_id,p_week_start,p_status,v_submission_id,'admin_correction')
  on conflict (challenge_id,week_start)
  do update set status=excluded.status, final_submission_id=excluded.final_submission_id, source='admin_correction', processed_at=now()
  returning id into v_result_id;

  perform public.reconcile_challenge_state(v_challenge.id);
  if p_status = 'success' then perform public.award_milestone_badges(v_challenge.id, v_result_id); end if;

  select * into v_after from public.weekly_results where id = v_result_id;
  insert into public.audit_logs(actor_user_id,target_user_id,challenge_id,week_start,action,reason,before_data,after_data)
  values (p_actor_user_id,v_challenge.user_id,v_challenge.id,p_week_start,'weekly_result_corrected',trim(p_reason),v_before,to_jsonb(v_after));
end;
$$;

-- Backfill existing v1.1 users sequentially: each qualifying weekly success
-- can award at most one next milestone.
do $$
declare
  c record;
  v_milestone integer;
  v_result record;
  v_after_week date;
begin
  for c in select * from public.challenges loop
    v_after_week := null;
    foreach v_milestone in array array[100,300,600,900,1000] loop
      select wr.id,
             wr.week_start,
             wr.final_submission_id,
             least(coalesce(s.submitted_at, wr.processed_at), public.week_deadline_at(wr.week_start)) as qualifying_at
      into v_result
      from public.weekly_results wr
      left join public.submissions s on s.id = wr.final_submission_id
      where wr.challenge_id = c.id
        and wr.status = 'success'
        and (v_after_week is null or wr.week_start > v_after_week)
        and least(coalesce(s.submitted_at, wr.processed_at), public.week_deadline_at(wr.week_start)) >= c.started_at + make_interval(days => v_milestone)
      order by wr.week_start asc, qualifying_at asc, wr.id asc
      limit 1;

      if found then
        insert into public.challenge_badges(
          challenge_id,user_id,milestone_days,awarded_at,trigger_weekly_result_id,trigger_submission_id
        ) values (
          c.id,c.user_id,v_milestone,v_result.qualifying_at,v_result.id,v_result.final_submission_id
        ) on conflict (challenge_id,milestone_days) do nothing;
        v_after_week := v_result.week_start;
      else
        exit;
      end if;
    end loop;
  end loop;
end;
$$;

-- Reconcile old stage-drop/reset snapshots into the new non-regressing model.
do $$
declare r record;
begin
  for r in select id from public.challenges loop
    perform public.reconcile_challenge_state(r.id);
  end loop;
end;
$$;

revoke all on function public.award_milestone_badges(uuid, uuid) from public, anon, authenticated;
grant execute on function public.award_milestone_badges(uuid, uuid) to service_role;
