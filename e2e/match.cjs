const { open, check, done, noOverflow, BASE } = require("./helpers.cjs");
const R = 7, C = 7;
const runsCleared = (b) => { const s = new Set(); for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const i = r * C + c; const t = b[i]; if (t < 0) continue;
  if (c + 2 < C && b[i + 1] === t && b[i + 2] === t) { s.add(i); s.add(i + 1); s.add(i + 2); } if (r + 2 < R && b[i + C] === t && b[i + 2 * C] === t) { s.add(i); s.add(i + C); s.add(i + 2 * C); } } return s.size; };
const bestMove = (b) => { let best = null; for (let i = 0; i < b.length; i++) for (const j of [i + 1, i + C]) { if (j >= b.length || (j === i + 1 && i % C === C - 1)) continue; const n = [...b]; [n[i], n[j]] = [n[j], n[i]]; const k = runsCleared(n); if (k && (!best || k > best.k)) best = { i, j, k }; } return best; };
const readBoard = (page) => page.$$eval("[data-testid=match-board] [data-i]", (els) => { const a = Array(49).fill(-1); els.forEach((e) => { a[+e.dataset.i] = e.dataset.s === "rainbow" ? -1 : +e.dataset.t; }); return a; });

(async () => {
  const VPS = ["ipad", "phone", "desktop"];
  for (const vp of VPS) {
    const { browser, page, errors } = await open(vp);
    const tap = (loc) => (vp === "desktop" ? loc.click() : loc.tap());
    await page.goto(BASE + "/games/christmas-match");
    await tap(page.locator("button:has-text(\"LET'S PLAY\")"));
    await page.waitForSelector("text=Choose a level");
    check(`[${vp}] 6 levels, only L1 unlocked`, (await page.locator("button[aria-label^='Level']").count()) === 6 && (await page.locator("button[aria-label$='locked']").count()) === 5);
    await tap(page.locator("button[aria-label='Level 1']"));
    await page.waitForSelector("[data-testid=match-board]");
    await page.waitForTimeout(400);
    check(`[${vp}] 49 gems`, (await page.locator("[data-testid=match-board] [data-i]").count()) === 49);
    const box = await page.locator("[data-testid=match-board]").boundingBox();
    check(`[${vp}] cells >= 44px`, box.width / 7 >= 44, `${Math.round(box.width / 7)}px`);
    await page.screenshot({ path: `shots/${vp}-match.png` });
    const cellPx = box.width / 7;
    const center = (i) => ({ x: box.x + (i % C + 0.5) * cellPx, y: box.y + (Math.floor(i / C) + 0.5) * cellPx });
    const read = async () => ({ moves: +(await page.locator("[data-testid=match-board]").getAttribute("data-moves")), score: +(await page.locator("[data-testid=match-board]").getAttribute("data-score")) });

    // invalid move (non-matching adjacent swap) costs nothing
    let board = await readBoard(page); let bad = null;
    for (let i = 0; i < 48 && !bad; i++) { if (i % C === C - 1) continue; const n = [...board]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; if (!runsCleared(n)) bad = i; }
    const before = await read();
    await page.mouse.move(center(bad).x, center(bad).y); await page.mouse.down(); await page.mouse.move(center(bad + 1).x, center(bad + 1).y, { steps: 5 }); await page.mouse.up();
    await page.waitForTimeout(700);
    check(`[${vp}] invalid swipe-swap refunded`, (await read()).moves === before.moves);

    // play greedily until a result dialog
    let played = 0, scoreUp = false, movesDown = false;
    for (let k = 0; k < 24; k++) {
      if (await page.locator("[role=dialog][aria-label=Results]").isVisible()) break;
      board = await readBoard(page); const m = bestMove(board);
      if (!m) { await page.waitForTimeout(900); continue; }
      const a = await read();
      if (k % 2 === 0) { await page.mouse.move(center(m.i).x, center(m.i).y); await page.mouse.down(); await page.mouse.move(center(m.j).x, center(m.j).y, { steps: 6 }); await page.mouse.up(); }
      else { await page.mouse.click(center(m.i).x, center(m.i).y); await page.mouse.click(center(m.j).x, center(m.j).y); }
      await page.waitForFunction(([s]) => +document.querySelector("[data-testid=match-board]")?.getAttribute("data-score") > s || !!document.querySelector("[aria-label=Results]"), [a.score], { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const b = await read(); played++; if (b.score > a.score) scoreUp = true; if (b.moves < a.moves) movesDown = true;
    }
    check(`[${vp}] moves played raise score & use moves`, played > 0 && scoreUp && movesDown, `${played} moves`);
    await page.waitForSelector("[role=dialog][aria-label=Results]", { timeout: 20000 });
    const txt = (await page.locator("[role=dialog][aria-label=Results]").innerText()).replace(/\n/g, " ");
    check(`[${vp}] result dialog shown`, /Score \d+/.test(txt), txt.slice(0, 60));
    await page.screenshot({ path: `shots/${vp}-match-result.png` });
    if (/Great|Amazing/.test(txt)) { const lv = await page.evaluate(() => JSON.parse(localStorage.getItem("wonderdays:v1:match-level"))); check(`[${vp}] level 2 unlocked after win`, lv >= 2, `unlocked=${lv}`); }
    check(`[${vp}] no overflow`, await noOverflow(page));
    await done(browser, errors, vp === VPS[VPS.length - 1]);
  }
})().catch((e) => { console.error("FAIL (exception)", e.message.split("\n").slice(0, 4).join(" ")); process.exit(1); });
