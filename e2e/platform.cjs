const { open, check, done, skipLoading, noOverflow, BASE } = require("./helpers.cjs");
(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    await page.goto(BASE);
    check(`[${vp}] loading text`, await page.locator("text=GETTING THE CHRISTMAS MAGIC READY").isVisible());
    await page.screenshot({ path: `shots/${vp}-loading.png` });
    await skipLoading(page);
    check(`[${vp}] home copy`, await page.locator("text=Your Christmas adventure starts here.").isVisible() && await page.locator("a:has-text('EXPLORE CHRISTMAS WORLD')").isVisible());
    check(`[${vp}] home no overflow`, await noOverflow(page));
    await page.screenshot({ path: `shots/${vp}-home.png` });
    await page.click("a:has-text('EXPLORE CHRISTMAS WORLD')");
    await page.waitForURL("**/world");
    await page.waitForSelector("[role=button][aria-label^='SANTA’S WORKSHOP']");
    check(`[${vp}] 6 zones`, (await page.locator("svg [role=button]").count()) === 6);
    await page.screenshot({ path: `shots/${vp}-world.png` });
    await page.locator("[role=button][aria-label^='CHRISTMAS SQUARE']").dispatchEvent("click");
    await page.waitForSelector("section[aria-label='CHRISTMAS SQUARE']");
    check(`[${vp}] zone sheet lists Memory`, await page.locator("a:has-text('Christmas Memory')").isVisible());
    await page.waitForTimeout(900);
    await page.screenshot({ path: `shots/${vp}-zone.png` });
    for (const path of ["/rewards", "/profile", "/settings"]) {
      await page.goto(BASE + path); await page.waitForTimeout(300);
      check(`[${vp}] ${path} renders & no overflow`, (await page.locator("h1").count()) > 0 && await noOverflow(page));
    }
    await page.screenshot({ path: `shots/${vp}-settings.png` });
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})();
