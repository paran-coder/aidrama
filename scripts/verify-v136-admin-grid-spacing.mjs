import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const admin = fs.readFileSync(path.join(root, "app/admin/page.tsx"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
const grid = 'grid-cols-[minmax(190px,1.3fr)_96px_112px_76px_minmax(170px,1fr)_minmax(190px,1.1fr)_190px]';

const checks = [
  ["version is 1.3.6", version === "1.3.6" && pkg.version === version],
  ["header and rows share one grid template", (admin.match(new RegExp(grid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length >= 2],
  ["equal inter-column gap is used", (admin.match(/gap-x-6/g) ?? []).length >= 2],
  ["left and right outer padding are symmetric", (admin.match(/px-5/g) ?? []).length >= 2],
  ["percentage colgroup removed", !admin.includes("<colgroup>") && !admin.includes('w-[18%]')],
  ["identity can truncate without expanding", admin.includes('role="cell" className="min-w-0"')],
  ["management actions stay on one line", admin.includes('justify-center gap-3 whitespace-nowrap')],
  ["management actions remain available", admin.includes('>제출 내역</Link>') && admin.includes('>접근 관리</Link>')],
  ["horizontal fallback remains", admin.includes('overflow-x-auto pb-1') && admin.includes('min-w-[1160px]')],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed++; }
}
if (failed) process.exit(1);
console.log(`v1.3.6 admin grid spacing checks passed: ${checks.length}/${checks.length}`);
