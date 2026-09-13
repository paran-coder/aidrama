import fs from "node:fs";

const file = fs.readFileSync(new URL("../app/admin/page.tsx", import.meta.url), "utf8");
const checks = [
  ["section max width", file.includes('max-w-[1320px]')],
  ["table min width", file.includes('min-w-[1160px]')],
  ["identity column remains", file.includes('톡방 닉네임 / 이메일')],
  ["status remains compact", file.includes('96px')],
  ["level remains compact", file.includes('112px')],
  ["elapsed remains compact", file.includes('76px')],
  ["proof status keeps flexible room", file.includes('minmax(170px,1fr)')],
  ["proof period keeps flexible room", file.includes('minmax(190px,1.1fr)')],
  ["management has fixed readable room", file.includes('_190px]')],
  ["management remains centered", file.includes('justify-center gap-3 whitespace-nowrap')],
  ["equal horizontal gap exists", file.includes('gap-x-6')],
];
let passed = 0;
for (const [name, ok] of checks) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${name}`);
    passed++;
  }
}
console.log(`${passed}/${checks.length} checks passed`);
