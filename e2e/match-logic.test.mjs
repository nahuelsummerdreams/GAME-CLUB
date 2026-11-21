// Unit tests for the match-3 engine. Run: node e2e/match-logic.test.mjs
import assert from "node:assert/strict";
import { createBoard, findRuns, trySwap, resolve, findMove, reshuffle, activate, newGem, starsFor } from "../games/christmas-match/logic.ts";

let n = 0; const t = (name, fn) => { fn(); n++; console.log("PASS ", name); };
const R = 7, C = 7;
const seeded = (s) => () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const mk = (rows) => rows.flatMap((r) => r.split(" ").map((x) => newGem(Number(x))));

t("createBoard has no initial matches (200 seeds)", () => { for (let s = 1; s <= 200; s++) { const b = createBoard(R, C, 6, seeded(s)); assert.equal(findRuns(b, R, C).length, 0); assert.equal(b.length, 49); } });
t("findRuns detects horizontal & vertical 3", () => {
  const b = mk(["0 0 0 1 2 3 4", "1 2 3 4 5 0 1", "2 3 4 5 0 1 2", "3 4 5 0 1 2 3", "4 5 0 1 2 3 4", "5 0 1 2 3 4 5", "0 1 2 3 4 5 0"]);
  assert.equal(findRuns(b, R, C).length, 1);
  const v = mk(["0 1 2 3 4 5 0", "0 2 3 4 5 0 1", "0 3 4 5 0 1 2", "3 4 5 0 1 2 3", "4 5 0 1 2 3 4", "5 0 1 2 3 4 5", "1 2 3 4 5 0 1"]);
  const rs = findRuns(v, R, C); assert.equal(rs.length, 1); assert.equal(rs[0].dir, "v");
});
t("invalid swap is rejected and board unchanged", () => {
  const b = createBoard(R, C, 6, seeded(7)); const mv = findMove(b, R, C); assert.ok(mv);
  // swapping non-adjacent
  const r = trySwap(b, R, C, 6, 0, 2, seeded(1)); assert.equal(r.ok, false); assert.equal(r.board, b);
});
t("valid swap clears gems, refills board, keeps size, no leftover matches", () => {
  for (let s = 1; s <= 100; s++) {
    const rnd = seeded(s); const b = createBoard(R, C, 6, rnd); const mv = findMove(b, R, C); if (!mv) continue;
    const r = trySwap(b, R, C, 6, mv[0], mv[1], rnd);
    assert.ok(r.ok && r.frames.length >= 1); assert.equal(r.board.length, 49);
    assert.ok(r.board.every(Boolean), "no holes after refill");
    assert.equal(findRuns(r.board, R, C).length, 0);
    assert.ok(r.frames[0].cleared.length >= 3 && r.frames[0].gained >= 30);
  }
});
t("4-in-a-row creates a line special; 5 creates rainbow", () => {
  const b = mk(["0 0 1 0 2 3 4", "1 2 0 4 5 1 2", "2 3 4 5 1 2 3", "3 4 5 1 2 3 4", "4 5 1 2 3 4 5", "5 1 2 3 4 5 1", "1 2 3 4 5 1 2"]);
  const r = trySwap(b, R, C, 6, 2, 9, seeded(3)); // bring a 0 up from row 1 col 2 to row 0 col 2
  assert.ok(r.ok); assert.equal(r.frames[0].created.length, 1);
  assert.ok(r.board.some((g) => g && g.s === "h"), "h special exists");
  const b5 = mk(["0 0 1 0 0 3 4", "1 2 0 4 5 1 2", "2 3 4 5 1 2 3", "3 4 5 1 2 3 4", "4 5 1 2 3 4 5", "5 1 2 3 4 5 1", "1 2 3 4 5 1 2"]);
  const r5 = trySwap(b5, R, C, 6, 2, 9, seeded(3)); assert.ok(r5.ok); assert.ok(r5.board.some((g) => g && g.s === "rainbow"));
});
t("special activation: row/col/bomb/rainbow expand clear set", () => {
  const b = createBoard(R, C, 6, seeded(9));
  b[24] = { ...b[24], s: "h" }; assert.equal(activate(b, R, C, new Set([24])).size, 7);
  b[24] = { ...b[24], s: "v" }; assert.equal(activate(b, R, C, new Set([24])).size, 7);
  b[24] = { ...b[24], s: "bomb" }; assert.equal(activate(b, R, C, new Set([24])).size, 9);
  b[24] = { ...b[24], s: "rainbow" }; assert.equal(activate(b, R, C, new Set([24])).size, 49);
});
t("rainbow swap clears every gem of that color", () => {
  const b = createBoard(R, C, 6, seeded(11)); b[0] = newGem(0, "rainbow"); const target = b[1].t;
  const count = b.filter((g) => g.t === target).length;
  const r = trySwap(b, R, C, 6, 0, 1, seeded(2)); assert.ok(r.ok);
  assert.ok(r.frames[0].cleared.length >= count);
});
t("reshuffle yields a playable board", () => { for (let s = 1; s <= 50; s++) { const rb = reshuffle(createBoard(R, C, 6, seeded(s)), R, C, seeded(s + 1)); assert.equal(findRuns(rb, R, C).length, 0); assert.ok(findMove(rb, R, C)); } });
t("stars thresholds", () => { assert.equal(starsFor(10, 20), 3); assert.equal(starsFor(4, 20), 2); assert.equal(starsFor(0, 20), 1); });
console.log(`\n${n} tests passed`);
