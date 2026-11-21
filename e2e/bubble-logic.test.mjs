// Unit tests for the bubble engine. Run: node e2e/bubble-logic.test.mjs
import assert from "node:assert/strict";
import { COLS, emptyGrid, cellPos, neighbors, cluster, floating, place, snap, trace, pushRow, makeLevel, count, lowestRow, shifted } from "../games/bubble-pop/logic.ts";
let n = 0; const t = (name, fn) => { fn(); n++; console.log("PASS ", name); };
const L = { r: 20, ox: 0, oy: 0, parity: 0 };
const seeded = (s) => () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);

t("neighbors are symmetric on both parities", () => { for (const parity of [0, 1]) for (let r = 0; r < 6; r++) for (let c = 0; c < COLS; c++) for (const [nr, nc] of neighbors(r, c, parity, 6)) assert.ok(neighbors(nr, nc, parity, 6).some(([a, b]) => a === r && b === c), `asym ${r},${c}->${nr},${nc} p${parity}`); });
t("neighbour distance equals 2r in pixel space", () => { for (const parity of [0, 1]) { const l = { ...L, parity }; for (let r = 1; r < 5; r++) for (let c = 1; c < 7; c++) { const a = cellPos(l, r, c); for (const [nr, nc] of neighbors(r, c, parity, 6)) { const b = cellPos(l, nr, nc); assert.ok(Math.abs(Math.hypot(a.x - b.x, a.y - b.y) - 40) < 0.001); } } } });
t("cluster finds connected same colour only", () => { const g = emptyGrid(5); g[0][0] = g[0][1] = g[1][0] = 2; g[0][5] = 2; assert.equal(cluster(g, 0, 0, 0).length, 3); assert.equal(cluster(g, 0, 5, 0).length, 1); });
t("3+ cluster pops, <3 stays", () => { const g = emptyGrid(5); g[0][0] = g[0][1] = 1; assert.equal(place(g, 1, 0, 2, 0).popped.length, 0); const g2 = emptyGrid(5); g2[0][0] = g2[0][1] = 1; assert.equal(place(g2, 0, 2, 1, 0).popped.length, 3); assert.equal(count(g2), 0); });
t("floating bubbles drop after support pops", () => { const g = emptyGrid(6); g[0][0] = g[0][1] = 1; g[1][0] = 3; g[2][0] = 4; const res = place(g, 0, 2, 1, 0); assert.equal(res.popped.length, 3); assert.equal(res.dropped.length, 2); assert.equal(count(g), 0); });
t("anchored bubbles never float", () => { const g = makeLevel(4, 12, 3, seeded(3)); assert.equal(floating(g, 0).length, 0); });
t("snap picks an empty cell touching the ceiling/bubble", () => { const g = emptyGrid(6); g[0][4] = 1; const [r, c] = snap(g, L, cellPos(L, 1, 4).x, 70); assert.equal(g[r][c], -1); assert.ok(r === 0 || neighbors(r, c, 0, 6).some(([a, b]) => g[a][b] >= 0)); });
t("trace ends at a valid cell, bounces off walls", () => {
  const g = makeLevel(4, 12, 3, seeded(5)); const W = (2 * COLS + 1) * L.r; const tr = trace(g, L, W / 2, 400, 0.9, 0, W);
  assert.ok(tr.cell && g[tr.cell[0]][tr.cell[1]] === -1); assert.ok(tr.pts.every((p) => p.x >= 0 && p.x <= W));
  const xs = tr.pts.map((p) => p.x); assert.ok(Math.max(...xs) > W - 2 * L.r, "reaches wall");
});
t("straight-up shot hits the ceiling in the correct column", () => { const g = emptyGrid(8); const W = (2 * COLS + 1) * L.r; const tr = trace(g, L, W / 2, 500, 0, 0, W); assert.equal(tr.cell[0], 0); });
t("pushRow shifts rows, flips parity and keeps size", () => { const g = makeLevel(3, 10, 3, seeded(2)); const before = g[0].slice(); const p = pushRow(g, 0, 3, seeded(9)); assert.equal(p, 1); assert.equal(g.length, 10); assert.deepEqual(g[1], before); assert.ok(g[0].every((v) => v >= 0)); });
t("visual x of a bubble is unchanged by pushRow (parity flip)", () => { const g = makeLevel(2, 8, 3, seeded(2)); const a = cellPos({ ...L, parity: 0 }, 0, 3); const p = pushRow(g, 0, 3); const b = cellPos({ ...L, parity: p }, 1, 3); assert.equal(a.x, b.x); });
t("lowestRow", () => { const g = emptyGrid(6); assert.equal(lowestRow(g), -1); g[3][2] = 1; assert.equal(lowestRow(g), 3); });
console.log(`\n${n} tests passed`);
