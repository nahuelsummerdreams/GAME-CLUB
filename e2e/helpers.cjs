// Run with: NODE_PATH=$(npm root -g) node e2e/<file>.cjs   (needs `next start -p 3111`)
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3111";
const VIEWPORTS = { ipad: { width: 820, height: 1180 }, phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 }, ipadLand: { width: 1180, height: 820 } };

async function open(vp = "ipad", opts = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORTS[vp], hasTouch: vp !== "desktop", deviceScaleFactor: 1, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => errors.push("requestfailed: " + r.url()));
  return { browser, ctx, page, errors };
}
const results = [];
const check = (name, ok, extra = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); };
const done = async (browser, errors, last = true) => {
  check("no console errors/warnings", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  if (!last) return;
  const bad = results.filter((r) => !r.ok).length; console.log(bad ? `\n${bad} FAILED` : "\nALL PASSED"); process.exit(bad ? 1 : 0);
};
// Skip the 1.8s loading screen
const skipLoading = (page) => page.waitForSelector("text=Welcome to WonderDays!", { timeout: 8000 });
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
module.exports = { open, check, done, skipLoading, noOverflow, BASE };
