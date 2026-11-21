const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");
const patchAudio = `(() => { window.__osc = 0; window.__ctx = 0; const AC = window.AudioContext || window.webkitAudioContext; const co = AC.prototype.createOscillator; AC.prototype.createOscillator = function () { window.__osc++; return co.call(this); }; })();`;

(async () => {
  const { browser, ctx, page, errors } = await open("ipad");
  await ctx.addInitScript(patchAudio);
  const ls = (k) => page.evaluate((k) => JSON.parse(localStorage.getItem("wonderdays:v1:" + k) || "null"), k);

  // ── map: every zone lists the right games
  await page.goto(BASE + "/world"); await page.waitForSelector("svg [role=button]");
  const expect = { "SANTA’S WORKSHOP": ["Santa's Workshop"], "REINDEER VILLAGE": ["Help Santa Deliver Gifts"], "CANDY LAND": ["Christmas Match", "Christmas Bubble Pop"], "SNOWY MOUNTAINS": ["Build a Snowman"], "CHRISTMAS SQUARE": ["Christmas Memory", "Decorate the Tree"], "SANTA’S HOUSE": ["Christmas Puzzle"] };
  for (const [zone, games] of Object.entries(expect)) {
    await page.locator(`svg [role=button][aria-label^='${zone}']`).dispatchEvent("click");
    await page.waitForSelector(`section[aria-label='${zone}']`);
    const names = await page.locator(`section[aria-label='${zone}'] a[href^='/games/']`).allInnerTexts();
    check(`zone ${zone} lists ${games.length} game(s)`, games.every((g) => names.some((n) => n.includes(g))), names.map((n) => n.split("\n")[0]).join(", "));
  }
  check("Santa's House links to Wish Room", await page.locator("section[aria-label='SANTA’S HOUSE'] a[href='/rewards']").isVisible());
  // every game link resolves (no broken routes)
  const slugs = ["santas-workshop", "gift-delivery", "christmas-match", "christmas-memory", "bubble-pop", "tree-decoration", "snowman-builder", "christmas-puzzle"];
  for (const s of slugs) { const r = await page.request.get(BASE + "/games/" + s); check(`route /games/${s} = 200`, r.status() === 200); }
  check("unknown game = 404 page", (await page.request.get(BASE + "/games/nope")).status() === 404);
  await page.goto(BASE + "/games/nope"); check("branded 404 has way home", await page.locator("a:has-text('BACK HOME')").isVisible());
  errors.length = 0; // the 404 above is intentional

  // ── earn stars via a perfect Memory run
  await page.goto(BASE + "/games/christmas-memory"); await page.locator("button:has-text(\"LET'S PLAY\")").click(); await page.locator("button:has-text('EASY')").click();
  await page.waitForSelector("[data-testid=memory-grid]");
  const syms = await page.$$eval("[data-testid=memory-grid] button", (b) => b.map((x) => x.dataset.sym)); const seen = {}; syms.forEach((s, i) => (seen[s] ||= []).push(i));
  const btns = page.locator("[data-testid=memory-grid] button");
  for (const idx of Object.values(seen)) { await btns.nth(idx[0]).click(); await btns.nth(idx[1]).click(); await page.waitForTimeout(520); }
  await page.waitForSelector("[role=dialog][aria-label=Results]");
  let p = await ls("progress"); check("stars earned & saved", p.stars === 17 && p.totalEarned === 17, `stars=${p.stars}`);

  // ── rewards: buy + wear
  await page.goto(BASE + "/rewards");
  check("Wish Room shows balance", await page.locator("text=17 Wonder Stars").isVisible());
  check("badge earned shown", (await page.locator("li:has-text('Christmas Badge'):has-text('Earned!')").count()) === 1);
  await page.locator("[role=tab]:has-text('Goodies')").click();
  const beanie = page.locator("li:has-text('Cozy Beanie')");
  await beanie.locator("button").click();
  p = await ls("progress"); check("buying spends stars & unlocks", p.stars === 7 && p.unlocked.includes("hat-beanie"));
  const crown = page.locator("li:has-text('Star Crown') button"); check("unaffordable item disabled", await crown.isDisabled());
  await beanie.locator("button:has-text('WEAR')").click();
  check("equipped saved", (await ls("progress")).equipped.hat === "hat-beanie");
  await page.reload(); await page.locator("[role=tab]:has-text('Goodies')").click(); check("equipped survives reload", await page.locator("li:has-text('Cozy Beanie') button:has-text('WEARING')").isVisible());
  // cosmetics unlock content in creative games
  await page.goto(BASE + "/rewards"); await page.locator("[role=tab]:has-text('Goodies')").click();
  check("no real-money language in rewards", !(await page.locator("body").innerText()).match(/\$|USD|buy now|purchase/i));

  // ── profile
  await page.goto(BASE + "/profile");
  await page.fill("#nick", "Zoe"); await page.locator("button[aria-label='Ginger']").first().click();
  await page.reload();
  const prof = await ls("profile"); check("profile saved (nickname + avatar)", prof.nickname === "Zoe" && prof.avatar === "ginger");
  check("profile asks for nickname, not real name", await page.locator("text=not a real name").isVisible());
  await page.locator("button[aria-label='Favorite Christmas Memory']").click();
  check("favorite saved", (await ls("progress")).favorites.includes("christmas-memory"));
  check("avatar shows on home top bar", await (async () => { await page.goto(BASE); await page.waitForSelector("text=Welcome to WonderDays!"); return (await page.locator("header a[href='/profile']").innerText()).includes("Zoe"); })());

  // ── audio: ON/OFF + independent volumes (counting oscillators created by the Web Audio engine)
  await page.goto(BASE + "/settings");
  const osc = () => page.evaluate(() => window.__osc);
  await page.locator("button:has-text('ON')").first().click(); // music toggles OFF
  const sOff = await ls("audio"); check("music OFF persisted", sOff.musicOn === false && sOff.sfxOn === true);
  let a = await osc(); await page.locator("a[aria-label=Back]").click(); await page.waitForURL("**/world"); await page.waitForTimeout(2500);
  check("music OFF -> no music notes scheduled", (await osc()) - a <= 2, `new osc=${(await osc()) - a}`);
  await page.goto(BASE + "/settings");
  await page.locator("button[aria-pressed]:has-text('OFF')").first().click(); // music ON again
  await page.locator("a[aria-label=Back]").click(); await page.waitForURL("**/world"); a = await osc(); await page.waitForTimeout(2500);
  check("music ON -> notes play on the map", (await osc()) - a >= 3, `new osc=${(await osc()) - a}`);
  await page.goto(BASE + "/settings"); const sl = page.locator("input[type=range]");
  await sl.first().fill("20"); await sl.nth(1).fill("90");
  const vol = await ls("audio"); check("volumes are independent & saved", vol.musicVolume === 0.2 && vol.sfxVolume === 0.9, JSON.stringify(vol));
  // effects only: music OFF, then compare a button tap with sounds ON vs OFF
  await page.locator("button[aria-pressed]:has-text('ON')").first().click(); // music OFF
  let e0 = await osc(); await page.locator("button[aria-pressed]:has-text('ON')").first().click(); // tap w/ sounds ON (also turns sounds OFF)
  check("sounds ON -> a tap makes a sound effect", (await osc()) - e0 >= 1, `d=${(await osc()) - e0}`);
  e0 = await osc(); await page.locator("button[aria-pressed]:has-text('OFF')").first().click(); await page.waitForTimeout(150);
  check("sounds OFF -> taps are silent", (await osc()) - e0 === 0, `d=${(await osc()) - e0}`);
  await page.locator("button[aria-pressed]:has-text('OFF')").first().click(); // restore sounds ON
  // ── erase progress asks first, then resets
  await page.goto(BASE + "/settings"); await page.locator("button:has-text('ERASE MY PROGRESS')").click();
  check("erase asks for confirmation", await page.locator("button:has-text('YES, ERASE')").isVisible() && (await ls("progress")).stars === 7);
  await page.locator("button:has-text('YES, ERASE')").click();
  p = await ls("progress"); check("erase resets stars/badges/profile", p.stars === 0 && p.badges.length === 0 && (await ls("profile")).nickname === "Little Elf");
  check("settings has install help + grown-ups note", await page.locator("text=Install WonderDays").isVisible() && await page.locator("text=No accounts, chat, ads, tracking or location.").isVisible());
  check("no overflow", await noOverflow(page));
  await done(browser, errors, true);
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 5).join(" ")); process.exit(1); });
