const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");

(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    const tap = (loc) => (vp === "desktop" ? loc.click() : loc.tap());
    await page.goto(BASE + "/games/christmas-puzzle");
    await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await page.waitForSelector("text=Choose a picture");
    check(`[${vp}] 4 pictures & 4 sizes`, (await page.locator("button[aria-pressed] svg[role=img]").count()) === 4 && (await page.locator("button:text-is('9'), button:text-is('16'), button:text-is('25'), button:text-is('36')").count()) === 4);
    await page.screenshot({ path: `shots/${vp}-puzzle-menu.png` });

    // 36-piece layout sanity (largest), then 9-piece full solve
    await tap(page.locator("button:text-is('36')")); await tap(page.locator("button:has-text('START PUZZLE')"));
    await page.waitForSelector("[data-testid=board]");
    check(`[${vp}] 36 pieces in tray`, (await page.locator("[data-piece]").count()) === 36);
    const box = await page.locator("[data-piece]").first().boundingBox();
    check(`[${vp}] tray piece tappable (>=44px)`, box.width >= 44, `${Math.round(box.width)}px`);
    await page.screenshot({ path: `shots/${vp}-puzzle-36.png` });

    await page.goto(BASE + "/games/christmas-puzzle"); await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await tap(page.locator("button:text-is('9')")); await tap(page.locator("button:has-text('START PUZZLE')"));
    await page.waitForSelector("[data-testid=board]");
    check(`[${vp}] 9 pieces`, (await page.locator("[data-piece]").count()) === 9);

    // wrong placement via select+tap counts as a mistake and keeps the piece
    const first = await page.locator("[data-piece]").first().getAttribute("data-piece");
    const wrongCell = first === "0" ? 1 : 0;
    await tap(page.locator("[data-piece]").first());
    await tap(page.locator(`[data-cell='${wrongCell}']`));
    check(`[${vp}] wrong spot rejected`, (await page.locator("[data-piece]").count()) === 9);

    // solve: mix of drag (desktop) and tap-select (touch)
    for (let guard = 0; guard < 12 && (await page.locator("[data-piece]").count()) > 0; guard++) {
      const el = page.locator("[data-piece]").first();
      const id = await el.getAttribute("data-piece");
      if (vp === "desktop") {
        const a = await el.boundingBox(); const b = await page.locator(`[data-cell='${id}']`).boundingBox();
        await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
        await page.mouse.move(a.x + a.width / 2 + 20, a.y + a.height / 2 - 20, { steps: 4 });
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await page.mouse.up();
      } else {
        await tap(el); await tap(page.locator(`[data-cell='${id}']`));
      }
      await page.waitForTimeout(80);
    }
    check(`[${vp}] all pieces placed`, (await page.locator("[data-piece]").count()) === 0);
    await page.screenshot({ path: `shots/${vp}-puzzle-solved.png` });
    await page.waitForSelector("[role=dialog][aria-label=Results]", { timeout: 6000 });
    const txt = await page.locator("[role=dialog][aria-label=Results]").innerText();
    check(`[${vp}] victory + stars`, /Score \d+/.test(txt) && /Wonder Stars/.test(txt), txt.replace(/\n/g, " ").slice(0, 70));
    check(`[${vp}] completion saved`, await page.evaluate(() => JSON.parse(localStorage.getItem("wonderdays:v1:puzzle-done") || "[]").length) > 0);
    check(`[${vp}] no overflow`, await noOverflow(page));
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 4).join(" ")); process.exit(1); });
