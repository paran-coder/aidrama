import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const challenge = read('lib/challenge.ts');
const service = read('lib/challenge-service.ts');
const challengeActions = read('lib/actions/challenge.ts');
const adminActions = read('lib/actions/admin.ts');
const dashboard = read('app/dashboard/page.tsx');
const submit = read('app/dashboard/submit/page.tsx');
const admin = read('app/admin/page.tsx');
const detail = read('app/admin/participants/[userId]/page.tsx');
const onboarding = read('app/onboarding/page.tsx');
const migration = read('supabase/migrations/008_v1_3_2_rolling_weeks.sql');
const pkg = JSON.parse(read('package.json'));

assert.equal(pkg.version, '1.3.2');
assert.match(challenge, /rollingWeekStartKey/);
assert.match(challenge, /proofPeriodForAnchor/);
assert.match(service, /rollingWeekStartKey\(challenge\.first_judgement_week_start/);
assert.match(challengeActions, /first_judgement_week_start: formatDateKey\(now\)/);
assert.doesNotMatch(challengeActions, /nextMondayAfterStart/);
assert.match(adminActions, /rollingWeekStartKey\(challengeForWindow\.first_judgement_week_start\)/);
assert.match(dashboard, /이번 인증 기간/);
assert.match(submit, /시작일 기준 7일/);
assert.match(admin, /이번 인증 기간/);
assert.match(admin, /다음 마감/);
assert.match(detail, /현재 인증 기간/);
assert.match(detail, /step=\{7\}/);
assert.match(onboarding, /시작일을 기준으로 7일마다/);
assert.doesNotMatch(onboarding, /다음 월요일/);
assert.match(migration, /create or replace function public\.challenge_window_start/);
assert.match(migration, /first_judgement_week_start = \(c\.started_at at time zone 'Asia\/Seoul'\)::date/);
assert.match(migration, /update public\.submissions/);
assert.match(migration, /update public\.weekly_results/);
assert.match(migration, /record_submission_success/);
assert.match(migration, /process_missed_weeks/);
assert.match(migration, /admin_correct_week_result/);

const DAY = 86400000;
const ordinal = (key) => {
  const [y,m,d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y,m-1,d)/DAY);
};
const keyFromOrdinal = (o) => new Date(o*DAY).toISOString().slice(0,10);
const rolling = (anchor, today) => {
  const diff = ordinal(today)-ordinal(anchor);
  if (diff < 0) return null;
  return keyFromOrdinal(ordinal(anchor)+Math.floor(diff/7)*7);
};
const remapLegacy = (anchor, oldWeek) => keyFromOrdinal(ordinal(anchor)+Math.floor(Math.max(ordinal(oldWeek)-ordinal(anchor),0)/7)*7);

for (const anchor of ['2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-19','2026-09-20']) {
  const a = ordinal(anchor);
  assert.equal(rolling(anchor, keyFromOrdinal(a)), anchor, `${anchor}: start date opens window 1`);
  assert.equal(rolling(anchor, keyFromOrdinal(a+6)), anchor, `${anchor}: day 6 stays in window 1`);
  assert.equal(rolling(anchor, keyFromOrdinal(a+7)), keyFromOrdinal(a+7), `${anchor}: day 7 opens window 2`);
  assert.equal(rolling(anchor, keyFromOrdinal(a+13)), keyFromOrdinal(a+7), `${anchor}: day 13 stays in window 2`);
  assert.equal(rolling(anchor, keyFromOrdinal(a+14)), keyFromOrdinal(a+14), `${anchor}: day 14 opens window 3`);
}

assert.equal(remapLegacy('2026-09-13','2026-09-14'),'2026-09-13');
assert.equal(remapLegacy('2026-09-13','2026-09-21'),'2026-09-20');
assert.equal(remapLegacy('2026-09-16','2026-09-21'),'2026-09-16');
assert.equal(remapLegacy('2026-09-16','2026-09-28'),'2026-09-23');
assert.equal(remapLegacy('2026-09-16','2026-10-05'),'2026-09-30');

console.log('v1.3.2 rolling-week checks passed: 28 source/migration checks + 40 calendar cases');
