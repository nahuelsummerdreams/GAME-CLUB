const { open, check, done, BASE } = require("./helpers.cjs");
(async () => {
  const { browser, page, errors } = await open("desktop");
  const hide = (v) => page.evaluate((v) => { Object.defineProperty(document, "hidden", { configurable: true, get: () => v }); document.dispatchEvent(new Event("visibilitychange")); }, v);
  // React game: hiding the tab pauses it
  await page.goto(BASE + "/games/christmas-memory"); await page.locator("button:has-text(\"LET'S PLAY\")").click(); await page.locator("button:has-text('EASY')").click(); await page.waitForSelector("[data-testid=memory-grid]");
  await hide(true); await page.waitForTimeout(200);
  check("hiding the tab pauses a React game", await page.locator("[role=dialog][aria-label=Paused]").isVisible());
  await hide(false); await page.locator("button:has-text('KEEP PLAYING')").click();
  // Phaser game: hiding pauses the world, resume continues
  await page.goto(BASE + "/games/gift-delivery?e2e=1"); await page.locator("button:has-text(\"LET'S PLAY\")").click(); await page.locator("button[aria-label^='Route 1']").click(); await page.waitForFunction(() => !!window.__wd);
  await page.waitForTimeout(1500);
  await hide(true); await page.waitForTimeout(300);
  check("hiding the tab pauses a Phaser game", await page.locator("[role=dialog][aria-label=Paused]").isVisible());
  const a = await page.evaluate(() => window.__wd.info().houses.map((h) => h.x).join()); await page.waitForTimeout(600);
  check("Phaser world frozen while paused", a === (await page.evaluate(() => window.__wd.info().houses.map((h) => h.x).join())));
  await hide(false);
  // START OVER from pause remounts cleanly (old Phaser instance destroyed, new one created)
  await page.locator("button:has-text('START OVER')").click();
  await page.waitForSelector("text=Pick a route"); // restart returns to the route picker
  check("START OVER destroyed the old Phaser game", await page.waitForFunction(() => !window.__wd, null, { timeout: 4000 }).then(() => true, () => false));
  await page.locator("button[aria-label^='Route 1']").click();
  await page.waitForFunction(() => !!window.__wd, null, { timeout: 8000 });
  await page.waitForTimeout(500);
  check("START OVER leaves exactly one Phaser canvas", (await page.locator("[data-testid=phaser-host] canvas").count()) === 1);
  // repeated enter/leave doesn't accumulate canvases or errors
  for (let i = 0; i < 3; i++) { await page.goto(BASE + "/games/bubble-pop?e2e=1"); await page.locator("button:has-text(\"LET'S PLAY\")").click(); await page.locator("button[aria-label='Level 1']").click(); await page.waitForFunction(() => !!window.__wd); await page.locator("a[aria-label='Back to map']").click(); await page.waitForURL("**/world"); }
  check("re-entering Phaser games 3x is clean", (await page.locator("canvas").count()) <= 1);
  await done(browser, errors, true);
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 5).join(" ")); process.exit(1); });
