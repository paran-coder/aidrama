import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const admin = read('app/admin/page.tsx');
const shell = read('components/app-shell.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

const checks = [
  ['v1.3.3 table structure persists', /^1\.3\.(?:3|[4-9]|[1-9]\d+)$/.test(version) && pkg.version === version],
  ['admin shell uses wider desktop width', shell.includes('isAdmin ? "max-w-[1440px]" : "max-w-6xl"')],
  ['admin table has compact fallback width', admin.includes('min-w-[1160px]')],
  ['identity column remains present', admin.includes('톡방 닉네임 / 이메일')],
  ['proof metrics are grouped', admin.includes('인증 현황') && admin.includes('성공/실패')],
  ['proof period and deadline are grouped', admin.includes('인증 기간') && admin.includes('마감 {formatShortKoreanDateKey(proofPeriod.endKey)} 23:59')],
  ['action column preserves symmetric outer spacing', admin.includes('gap-x-6') && admin.includes('px-5')],
  ['action buttons do not wrap', admin.includes('whitespace-nowrap')],
  ['submission and access actions remain', admin.includes('>제출 내역</Link>') && admin.includes('>접근 관리</Link>')],
  ['nickname/email are protected with truncation', admin.includes('truncate font-black') && admin.includes('truncate text-sm leading-5 text-[var(--muted)]')],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed++; }
}
if (failed) process.exit(1);
console.log(`v1.3.3 admin table checks passed: ${checks.length}/${checks.length}`);
