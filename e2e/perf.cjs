const { open, BASE } = require("./helpers.cjs");
(async () => {
  for (const [name, url] of [["home", "/"], ["world", "/world"], ["memory", "/games/christmas-memory"], ["gift-delivery (Phaser)", "/games/gift-delivery"]]) {
    const { browser, page } = await open("phone", { serviceWorkers: "block" }); const sizes = {}; let total = 0;
    page.on("response", async (r) => { try { const b = await r.body(); const h = +r.headers()["content-length"] || 0; const t = r.request().resourceType(); sizes[t] = (sizes[t] || 0) + b.length; total += h || b.length; } catch {} });
    const t0 = Date.now(); await page.goto(BASE + url, { waitUntil: "networkidle" });
    if (url.includes("games")) { await page.locator("button:has-text(\"LET'S PLAY\")").click(); if (url.includes("gift")) { await page.locator("button[aria-label^='Route 1']").click(); } await page.waitForTimeout(2500); }
    console.log(`${name.padEnd(24)} wire≈${(total / 1024).toFixed(0)}KB  js(raw)=${((sizes.script || 0) / 1024).toFixed(0)}KB  ms=${Date.now() - t0}`);
    await browser.close();
  }
})();
