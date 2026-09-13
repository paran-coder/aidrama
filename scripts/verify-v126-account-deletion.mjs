import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const profile = read('lib/actions/profile.ts');
const page = read('app/mypage/page.tsx');
const panel = read('components/account-deletion-panel.tsx');
const migration = read('supabase/migrations/005_v1_2_6_account_deletion.sql');
const adminService = read('lib/admin-service.ts');
const adminPage = read('app/admin/page.tsx');

const checks = [
  ['server action exists', profile.includes('deleteMyAccountAction')],
  ['admin self-delete blocked', profile.includes('context.isAdmin') && profile.includes('관리자 계정은')],
  ['typed confirmation enforced server-side', profile.includes('confirmText !== "탈퇴"')],
  ['auth user is hard-deleted through admin client', profile.includes('admin.auth.admin.deleteUser(context.user.id, false)')],
  ['session sign-out attempted', profile.includes('supabase.auth.signOut()')],
  ['danger zone mounted for regular users', page.includes('<AccountDeletionPanel />')],
  ['admin protection message rendered', page.includes('관리자 계정은 운영 보호를 위해')],
  ['irreversible deletion guidance exists', panel.includes('삭제 후에는 복구할 수 없습니다')],
  ['deleted data list explains auth/profile/challenge history', panel.includes('로그인 계정, 이메일, 표시 이름') && panel.includes('제출 URL과 주간 판정 이력')],
  ['confirmation UI requires 탈퇴', panel.includes('confirmation.trim() === "탈퇴"')],
  ['invite history migration exists', migration.includes('used_account_deleted_at')],
  ['admin invite history reads deletion marker', adminService.includes('used_account_deleted_at')],
  ['admin UI labels withdrawn user anonymously', adminPage.includes('탈퇴한 사용자') && adminPage.includes('개인 정보 삭제됨')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
console.log(`PASS v1.2.6 account deletion checks: ${checks.length}`);
