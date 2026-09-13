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
  [dashboard.includes('월요일 00:00 ~ 일요일 23:59 KST'), 'dashboard KST window'],
  [dashboard.includes('disabled aria-disabled="true"'), 'dashboard disabled prep CTA'],
  [submit.includes('제출 일정을 확인하세요.'), 'submit preparation heading'],
  [submit.includes('링크 입력 가능'), 'submit disabled preparation CTA'],
  [challenge.includes('formatKoreanDateKey'), 'Korean date formatting helper'],
];

for (const [ok, label] of checks) {
  if (!ok) throw new Error(`v1.2.2 submit UX check failed: ${label}`);
}
console.log('v1.2.2 submission UX structure checks passed');
