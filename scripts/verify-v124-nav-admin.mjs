import fs from "node:fs";

function read(file) { return fs.readFileSync(file, "utf8"); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.2.4", "package version must be 1.2.4");

const nav = read("components/app-nav.tsx");
assert(nav.includes('usePathname'), "navigation must derive active state from the current path");
for (const route of ["/dashboard", "/dashboard/submit", "/community", "/mypage"]) {
  assert(nav.includes(route), `missing user nav route: ${route}`);
}
assert(nav.includes('aria-current={active ? "page" : undefined}'), "active navigation must expose aria-current");
assert(nav.includes('nav-link-active') && nav.includes('mobile-nav-link-active'), "desktop/mobile active navigation styles missing");

const css = read("app/globals.css");
for (const token of ["--nav-active-bg", "--nav-active-ink", "--nav-active-line", ".nav-link-active", ".mobile-nav-link-active"]) {
  assert(css.includes(token), `missing active nav token/style: ${token}`);
}

const community = read("app/community/page.tsx");
assert(community.includes("연속 인증"), "community streak must be labeled as weekly consecutive verification");
assert(!community.includes("주 연속"), "ambiguous old streak label remains");

const adminService = read("lib/admin-service.ts");
assert(adminService.includes("isMissingEmailColumn"), "profiles.email compatibility detection missing");
assert(adminService.includes("PROFILE_FIELDS_LEGACY"), "legacy profile select fallback missing");
assert(adminService.includes("emailCompatibilityMode"), "admin compatibility state missing");
assert(adminService.includes("describeReadFailure"), "partial admin read failure handling missing");
assert(!adminService.includes("processMissedWeeks"), "admin participant detail should not auto-process challenge state while opening access controls");

const adminPage = read("app/admin/page.tsx");
assert(adminPage.includes("warnings, health"), "admin page must receive partial-read health information");
assert(adminPage.includes("일부 운영 정보를 호환 모드로 불러왔습니다."), "admin compatibility warning UI missing");
assert(adminPage.includes("현재/최장 인증(주)"), "admin weekly streak unit label missing");

console.log("v1.2.4 navigation/admin resilience checks passed");
