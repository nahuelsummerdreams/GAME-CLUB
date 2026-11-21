/** Pure match-3 engine. No imports so it can be unit-tested with plain Node. */
export type Special = "h" | "v" | "bomb" | "rainbow";
export interface Gem { id: number; t: number; s?: Special }
export type Board = (Gem | null)[];
export type Rnd = () => number;

export interface Frame {
  cleared: { idx: number; gem: Gem }[];
  after: Board;
  gained: number;
  collected: Record<number, number>;
  cascade: number;
  created: number[];
}

let uid = 1;
export const newGem = (t: number, s?: Special): Gem => ({ id: uid++, t, s });

const wouldMatch = (b: Board, i: number, t: number, cols: number) => {
  const x = i % cols;
  if (x >= 2 && b[i - 1]?.t === t && b[i - 2]?.t === t) return true;
  if (i >= cols * 2 && b[i - cols]?.t === t && b[i - cols * 2]?.t === t) return true;
  return false;
};

export function createBoard(rows: number, cols: number, types: number, rnd: Rnd = Math.random): Board {
  const b: Board = [];
  for (let i = 0; i < rows * cols; i++) {
    let t = Math.floor(rnd() * types);
    while (wouldMatch(b, i, t, cols)) t = Math.floor(rnd() * types);
    b.push(newGem(t));
  }
  return b;
}

interface Run { cells: number[]; dir: "h" | "v"; t: number }

export function findRuns(b: Board, rows: number, cols: number): Run[] {
  const runs: Run[] = [];
  const ok = (g: Gem | null | undefined): g is Gem => !!g && g.s !== "rainbow";
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const g = b[r * cols + c]; let e = c + 1;
      if (ok(g)) { while (e < cols && ok(b[r * cols + e]) && b[r * cols + e]!.t === g.t) e++; if (e - c >= 3) runs.push({ cells: Array.from({ length: e - c }, (_, k) => r * cols + c + k), dir: "h", t: g.t }); }
      c = Math.max(e, c + 1);
    }
  }
  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const g = b[r * cols + c]; let e = r + 1;
      if (ok(g)) { while (e < rows && ok(b[e * cols + c]) && b[e * cols + c]!.t === g.t) e++; if (e - r >= 3) runs.push({ cells: Array.from({ length: e - r }, (_, k) => (r + k) * cols + c), dir: "v", t: g.t }); }
      r = Math.max(e, r + 1);
    }
  }
  return runs;
}

/** Expand a clear-set with special gems' effects (chain reactions). */
export function activate(b: Board, rows: number, cols: number, set: Set<number>): Set<number> {
  const out = new Set(set); const queue = [...set]; const seen = new Set<number>();
  while (queue.length) {
    const i = queue.pop()!; if (seen.has(i)) continue; seen.add(i);
    const g = b[i]; if (!g?.s) continue;
    const r = Math.floor(i / cols), c = i % cols; const add = (k: number) => { if (!out.has(k)) { out.add(k); queue.push(k); } };
    if (g.s === "h") { for (let x = 0; x < cols; x++) add(r * cols + x); }
    else if (g.s === "v") { for (let y = 0; y < rows; y++) add(y * cols + c); }
    else if (g.s === "bomb") { for (let y = r - 1; y <= r + 1; y++) for (let x = c - 1; x <= c + 1; x++) if (y >= 0 && y < rows && x >= 0 && x < cols) add(y * cols + x); }
    else if (g.s === "rainbow") { for (let k = 0; k < b.length; k++) add(k); }
  }
  return out;
}

function planSpecials(runs: Run[], pref: number[]): Map<number, Special> {
  const specials = new Map<number, Special>();
  const hits = new Map<number, Run[]>();
  runs.forEach((r) => r.cells.forEach((i) => hits.set(i, [...(hits.get(i) ?? []), r])));
  for (const [i, rs] of hits) if (rs.some((r) => r.dir === "h") && rs.some((r) => r.dir === "v")) specials.set(i, "bomb");
  for (const r of runs) {
    if (r.cells.length < 4) continue;
    if (r.cells.some((i) => specials.has(i))) continue;
    const pivot = r.cells.find((i) => pref.includes(i)) ?? r.cells[Math.floor(r.cells.length / 2)]!;
    specials.set(pivot, r.cells.length >= 5 ? "rainbow" : r.dir === "h" ? "h" : "v");
  }
  return specials;
}

function gravity(b: Board, rows: number, cols: number, types: number, rnd: Rnd): void {
  for (let c = 0; c < cols; c++) {
    let write = rows - 1;
    for (let r = rows - 1; r >= 0; r--) { const g = b[r * cols + c]; if (g) { b[write * cols + c] = g; if (write !== r) b[r * cols + c] = null; write--; } }
    for (let r = write; r >= 0; r--) b[r * cols + c] = newGem(Math.floor(rnd() * types));
  }
}

