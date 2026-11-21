const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");

async function solve(page, tap) {
  const syms = await page.$$eval("[data-testid=memory-grid] button", (b) => b.map((x) => x.dataset.sym));
  const seen = {};
  syms.forEach((s, i) => (seen[s] ||= []).push(i));
  const btns = page.locator("[data-testid=memory-grid] button");
  for (const idx of Object.values(seen)) { await tap(btns.nth(idx[0])); await tap(btns.nth(idx[1])); await page.waitForTimeout(520); }
}

(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    const tap = (loc) => (vp === "desktop" ? loc.click() : loc.tap());
    await page.goto(BASE + "/games/christmas-memory");
    check(`[${vp}] tutorial shown`, await page.locator("text=Find every matching pair!").isVisible());
    await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await page.waitForSelector("text=Pick a level");
    check(`[${vp}] 3 difficulties`, (await page.locator("button:has-text('cards')").count()) === 3);
    await page.screenshot({ path: `shots/${vp}-memory-menu.png` });

    // Hard grid fits the screen (24 cards)
    await tap(page.locator("button:has-text('HARD')"));
    await page.waitForSelector("[data-testid=memory-grid]");
    check(`[${vp}] hard = 24 cards`, (await page.locator("[data-testid=memory-grid] button").count()) === 24);
    const fits = await page.evaluate(() => { const g = document.querySelector("[data-testid=memory-grid]").getBoundingClientRect(); const a = document.querySelector("[data-testid=memory-grid]").parentElement.getBoundingClientRect(); return g.width <= a.width + 1 && g.height <= a.height + 1; });
    check(`[${vp}] hard grid fits area`, fits);
    check(`[${vp}] cards are big enough to tap (>=44px)`, await page.evaluate(() => document.querySelector("[data-testid=memory-grid] button").getBoundingClientRect().width >= 44));
    await page.screenshot({ path: `shots/${vp}-memory-hard.png` });

    // Mismatch flips back
    const info = await page.$$eval("[data-testid=memory-grid] button", (b) => b.map((x) => x.dataset.sym));
    const a = 0, b = info.findIndex((s, i) => i > 0 && s !== info[0]);
    const btns = page.locator("[data-testid=memory-grid] button");
    await tap(btns.nth(a)); await tap(btns.nth(b));
    check(`[${vp}] two cards open`, (await page.locator("[data-testid=memory-grid] button[aria-pressed=true]").count()) === 2);
    await page.waitForTimeout(1100);
    check(`[${vp}] mismatch flips back`, (await page.locator("[data-testid=memory-grid] button[aria-pressed=true]").count()) === 0);

    // Pause blocks input and shows menu
    await tap(page.locator("button[aria-label=Pause]"));
    check(`[${vp}] pause menu`, await page.locator("[role=dialog][aria-label=Paused]").isVisible());
    await tap(page.locator("button:has-text('KEEP PLAYING')"));

    if (vp === "ipad") {
      // Full play-through on EASY with persistence
      await tap(page.locator("button:has-text('START OVER')").or(page.locator("button[aria-label=Pause]"))).catch(() => {});
    }
    await page.goto(BASE + "/games/christmas-memory");
    await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await tap(page.locator("button:has-text('EASY')"));
    await page.waitForSelector("[data-testid=memory-grid]");
    check(`[${vp}] easy = 12 cards`, (await page.locator("[data-testid=memory-grid] button").count()) === 12);
    await solve(page, tap);
    await page.waitForSelector("[role=dialog][aria-label=Results]", { timeout: 6000 });
    const txt = await page.locator("[role=dialog][aria-label=Results]").innerText();
    check(`[${vp}] victory screen with score + stars`, /Score \d+/.test(txt) && /Wonder Stars/.test(txt), txt.replace(/\n/g, " ").slice(0, 90));
    check(`[${vp}] 3 stars on perfect run`, (await page.locator("[aria-label='3 of 3 stars']").count()) === 1);
    await page.screenshot({ path: `shots/${vp}-memory-win.png` });
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("wonderdays:v1:progress")));
    check(`[${vp}] progress persisted`, saved.stars > 0 && saved.bestStars["christmas-memory"] === 3 && saved.records["christmas-memory:easy"] > 0 && saved.badges.includes("christmas-badge"), JSON.stringify({ stars: saved.stars }));
    await tap(page.locator("button:has-text('PLAY AGAIN')"));
    await page.waitForSelector("text=Pick a level");
    check(`[${vp}] play again returns to level pick`, true);
    check(`[${vp}] no overflow`, await noOverflow(page));
    // Back to map link
    await page.goto(BASE + "/games/christmas-memory"); await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await tap(page.locator("a[aria-label='Back to map']")); await page.waitForURL("**/world");
    check(`[${vp}] back to map works`, true);

    // Timed mode: timer visible
    await page.goto(BASE + "/games/christmas-memory"); await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await page.locator("input[type=checkbox]").check(); await tap(page.locator("button:has-text('EASY')"));
    await page.waitForSelector("text=/⏱ \\d+s/");
    check(`[${vp}] timer shown in timed mode`, true);
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n")[0]); process.exit(1); });
