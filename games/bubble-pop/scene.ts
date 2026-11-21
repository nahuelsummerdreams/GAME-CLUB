import type PhaserNS from "phaser";
import type { SfxName } from "@/types/game";
import { COLS, cellPos, colorsLeft, count, lowestRow, makeLevel, neighbors, place, pushRow, trace, type BubbleLevel, type Grid, type Layout } from "./logic";

export interface Hud { shots: number; score: number; collected: number; dropIn: number }
export interface End { won: boolean; shotsLeft: number; score: number }
export interface Opts { level: BubbleLevel; images: Record<string, HTMLImageElement>; onHud: (h: Hud) => void; onEnd: (e: End) => void; sfx: (n: SfxName) => void; e2e: boolean }

const SQ3 = Math.sqrt(3);
type Img = PhaserNS.GameObjects.Image;

export function createBubble(Phaser: typeof PhaserNS, parent: HTMLElement, o: Opts): PhaserNS.Game {
  const LV = o.level;
  class Play extends Phaser.Scene {
    grid: Grid = []; parity = 0; L: Layout = { r: 20, ox: 0, oy: 56, parity: 0 };
    w = 0; h = 0; sx = 0; sy = 0; sprites = new Map<string, Img>();
    cur = 0; next = 0; curImg!: Img; nextImg!: Img; barrel!: PhaserNS.GameObjects.Rectangle; base!: PhaserNS.GameObjects.Arc;
    guide!: PhaserNS.GameObjects.Graphics; bg!: PhaserNS.GameObjects.Graphics; walls!: PhaserNS.GameObjects.Graphics; danger!: PhaserNS.GameObjects.Graphics;
    mascot!: Img; spark!: PhaserNS.GameObjects.Particles.ParticleEmitter;
    angle = 0; shots = LV.shots; score = 0; collected = 0; miss = 0; ended = false;
    flying: { img: Img; pts: { x: number; y: number }[]; seg: number; t: number; cell: [number, number]; color: number } | null = null;
    keys!: { left: PhaserNS.Input.Keyboard.Key; right: PhaserNS.Input.Keyboard.Key; a: PhaserNS.Input.Keyboard.Key; d: PhaserNS.Input.Keyboard.Key };
    aiming = false; rows = 10; dangerRow = 8;

    constructor() { super("play"); }

    create() {
      for (const [k, img] of Object.entries(o.images)) if (!this.textures.exists(k)) this.textures.addImage(k, img);
      // use the height we have: taller screens get more rows (min 9, max 12)
      const r0 = this.scale.width / (2 * COLS + 1); this.rows = Math.max(9, Math.min(12, Math.floor((this.scale.height - 52 - 4.6 * r0) / (SQ3 * r0)) + 1)); this.dangerRow = this.rows - 2;
      this.grid = makeLevel(LV.rows, this.rows, LV.colors);
      this.bg = this.add.graphics().setDepth(0); this.walls = this.add.graphics().setDepth(1); this.danger = this.add.graphics().setDepth(1); this.guide = this.add.graphics().setDepth(5);
      this.spark = this.add.particles(0, 0, "spark", { speed: { min: 90, max: 260 }, lifespan: 520, scale: { start: 0.55, end: 0 }, alpha: { start: 1, end: 0 }, emitting: false }).setDepth(30);
      this.mascot = this.add.image(0, 0, "holly").setDepth(4);
      this.base = this.add.circle(0, 0, 10, 0x174b3c).setStrokeStyle(5, 0xf4c95d).setDepth(6);
      this.barrel = this.add.rectangle(0, 0, 10, 10, 0xd94a4a).setOrigin(0.5, 1).setStrokeStyle(4, 0xa93434).setDepth(5);
      this.cur = this.pickColor(); this.next = this.pickColor();
      this.curImg = this.add.image(0, 0, `b${this.cur}`).setDepth(7); this.nextImg = this.add.image(0, 0, `b${this.next}`).setDepth(7).setInteractive({ useHandCursor: true });
      this.nextImg.on("pointerdown", (_p: unknown, _x: unknown, _y: unknown, e: { stopPropagation: () => void }) => { e.stopPropagation(); this.swap(); });

      this.layout(); this.scale.on("resize", () => this.layout());
      this.grid.forEach((row, r) => row.forEach((v, c) => { if (v >= 0) this.addSprite(r, c, v); }));
      this.reposition(false);

      this.input.on("pointerdown", (p: PhaserNS.Input.Pointer) => { if (this.ended || this.flying) return; this.aiming = true; this.aimAt(p); });
      this.input.on("pointermove", (p: PhaserNS.Input.Pointer) => { if (this.aiming && p.isDown) this.aimAt(p); });
      this.input.on("pointerup", (p: PhaserNS.Input.Pointer) => { if (!this.aiming) return; this.aiming = false; if (p.y < this.sy - this.L.r * 1.2) { this.aimAt(p); this.shoot(); } });
      const kb = this.input.keyboard!; this.keys = { left: kb.addKey("LEFT"), right: kb.addKey("RIGHT"), a: kb.addKey("A"), d: kb.addKey("D") };
      kb.addCapture("LEFT,RIGHT,SPACE"); kb.on("keydown-SPACE", () => this.shoot()); kb.on("keydown-ENTER", () => this.shoot());
      this.tweens.add({ targets: this.mascot, y: "-=6", yoyo: true, repeat: -1, duration: 900, ease: "Sine.inOut" });
      this.emitHud(); this.drawGuide();

      if (o.e2e) (window as unknown as { __wd: unknown }).__wd = {
        info: () => ({ shots: this.shots, score: this.score, ended: this.ended, flying: !!this.flying, bubbles: count(this.grid), cur: this.cur, angle: this.angle, collected: this.collected }),
        shoot: (a: number) => { this.angle = a; this.shoot(); },
        best: () => this.bestAngle(),
      };
      const cleanup = () => { this.scale.off("resize"); this.input.keyboard?.removeAllListeners(); if (o.e2e) delete (window as unknown as { __wd?: unknown }).__wd; };
      this.events.once("shutdown", cleanup); this.events.once("destroy", cleanup);
    }

    pickColor() { const left = colorsLeft(this.grid); return left.length ? left[Math.floor(Math.random() * left.length)]! : 0; }

    layout() {
      const w = this.scale.width, h = this.scale.height; this.w = w; this.h = h;
      const m = 52; const need = 1 + SQ3 * (this.rows - 1) + 4.6;
      const r = Math.max(14, Math.min(w / (2 * COLS + 1), (h - m) / need));
      this.L = { r, ox: (w - (2 * COLS + 1) * r) / 2, oy: m, parity: this.parity };
      this.sx = w / 2; this.sy = m + r + SQ3 * r * (this.rows - 1) + 3 * r;
      const bw = (2 * COLS + 1) * r, x0 = this.L.ox;
      this.bg.clear().fillGradientStyle(0x174b3c, 0x174b3c, 0x28664d, 0x28664d, 1).fillRect(0, 0, w, h);
      this.walls.clear().fillStyle(0xffffff, 0.08).fillRect(x0, m, bw, this.sy + r * 1.6 - m).lineStyle(4, 0xffffff, 0.35).strokeRect(x0, m, bw, this.sy + r * 1.6 - m);
      const dy = this.L.oy + r + SQ3 * r * this.dangerRow + r; this.danger.clear().lineStyle(3, 0xf4c95d, 0.7);
      for (let x = x0; x < x0 + bw; x += r * 1.2) this.danger.lineBetween(x, dy, x + r * 0.6, dy);
      this.base.setPosition(this.sx, this.sy).setRadius(r * 1.25); this.barrel.setPosition(this.sx, this.sy).setSize(r * 0.95, r * 2.5);
      this.curImg.setPosition(this.sx, this.sy).setDisplaySize(r * 1.9, r * 1.9);
      this.nextImg.setPosition(this.sx - r * 3.6, this.sy + r * 0.5).setDisplaySize(r * 1.4, r * 1.4);
      this.mascot.setPosition(Math.max(r * 1.8, x0 + r * 1.2), this.sy + r * 0.2).setDisplaySize(r * 3.4, r * 3.4);
      this.reposition(false);
    }

    addSprite(r: number, c: number, color: number) {
      const p = cellPos({ ...this.L, parity: this.parity }, r, c);
      const img = this.add.image(p.x, p.y, `b${color}`).setDisplaySize(this.L.r * 2, this.L.r * 2).setDepth(3);
      this.sprites.set(`${r},${c}`, img); return img;
    }
    reposition(animate: boolean) {
      const L = { ...this.L, parity: this.parity };
      for (const [k, img] of this.sprites) { const [r, c] = k.split(",").map(Number) as [number, number]; const p = cellPos(L, r, c); img.setDisplaySize(L.r * 2, L.r * 2); if (animate) this.tweens.add({ targets: img, x: p.x, y: p.y, duration: 220 }); else img.setPosition(p.x, p.y); }
    }

    emitHud() { o.onHud({ shots: this.shots, score: this.score, collected: this.collected, dropIn: LV.dropEvery - (this.miss % LV.dropEvery) }); }

    aimAt(p: { x: number; y: number }) {
      if (p.y > this.sy - this.L.r) return;
      this.angle = Phaser.Math.Clamp(Math.atan2(p.x - this.sx, this.sy - p.y), -1.3, 1.3); this.drawGuide();
    }

    drawGuide() {
      this.barrel.setRotation(this.angle); this.guide.clear();
      if (this.flying || this.ended) return;
      const L = { ...this.L, parity: this.parity }; const tr = trace(this.grid, L, this.sx, this.sy, this.angle, L.ox, L.ox + (2 * COLS + 1) * L.r);
      this.guide.fillStyle(0xfffdf7, 0.85); let acc = 0; const gap = L.r * 1.1;
      for (let i = 1; i < tr.pts.length; i++) { const a = tr.pts[i - 1]!, b = tr.pts[i]!; const d = Math.hypot(b.x - a.x, b.y - a.y); for (; acc < d; acc += gap) { this.guide.fillCircle(a.x + ((b.x - a.x) * acc) / d, a.y + ((b.y - a.y) * acc) / d, L.r * 0.16); } acc -= d; }
    }

    swap() { if (this.flying || this.ended) return; [this.cur, this.next] = [this.next, this.cur]; this.curImg.setTexture(`b${this.cur}`); this.nextImg.setTexture(`b${this.next}`); this.sfxTap(); }
    sfxTap() { o.sfx("tap"); }

    shoot() {
      if (this.flying || this.ended) return;
      const L = { ...this.L, parity: this.parity }; const tr = trace(this.grid, L, this.sx, this.sy, this.angle, L.ox, L.ox + (2 * COLS + 1) * L.r);
      if (!tr.cell) return;
      o.sfx("whoosh");
      const img = this.add.image(this.sx, this.sy, `b${this.cur}`).setDisplaySize(L.r * 2, L.r * 2).setDepth(8);
      this.flying = { img, pts: tr.pts, seg: 1, t: 0, cell: tr.cell, color: this.cur };
      this.cur = this.next; this.next = this.pickColor(); this.curImg.setTexture(`b${this.cur}`); this.nextImg.setTexture(`b${this.next}`); this.guide.clear();
    }

    /** Aim helper (also used by the E2E hook): the angle whose landing pops/drops the most. */
    bestAngle() {
      const L = { ...this.L, parity: this.parity }; let best = 0, score = -1;
      for (let a = -1.25; a <= 1.25; a += 0.01) {
        const tr = trace(this.grid, L, this.sx, this.sy, a, L.ox, L.ox + (2 * COLS + 1) * L.r); if (!tr.cell) continue;
        const g = this.grid.map((row) => row.slice()); const res = place(g, tr.cell[0], tr.cell[1], this.cur, this.parity);
        // no pop? prefer landing next to same-colour bubbles (builds a cluster for the next shot)
        const sameNb = res.popped.length ? 0 : neighbors(tr.cell[0], tr.cell[1], this.parity, this.rows).filter(([nr, nc]) => this.grid[nr]![nc] === this.cur).length;
        const s = res.popped.length * 3 + res.dropped.length + sameNb * 0.5 + (res.popped.length ? 0 : (10 - tr.cell[0]) * 0.01);
        if (s > score) { score = s; best = a; }
      }
      return best;
    }

    land() {
      const f = this.flying!; this.flying = null; const [r, c] = f.cell; const before = this.grid.map((row) => row.slice());
      const res = place(this.grid, r, c, f.color, this.parity);
      const pos = cellPos({ ...this.L, parity: this.parity }, r, c); f.img.setPosition(pos.x, pos.y);
      this.shots--;
      if (res.popped.length === 0) {
        this.sprites.set(`${r},${c}`, f.img.setDepth(3)); this.miss++; o.sfx("tap");
        this.tweens.add({ targets: f.img, scale: f.img.scale * 1.12, yoyo: true, duration: 90 });
      } else {
        this.miss = 0; o.sfx("pop"); this.time.delayedCall(90, () => o.sfx("match"));
        const gone = (r0: number, c0: number) => before[r0]![c0]!;
        const pop = (img: Img | undefined, x: number, y: number) => { this.spark.explode(5, x, y); if (img) this.tweens.add({ targets: img, scale: img.scale * 1.5, alpha: 0, duration: 130, onComplete: () => img.destroy() }); };
        for (const [pr, pc] of res.popped) { if (pr === r && pc === c) { pop(f.img, pos.x, pos.y); continue; } const k = `${pr},${pc}`; const img = this.sprites.get(k); this.sprites.delete(k); if (this.collectColor(gone(pr, pc))) this.collected++; pop(img, img?.x ?? 0, img?.y ?? 0); }
        if (this.collectColor(f.color)) this.collected++;
        for (const [dr, dc] of res.dropped) { const k = `${dr},${dc}`; const img = this.sprites.get(k); this.sprites.delete(k); if (this.collectColor(gone(dr, dc))) this.collected++; if (img) this.tweens.add({ targets: img, y: this.h + 60, alpha: 0.2, angle: Phaser.Math.Between(-90, 90), duration: 650, ease: "Quad.easeIn", onComplete: () => img.destroy() }); }
        if (res.dropped.length) this.time.delayedCall(220, () => o.sfx("bell"));
        this.score += res.popped.length * 10 + res.dropped.length * 20 + (res.popped.length > 3 ? (res.popped.length - 3) * 5 : 0);
        this.tweens.add({ targets: this.mascot, scale: this.mascot.scale * 1.18, yoyo: true, duration: 140 });
      }
      this.resolveState();
    }
    collectColor(color: number) { return LV.goal.kind === "collect" && LV.goal.color === color; }

    resolveState() {
      const won = LV.goal.kind === "clear" ? count(this.grid) === 0 : this.collected >= LV.goal.n;
      if (won) return this.finish(true);
      if (this.miss > 0 && this.miss % LV.dropEvery === 0) {
        this.parity = pushRow(this.grid, this.parity, LV.colors); this.L = { ...this.L, parity: this.parity };
        const old = new Map(this.sprites); this.sprites.clear(); for (const [k, img] of old) { const [r, c] = k.split(",").map(Number) as [number, number]; this.sprites.set(`${r + 1},${c}`, img); }
        for (let c = 0; c < COLS; c++) { const img = this.addSprite(0, c, this.grid[0]![c]!); img.setAlpha(0); this.tweens.add({ targets: img, alpha: 1, duration: 250 }); }
        this.reposition(true); o.sfx("error");
      }
      if (lowestRow(this.grid) >= this.dangerRow || this.shots <= 0) return this.finish(false);
      const left = colorsLeft(this.grid); if (!left.includes(this.cur) && left.length) { this.cur = left[0]!; this.curImg.setTexture(`b${this.cur}`); }
      this.emitHud(); this.drawGuide();
    }

    finish(won: boolean) { if (this.ended) return; this.ended = true; this.emitHud(); this.guide.clear(); this.time.delayedCall(won ? 700 : 500, () => o.onEnd({ won, shotsLeft: this.shots, score: this.score })); }

    update(_t: number, delta: number) {
      if (this.ended) return; const dt = Math.min(delta / 1000, 0.05);
      const f = this.flying;
      if (f) {
        let dist = this.L.r * 20 * dt;
        while (dist > 0 && f.seg < f.pts.length) {
          const a = f.pts[f.seg - 1]!, b = f.pts[f.seg]!; const len = Math.hypot(b.x - a.x, b.y - a.y) || 0.0001; const remain = len * (1 - f.t);
          if (dist >= remain) { dist -= remain; f.seg++; f.t = 0; } else { f.t += dist / len; dist = 0; }
        }
        if (f.seg >= f.pts.length) { this.land(); return; }
        const a = f.pts[f.seg - 1]!, b = f.pts[f.seg]!; f.img.setPosition(a.x + (b.x - a.x) * f.t, a.y + (b.y - a.y) * f.t);
        return;
      }
      const dir = (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0) - (this.keys.left.isDown || this.keys.a.isDown ? 1 : 0);
      if (dir) { this.angle = Phaser.Math.Clamp(this.angle + dir * 1.4 * dt, -1.3, 1.3); this.drawGuide(); }
    }
  }
  return new Phaser.Game({
    type: Phaser.CANVAS, parent, backgroundColor: "#174B3C", banner: false, audio: { noAudio: true }, disableContextMenu: true,
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth || 800, height: parent.clientHeight || 450 },
    input: { activePointers: 2 }, scene: Play,
  });
}
