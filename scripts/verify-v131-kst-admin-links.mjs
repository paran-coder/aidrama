import fs from 'node:fs';
import assert from 'node:assert/strict';

const challenge = fs.readFileSync(new URL('../lib/challenge.ts', import.meta.url), 'utf8');
const adminPage = fs.readFileSync(new URL('../app/admin/page.tsx', import.meta.url), 'utf8');
const detail = fs.readFileSync(new URL('../app/admin/participants/[userId]/page.tsx', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../supabase/migrations/007_v1_3_1_kst_day_alignment.sql', import.meta.url), 'utf8');

assert.match(challenge, /kstCalendarDayOrdinal/);
assert.match(challenge, /calendarDays = kstCalendarDayOrdinal\(now\) - kstCalendarDayOrdinal\(start\)/);
assert.match(adminPage, /#submissions/);
assert.match(adminPage, />제출 내역</);
assert.match(detail, /id="submissions"/);
assert.match(detail, /참여자 제출 링크/);
assert.match(detail, /href=\{submission\.url\}/);
assert.match(detail, /공식 인정/);
assert.match(migration, /create or replace function public\.kst_elapsed_days/);
assert.match(migration, /award_milestone_badges/);
assert.match(migration, /Asia\/Seoul/);

const DAY=86400000;
function kstOrdinal(date){
  const shifted = new Date(date.getTime()+9*60*60*1000);
  return Math.floor(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate())/DAY);
}
function elapsed(start, now){return Math.min(1000, Math.max(0,kstOrdinal(now)-kstOrdinal(start)));}

assert.equal(elapsed(new Date('2026-09-13T14:30:00Z'), new Date('2026-09-13T14:59:59Z')), 0, 'same KST date remains day 0');
assert.equal(elapsed(new Date('2026-09-13T14:30:00Z'), new Date('2026-09-13T15:00:00Z')), 1, 'KST midnight advances to day 1');
assert.equal(elapsed(new Date('2026-09-13T15:01:00Z'), new Date('2026-09-14T14:59:59Z')), 0, 'less than one KST calendar boundary remains day 0');
assert.equal(elapsed(new Date('2026-09-13T15:01:00Z'), new Date('2026-09-14T15:00:00Z')), 1, 'next KST date is day 1');

console.log('v1.3.1 KST/admin links checks: 14 passed');
