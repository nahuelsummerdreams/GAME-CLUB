const { open, check, done, BASE } = require("./helpers.cjs");
(async () => {
  const { browser, ctx, page, errors } = await open("ipad");
  // manifest + icons
  const res = await page.request.get(BASE + "/manifest.webmanifest"); const m = await res.json();
  check("manifest valid (name, standalone, 3 icons, en-US)", res.ok() && m.name === "WonderDays Christmas Game Club" && m.display === "standalone" && m.icons.length === 3 && m.lang === "en-US" && m.theme_color === "#174B3C");
  for (const ic of m.icons) check(`icon ${ic.src} reachable`, (await page.request.get(BASE + ic.src)).ok());
  check("apple-touch-icon reachable", (await page.request.get(BASE + "/icons/apple-touch-icon.png")).ok());
  const sw = await page.request.get(BASE + "/sw.js"); check("sw.js served no-cache", sw.ok() && /no-cache/.test(sw.headers()["cache-control"] || ""));
  check("security headers", (await page.request.get(BASE + "/")).headers()["x-content-type-options"] === "nosniff");

  // service worker + offline
  await page.goto(BASE); await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller || true);
  await page.reload(); await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 8000 });
  check("service worker controls the page", true);
  await page.waitForTimeout(14000); // warm-up starts after 6s idle
  const cached = await page.evaluate(async () => (await (await caches.open("wd-v1")).keys()).length);
  check("assets precached", cached > 30, `${cached} entries`);
  await ctx.setOffline(true);
  await page.goto(BASE + "/world", { waitUntil: "load" });
  await page.waitForSelector("svg [role=button]", { timeout: 8000 });
  check("OFFLINE: world map loads with 6 zones", (await page.locator("svg [role=button]").count()) === 6);
  for (const g of ["christmas-memory", "christmas-puzzle", "snowman-builder", "santas-workshop"]) {
    await page.goto(BASE + "/games/" + g); await page.locator("button:has-text(\"LET'S PLAY\")").click();
    await page.waitForTimeout(500);
    check(`OFFLINE: ${g} starts`, (await page.locator("text=Getting ready").count()) === 0 && (await page.locator("[role=dialog][aria-label=\"How to play\"]").count()) === 0);
  }
  await page.goto(BASE + "/games/gift-delivery?e2e=1"); await page.locator("button:has-text(\"LET'S PLAY\")").click(); await page.locator("button[aria-label^='Route 1']").click();
  await page.waitForFunction(() => !!window.__wd, null, { timeout: 15000 });
  check("OFFLINE: Phaser game (Gift Delivery) runs", true);
  await ctx.setOffline(false);
  await done(browser, errors.filter((e) => !/Failed to load resource|requestfailed/.test(e)), false);

  // reduced motion
  const b2 = await open("ipad", { reducedMotion: "reduce" });
  await b2.page.goto(BASE); await b2.page.waitForSelector("text=GETTING THE CHRISTMAS MAGIC READY");
  const dur = await b2.page.evaluate(() => { const el = document.querySelector(".anim-bob, .anim-pop"); return el ? getComputedStyle(el).animationDuration : "none"; });
  check("prefers-reduced-motion shortens animations", /^(1e-06s|0\.001ms|0s)$/.test(dur) || parseFloat(dur) < 0.01, dur);
  await done(b2.browser, b2.errors, true);
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 5).join(" ")); process.exit(1); });
