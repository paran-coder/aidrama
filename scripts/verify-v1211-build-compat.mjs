import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const server = read("lib/supabase/server.ts");
const pkg = JSON.parse(read("package.json"));

const checks = [
  [/^1\.2\.(?:1[1-9]|[2-9]\d+)$/.test(pkg.version) || /^1\.(?:[3-9]|[1-9]\d+)\.\d+$/.test(pkg.version), "package version retains v1.2.11+ build compatibility"],
  [server.includes("export async function clearSupabaseAuthCookies"), "legacy auth-cookie helper export exists"],
  [!exists("lib/actions/account-deletion.ts"), "self-service deletion action is absent from clean package"],
  [!exists("components/account-deletion-panel.tsx"), "self-service deletion panel is absent from clean package"],
  [exists("lib/actions/admin-account-deletion.ts"), "admin-only deletion action remains"],
  [exists("components/admin-delete-account-panel.tsx"), "admin-only deletion panel remains"],
];

for (const [ok, label] of checks) {
  if (!ok) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }
  console.log(`PASS: ${label}`);
}

console.log(`v1.2.11+ build compatibility checks passed (${checks.length}/${checks.length}).`);
