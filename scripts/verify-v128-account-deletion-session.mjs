import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const auth = read("lib/auth.ts");
const server = read("lib/supabase/server.ts");
const action = read("lib/actions/account-deletion.ts");
const landing = read("app/page.tsx");

const checks = [
  [auth.includes("export function isSignedOutAuthError"), "auth layer classifies signed-out session errors"],
  [auth.includes("user from sub claim in jwt does not exist"), "deleted Supabase user JWT error is recognized"],
  [auth.includes("refresh token not found") && auth.includes("invalid refresh token"), "stale refresh-token errors are recognized"],
  [auth.includes("if (isSignedOutAuthError(error)) return null"), "recognized stale auth errors resolve to signed-out state"],
  [server.includes("export async function clearSupabaseAuthCookies"), "explicit Supabase auth-cookie cleanup helper exists"],
  [server.includes('cookie.name.startsWith("sb-")') && server.includes('cookie.name.includes("-auth-token")'), "cookie cleanup targets Supabase auth cookies"],
  [action.includes("clearSupabaseAuthCookies, createClient"), "account deletion imports explicit cookie cleanup"],
  [action.includes("await supabase.auth.signOut()") && action.includes("await clearSupabaseAuthCookies()"), "account deletion attempts sign-out and forced cookie cleanup"],
  [action.indexOf("await clearSupabaseAuthCookies()") < action.indexOf('redirect("/?accountDeleted=1")'), "cookie cleanup happens before success redirect"],
  [landing.includes('q.accountDeleted === "1"') && landing.includes("회원 탈퇴가 완료되었습니다"), "landing success message remains present"],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed += 1; }
}
if (failed) process.exit(1);
console.log(`v1.2.8 account-deletion session checks passed (${checks.length}/${checks.length}).`);
