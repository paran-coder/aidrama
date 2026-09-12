create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'admin');
create type public.verification_status as enum ('verified', 'unverified');
create type public.weekly_status as enum ('success', 'failure');
create type public.challenge_event_type as enum ('success', 'failure', 'stage_drop', 'warning', 'reset', 'recovery');

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
  constraint invite_code_state check ((used_by is null and used_at is null) or (used_by is not null and used_at is not null))
);

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
  last_processed_week_start date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  url text not null check (char_length(url) <= 2048),
  platform_host text,
  verification_status public.verification_status not null,
  submitted_at timestamptz not null default now(),
  unique (challenge_id, week_start)
);

create table public.weekly_results (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  status public.weekly_status not null,
  submission_id uuid references public.submissions(id) on delete set null,
  processed_at timestamptz not null default now(),
  unique (challenge_id, week_start)
);

create table public.challenge_events (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date,
  event_type public.challenge_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index submissions_user_week_idx on public.submissions(user_id, week_start desc);
create index weekly_results_user_week_idx on public.weekly_results(user_id, week_start desc);
create index challenge_events_user_created_idx on public.challenge_events(user_id, created_at desc);
create index challenges_longest_streak_idx on public.challenges(longest_streak desc);

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
  if v_invite.used_by is not null then
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

revoke all on function public.claim_invite_code(text, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_invite_code(text, uuid, text) to service_role;

alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.challenges enable row level security;
alter table public.submissions enable row level security;
alter table public.weekly_results enable row level security;
alter table public.challenge_events enable row level security;
alter table public.analytics_events enable row level security;

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
create policy "users read own challenge events" on public.challenge_events
for select to authenticated using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant select on public.challenges to authenticated;
grant select on public.submissions to authenticated;
grant select on public.weekly_results to authenticated;
grant select on public.challenge_events to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

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
  v_new_streak integer;
  v_had_penalty boolean;
begin
  select * into v_challenge
  from public.challenges
  where user_id = p_user_id
  for update;

  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;
  if p_week_start < v_challenge.first_judgement_week_start then raise exception 'WEEK_NOT_STARTED'; end if;
  if exists(select 1 from public.weekly_results where challenge_id = v_challenge.id and week_start = p_week_start) then
    raise exception 'WEEK_ALREADY_PROCESSED';
  end if;

  insert into public.submissions(challenge_id, user_id, week_start, url, platform_host, verification_status)
  values(v_challenge.id, p_user_id, p_week_start, p_url, p_platform_host, p_verification)
  returning id into v_submission_id;

  v_had_penalty := v_challenge.stage_override is not null;
  v_new_streak := v_challenge.streak + 1;

  update public.challenges
  set streak = v_new_streak,
      longest_streak = greatest(longest_streak, v_new_streak),
      consecutive_failures = 0,
      stage_override = null
  where id = v_challenge.id;

  insert into public.weekly_results(challenge_id, user_id, week_start, status, submission_id)
  values(v_challenge.id, p_user_id, p_week_start, 'success', v_submission_id);

  insert into public.challenge_events(challenge_id, user_id, week_start, event_type, metadata)
  values(v_challenge.id, p_user_id, p_week_start, 'success', jsonb_build_object('verification', p_verification));

  if v_had_penalty then
    insert into public.challenge_events(challenge_id, user_id, week_start, event_type)
    values(v_challenge.id, p_user_id, p_week_start, 'recovery');
  end if;

  return v_submission_id;
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
  v_next_failures integer;
  v_current_stage smallint;
begin
  select * into v_challenge
  from public.challenges
  where user_id = p_user_id
  for update;

  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;
  if p_week_start < v_challenge.first_judgement_week_start then raise exception 'WEEK_NOT_STARTED'; end if;
  if exists(select 1 from public.weekly_results where challenge_id = v_challenge.id and week_start = p_week_start) then
    return;
  end if;

  v_next_failures := least(v_challenge.consecutive_failures + 1, 3);
  v_current_stage := coalesce(v_challenge.stage_override, p_base_stage);

  update public.challenges
  set streak = 0,
      consecutive_failures = v_next_failures,
      stage_override = case
        when v_next_failures = 1 then greatest(v_current_stage - 1, 0)
        when v_next_failures >= 3 then 0
        else v_challenge.stage_override
      end,
      reset_count = reset_count + case when v_next_failures = 3 and v_challenge.consecutive_failures < 3 then 1 else 0 end,
      last_processed_week_start = p_week_start
  where id = v_challenge.id;

  insert into public.weekly_results(challenge_id, user_id, week_start, status)
  values(v_challenge.id, p_user_id, p_week_start, 'failure');

  insert into public.challenge_events(challenge_id, user_id, week_start, event_type)
  values(v_challenge.id, p_user_id, p_week_start, 'failure');

  if v_next_failures = 1 then
    insert into public.challenge_events(challenge_id, user_id, week_start, event_type, metadata)
    values(v_challenge.id, p_user_id, p_week_start, 'stage_drop', jsonb_build_object('from', v_current_stage, 'to', greatest(v_current_stage - 1, 0)));
  elsif v_next_failures = 2 then
    insert into public.challenge_events(challenge_id, user_id, week_start, event_type)
    values(v_challenge.id, p_user_id, p_week_start, 'warning');
  elsif v_next_failures = 3 and v_challenge.consecutive_failures < 3 then
    insert into public.challenge_events(challenge_id, user_id, week_start, event_type)
    values(v_challenge.id, p_user_id, p_week_start, 'reset');
  end if;
end;
$$;

revoke all on function public.record_submission_success(uuid, date, text, text, public.verification_status) from public, anon, authenticated;
revoke all on function public.record_week_failure(uuid, date, smallint) from public, anon, authenticated;
grant execute on function public.record_submission_success(uuid, date, text, text, public.verification_status) to service_role;
grant execute on function public.record_week_failure(uuid, date, smallint) to service_role;
