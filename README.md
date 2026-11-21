# WonderDays Christmas Game Club

> **ENTER THE MAGIC OF CHRISTMAS.** — A safe, ad-free Christmas game world for kids 4–10 and their families. Powered by WonderDays.

A Progressive Web App built with **Next.js 16 · React 19 · TypeScript 5.9 · Tailwind 4 · Phaser 3.90**. No accounts, no backend, no tracking: progress is stored only on the device.

## The 8 games

| Zone | Game | Engine | Highlights |
|---|---|---|---|
| Santa's Workshop | **Santa's Workshop** | React | 4 jobs: wrap gifts, sort toys (drag & drop), pack orders, special gifts |
| Reindeer Village | **Help Santa Deliver Gifts** | Phaser | Sleigh flight, 3 routes, gift drops, obstacles, bonus stars |
| Candy Land | **Christmas Match** | React | Match-3 with 4 power-ups, cascades, 6 levels, swipe or tap |
| Candy Land | **Christmas Bubble Pop** | Phaser | Aim with bounce guide, hex grid, 4 levels, falling clusters |
| Christmas Square | **Christmas Memory** | React | 3 difficulties, optional timer, personal records |
| Christmas Square | **Decorate the Tree** | React | Free placement, lights, garlands, gifts, scenes, autosave |
| Snowy Mountains | **Build a Snowman** | React | 3 body sizes, mix-and-match parts, autosave |
| Santa's House | **Christmas Puzzle** | React | 4 illustrations × 9/16/25/36 pieces, drag or tap-to-place |

Rewards: **Wonder Stars** (earned only by playing — no purchases), 5 badges, 12 cosmetics (hats, scarves, accessories, tree ornaments, scenes). No chat, no public profiles, no personal data.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Requires Node ≥ 20.9.

## Architecture

```
app/            routes: / (loading → home), /world, /games/[slug], /rewards, /profile, /settings
components/     characters · navigation (map, top bar) · game-ui (shell, palette, stage) · rewards · animations
games/<slug>/   one self-contained module per game (manifest in index.ts, UI in Game.tsx, pure rules in logic.ts)
lib/game-engine registry (single source of truth), zones, PhaserHost helpers, shared hooks
lib/progression stars, badges, records, cosmetics catalog        lib/storage  versioned localStorage
lib/audio       Web Audio engine (music + SFX buses, independent volumes)
lib/state       tiny external store (useSyncExternalStore) for profile/progress/audio
types/          game.ts · player.ts · rewards.ts
public/         sw.js (offline), icons/        e2e/  browser + unit tests      scripts/  tooling
```

**Adding a game:** create `games/<slug>/` with a `Game.tsx` that implements `GameProps`, export a `GameManifest` from `index.ts`, add it to `lib/game-engine/registry.ts`, and place it in a zone. The shell gives it tutorial, pause, victory, rewards, replay and back-to-map for free. Phaser games mount through `PhaserHost`, which lazy-loads Phaser, honours pause, and destroys everything on exit.

## Quality gate

```bash
npm run test:all   # lint, types, build, unit tests, then 13 browser suites on iPad / phone / desktop
```

Browser suites drive real Chromium (touch emulation for iPad/phone) and use the Playwright already present in the dev container (`NODE_PATH=$(npm root -g)`); it is intentionally **not** a project dependency. Individual suites: `node e2e/<suite>.cjs` against `next start -p 3111`.
A `?e2e=1` query flag exposes a small `window.__wd` hook in the two Phaser games so tests can steer them; it does nothing without the flag.

## Deploy (Vercel)

Zero-config: import the repo, framework = Next.js, no environment variables needed. `next.config.ts` already sets no-cache on `/sw.js` and security headers. After the first deploy open the site once online so the service worker can cache the games for offline play.

## Privacy & safety by design

No accounts · no chat · no geolocation · no ads · no analytics · no third-party requests · fonts self-hosted · progress in `localStorage` only · "erase my progress" in Settings · no prices or payments anywhere.

## Known limitations / to replace before launch

See [`ASSETS_TODO.md`](./ASSETS_TODO.md): all art is original code-drawn SVG and all audio is synthesized (placeholders by design).
