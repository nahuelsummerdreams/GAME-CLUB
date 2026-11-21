// Generates PWA icons from an SVG using the preinstalled Chromium. Run: NODE_PATH=$(npm root -g) node scripts/make-icons.cjs
const { chromium } = require("playwright");
const path = require("path");
const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<rect width="512" height="512" fill="#174B3C"/>
<g transform="translate(${pad} ${pad}) scale(${(512 - pad * 2) / 512})">
<circle cx="256" cy="256" r="196" fill="#28664D"/><circle cx="256" cy="256" r="196" fill="none" stroke="#FFFDF7" stroke-width="10" stroke-dasharray="2 22" stroke-linecap="round"/>
<path d="M256 96l46 100 108 12-80 72 22 108-96-54-96 54 22-108-80-72 108-12z" fill="#F4C95D" stroke="#C99A2E" stroke-width="12" stroke-linejoin="round"/>
<circle cx="256" cy="262" r="40" fill="#D94A4A" stroke="#A93434" stroke-width="8"/><path d="M236 262h40M256 242v40" stroke="#FFFDF7" stroke-width="8" stroke-linecap="round"/>
</g></svg>`;
(async () => {
  const b = await chromium.launch();
  for (const [name, size, pad] of [["icon-192", 192, 0], ["icon-512", 512, 0], ["maskable-512", 512, 60], ["apple-touch-icon", 180, 0]]) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<body style="margin:0">${svg(pad).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body>`);
    await p.screenshot({ path: path.join(__dirname, "../public/icons", name + ".png") });
    await p.close();
  }
  await b.close(); console.log("icons ok");
})();
