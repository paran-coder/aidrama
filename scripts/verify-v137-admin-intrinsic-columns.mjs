import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const admin = fs.readFileSync(path.join(root, "app/admin/page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();

const checks = [
  ["version is 1.3.7", version === "1.3.7" && pkg.version === version],
  ["single shared participant table grid exists", admin.includes("admin-participant-table") && admin.includes("admin-participant-row")],
  ["fractional row grids removed", !admin.includes("grid-cols-[minmax(190px,1.3fr)")],
  ["columns size from actual content", css.includes("grid-template-columns: max-content max-content max-content max-content max-content max-content max-content")],
  ["all rows inherit the exact same tracks", css.includes("grid-template-columns: subgrid") && css.includes("grid-column: 1 / -1")],
  ["remaining horizontal space is distributed equally", css.includes("justify-content: space-between")],
  ["cell boxes no longer stretch to full track width", css.includes('width: max-content;') && css.includes('justify-self: start;')],
  ["outer left/right padding is symmetric", css.includes("padding-inline: 1.25rem")],
  ["identity content has a sane maximum width", css.includes(".admin-participant-identity") && css.includes("max-width: 15rem")],
  ["management actions remain one line and right anchored", admin.includes("admin-participant-management") && admin.includes("whitespace-nowrap") && css.includes("justify-self: end !important")],
  ["narrow-screen overflow fallback remains", admin.includes("overflow-x-auto pb-1") && admin.includes("min-w-[1160px]")],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed++; }
}
if (failed) process.exit(1);
console.log(`v1.3.7 intrinsic-column checks passed: ${checks.length}/${checks.length}`);
