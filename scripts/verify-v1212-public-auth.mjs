import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const auth = read("lib/auth.ts");
const landing = read("app/page.tsx");
const signup = read("app/signup/page.tsx");
const login = read("app/login/page.tsx");
const proxy = read("proxy.ts");

const checks = [
  [auth.includes('"authsessionmissingerror"'), "AuthSessionMissingError is treated as signed out"],
  [auth.includes('"auth session missing"'), "auth session missing message is treated as signed out"],
  [auth.includes('if (!user) return null;'), "getAuthContext returns null for signed-out visitors"],
  [landing.includes("const context = await getAuthContext();"), "landing uses auth context without requiring login"],
  [signup.includes("const context = await getAuthContext();"), "signup uses auth context without requiring login"],
  [login.includes("const context = await getAuthContext();"), "login uses auth context without requiring login"],
  [auth.includes('"user from sub claim in jwt does not exist"'), "deleted-user stale-session handling retained"],
  [auth.includes('"invalid refresh token"'), "invalid refresh-token handling retained"],
  [proxy.includes('console.error("SESSION_REFRESH_FAILED"'), "proxy refresh failures remain non-fatal"],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed += 1; }
}
if (failed) process.exit(1);
console.log(`v1.2.12 public-auth checks passed: ${checks.length}/${checks.length}`);
