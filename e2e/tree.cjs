const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");
(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    const tap = (loc) => (vp === "desktop" ? loc.click() : loc.tap());
    await page.goto(BASE + "/games/tree-decoration");
    await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await page.waitForSelector("[data-testid=tree-game]");
    const count = () => page.locator("svg[aria-label='Christmas tree'] [data-item]").count();
    check(`[${vp}] starts empty`, (await count()) === 0);
    const opt = (t, id) => page.locator(`[data-opt='${t}:${id}']`);
    await tap(opt("ornaments", "bauble|#D94A4A")); await tap(opt("ornaments", "bell")); await tap(opt("ornaments", "candycane"));
    check(`[${vp}] add 3 ornaments`, (await count()) === 3);

    // drag the last item to a new spot
    const item = page.locator("svg[aria-label='Christmas tree'] [data-item='candycane']");
    const a = await item.boundingBox();
    const tx = a.x + a.width / 2 + 60, ty = a.y + a.height / 2 - 70;
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await page.mouse.move(tx, ty, { steps: 8 }); await page.mouse.up();
    const b = await item.boundingBox();
    check(`[${vp}] drag moves item`, Math.abs(b.x - a.x) > 30, `dx=${Math.round(b.x - a.x)}`);

    // selection controls
    check(`[${vp}] selected -> Remove enabled`, await page.locator("button[aria-label=Remove]").isEnabled());
    await page.locator("button[aria-label=Bigger]").click();
    const c = await item.boundingBox(); check(`[${vp}] bigger enlarges`, c.width > b.width + 3);
    await page.locator("button[aria-label=Remove]").click();
    check(`[${vp}] remove deletes`, (await count()) === 2);

    // tree color / topper / lights / scene
    await tap(page.locator("[role=tab]:has-text('Tree')")); await tap(opt("color", "#E58FA3"));
    await tap(page.locator("[role=tab]:has-text('Lights')")); await tap(opt("lights", "multi"));
    await tap(page.locator("[role=tab]:has-text('Gifts')")); await tap(page.locator("[data-opt^='gifts:']").first());
    check(`[${vp}] gift added`, (await count()) === 3);
    await tap(page.locator("[role=tab]:has-text('Scene')"));
    await tap(opt("bg", "cozy"));
    check(`[${vp}] locked scene shows unlock hint`, await page.locator("text=earn Wonder Stars").isVisible());
    await tap(opt("bg", "snow"));
    await page.screenshot({ path: `shots/${vp}-tree.png` });

    // persistence
    await page.waitForTimeout(200);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("wonderdays:v1:tree")));
    check(`[${vp}] saved locally`, saved.items.length === 3 && saved.color === "#E58FA3" && saved.lights === "multi" && saved.bg === "snow");
    await page.reload(); await tap(page.locator("button:has-text(\"LET'S PLAY\")")); await page.waitForSelector("[data-testid=tree-game]");
    check(`[${vp}] restored after reload`, (await count()) === 3);

    // start over needs confirmation
    await page.locator("button:has-text('Start over')").click(); check(`[${vp}] start-over asks first`, (await count()) === 3);
    await page.locator("button:has-text('Sure?')").click(); check(`[${vp}] start-over clears`, (await count()) === 0);

    await tap(opt("ornaments", "bell")); await page.locator("button:has-text('DONE')").click();
    await page.waitForSelector("[role=dialog][aria-label=Results]");
    check(`[${vp}] DONE shows reward`, /Wonder Stars/.test(await page.locator("[role=dialog][aria-label=Results]").innerText()));
    check(`[${vp}] no overflow`, await noOverflow(page));
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 4).join(" ")); process.exit(1); });
