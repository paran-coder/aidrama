import fs from "node:fs";
import path from "node:path";

function read(file) { return fs.readFileSync(file, "utf8"); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const pkg = JSON.parse(read("package.json"));
assert(["1.2.3", "1.2.4"].includes(pkg.version), "package version must remain in the v1.2.3+ UI line");

const css = read("app/globals.css");
for (const token of ["--disabled-bg", "--success-bg", "--warning-bg", "--danger-bg", ".ui-success", ".ui-warning", ".ui-danger", ".copy-pretty"]) {
  assert(css.includes(token), `missing UI token/class: ${token}`);
}
assert(css.includes("word-break: keep-all"), "Korean keep-all wrapping rule missing");

const shell = read("components/app-shell.tsx");
const nav = fs.existsSync("components/app-nav.tsx") ? read("components/app-nav.tsx") : shell;
assert(!shell.includes('primary-button min-h-0 px-4 py-2 text-sm" href="/dashboard/submit"'), "submit nav must not look like primary CTA");
assert(nav.includes("이번 주 제출"), "submit navigation entry missing");

const dashboard = read("app/dashboard/page.tsx");
assert(dashboard.includes("부터 가능합니다.</p>"), "first-submit availability sentence must end as its own paragraph");
assert(dashboard.includes('<p className="mt-1">이번 주는 준비 기간입니다.</p>'), "prep-period sentence must be a separate paragraph");
assert(dashboard.includes('className="soft-shadow overflow-hidden rounded-[2.6rem]"'), "dashboard owl wrapper should not create a padded double surface");

const owlVisual = read("components/owl-visual.tsx");
assert(owlVisual.includes("grid h-full w-full"), "owl visual should fill the stretched dashboard column");
assert(owlVisual.includes("object-contain"), "owl assets must render without crop");

const owlAssets = read("lib/owl-assets.ts");
const expected = ["hero-owl.webp", ...Array.from({length:5}, (_,i)=>`owl-stage-${i+1}.webp`), ...Array.from({length:5}, (_,i)=>`owl-thumb-${i+1}.webp`)];
for (const file of expected) {
  const disk = path.join("public/images/owl", file);
  assert(fs.existsSync(disk), `missing transparent owl asset: ${file}`);
  assert(fs.statSync(disk).size > 0, `empty owl asset: ${file}`);
  assert(owlAssets.includes(file), `owl asset not referenced: ${file}`);
}
assert(!fs.readdirSync("public/images/owl").some((name) => name.endsWith(".png")), "unoptimized PNG owl assets should not ship");

for (const root of ["app", "components"]) {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(tsx|ts|css)$/.test(entry.name)) files.push(p);
    }
  };
  walk(root);
  const directPalette = /(?:bg|border|text)-(?:emerald|amber|red|zinc)-/;
  for (const file of files) {
    const content = read(file);
    assert(!directPalette.test(content), `direct utility status palette remains in ${file}`);
  }
}

console.log("v1.2.3 UI system checks passed");