/** Resolves all matches/cascades. `forced` = explicit clear set (rainbow swaps). */
export function resolve(b: Board, rows: number, cols: number, types: number, rnd: Rnd, pref: number[] = [], forced?: Set<number>): Frame[] {
  const frames: Frame[] = []; let cascade = 0; let force = forced;
  for (;;) {
    let toClear: Set<number>; let specials = new Map<number, Special>();
    if (force) { toClear = activate(b, rows, cols, force); force = undefined; }
    else {
      const runs = findRuns(b, rows, cols); if (!runs.length) break;
      toClear = new Set(runs.flatMap((r) => r.cells)); specials = planSpecials(runs, cascade === 0 ? pref : []);
      toClear = activate(b, rows, cols, toClear);
    }
    const cleared: Frame["cleared"] = []; const collected: Record<number, number> = {};
    for (const i of toClear) {
      const g = b[i]; if (!g) continue;
      if (specials.has(i)) { b[i] = { ...g, s: specials.get(i) }; continue; }
      cleared.push({ idx: i, gem: g }); collected[g.t] = (collected[g.t] ?? 0) + 1; b[i] = null;
    }
    const gained = Math.round(cleared.length * 10 * (1 + cascade * 0.5)) + specials.size * 20;
    gravity(b, rows, cols, types, rnd);
    frames.push({ cleared, after: [...b], gained, collected, cascade, created: [...specials.keys()] });
    cascade++;
  }
  return frames;
}

export interface SwapResult { ok: boolean; frames: Frame[]; board: Board }

export function trySwap(board: Board, rows: number, cols: number, types: number, a: number, b: number, rnd: Rnd = Math.random): SwapResult {
  const adj = Math.abs(a - b) === cols || (Math.abs(a - b) === 1 && Math.floor(a / cols) === Math.floor(b / cols));
  const ga = board[a], gb = board[b];
  if (!adj || !ga || !gb) return { ok: false, frames: [], board };
  const next = [...board]; [next[a], next[b]] = [gb, ga];
  if (ga.s === "rainbow" || gb.s === "rainbow") {
    const set = new Set<number>([a, b]);
    const other = ga.s === "rainbow" ? gb : ga;
    if (other.s === "rainbow") next.forEach((_, i) => set.add(i));
    else next.forEach((g, i) => { if (g && g.t === other.t) set.add(i); });
    const frames = resolve(next, rows, cols, types, rnd, [], set);
    return { ok: true, frames: [...frames, ...resolve(next, rows, cols, types, rnd)], board: next };
  }
  if (!findRuns(next, rows, cols).length) return { ok: false, frames: [], board };
  return { ok: true, frames: resolve(next, rows, cols, types, rnd, [a, b]), board: next };
}

export function findMove(board: Board, rows: number, cols: number): [number, number] | null {
  for (let i = 0; i < board.length; i++) {
    for (const j of [i + 1, i + cols]) {
      if (j >= board.length || (j === i + 1 && (i % cols) === cols - 1)) continue;
      const g = board[i], h = board[j]; if (!g || !h) continue;
      if (g.s === "rainbow" || h.s === "rainbow") return [i, j];
      const n = [...board]; [n[i], n[j]] = [h, g];
      if (findRuns(n, rows, cols).length) return [i, j];
    }
  }
  return null;
}

/** Reshuffle gems (keeping specials) until the board has a move and no pending matches. */
export function reshuffle(board: Board, rows: number, cols: number, rnd: Rnd = Math.random): Board {
  const gems = board.filter(Boolean) as Gem[];
  for (let tries = 0; tries < 200; tries++) {
    const a = [...gems]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
    if (!findRuns(a, rows, cols).length && findMove(a, rows, cols)) return a;
  }
  return createBoard(rows, cols, 6, rnd);
}

export interface Level { moves: number; goal: { kind: "score"; target: number } | { kind: "collect"; type: number; target: number } }
export const LEVELS: Level[] = [
  { moves: 20, goal: { kind: "score", target: 500 } },
  { moves: 20, goal: { kind: "collect", type: 2, target: 14 } },
  { moves: 22, goal: { kind: "score", target: 900 } },
  { moves: 22, goal: { kind: "collect", type: 1, target: 18 } },
  { moves: 24, goal: { kind: "score", target: 1400 } },
  { moves: 24, goal: { kind: "collect", type: 4, target: 24 } },
];
export const starsFor = (movesLeft: number, total: number): 1 | 2 | 3 => (movesLeft >= total * 0.4 ? 3 : movesLeft >= total * 0.15 ? 2 : 1);
