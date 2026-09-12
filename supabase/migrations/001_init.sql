create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'admin');
create type public.verification_status as enum ('verified', 'unverified');
create type public.weekly_status as enum ('success', 'failure');
create type public.weekly_effect as enum ('none', 'stage_drop', 'warning', 'reset', 'recovery');
create type public.weekly_result_source as enum ('user_submission', 'system_missed', 'admin_correction');
create type public.audit_action as enum ('weekly_result_corrected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invite_codes (
  code text primary key,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  used_by uuid unique references public.profiles(id) on delete set null,
  used_at timestamptz,
  constraint invite_code_state check (
    (used_at is null and used_by is null)
    or used_at is not null
  )
);

-- One active 1000-day challenge per account in the current product.
-- Account metadata and challenge state remain separate so challenge data can be
-- repaired/rebuilt without touching authentication/profile data.
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  started_at timestamptz not null,
  first_judgement_week_start date not null,
  streak integer not null default 0 check (streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  consecutive_failures integer not null default 0 check (consecutive_failures between 0 and 3),
  stage_override smallint check (stage_override between 0 and 7),
  reset_count integer not null default 0 check (reset_count >= 0),
  success_count integer not null default 0 check (success_count >= 0),
  failure_count integer not null default 0 check (failure_count >= 0),
  last_processed_week_start date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- Submission attempts are deliberately separate from the official weekly result.
-- Current participant UI still blocks a second successful submission for a week,
-- while operations can preserve a corrected/replaced link instead of overwriting history.
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null,
  user_id uuid not null,
  week_start date not null,
  url text not null check (char_length(url) between 1 and 2048),
  platform_host text,
  verification_status public.verification_status not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (id, challenge_id, week_start),
  foreign key (challenge_id, user_id) references public.challenges(id, user_id) on delete cascade
);

-- One official outcome per challenge/week. Snapshot columns make the historical
-- state inspectable while remaining fully rebuildable from ordered weekly status.
create table public.weekly_results (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null,
  user_id uuid not null,
  week_start date not null,
  status public.weekly_status not null,
  final_submission_id uuid,
  source public.weekly_result_source not null,
  effect public.weekly_effect not null default 'none',
  streak_after integer not null default 0 check (streak_after >= 0),
  consecutive_failures_after integer not null default 0 check (consecutive_failures_after between 0 and 3),
  stage_override_after smallint check (stage_override_after between 0 and 7),
  reset_count_after integer not null default 0 check (reset_count_after >= 0),
  processed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (challenge_id, week_start),
  foreign key (challenge_id, user_id) references public.challenges(id, user_id) on delete cascade,
  foreign key (final_submission_id, challenge_id, week_start) references public.submissions(id, challenge_id, week_start),
  constraint weekly_result_submission_state check (
    (status = 'success' and final_submission_id is not null)
    or (status = 'failure' and final_submission_id is null)
  )
);

-- Only meaningful administrative corrections are audited. Routine page/click
-- analytics are intentionally not persisted in the operational database.
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  challenge_id uuid references public.challenges(id) on delete set null,
  week_start date,
  action public.audit_action not null,
  reason text not null check (char_length(trim(reason)) between 3 and 500),
  before_data jsonb not null default '{}'::jsonb,
  after_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index submissions_user_week_idx on public.submissions(user_id, week_start desc, submitted_at desc);
