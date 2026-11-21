const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");

const autopilot = (page) => page.evaluate(() => {
  window.__ap = setInterval(() => {
    const w = window.__wd; if (!w) return; const i = w.info(); if (i.ended) return;
    w.god = true; w.setY(i.groundY * 0.42);
    for (const h of i.houses) {
      if (h.done) continue; const dy = h.y - (i.sy + 0.7 * i.u); if (dy <= 0) continue;
      const t = Math.sqrt((2 * dy) / i.g); const ex = h.x - i.speed * t;
      if (Math.abs(ex - i.sx) < 0.35 * i.u && h.x > i.sx - 0.2 * i.u) { w.drop(); break; }
    }
  }, 30);
});

(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    const tap = (loc) => (vp === "desktop" ? loc.click() : loc.tap());
    await page.goto(BASE + "/games/gift-delivery?e2e=1");
    check(`[${vp}] tutorial`, await page.locator("text=Fly the sleigh").isVisible());
    await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await page.waitForSelector("text=Pick a route");
    check(`[${vp}] 3 routes, 2 locked`, (await page.locator("button[aria-label^='Route']").count()) === 3 && (await page.locator("button[aria-label$='locked']").count()) === 2);
    await tap(page.locator("button[aria-label^='Route 1']"));
    await page.waitForFunction(() => !!window.__wd, null, { timeout: 15000 });
    check(`[${vp}] phaser canvas mounted`, (await page.locator("[data-testid=phaser-host] canvas").count()) === 1);
    const size = await page.locator("[data-testid=phaser-host] canvas").boundingBox();
    const host = await page.locator("[data-testid=phaser-host]").boundingBox();
    check(`[${vp}] canvas fills host`, Math.abs(size.width - host.width) < 2 && Math.abs(size.height - host.height) < 2);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `shots/${vp}-delivery.png` });

    // keyboard / pointer steering
    const y0 = await page.evaluate(() => window.__wd.info().sy);
    if (vp === "desktop") { await page.keyboard.down("ArrowDown"); await page.waitForTimeout(500); await page.keyboard.up("ArrowDown"); }
    else { const b = await page.locator("[data-testid=phaser-host]").boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height * 0.2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2, b.y + b.height * 0.6, { steps: 8 }); await page.waitForTimeout(400); await page.mouse.up(); }
    const y1 = await page.evaluate(() => window.__wd.info().sy);
    check(`[${vp}] steering moves sleigh`, Math.abs(y1 - y0) > 10, `${Math.round(y0)} -> ${Math.round(y1)}`);

    // pause freezes the world
    await page.locator("button[aria-label=Pause]").click();
    const p0 = await page.evaluate(() => window.__wd.info().houses.map((h) => h.x).join());
    await page.waitForTimeout(700);
    const p1 = await page.evaluate(() => window.__wd.info().houses.map((h) => h.x).join());
    check(`[${vp}] pause freezes world`, p0 === p1);
    await page.locator("button:has-text('KEEP PLAYING')").click();
    await page.waitForTimeout(300);
    const p2 = await page.evaluate(() => window.__wd.info().houses.map((h) => h.x).join());
    check(`[${vp}] resume continues`, p2 !== p1 || (await page.evaluate(() => window.__wd.info().houses.length)) === 0);

    await autopilot(page);
    await page.waitForSelector("[role=dialog][aria-label=Results]", { timeout: 60000 });
    const txt = (await page.locator("[role=dialog][aria-label=Results]").innerText()).replace(/\n/g, " ");
    check(`[${vp}] route completed with reward`, /Score \d+/.test(txt) && /Wonder Stars/.test(txt) && !/So close/.test(txt), txt.slice(0, 80));
    const hud = await page.locator("[data-testid=delivery-hud]").getAttribute("data-delivered");
    check(`[${vp}] delivered most gifts`, +hud >= 6, `delivered=${hud}/8`);
    await page.screenshot({ path: `shots/${vp}-delivery-win.png` });
    check(`[${vp}] route 2 unlocked`, (await page.evaluate(() => JSON.parse(localStorage.getItem("wonderdays:v1:delivery-route")))) >= 2);

    // leaving frees the game
    await page.locator("a:has-text('MAP')").click(); await page.waitForURL("**/world");
    check(`[${vp}] left game cleanly (phaser destroyed)`, await page.waitForFunction(() => !window.__wd, null, { timeout: 4000 }).then(() => true, () => false));
    check(`[${vp}] no overflow`, await noOverflow(page));

    if (vp === "desktop") {
      // failure path: play without dropping anything
      await page.goto(BASE + "/games/gift-delivery?e2e=1"); await page.locator("button:has-text(\"LET'S PLAY\")").click();
      await page.locator("button[aria-label^='Route 1']").click(); await page.waitForFunction(() => !!window.__wd);
      await page.evaluate(() => { window.__wd.god = true; });
      await page.waitForSelector("[role=dialog][aria-label=Results]", { timeout: 60000 });
      check(`[desktop] no deliveries = "So close" (0 stars)`, /So close/.test(await page.locator("[role=dialog][aria-label=Results]").innerText()));
    }
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 5).join(" ")); process.exit(1); });
