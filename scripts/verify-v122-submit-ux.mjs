import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const shell = read('components/app-shell.tsx');
const nav = fs.existsSync(path.join(root, 'components/app-nav.tsx')) ? read('components/app-nav.tsx') : shell;
const dashboard = read('app/dashboard/page.tsx');
const submit = read('app/dashboard/submit/page.tsx');
const challenge = read('lib/challenge.ts');

const checks = [
  [nav.includes('/dashboard/submit') && nav.includes('이번 주 제출'), 'header submit entry'],
  [nav.includes('grid-cols-4'), 'mobile four-item navigation'],
  [dashboard.includes('이번 인증 기간') && dashboard.includes('시작일 기준 7일'), 'dashboard proof-window guidance'],
  [submit.includes('현재 인증 기간의 작업을 기록하세요.'), 'submit proof-window heading'],
  [submit.includes('다음 마감') && submit.includes('23:59 KST'), 'submit deadline guidance'],
  [challenge.includes('formatProofPeriod') && challenge.includes('proofPeriodForAnchor'), 'personal proof-period helpers'],
  [!dashboard.includes('매주 월요일 00:00 ~ 일요일 23:59 KST'), 'legacy fixed-week guidance removed'],
];

for (const [ok, label] of checks) {
  if (!ok) throw new Error(`submission UX regression check failed: ${label}`);
}
console.log('submission UX structure checks passed');
