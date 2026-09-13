import fs from "node:fs";

function read(path) { return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const migration = read("supabase/migrations/004_v1_2_1_hotfix.sql");
const growth = read("lib/growth.ts");
const adminService = read("lib/admin-service.ts");
const communityService = read("lib/challenge-service.ts");
const adminPage = read("app/admin/page.tsx");
const preview = read("app/admin/preview/page.tsx");
const owl = read("components/owl-visual.tsx");
const proxy = read("proxy.ts");
const auth = read("lib/auth.ts");

assert(migration.includes("add column email text"), "profile email cache migration missing");
assert(migration.includes("delete from public.challenge_badges"), "invalid badge cleanup missing");
assert(migration.includes("trigger_weekly_result_id is null"), "badge validity cleanup is too weak");
assert(growth.includes("maxEligibleDay"), "day-gated level calculation missing");
assert(adminService.includes("emailCompatibilityMode") && adminService.includes("auth.admin.listUsers"), "admin email fallback compatibility path missing");
assert(adminService.indexOf("auth.admin.listUsers") > adminService.indexOf("isMissingEmailColumn"), "Auth listUsers must remain a compatibility fallback, not the primary overview path");
assert(!adminService.includes("syncAllMissedWeeks"), "admin overview still auto-syncs all participants");
const communityBody = communityService.slice(communityService.indexOf("export async function getCommunityRows"));
assert(!communityBody.split("export async function getPublicParticipant")[0].includes("syncAllMissedWeeks"), "community still auto-syncs all participants");
assert(adminPage.includes("진행상태 동기화"), "manual admin sync control missing");
assert(adminPage.includes("접근 관리"), "participant suspension entry point is not visible");
assert(!adminPage.includes("취소된 코드 이력") && adminPage.includes("톡방 닉네임 / 이메일"), "v1.3 admin simplification must replace invite history with participant identity");
assert(preview.includes("Lv.1") && preview.includes("0 / 100일"), "admin preview still starts at Lv.2");
assert(owl.includes("object-contain") && owl.includes("lg:min-h-[500px]"), "hero crop hotfix missing");
assert(proxy.includes("SESSION_REFRESH_FAILED"), "proxy transient auth guard missing");
assert(auth.includes("AUTH_SESSION_LOOKUP_FAILED"), "auth retry guard missing");

console.log("v1.2.1 hotfix structure checks passed");
