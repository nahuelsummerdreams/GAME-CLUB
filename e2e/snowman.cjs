const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");
(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    const tap = (loc) => (vp === "desktop" ? loc.click() : loc.tap());
    await page.goto(BASE + "/games/snowman-builder");
    await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await page.waitForSelector("[data-testid=snowman-game]");
    const parts = () => page.locator("svg[aria-label='Snowman'] [data-item]").count();
    const opt = (t, id) => page.locator(`[data-opt='${t}:${id}']`);
    const tab = (n) => tap(page.locator(`[role=tab]:has-text('${n}')`));
    check(`[${vp}] starts empty`, (await parts()) === 0);
    await tab("Eyes"); await tap(opt("eyes", "eyes|happy"));
    await tab("Nose"); await tap(opt("nose", "nose|carrot"));
    await tab("Mouth"); await tap(opt("mouth", "mouth|smile"));
    await tab("Hats"); await tap(opt("hats", "hat|santa")).catch(() => {}); await tap(opt("hat", "hat|santa"));
    check(`[${vp}] 4 parts added`, (await parts()) === 4);
    // single slot replaced, not stacked
    await tab("Eyes"); await tap(opt("eyes", "eyes|big"));
    check(`[${vp}] eyes replaced (still 4)`, (await parts()) === 4 && (await page.locator("[data-item='eyes|big']").count()) === 1);
    // extras stack
    await tab("Extras"); await tap(opt("extras", "buttons|coal")); await tap(opt("extras", "acc|star"));
    check(`[${vp}] extras add`, (await parts()) === 6);
    // body size changes geometry and keeps parts attached
    const hat = page.locator("[data-item='hat|santa']"); const h0 = await hat.boundingBox();
    await tab("Body"); await tap(opt("body", "2"));
    const h1 = await hat.boundingBox();
    check(`[${vp}] size change moves/scales parts`, Math.abs(h1.y - h0.y) > 5 || Math.abs(h1.width - h0.width) > 3);
    // drag a part
    const nose = page.locator("[data-item='nose|carrot']"); const a = await nose.boundingBox(); const tx = async () => +(/translate\(([-\d.]+)/.exec(await nose.getAttribute("transform"))[1]); const x0 = await tx();
    const gx = a.x + a.width / 2, gy = a.y + a.height * 0.3; await page.mouse.move(gx, gy); await page.mouse.down(); await page.mouse.move(gx + 50, gy + 40, { steps: 6 }); await page.mouse.up();
    const x1 = await tx(); check(`[${vp}] parts are draggable`, Math.abs(x1 - x0) > 10, `dx=${(x1 - x0).toFixed(0)}`);
    // locked
    await tab("Hats"); await tap(opt("hat", "hat|crown"));
    check(`[${vp}] locked hat shows hint`, await page.locator("text=earn Wonder Stars").isVisible() && (await parts()) === 6);
    await page.screenshot({ path: `shots/${vp}-snowman.png` });
    await page.waitForTimeout(200);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("wonderdays:v1:snowman")));
    check(`[${vp}] saved locally`, saved.items.length === 6 && saved.size === 2);
    await page.locator("button:has-text('DONE')").click();
    await page.waitForSelector("[role=dialog][aria-label=Results]");
    check(`[${vp}] DONE shows reward`, /Wonder Stars/.test(await page.locator("[role=dialog][aria-label=Results]").innerText()));
    check(`[${vp}] no overflow`, await noOverflow(page));
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 4).join(" ")); process.exit(1); });
