const { open, check, done, BASE } = require("./helpers.cjs");
const SIZES = [[320, 568], [360, 640], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
(async () => {
  const { browser, ctx, errors } = await open("ipad");
  for (const [w, h] of SIZES) {
    const page = await ctx.newPage(); await page.setViewportSize({ width: w, height: h });
    for (const path of ["/", "/world", "/rewards", "/profile", "/settings"]) {
      await page.goto(BASE + path); await page.waitForTimeout(path === "/" ? 2200 : 400);
      const r = await page.evaluate(() => {
        const bad = []; const vw = innerWidth;
        document.querySelectorAll("header a, header button, header > div").forEach((el) => { const b = el.getBoundingClientRect(); if (b.width && (b.right > vw + 1 || b.left < -1)) bad.push(el.getAttribute("aria-label") || el.textContent.slice(0, 12)); });
        const small = [...document.querySelectorAll("a, button")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.width < 40 || b.height < 40) && getComputedStyle(e).visibility !== "hidden" && !e.closest("svg") && !e.className.toString().includes("sr-only"); }).map((e) => (e.getAttribute("aria-label") || e.textContent).slice(0, 18) + ` ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
        return { overflowX: document.documentElement.scrollWidth > vw + 1, bad, small };
      });
      check(`[${w}x${h}] ${path}: no horizontal overflow, top bar fits`, !r.overflowX && r.bad.length === 0, r.bad.join(",") || (r.overflowX ? "page overflows" : ""));
      check(`[${w}x${h}] ${path}: touch targets >= 40px`, r.small.length === 0, r.small.slice(0, 3).join(" | "));
    }
    await page.close();
  }
  await done(browser, errors, true);
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 5).join(" ")); process.exit(1); });
