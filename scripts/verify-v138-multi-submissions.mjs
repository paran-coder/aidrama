import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const sql = read('supabase/migrations/009_v1_3_8_multi_submissions.sql');
const action = read('lib/actions/challenge.ts');
const submitPage = read('app/dashboard/submit/page.tsx');
const dashboard = read('app/dashboard/page.tsx');
const adminPage = read('app/admin/participants/[userId]/page.tsx');
const pkg = JSON.parse(read('package.json'));

const checks = [
  ['version is 1.3.8', pkg.version === '1.3.8'],
  ['migration captures existing result before insert', sql.includes('v_has_result := found;')],
  ['existing failed period is blocked', sql.includes("WEEK_ALREADY_FINALIZED_FAILURE")],
  ['every valid URL is inserted into submissions', sql.includes('insert into public.submissions')],
  ['additional submission returns before weekly result creation', sql.indexOf('if v_has_result then') < sql.indexOf('insert into public.weekly_results')],
  ['first submission creates one weekly result', sql.includes("'success', v_submission_id, 'user_submission'" )],
  ['additional branch does not replace official id', !/update\s+public\.weekly_results[\s\S]*final_submission_id/i.test(sql)],
  ['reconcile happens only after first-result insert', sql.indexOf('perform public.reconcile_challenge_state') > sql.indexOf('insert into public.weekly_results')],
  ['action detects official vs additional by final_submission_id', action.includes('officialResult?.final_submission_id === submissionId')],
  ['additional submission redirects back to submit page', action.includes('/dashboard/submit?added=${verification}')],
  ['submit page keeps additional URL form after success', submitPage.includes('추가 URL 기록하기') && submitPage.includes('result?.status === "success" ? "추가 작업 URL"')],
  ['submit page explains official first link', submitPage.includes('첫 정상 제출 URL이 공식 인정 링크로 고정됩니다.')],
  ['dashboard exposes additional URL action after official success', dashboard.includes('weeklyResult?.status === "success"') && dashboard.includes('추가 작업 URL 기록하기')],
  ['dashboard does not label finalized failure as success', dashboard.includes('weeklyResult?.status === "failure"') && dashboard.includes('이번 인증 기간은 실패로 확정되었습니다.')],
  ['admin page loads all submissions', adminPage.includes('submissions.map((submission)')],
  ['admin page marks official submission only by final id', adminPage.includes('officialSubmissionIds.has(submission.id)')],
  ['admin official history keeps all attempts grouped by period', adminPage.includes('attemptsByWeek') && adminPage.includes('제출 이력 {attempts.length}건')],
];

let failed = 0;
for (const [name, ok] of checks) {
  if (ok) console.log(`✓ ${name}`);
  else { console.error(`✗ ${name}`); failed++; }
}
console.log(`\nv1.3.8 checks: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