create index submissions_challenge_week_idx on public.submissions(challenge_id, week_start desc, submitted_at desc);
create index weekly_results_user_week_idx on public.weekly_results(user_id, week_start desc);
create index weekly_results_challenge_week_idx on public.weekly_results(challenge_id, week_start desc);
create index challenges_longest_streak_idx on public.challenges(longest_streak desc, streak desc);
create index audit_logs_challenge_created_idx on public.audit_logs(challenge_id, created_at desc);
create index audit_logs_target_created_idx on public.audit_logs(target_user_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles
for each row execute procedure public.touch_updated_at();
create trigger challenges_touch_updated_at before update on public.challenges
for each row execute procedure public.touch_updated_at();
create trigger weekly_results_touch_updated_at before update on public.weekly_results
for each row execute procedure public.touch_updated_at();

create or replace function public.owl_base_stage_for_day(p_day integer)
returns smallint
language sql
immutable
as $$
  select case
    when p_day >= 900 then 7
    when p_day >= 730 then 6
    when p_day >= 550 then 5
    when p_day >= 365 then 4
    when p_day >= 200 then 3
    when p_day >= 100 then 2
    when p_day >= 30 then 1
    else 0
  end::smallint;
$$;

create or replace function public.week_deadline_at(p_week_start date)
returns timestamptz
language sql
stable
as $$
  select ((p_week_start::timestamp + interval '7 days' - interval '1 second') at time zone 'Asia/Seoul');
$$;


create or replace function public.kst_week_start(p_at timestamptz)
returns date
language sql
stable
as $$
  select ((p_at at time zone 'Asia/Seoul')::date
    - (extract(isodow from (p_at at time zone 'Asia/Seoul'))::integer - 1));
$$;

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

-- Rebuilds all derived challenge state and per-week snapshots from official weekly
-- outcomes. This is the single rule implementation used after ordinary writes and
-- administrative corrections, so repaired data cannot drift from normal behavior.
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
  v_stage_override smallint := null;
  v_reset_count integer := 0;
  v_success_count integer := 0;
  v_failure_count integer := 0;
  v_current_stage smallint;
  v_base_stage smallint;
  v_elapsed_days integer;
  v_effect public.weekly_effect;
begin
  select * into v_challenge
  from public.challenges
  where id = p_challenge_id
  for update;

  if not found then
    raise exception 'CHALLENGE_NOT_FOUND';
  end if;

  for v_result in
    select *
    from public.weekly_results
    where challenge_id = p_challenge_id
    order by week_start asc, processed_at asc, id asc
  loop
    if v_result.status = 'success' then
      v_effect := case when v_stage_override is not null then 'recovery'::public.weekly_effect else 'none'::public.weekly_effect end;
      v_streak := v_streak + 1;
      v_longest := greatest(v_longest, v_streak);
      v_failures := 0;
      v_stage_override := null;
      v_success_count := v_success_count + 1;
    else
      v_failure_count := v_failure_count + 1;
      v_streak := 0;
      v_elapsed_days := least(
        1000,
        greatest(
          0,
          floor(extract(epoch from (public.week_deadline_at(v_result.week_start) - v_challenge.started_at)) / 86400)::integer
        )
      );
      v_base_stage := public.owl_base_stage_for_day(v_elapsed_days);
      v_current_stage := coalesce(v_stage_override, v_base_stage);

      v_previous_failures := v_failures;
      v_failures := least(v_failures + 1, 3);

      if v_failures = 1 then
        v_stage_override := greatest(v_current_stage - 1, 0)::smallint;
        v_effect := 'stage_drop';
      elsif v_failures = 2 then
        v_effect := 'warning';
      elsif v_failures = 3 then
        if v_previous_failures < 3 then
          v_reset_count := v_reset_count + 1;
          v_effect := 'reset';
        else
          v_effect := 'none';
        end if;
        v_stage_override := 0;
      else
        v_effect := 'none';
      end if;
    end if;

    update public.weekly_results
    set effect = v_effect,
        streak_after = v_streak,
        consecutive_failures_after = v_failures,
        stage_override_after = v_stage_override,
        reset_count_after = v_reset_count
    where id = v_result.id;
  end loop;

  update public.challenges
  set streak = v_streak,
      longest_streak = v_longest,
      consecutive_failures = v_failures,
      stage_override = v_stage_override,
      reset_count = v_reset_count,
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
begin
  select * into v_challenge
  from public.challenges
  where user_id = p_user_id
  for update;

  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;
  if p_week_start < v_challenge.first_judgement_week_start then raise exception 'WEEK_NOT_STARTED'; end if;
  if p_week_start <> public.kst_week_start(now()) then raise exception 'INVALID_SUBMISSION_WEEK'; end if;
  if now() > public.week_deadline_at(p_week_start) then raise exception 'SUBMISSION_DEADLINE_PASSED'; end if;
  if now() >= v_challenge.started_at + interval '1000 days' then raise exception 'CHALLENGE_COMPLETED'; end if;
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
  );

  perform public.reconcile_challenge_state(v_challenge.id);
  return v_submission_id;
