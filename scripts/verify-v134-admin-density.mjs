import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const admin = read('app/admin/page.tsx');
const css = read('app/globals.css');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

const checks = [
  ['v1.3.4+ density behavior retained', version.startsWith('1.3.') && pkg.version.startsWith('1.3.')],
  ['admin intro copy is larger', admin.includes('text-[15px] font-bold leading-7') && admin.includes('sm:text-base')],
  ['intro has semantic break before signup', admin.includes('가입은 참여자에게 공유한 사이트 주소에서 바로 진행됩니다.') && admin.includes('block xl:inline')],
  ['table body is larger than text-sm', admin.includes('table-fixed text-left text-[15px]')],
  ['table secondary copy uses text-sm', admin.includes('truncate text-sm leading-5 text-[var(--muted)]')],
  ['rows use tighter vertical padding', admin.includes('py-3.5')],
  ['management actions are horizontal', admin.includes('flex items-center justify-center gap-3 whitespace-nowrap') || admin.includes('flex items-center justify-end gap-1.5 whitespace-nowrap')],
  ['management actions use compact class', (admin.match(/admin-table-action/g) ?? []).length >= 2],
  ['compact action style has no border', css.includes('.admin-table-action {') && css.includes('border: 0;') && css.includes('min-height: 2.2rem;')],
  ['submission and access actions remain', admin.includes('>제출 내역</Link>') && admin.includes('>접근 관리</Link>')],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed++; }
}
if (failed) process.exit(1);
console.log(`v1.3.4+ admin density checks passed: ${checks.length}/${checks.length}`);
