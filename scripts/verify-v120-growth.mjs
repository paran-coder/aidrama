import fs from "node:fs";

function read(path) { return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const migration = read("supabase/migrations/003_v1_2_0_growth.sql");
const growth = read("lib/growth.ts");
const dashboard = read("app/dashboard/page.tsx");
const landing = read("app/page.tsx");
const owl = read("components/owl-visual.tsx");
const warning = read("components/warning-dialog.tsx");
const celebration = read("components/milestone-celebration.tsx");
const challengeAction = read("lib/actions/challenge.ts");
const css = read("app/globals.css");

for (const milestone of [100, 300, 600, 900, 1000]) {
  assert(migration.includes(String(milestone)), `migration missing ${milestone} milestone`);
  assert(growth.includes(String(milestone)), `growth model missing ${milestone} milestone`);
}
assert(migration.includes("create table public.challenge_badges"), "challenge_badges table missing");
assert(migration.includes("unique (challenge_id, milestone_days)"), "badge uniqueness missing");
assert(migration.includes("stage_override = null"), "legacy stage override is not neutralized");
assert(migration.includes("reset_count = 0"), "legacy reset counter is not neutralized");
assert(migration.includes("select min(candidate) into v_milestone"), "sequential next-milestone selection missing");
assert(migration.includes("perform public.award_milestone_badges"), "success does not award milestones");
assert(!warning.includes("알로 돌아"), "warning UI still describes owl regression");
assert(dashboard.includes("MilestoneBadges"), "dashboard milestone badges missing");
assert(dashboard.includes("milestoneProgress"), "dashboard current-goal progress missing");
assert(landing.includes("당신은 이미"), "creator-first landing copy missing");
assert(owl.includes("OWL_ASSETS"), "production owl assets are not centralized");
assert(dashboard.includes("MilestoneCelebration"), "dashboard level-up celebration missing");
assert(challengeAction.includes("milestoneQuery"), "submission action does not surface newly awarded milestone");
assert(celebration.includes("Lv.${level.level}"), "celebration does not announce creator level");
assert(css.includes("prefers-reduced-motion") && css.includes(".milestone-celebration"), "celebration reduced-motion handling missing");

console.log("v1.2.0 milestone and creator-growth structure checks passed");
