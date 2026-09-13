import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const action = read("lib/actions/account-deletion.ts");
const panel = read("components/account-deletion-panel.tsx");
const profile = read("lib/actions/profile.ts");

const checks = [
  [action.includes('"use server"'), "dedicated deletion module is a server-action module"],
  [action.includes("export async function deleteMyAccountAction"), "deleteMyAccountAction is exported"],
  [panel.includes('@/lib/actions/account-deletion'), "client panel imports the dedicated deletion module"],
  [!panel.includes('@/lib/actions/profile'), "client panel no longer depends on profile action exports"],
  [!profile.includes("deleteMyAccountAction"), "profile actions remain independent from account deletion"],
  [action.includes('confirmText !== "탈퇴"'), "server validates explicit deletion confirmation"],
  [action.includes('context.isAdmin || context.profile.role === "admin"'), "admin self-deletion remains blocked"],
  [action.includes("admin.auth.admin.deleteUser"), "Supabase Auth hard delete remains in place"],
  [action.includes("used_account_deleted_at"), "anonymous invite history timestamp remains in place"],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed += 1; }
}
if (failed) process.exit(1);
console.log(`v1.2.7 account-action module checks passed (${checks.length}/${checks.length}).`);
