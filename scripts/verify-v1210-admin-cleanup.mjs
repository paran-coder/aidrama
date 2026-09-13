import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const adminService = fs.readFileSync(path.join(root, 'lib/admin-service.ts'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/006_v1_2_10_test_data_cleanup.sql'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const expectedCodes = [
  'OWL-3Q4SQ-25W3P',
  'OWL-AXSMH-KUZ4A',
  'OWL-XJHXD-2U8FW',
  'OWL-9NYFH-SK7RA',
  'OWL-B5J9G-S6LXE',
  'OWL-JYRRV-39ZFU',
  'OWL-DN328-7Y2NL',
  'OWL-JXTWD-SV3V2',
  'OWL-5TNUW-F2AVS',
  'OWL-PE7WK-Z2BWD',
  'OWL-WQ97D-7NZXD',
];

const checks = [
  ['package retains v1.2.10 cleanup behavior', /^1\.2\.(?:1[0-9]|[2-9][0-9])$/.test(pkg.version)],
  ['preferred profile query filters role user', adminService.includes('.select(PROFILE_FIELDS).eq("role", "user").order("created_at"')],
  ['legacy profile query filters role user', adminService.includes('.select(PROFILE_FIELDS_LEGACY).eq("role", "user").order("created_at"')],
  ['cleanup is exact-code delete', migration.includes('delete from public.invite_codes') && migration.includes('where code in (')],
  ['cleanup has no broad revoked predicate', !migration.includes('where revoked_at is not null')],
  ['cleanup has no broad deleted-user predicate', !migration.includes('where used_account_deleted_at is not null')],
  ['all 11 known test codes are listed', expectedCodes.every((code) => migration.includes(`'${code}'`))],
  ['cleanup returns deleted rows for verification', migration.includes('returning code, used_at, revoked_at, used_account_deleted_at')],
];

let failures = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`PASS: ${label}`);
  else { console.error(`FAIL: ${label}`); failures += 1; }
}
if (failures) process.exit(1);
console.log(`v1.2.10 admin cleanup checks passed: ${checks.length}/${checks.length}`);
