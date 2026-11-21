const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");
(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    const click = (loc) => loc.dispatchEvent("click"); // belt items move, so dispatch directly
    await page.goto(BASE + "/games/santas-workshop");
    await page.locator("button:has-text(\"LET'S PLAY\")").click();
    await page.waitForSelector("text=Pick a job");
    check(`[${vp}] 4 jobs, 3 locked`, (await page.locator("button[aria-label^='Level']").count()) === 4 && (await page.locator("button[aria-label$='locked']").count()) === 3);

    // ── Level 1: wrap 3 gifts, with a wrong pick first
    await page.locator("button[aria-label^='Level 1']").click();
    await page.waitForSelector("[data-testid=wrap-flow]");
    await page.screenshot({ path: `shots/${vp}-workshop-1.png` });
    const wrap = async (special) => {
      for (let n = 0; n < 3; n++) {
        const f = page.locator("[data-testid=wrap-flow]");
        const d = { toy: await f.getAttribute("data-order-toy"), paper: await f.getAttribute("data-order-paper"), bow: await f.getAttribute("data-order-bow"), name: await f.getAttribute("data-order-name") };
        if (n === 0 && !special) { // wrong toy first
          const wrongToy = (await page.locator("[data-testid=wrap-flow] [data-choice]").evaluateAll((els, want) => els.map((e) => e.dataset.choice).find((c) => c !== want), d.toy));
          await click(page.locator(`[data-choice='${wrongToy}']`).first());
          check(`[${vp}] wrong toy rejected (stays on step 1)`, (await f.getAttribute("data-step")) === "toy" && +(await page.locator("[data-testid=workshop]").getAttribute("data-mistakes")) === 1);
        }
        await click(page.locator(`[data-choice='${d.toy}']`).first());
        await page.locator(`[data-choice='${d.paper}']`).click();
        for (let k = 0; k < 4; k++) await page.locator("button[data-fold]").click();
        await page.locator(`[data-choice='${d.bow}']`).click();
        await page.locator(`button[aria-label='Tag ${d.name}']`).click();
        if (n === 0) await page.screenshot({ path: `shots/${vp}-workshop-${special ? 4 : 1}-gift.png` });
        await page.locator("button[aria-label=\"Send to Santa's bag\"]").click();
      }
    };
    await wrap(false);
    await page.waitForSelector("[role=dialog][aria-label=Results]");
    check(`[${vp}] L1 reward`, /Wonder Stars/.test(await page.locator("[role=dialog][aria-label=Results]").innerText()));
    check(`[${vp}] L2 unlocked`, (await page.evaluate(() => JSON.parse(localStorage.getItem("wonderdays:v1:workshop-level")))) >= 2);

    // ── Level 2: sort 8 toys by tap-select + bin (and one drag)
    await page.locator("button:has-text('PLAY AGAIN')").click(); await page.waitForSelector("text=Pick a job");
    await page.locator("button[aria-label^='Level 2']").click(); await page.waitForSelector("[data-testid=sort-flow]");
    await page.screenshot({ path: `shots/${vp}-workshop-2.png` });
    for (let n = 0; n < 8; n++) {
      const cat = await page.locator("[data-testid=sort-flow]").getAttribute("data-toy-cat");
      if (n === 0) { // drag with the mouse
        const a = await page.locator("[data-toy]").boundingBox(); const b = await page.locator(`[data-bin='${cat}']`).boundingBox();
        await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await page.mouse.up();
      } else { await page.locator("[data-toy]").click(); await page.locator(`[data-bin='${cat}']`).click(); }
      await page.waitForTimeout(60);
    }
    await page.waitForSelector("[role=dialog][aria-label=Results]");
    check(`[${vp}] L2 sorted all (3 stars, no mistakes)`, (await page.locator("[aria-label='3 of 3 stars']").count()) === 1);

    // ── Level 3: pack orders
    await page.locator("button:has-text('PLAY AGAIN')").click(); await page.waitForSelector("text=Pick a job");
    await page.locator("button[aria-label^='Level 3']").click(); await page.waitForSelector("[data-testid=pack-flow]");
    await page.locator("button:has-text('PACK IT')").click();
    check(`[${vp}] empty box rejected`, +(await page.locator("[data-testid=workshop]").getAttribute("data-mistakes")) === 1);
    for (let n = 0; n < 3; n++) {
      const need = JSON.parse(await page.locator("[data-testid=pack-flow]").getAttribute("data-need"));
      const names = ["Teddy bear", "Rubber duck", "Ball", "Drum", "Toy train", "Robot"];
      for (const [t, c] of Object.entries(need)) for (let k = 0; k < c; k++) await page.locator(`button[aria-label='Add ${names[t]}']`).click();
      if (n === 0) await page.screenshot({ path: `shots/${vp}-workshop-3.png` });
      await page.locator("button:has-text('PACK IT')").click();
    }
    await page.waitForSelector("[role=dialog][aria-label=Results]");
    check(`[${vp}] L3 reward`, /Wonder Stars/.test(await page.locator("[role=dialog][aria-label=Results]").innerText()));

    // ── Level 4: special gifts
    await page.locator("button:has-text('PLAY AGAIN')").click(); await page.waitForSelector("text=Pick a job");
    await page.locator("button[aria-label^='Level 4']").click(); await page.waitForSelector("[data-testid=wrap-flow]");
    await wrap(true);
    await page.waitForSelector("[role=dialog][aria-label=Results]");
    check(`[${vp}] L4 reward`, /Wonder Stars/.test(await page.locator("[role=dialog][aria-label=Results]").innerText()));
    check(`[${vp}] no overflow`, await noOverflow(page));
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 5).join(" ")); process.exit(1); });
