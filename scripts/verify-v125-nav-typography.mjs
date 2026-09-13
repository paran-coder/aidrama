import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const nav = fs.readFileSync("components/app-nav.tsx", "utf8");

const checks = [
  [css.includes(".nav-link-active"), "desktop active nav selector exists"],
  [/\.nav-link-active\s*\{[^}]*font-weight:\s*900;/s.test(css), "desktop active nav is weight 900"],
  [/\.nav-link-active\s*\{[^}]*color:\s*var\(--ink\);/s.test(css), "desktop active nav uses dark ink"],
  [/\.mobile-nav-link-active\s*\{[^}]*font-weight:\s*900;/s.test(css), "mobile active nav is weight 900"],
  [/\.mobile-nav-link-active\s*\{[^}]*color:\s*var\(--ink\);/s.test(css), "mobile active nav uses dark ink"],
  [nav.includes('aria-current={active ? "page" : undefined}'), "active nav remains semantic"],
  [nav.includes('usePathname'), "route-aware active nav remains enabled"],
];

let failed = 0;
for (const [ok, label] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
