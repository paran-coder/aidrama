import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const signup = read("app/signup/page.tsx");
const auth = read("lib/actions/auth.ts");
const adminPage = read("app/admin/page.tsx");
const adminService = read("lib/admin-service.ts");
const adminActions = read("lib/actions/admin.ts");
const mypage = read("app/mypage/page.tsx");
const landing = read("app/page.tsx");
const login = read("app/login/page.tsx");
const initialMigration = read("supabase/migrations/001_init.sql");
const pkg = JSON.parse(read("package.json"));

const checks = [
  [pkg.version === "1.3.0", "package version is 1.3.0"],
  [signup.includes("톡방 닉네임"), "signup labels display_name as chat-room nickname"],
  [signup.includes("챌린지 톡방에서 사용 중인 닉네임을 정확히 입력해 주세요."), "signup includes exact nickname guidance"],
  [!signup.includes("inviteCode") && !signup.includes("초대 코드"), "signup no longer asks for an invite code"],
  [!auth.includes('formData, "inviteCode"') && !auth.includes('from("invite_codes")') && !auth.includes('claim_invite_code'), "signup action no longer validates or claims invite codes"],
  [auth.includes('.from("profiles").insert({') && auth.includes("display_name: displayName") && auth.includes("email,"), "signup creates participant profile directly"],
  [auth.includes("await admin.auth.admin.deleteUser(created.user.id)"), "orphaned Auth user is cleaned up if profile creation fails"],
  [!adminPage.includes("초대 코드") && !adminPage.includes("새 코드 발급") && !adminPage.includes("Invitations"), "admin overview removes invite-code UI"],
  [adminPage.includes("톡방 닉네임 / 이메일"), "admin participant table prioritizes nickname and email"],
  [!adminService.includes("readInviteCodes") && !adminService.includes('from("invite_codes")'), "admin overview no longer queries invite-code data"],
  [!adminActions.includes("createInviteCodeAction") && !adminActions.includes("revokeInviteCodeAction"), "active admin actions remove invite-code issuance/revocation"],
  [mypage.includes("톡방 닉네임"), "mypage uses chat-room nickname label"],
  [landing.includes("참여자로 시작하기"), "landing CTA uses direct participant signup language"],
  [login.includes("처음 참여하시나요?"), "login links to direct signup without invite-code wording"],
  [initialMigration.includes("create table public.invite_codes"), "legacy invite-code schema remains intact for historical compatibility"],
  [!exists("supabase/migrations/007_v1_3_0_signup_simplification.sql"), "v1.3.0 adds no DB migration"],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed += 1; }
}
if (failed) process.exit(1);
console.log(`v1.3.0 signup simplification checks passed: ${checks.length}/${checks.length}`);
