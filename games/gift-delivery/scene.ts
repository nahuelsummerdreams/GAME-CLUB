import type PhaserNS from "phaser";
import type { SfxName } from "@/types/game";

export interface Route { name: string; houses: number; speed: number; obstacleEvery: number; birds: boolean; bonusStars: number; sky: [number, number] }
export const ROUTES: Route[] = [
  { name: "Snowy Village", houses: 8, speed: 2.3, obstacleEvery: 2.2, birds: false, bonusStars: 5, sky: [0x7fb8d2, 0xd9eef5] },
  { name: "Candy Hills", houses: 10, speed: 2.7, obstacleEvery: 1.5, birds: true, bonusStars: 8, sky: [0xe9a8c0, 0xfde9ed] },
  { name: "Frozen Night", houses: 12, speed: 3.1, obstacleEvery: 1.1, birds: true, bonusStars: 10, sky: [0x2b2f6b, 0x6a74b8] },
];

export interface Hud { hearts: number; delivered: number; total: number; stars: number; bonus: number }
export interface End { delivered: number; total: number; stars: number; hearts: number; bonusDone: boolean; failed: boolean }
export interface Opts { route: Route; images: Record<string, HTMLImageElement>; onHud: (h: Hud) => void; onEnd: (e: End) => void; sfx: (n: SfxName) => void; e2e: boolean }

type Sprite = PhaserNS.GameObjects.Image;
interface House { s: Sprite; done: boolean; gift?: Sprite }
interface Obs { s: Sprite; kind: "cloud" | "owl"; phase: number }

export async function loadImages(textures: Record<string, { url: string }>): Promise<Record<string, HTMLImageElement>> {
  const out: Record<string, HTMLImageElement> = {};
  await Promise.all(Object.entries(textures).map(([k, t]) => new Promise<void>((res, rej) => { const i = new Image(); i.onload = () => { out[k] = i; res(); }; i.onerror = () => rej(new Error(`texture ${k}`)); i.src = t.url; })));
  return out;
}

