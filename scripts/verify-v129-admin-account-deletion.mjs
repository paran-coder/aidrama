import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const mypage = read("app/mypage/page.tsx");
const adminAction = read("lib/actions/admin-account-deletion.ts");
const adminDetail = read("app/admin/participants/[userId]/page.tsx");
const adminDeletePanel = read("components/admin-delete-account-panel.tsx");
const adminPage = read("app/admin/page.tsx");
const migration005 = read("supabase/migrations/005_v1_2_6_account_deletion.sql");

const checks = [
  [!exists("components/account-deletion-panel.tsx"), "self-service deletion panel removed"],
  [!exists("lib/actions/account-deletion.ts"), "self-service deletion action removed"],
  [!mypage.includes("AccountDeletionPanel") && mypage.includes("계정 삭제가 필요한 경우 운영자에게 요청"), "My Page contains guidance only"],
  [adminDetail.includes("<AdminDeleteAccountPanel") && adminDetail.includes('id="access"'), "admin deletion is mounted only in participant access management"],
  [adminDeletePanel.includes('confirmation.trim() === displayName'), "destructive button requires exact display name client-side"],
  [adminDeletePanel.includes('name="confirmDisplayName"'), "confirmation value is submitted to server"],
  [adminAction.includes("export async function deleteParticipantAccountAction"), "dedicated admin hard-delete server action exists"],
  [adminAction.includes("await requireAdmin()"), "delete action requires an administrator"],
  [adminAction.includes("targetUserId === actor.id") && adminAction.includes('targetProfile.role === "admin"'), "self/admin account deletion is blocked"],
  [adminAction.includes("confirmDisplayName !== targetProfile.display_name"), "server re-checks exact display name"],
  [adminAction.includes("admin.auth.admin.deleteUser(targetUserId, false)"), "Supabase Auth user is hard-deleted"],
  [adminAction.includes('from("invite_codes")') && adminAction.includes("used_account_deleted_at"), "used invite history is anonymized with deletion timestamp"],
  [migration005.includes("used_account_deleted_at"), "existing migration 005 remains the deletion-history schema"],
  [!exists("supabase/migrations/006_v1_2_9_admin_deletion.sql"), "v1.2.9 adds no new DB migration"],
  [adminPage.includes("계정을 영구 삭제했습니다") && adminPage.includes("익명 이력"), "admin receives a deletion success notice"],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed += 1; }
}
if (failed) process.exit(1);
console.log(`v1.2.9 admin account-deletion checks passed (${checks.length}/${checks.length}).`);
