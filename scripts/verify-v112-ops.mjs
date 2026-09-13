import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const auth = read("lib/actions/auth.ts");
const challengeService = read("lib/challenge-service.ts");
const adminService = read("lib/admin-service.ts");
const migration = read("supabase/migrations/002_v1_1_2_ops.sql");
const adminPage = read("app/admin/page.tsx");
const shell = read("components/app-shell.tsx");
const nav = fs.existsSync(new URL("../components/app-nav.tsx", import.meta.url)) ? read("components/app-nav.tsx") : shell;

assert(auth.includes('redirect(isAdmin ? "/admin" : "/dashboard")'), "admin login redirect is missing");
assert(!auth.includes('formData, "inviteCode"'), "v1.3 signup must remain independent from legacy invite codes");
assert(challengeService.includes('admin.rpc("process_all_missed_weeks"'), "batch missed-week RPC is missing");
assert(!challengeService.includes("typedChallenges.map((challenge) => processMissedWeeks"), "community N+1 processing still exists");
assert(!adminService.includes("typedProfiles.map(async"), "admin participant N+1 processing still exists");
assert(migration.includes("admin_revoke_invite_code"), "invite revoke RPC is missing");
assert(migration.includes("admin_set_user_status"), "user status RPC is missing");
assert(migration.includes("public.is_active_user()"), "active-user RLS gate is missing");
assert(adminPage.includes("톡방 닉네임 / 이메일"), "admin participant identity column is missing");
assert(!adminPage.includes("새 코드 발급"), "legacy invite-code issuance UI must stay removed");
assert(nav.includes("/admin/preview"), "read-only admin preview navigation is missing");

console.log("v1.1.2 operations structure checks passed");