export function createDelivery(Phaser: typeof PhaserNS, parent: HTMLElement, o: Opts): PhaserNS.Game {
  const R = o.route;
  class Play extends Phaser.Scene {
    u = 60; groundY = 0; w = 0; h = 0;
    sky!: PhaserNS.GameObjects.Graphics; ground!: PhaserNS.GameObjects.Graphics;
    mount!: PhaserNS.GameObjects.TileSprite; hills!: PhaserNS.GameObjects.TileSprite;
    sleigh!: Sprite; btn!: PhaserNS.GameObjects.Container; hint!: PhaserNS.GameObjects.Text;
    houses: House[] = []; obs: Obs[] = []; stars: Sprite[] = []; gifts: { s: Sprite; vy: number }[] = []; trees: Sprite[] = [];
    targetY = 0; travel = 0; obsTravel = 0; starTravel = 0; treeTravel = 0; spawned = 0; passed = 0; delivered = 0; starCount = 0; hearts = 3;
    inv = 0; cooldown = 0; ended = false; gravity = 0;
    keys!: { up: PhaserNS.Input.Keyboard.Key; down: PhaserNS.Input.Keyboard.Key; w: PhaserNS.Input.Keyboard.Key; s: PhaserNS.Input.Keyboard.Key; space: PhaserNS.Input.Keyboard.Key };
    god = false;

    constructor() { super("play"); }

    create() {
      for (const [k, img] of Object.entries(o.images)) if (!this.textures.exists(k)) this.textures.addImage(k, img);
      const g = this.make.graphics({ x: 0, y: 0 }, false); g.fillStyle(0xffffff, 1); g.fillCircle(6, 6, 6); g.generateTexture("flake", 12, 12); g.destroy();
      this.sky = this.add.graphics().setDepth(0); this.ground = this.add.graphics().setDepth(8);
      this.mount = this.add.tileSprite(0, 0, 10, 10, "mountain").setOrigin(0, 1).setDepth(1);
      this.hills = this.add.tileSprite(0, 0, 10, 10, "hills").setOrigin(0, 1).setDepth(2);
      this.sleigh = this.add.image(0, 0, "sleigh").setDepth(20);
      this.hint = this.add.text(0, 0, "▼", { fontFamily: "Fredoka Variable, sans-serif", fontSize: "34px", color: "#D94A4A", stroke: "#ffffff", strokeThickness: 5 }).setOrigin(0.5).setDepth(30).setVisible(false);
      this.add.particles(0, 0, "flake", { x: { min: 0, max: 2400 }, y: -10, lifespan: 6000, speedY: { min: 30, max: 90 }, speedX: { min: -140, max: -50 }, scale: { min: 0.25, max: 0.9 }, alpha: 0.85, frequency: 90, quantity: 1 }).setDepth(25);

      const btnBg = this.add.circle(0, 0, 50, 0xd94a4a).setStrokeStyle(6, 0xa93434);
      const btnIcon = this.add.image(0, -4, "gift").setDisplaySize(52, 52);
      const btnLabel = this.add.text(0, 34, "GIFT", { fontFamily: "Fredoka Variable, sans-serif", fontSize: "18px", color: "#FFFDF7", fontStyle: "600" }).setOrigin(0.5);
      this.btn = this.add.container(0, 0, [btnBg, btnIcon, btnLabel]).setDepth(50).setSize(110, 110).setInteractive({ useHandCursor: true });
      this.btn.on("pointerdown", () => this.drop());

      this.input.addPointer(2);
      const kb = this.input.keyboard!;
      this.keys = { up: kb.addKey("UP"), down: kb.addKey("DOWN"), w: kb.addKey("W"), s: kb.addKey("S"), space: kb.addKey("SPACE") };
      kb.addCapture("UP,DOWN,SPACE");
      kb.on("keydown-SPACE", () => this.drop()); kb.on("keydown-ENTER", () => this.drop());

      this.layout(); this.scale.on("resize", () => this.layout());
      this.sleigh.setPosition(this.u * 2.6, this.groundY * 0.4); this.targetY = this.sleigh.y;
      this.emitHud();
      if (o.e2e) (window as unknown as { __wd: unknown }).__wd = {
        info: () => ({ sx: this.sleigh.x, sy: this.sleigh.y, u: this.u, g: this.gravity, speed: this.speed(), groundY: this.groundY, ended: this.ended, houses: this.houses.map((h) => ({ x: h.s.x, y: h.s.y - h.s.displayHeight, done: h.done })) }),
        drop: () => this.drop(), setY: (y: number) => { this.targetY = y; }, set god(v: boolean) { godRef.v = v; },
      };
      const cleanup = () => { this.scale.off("resize"); this.input.keyboard?.removeAllListeners(); if (o.e2e) delete (window as unknown as { __wd?: unknown }).__wd; };
      this.events.once("shutdown", cleanup); this.events.once("destroy", cleanup);
    }

    speed() { return R.speed * this.u * (1 + this.passed * 0.04); }

    layout() {
      const w = this.scale.width, h = this.scale.height; this.w = w; this.h = h;
      this.u = Math.max(28, Math.min(w / 12, h / 7)); const u = this.u; this.gravity = 11 * u;
      this.groundY = h - Math.max(u * 0.9, h * 0.1);
      this.sky.clear().fillGradientStyle(R.sky[0], R.sky[0], R.sky[1], R.sky[1], 1).fillRect(0, 0, w, h);
      this.ground.clear().fillStyle(0xfffdf7, 1).fillRect(0, this.groundY, w, h - this.groundY).fillStyle(0xeaf4f7, 1).fillRect(0, this.groundY + u * 0.55, w, h);
      this.ground.fillStyle(0xfffdf7, 1); for (let x = -u; x < w + u; x += u * 1.7) this.ground.fillEllipse(x, this.groundY, u * 1.9, u * 0.35);
      const mk = (3.2 * u) / 260; this.mount.setPosition(0, this.groundY).setSize(w, 260 * mk).setTileScale(mk);
      const hk = (1.5 * u) / 160; this.hills.setPosition(0, this.groundY + u * 0.1).setSize(w, 160 * hk).setTileScale(hk);
      this.sleigh.setDisplaySize(u * 3.2, u * 1.6);
      this.btn.setPosition(w - u * 1.15, h - u * 1.15).setScale(u / 78);
      this.sleigh.x = u * 2.6;
    }

    drop() {
      if (this.ended || this.cooldown > 0) return;
      this.cooldown = 0.45; o.sfx("whoosh");
      const s = this.add.image(this.sleigh.x + this.u * 0.1, this.sleigh.y + this.u * 0.7, "gift").setDisplaySize(this.u * 0.6, this.u * 0.6).setDepth(18);
      this.gifts.push({ s, vy: 0 });
    }

    emitHud() { o.onHud({ hearts: this.hearts, delivered: this.delivered, total: R.houses, stars: this.starCount, bonus: R.bonusStars }); }

    popup(x: number, y: number, text: string, color = "#F4C95D") {
      const t = this.add.text(x, y, text, { fontFamily: "Fredoka Variable, sans-serif", fontSize: `${Math.round(this.u * 0.5)}px`, color, stroke: "#174B3C", strokeThickness: 5, fontStyle: "600" }).setOrigin(0.5).setDepth(40);
      this.tweens.add({ targets: t, y: y - this.u, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    }

    spawnHouse() {
      const u = this.u; const key = ["houseA", "houseB", "houseC"][this.spawned % 3]!;
      const s = this.add.image(this.w + u * 2, this.groundY + u * 0.15, key).setOrigin(0.5, 1).setDisplaySize(u * 1.9, u * 1.78).setDepth(10);
      this.houses.push({ s, done: false }); this.spawned++;
    }
    spawnObstacle() {
      const u = this.u; const owl = R.birds && Math.random() < 0.5;
      const y = Phaser.Math.Between(Math.round(u * 1.1), Math.round(this.groundY - u * 2.3));
      const s = this.add.image(this.w + u * 2, y, owl ? "owl" : "cloud").setDepth(16);
      owl ? s.setDisplaySize(u * 0.95, u * 0.95) : s.setDisplaySize(u * 2.2, u * 1.2);
      this.obs.push({ s, kind: owl ? "owl" : "cloud", phase: Math.random() * 6 });
    }
    spawnStars() {
      const u = this.u; const y0 = Phaser.Math.Between(Math.round(u * 1.2), Math.round(this.groundY - u * 2.4));
      for (let i = 0; i < 3; i++) this.stars.push(this.add.image(this.w + u * (1.5 + i * 0.95), y0 - Math.sin(i * 1.4) * u * 0.5, "star").setDisplaySize(u * 0.7, u * 0.7).setDepth(15));
    }
    spawnTree() {
      const u = this.u; const k = Phaser.Math.FloatBetween(0.8, 1.3);
      this.trees.push(this.add.image(this.w + u, this.groundY + u * 0.1, "tree").setOrigin(0.5, 1).setDisplaySize(u * 0.9 * k, u * 1.2 * k).setDepth(Phaser.Math.Between(6, 9)));
    }

    finish(failed: boolean) {
      if (this.ended) return; this.ended = true;
      const ratio = this.delivered / R.houses;
      const stars = failed ? 0 : ratio >= 0.95 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.5 ? 1 : 0;
      this.time.delayedCall(failed ? 600 : 400, () => o.onEnd({ delivered: this.delivered, total: R.houses, stars, hearts: this.hearts, bonusDone: this.starCount >= R.bonusStars, failed: failed || stars === 0 }));
    }

    update(_t: number, delta: number) {
      if (this.ended) return;
      const dt = Math.min(delta / 1000, 0.05); const u = this.u; const sp = this.speed(); const dx = sp * dt;
      this.cooldown = Math.max(0, this.cooldown - dt); this.inv = Math.max(0, this.inv - dt);
      this.btn.setAlpha(this.cooldown > 0 ? 0.55 : 1);
      this.mount.tilePositionX += (dx * 0.1) / this.mount.tileScaleX; this.hills.tilePositionX += (dx * 0.3) / this.hills.tileScaleX;

      // input
      const up = this.keys.up.isDown || this.keys.w.isDown, down = this.keys.down.isDown || this.keys.s.isDown;
      if (up || down) this.targetY += (down ? 1 : -1) * 5 * u * dt;
      for (const p of this.input.manager.pointers) {
        if (p.isDown && Phaser.Math.Distance.Between(p.x, p.y, this.btn.x, this.btn.y) > u * 1.0) this.targetY = p.y - u * 0.3;
      }
      this.targetY = Phaser.Math.Clamp(this.targetY, u * 1.0, this.groundY - u * 2.1);
      this.sleigh.y += (this.targetY - this.sleigh.y) * Math.min(1, 9 * dt);
      this.sleigh.setRotation((this.targetY - this.sleigh.y) * 0.002);
      this.sleigh.setAlpha(this.inv > 0 && Math.floor(this.inv * 10) % 2 ? 0.35 : 1);

      // spawning (distance based, so difficulty follows speed)
      this.travel += dx; this.obsTravel += dx; this.starTravel += dx; this.treeTravel += dx;
      const gap = u * 5.4;
      if (this.spawned < R.houses && this.travel >= (this.spawned === 0 ? gap * 0.55 : gap)) { this.travel = 0; this.spawnHouse(); }
      if (this.spawned > 0 && this.spawned <= R.houses && this.obsTravel >= gap * R.obstacleEvery) { this.obsTravel = Phaser.Math.Between(0, Math.round(gap * 0.4)); this.spawnObstacle(); }
      if (this.starTravel >= gap * 0.9) { this.starTravel = 0; this.spawnStars(); }
      if (this.treeTravel >= u * 2.2) { this.treeTravel = Phaser.Math.Between(0, Math.round(u)); this.spawnTree(); }

      // world movement
      for (const t of this.trees) t.x -= dx;
      this.trees = this.trees.filter((t) => (t.x < -u * 2 ? (t.destroy(), false) : true));
      let hintHouse: House | undefined;
      for (const h of this.houses) {
        h.s.x -= dx; if (h.gift) h.gift.x = h.s.x + u * 0.1;
        if (!h.done && h.s.x > this.sleigh.x - u * 0.3 && !hintHouse) hintHouse = h;
      }
      this.hint.setVisible(!!hintHouse && hintHouse.s.x - this.sleigh.x < u * 5);
      if (hintHouse) this.hint.setPosition(hintHouse.s.x, hintHouse.s.y - u * 2.05 + Math.sin(this.time.now / 140) * 6).setFontSize(Math.round(u * 0.55));
      this.houses = this.houses.filter((h) => { if (h.s.x < -u * 2.2) { this.passed++; h.s.destroy(); h.gift?.destroy(); this.emitHud(); return false; } return true; });
      for (const ob of this.obs) { ob.s.x -= dx * (ob.kind === "owl" ? 1.5 : 1.05); ob.s.y += Math.sin(this.time.now / 380 + ob.phase) * u * 0.7 * dt; }
      this.obs = this.obs.filter((ob) => (ob.s.x < -u * 2 ? (ob.s.destroy(), false) : true));
      for (const s of this.stars) { s.x -= dx; s.angle += 90 * dt; }
      this.stars = this.stars.filter((s) => (s.x < -u ? (s.destroy(), false) : true));

      // gifts
      this.gifts = this.gifts.filter((g) => {
        g.vy += this.gravity * dt; g.s.y += g.vy * dt; g.s.angle += 120 * dt;
        for (const h of this.houses) {
          if (h.done) continue; const top = h.s.y - u * 1.7;
          if (g.s.y >= top && g.s.y <= h.s.y && Math.abs(g.s.x - h.s.x) < u * 0.95) {
            h.done = true; this.delivered++; h.gift = this.add.image(h.s.x + u * 0.1, top + u * 0.05, "gift").setDisplaySize(u * 0.62, u * 0.62).setDepth(11);
            this.popup(h.s.x, top - u * 0.3, "+100"); o.sfx("match"); this.emitHud(); g.s.destroy(); return false;
          }
        }
        if (g.s.y > this.groundY + u * 0.2) { o.sfx("error"); g.s.destroy(); return false; }
        return true;
      });

      // stars & obstacles
      const sx = this.sleigh.x, sy = this.sleigh.y;
      this.stars = this.stars.filter((s) => {
        if (Math.abs(s.x - sx - u * 0.2) < u * 1.5 && Math.abs(s.y - sy) < u * 0.8) { this.starCount++; this.popup(s.x, s.y, "+10", "#FFFDF7"); o.sfx("pop"); this.emitHud(); s.destroy(); return false; }
        return true;
      });
      if (this.inv <= 0 && !godRef.v) {
        for (const ob of this.obs) {
          const hw = ob.s.displayWidth * 0.34, hh = ob.s.displayHeight * 0.34;
          if (Math.abs(ob.s.x - sx - u * 0.1) < hw + u * 1.05 && Math.abs(ob.s.y - sy) < hh + u * 0.4) {
            this.hearts--; this.inv = 1.6; o.sfx("error"); this.cameras.main.shake(160, 0.007); this.emitHud();
            if (this.hearts <= 0) this.finish(true);
            break;
          }
        }
      }
      if (this.spawned >= R.houses && this.houses.length === 0) this.finish(false);
    }
  }
  const godRef = { v: false };
  return new Phaser.Game({
    type: Phaser.CANVAS, parent, backgroundColor: "#8EC5DC", banner: false, audio: { noAudio: true }, disableContextMenu: true,
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth || 800, height: parent.clientHeight || 450 },
    input: { activePointers: 3 }, scene: Play,
  });
}
