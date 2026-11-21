# Provisional assets — replace before launch

Everything below is **original** (code-drawn SVG, Web Audio synthesis) so there are no licensing risks, but it is placeholder-grade art/audio, not final production assets.

| Area | Current (provisional) | Where | Replace with |
|---|---|---|---|
| Characters (Santa, Holly, Jingle, Snowy, Ginger) | SVG, 4 moods (idle/happy/surprised/cheer), shared head layout for cosmetics | `components/characters/index.tsx` | Illustrator artwork, same 4 expressions |
| World map | Layered SVG scene, 6 zones | `components/navigation/WorldMap.tsx` | Final layered map art |
| Loading / Home landscape | SVG scene | `components/animations/WinterScene.tsx` | Final key art |
| Toys, ornaments, bells, gifts… | SVG object set | `assets/objects/art.tsx` | Illustrator object set |
| Puzzle pictures (4) | SVG scenes | `games/christmas-puzzle/scenes.tsx` | 8+ original illustrations |
| Sleigh, houses, clouds, owls | SVG → Phaser textures | `games/gift-delivery/art.tsx` | Sprite sheets |
| Bubbles, mascot | SVG → Phaser textures | `games/bubble-pop/art.tsx` | Sprite sheets |
| Snowman parts, scenes | SVG | `games/snowman-builder/Game.tsx`, `components/game-ui/Backdrop.tsx` | Final part art |
| Badge medals (5) | SVG | `components/rewards/BadgeMedal.tsx` | Final badge art |
| PWA icons | Generated star icon | `public/icons/`, `app/icon.svg` (`npm run icons`) | Final WonderDays logo |
| Music (4 themes) | Synthesized loops | `lib/audio/index.ts` | Licensed/original tracks |
| SFX & character voices | Synthesized blips (no voices yet) | `lib/audio/index.ts` | Recorded audio, character laughs |

## Not yet done / out of scope for v1
- Real-device testing on physical iPhone/iPad/Android (only Chromium emulation was available).
- Audio has been verified programmatically (ON/OFF, volumes, per-bus behaviour) but **not listened to**.
- Supabase sync, payments, and the MegaPack hand-off are intentionally not implemented.
