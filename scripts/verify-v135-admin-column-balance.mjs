import fs from "node:fs";

const file = fs.readFileSync(new URL("../app/admin/page.tsx", import.meta.url), "utf8");
const checks = [
  ["section max width", 'max-w-[1320px]'],
  ["table min width", 'min-w-[1160px]'],
  ["nickname compact", 'w-[18%]'],
  ["status compact", 'w-[8%]'],
  ["level width", 'w-[11%]'],
  ["elapsed compact", 'w-[7%]'],
  ["proof status width", 'w-[17%]'],
  ["proof period compact", 'w-[17%]'],
  ["management width", 'w-[22%]'],
  ["management centered", 'justify-center gap-3 whitespace-nowrap'],
  ["management header centered", 'pr-6 text-center\">관리</th>'],
];
let passed = 0;
for (const [name, needle] of checks) {
  if (!file.includes(needle)) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${name}`);
    passed++;
  }
}
console.log(`${passed}/${checks.length} checks passed`);
