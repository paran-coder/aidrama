import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const admin = fs.readFileSync(path.join(root, "app/admin/page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
const modern = admin.includes("admin-participant-table") && css.includes("grid-template-columns: subgrid");
const checks = [
  ["v1.3.6+ spacing behavior retained", /^1\.3\.(?:6|[7-9]|[1-9]\d+)$/.test(version) && pkg.version === version],
  ["header and rows share one grid system", modern || (admin.match(/grid-cols-\[/g) ?? []).length >= 2],
  ["equal inter-column spacing is retained", modern ? css.includes("justify-content: space-between") : (admin.match(/gap-x-6/g) ?? []).length >= 2],
  ["left and right outer padding are symmetric", modern ? css.includes("padding-inline: 1.25rem") : (admin.match(/px-5/g) ?? []).length >= 2],
  ["percentage colgroup removed", !admin.includes("<colgroup>") && !admin.includes('w-[18%]')],
  ["identity cannot force unbounded width", admin.includes("admin-participant-identity") || admin.includes('role="cell" className="min-w-0"')],
  ["management actions stay on one line", admin.includes("whitespace-nowrap")],
  ["management actions remain available", admin.includes('>제출 내역</Link>') && admin.includes('>접근 관리</Link>')],
  ["horizontal fallback remains", admin.includes('overflow-x-auto pb-1') && admin.includes('min-w-[1160px]')],
];
let failed = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`PASS ${label}`); else { console.error(`FAIL ${label}`); failed++; }
}
if (failed) process.exit(1);
console.log(`v1.3.6+ admin grid spacing checks passed: ${checks.length}/${checks.length}`);
