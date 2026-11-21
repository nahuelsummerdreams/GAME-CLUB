const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");
(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    const tap = (loc) => (vp === "desktop" ? loc.click() : loc.tap());
    await page.goto(BASE + "/games/bubble-pop?e2e=1");
    await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await page.waitForSelector("text=Choose a level");
    check(`[${vp}] 4 levels, 3 locked`, (await page.locator("button[aria-label^='Level']").count()) === 4 && (await page.locator("button[aria-label$='locked']").count()) === 3);
    await tap(page.locator("button[aria-label='Level 1']"));
    await page.waitForFunction(() => !!window.__wd, null, { timeout: 15000 });
    await page.waitForTimeout(500);
    const host = await page.locator("[data-testid=phaser-host]").boundingBox();
    const cv = await page.locator("[data-testid=phaser-host] canvas").boundingBox();
    check(`[${vp}] canvas fills host`, Math.abs(cv.width - host.width) < 2 && Math.abs(cv.height - host.height) < 2);
    const info0 = await page.evaluate(() => window.__wd.info());
    check(`[${vp}] board has bubbles`, info0.bubbles === 36, `bubbles=${info0.bubbles}`);
    await page.screenshot({ path: `shots/${vp}-bubble.png` });

    // pointer aim + release shoots
    const sx = host.x + host.width / 2, sy = host.y + host.height * 0.5;
    await page.mouse.move(sx, host.y + host.height * 0.8); await page.mouse.down(); await page.mouse.move(sx + 60, sy, { steps: 6 }); await page.mouse.up();
    await page.waitForTimeout(150);
    check(`[${vp}] release fires a shot`, (await page.evaluate(() => window.__wd.info().shots)) === 35 || (await page.evaluate(() => window.__wd.info().flying)));
    await page.waitForFunction(() => !window.__wd.info().flying, null, { timeout: 8000 });

    // pause stops flight
    await page.evaluate(() => window.__wd.shoot(window.__wd.best()));
    await page.locator("button[aria-label=Pause]").click();
    const f0 = await page.evaluate(() => window.__wd.info().flying);
    await page.waitForTimeout(500);
    check(`[${vp}] pause keeps shot frozen`, f0 === (await page.evaluate(() => window.__wd.info().flying)));
    await page.locator("button:has-text('KEEP PLAYING')").click();
    await page.waitForFunction(() => !window.__wd.info().flying, null, { timeout: 8000 });

    // auto-solve with the best angle each turn
    let guard = 0;
    while (guard++ < 50) {
      if (await page.locator("[role=dialog][aria-label=Results]").isVisible()) break;
      const i = await page.evaluate(() => window.__wd?.info());
      if (!i || i.ended) { await page.waitForTimeout(300); continue; }
      if (i.flying) { await page.waitForTimeout(80); continue; }
      await page.evaluate(() => window.__wd.shoot(window.__wd.best()));
      await page.waitForFunction(() => !window.__wd || window.__wd.info().ended || !window.__wd.info().flying, null, { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(450);
    }
    await page.waitForSelector("[role=dialog][aria-label=Results]", { timeout: 15000 });
    const txt = (await page.locator("[role=dialog][aria-label=Results]").innerText()).replace(/\n/g, " ");
    check(`[${vp}] level cleared with reward`, /Score \d+/.test(txt) && /Wonder Stars/.test(txt) && !/So close/.test(txt), txt.slice(0, 80));
    check(`[${vp}] level 2 unlocked`, (await page.evaluate(() => JSON.parse(localStorage.getItem("wonderdays:v1:bubble-level")))) >= 2);
    await page.screenshot({ path: `shots/${vp}-bubble-win.png` });
    await page.locator("a:has-text('MAP')").click(); await page.waitForURL("**/world");
    check(`[${vp}] left game cleanly`, await page.waitForFunction(() => !window.__wd, null, { timeout: 4000 }).then(() => true, () => false));
    check(`[${vp}] no overflow`, await noOverflow(page));
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 5).join(" ")); process.exit(1); });