end;
$$;

create or replace function public.process_missed_weeks(
  p_user_id uuid,
  p_last_closed_week date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge public.challenges%rowtype;
  v_cursor date;
  v_last_visited date;
  v_completion_at timestamptz;
  v_max_closed_week date;
  v_target_closed_week date;
begin
  select * into v_challenge
  from public.challenges
  where user_id = p_user_id
  for update;

  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;

  v_max_closed_week := public.kst_week_start(now()) - 7;
  v_target_closed_week := least(p_last_closed_week, v_max_closed_week);
  if v_target_closed_week < v_challenge.first_judgement_week_start then
    return;
  end if;

  v_completion_at := v_challenge.started_at + interval '1000 days';
  v_cursor := coalesce(v_challenge.last_processed_week_start + 7, v_challenge.first_judgement_week_start);
  v_last_visited := v_challenge.last_processed_week_start;

  while v_cursor <= v_target_closed_week loop
    if public.week_deadline_at(v_cursor) > v_completion_at then
      exit;
    end if;

    insert into public.weekly_results(
      challenge_id, user_id, week_start, status, final_submission_id, source
    ) values (
      v_challenge.id, p_user_id, v_cursor, 'failure', null, 'system_missed'
    )
    on conflict (challenge_id, week_start) do nothing;

    v_last_visited := v_cursor;
    v_cursor := v_cursor + 7;
  end loop;

  if v_last_visited is distinct from v_challenge.last_processed_week_start then
    update public.challenges
    set last_processed_week_start = v_last_visited
    where id = v_challenge.id;
  end if;

  perform public.reconcile_challenge_state(v_challenge.id);
end;
$$;

create or replace function public.record_week_failure(
  p_user_id uuid,
  p_week_start date,
  p_base_stage smallint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge public.challenges%rowtype;
begin
  -- p_base_stage is retained in the RPC signature for backwards-compatible
  -- server calls. Reconciliation derives the canonical stage from dates.
  perform p_base_stage;

  select * into v_challenge
  from public.challenges
  where user_id = p_user_id
  for update;

  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;
  if p_week_start < v_challenge.first_judgement_week_start then raise exception 'WEEK_NOT_STARTED'; end if;
  if p_week_start >= public.kst_week_start(now()) then raise exception 'WEEK_NOT_CLOSED'; end if;
  if public.week_deadline_at(p_week_start) > v_challenge.started_at + interval '1000 days' then raise exception 'CHALLENGE_COMPLETED'; end if;
  if exists(
    select 1 from public.weekly_results
    where challenge_id = v_challenge.id and week_start = p_week_start
  ) then
    return;
  end if;

  insert into public.weekly_results(
    challenge_id, user_id, week_start, status, final_submission_id, source
  ) values (
    v_challenge.id, p_user_id, p_week_start, 'failure', null, 'system_missed'
  );

  update public.challenges
  set last_processed_week_start = p_week_start
  where id = v_challenge.id;

  perform public.reconcile_challenge_state(v_challenge.id);
end;
$$;

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
  v_current_week_start date;
  v_before jsonb := '{}'::jsonb;
  v_trimmed_url text := nullif(trim(coalesce(p_submission_url, '')), '');
begin
  if not exists(
    select 1 from public.profiles where id = p_actor_user_id and role = 'admin'
  ) then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'CORRECTION_REASON_REQUIRED';
  end if;

  v_current_week_start := public.kst_week_start(now());

  if p_week_start > v_current_week_start then
    raise exception 'FUTURE_WEEK_NOT_ALLOWED';
  end if;
  if p_status = 'failure' and p_week_start = v_current_week_start then
    raise exception 'OPEN_WEEK_FAILURE_NOT_ALLOWED';
  end if;

  select * into v_challenge
  from public.challenges
  where id = p_challenge_id
  for update;

  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;
  if p_week_start < v_challenge.first_judgement_week_start then raise exception 'WEEK_NOT_STARTED'; end if;

  select * into v_existing
  from public.weekly_results
  where challenge_id = p_challenge_id and week_start = p_week_start
  for update;

  if found then
    v_before := to_jsonb(v_existing);
    v_submission_id := v_existing.final_submission_id;
  end if;

  if p_status = 'success' then
    if v_trimmed_url is not null then
      insert into public.submissions(
        challenge_id, user_id, week_start, url, platform_host, verification_status
      ) values (
        v_challenge.id,
        v_challenge.user_id,
        p_week_start,
        v_trimmed_url,
        p_platform_host,
        coalesce(p_verification, 'unverified')
      ) returning id into v_submission_id;
    end if;

    if v_submission_id is null then
      raise exception 'SUCCESS_SUBMISSION_REQUIRED';
    end if;
  else
    v_submission_id := null;
  end if;

  insert into public.weekly_results(
    challenge_id, user_id, week_start, status, final_submission_id, source
  ) values (
    v_challenge.id,
    v_challenge.user_id,
    p_week_start,
    p_status,
    v_submission_id,
    'admin_correction'
  )
  on conflict (challenge_id, week_start)
  do update set
    status = excluded.status,
    final_submission_id = excluded.final_submission_id,
    source = 'admin_correction',
    processed_at = now();

  perform public.reconcile_challenge_state(v_challenge.id);

  select * into v_after
  from public.weekly_results
  where challenge_id = p_challenge_id and week_start = p_week_start;

  insert into public.audit_logs(
    actor_user_id,
    target_user_id,
    challenge_id,
    week_start,
    action,
    reason,
    before_data,
    after_data
  ) values (
    p_actor_user_id,
    v_challenge.user_id,
    v_challenge.id,
    p_week_start,
    'weekly_result_corrected',
    trim(p_reason),
    v_before,
    to_jsonb(v_after)
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.challenges enable row level security;
alter table public.submissions enable row level security;
alter table public.weekly_results enable row level security;
alter table public.audit_logs enable row level security;

create policy "authenticated profiles readable" on public.profiles
for select to authenticated using (true);
create policy "users update own profile" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "authenticated challenges readable" on public.challenges
for select to authenticated using (true);
create policy "users read own submissions" on public.submissions
for select to authenticated using (auth.uid() = user_id);
create policy "users read own weekly results" on public.weekly_results
for select to authenticated using (auth.uid() = user_id);

-- No direct authenticated policy for invite_codes or audit_logs. They are
-- manipulated through server-side service-role flows only.

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant select on public.challenges to authenticated;
grant select on public.submissions to authenticated;
grant select on public.weekly_results to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

revoke all on function public.claim_invite_code(text, uuid, text) from public, anon, authenticated;
revoke all on function public.reconcile_challenge_state(uuid) from public, anon, authenticated;
revoke all on function public.record_submission_success(uuid, date, text, text, public.verification_status) from public, anon, authenticated;
revoke all on function public.process_missed_weeks(uuid, date) from public, anon, authenticated;
revoke all on function public.record_week_failure(uuid, date, smallint) from public, anon, authenticated;
revoke all on function public.admin_correct_week_result(uuid, uuid, date, public.weekly_status, text, text, public.verification_status, text) from public, anon, authenticated;

grant execute on function public.claim_invite_code(text, uuid, text) to service_role;
grant execute on function public.reconcile_challenge_state(uuid) to service_role;
grant execute on function public.record_submission_success(uuid, date, text, text, public.verification_status) to service_role;
grant execute on function public.process_missed_weeks(uuid, date) to service_role;
grant execute on function public.record_week_failure(uuid, date, smallint) to service_role;
grant execute on function public.admin_correct_week_result(uuid, uuid, date, public.weekly_status, text, text, public.verification_status, text) to service_role;
