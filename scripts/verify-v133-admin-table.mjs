import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const admin = read('app/admin/page.tsx');
const shell = read('components/app-shell.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

const checks = [
  ['version is 1.3.3', version === '1.3.3' && pkg.version === '1.3.3'],
  ['admin shell uses wider desktop width', shell.includes('isAdmin ? "max-w-[1440px]" : "max-w-6xl"')],
  ['admin table has compact fallback width', admin.includes('min-w-[980px] table-fixed')],
  ['identity column remains present', admin.includes('톡방 닉네임 / 이메일')],
  ['proof metrics are grouped', admin.includes('인증 현황') && admin.includes('성공/실패')],
  ['proof period and deadline are grouped', admin.includes('인증 기간') && admin.includes('마감 {formatShortKoreanDateKey(proofPeriod.endKey)} 23:59')],
  ['action column has explicit right padding', admin.includes('px-4 py-4 pr-6')],
  ['action buttons do not wrap', admin.includes('whitespace-nowrap px-3 py-2 text-xs')],
  ['submission and access actions remain', admin.includes('>제출 내역</Link>') && admin.includes('>접근 관리</Link>')],
  ['nickname/email are protected with truncation', admin.includes('truncate font-black') && admin.includes('truncate text-xs text-[var(--muted)]')],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed++; }
}
if (failed) process.exit(1);
console.log(`v1.3.3 admin table checks passed: ${checks.length}/${checks.length}`);
