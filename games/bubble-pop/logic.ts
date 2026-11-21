/** Pure hex-grid bubble engine. No imports → testable with plain Node. */
export const COLS = 9;
export type Grid = number[][]; // -1 = empty
export interface Layout { r: number; ox: number; oy: number; parity: number }

const SQ3 = Math.sqrt(3);
export const shifted = (row: number, parity: number) => (row + parity) % 2 === 1;

export const emptyGrid = (rows: number): Grid => Array.from({ length: rows }, () => Array(COLS).fill(-1));

export function cellPos(L: Layout, row: number, col: number) {
  return { x: L.ox + L.r + col * 2 * L.r + (shifted(row, L.parity) ? L.r : 0), y: L.oy + L.r + row * SQ3 * L.r };
}

export function neighbors(row: number, col: number, parity: number, rows: number): [number, number][] {
  const d = shifted(row, parity)
    ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
    : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
  return d.map(([dr, dc]) => [row + dr!, col + dc!] as [number, number]).filter(([r, c]) => r >= 0 && r < rows && c >= 0 && c < COLS);
}

export function cluster(g: Grid, row: number, col: number, parity: number): [number, number][] {
  const color = g[row]![col]!; if (color < 0) return [];
  const seen = new Set<string>([`${row},${col}`]); const out: [number, number][] = []; const q: [number, number][] = [[row, col]];
  while (q.length) {
    const [r, c] = q.pop()!; out.push([r, c]);
    for (const [nr, nc] of neighbors(r, c, parity, g.length)) { const k = `${nr},${nc}`; if (!seen.has(k) && g[nr]![nc] === color) { seen.add(k); q.push([nr, nc]); } }
  }
  return out;
}

/** Bubbles not connected (through neighbours) to the ceiling row. */
export function floating(g: Grid, parity: number): [number, number][] {
  const ok = new Set<string>(); const q: [number, number][] = [];
  for (let c = 0; c < COLS; c++) if (g[0]![c]! >= 0) { ok.add(`0,${c}`); q.push([0, c]); }
  while (q.length) { const [r, c] = q.pop()!; for (const [nr, nc] of neighbors(r, c, parity, g.length)) { const k = `${nr},${nc}`; if (!ok.has(k) && g[nr]![nc]! >= 0) { ok.add(k); q.push([nr, nc]); } } }
  const out: [number, number][] = [];
  g.forEach((row, r) => row.forEach((v, c) => { if (v >= 0 && !ok.has(`${r},${c}`)) out.push([r, c]); }));
  return out;
}

export const count = (g: Grid) => g.reduce((n, row) => n + row.filter((v) => v >= 0).length, 0);
export const lowestRow = (g: Grid) => { for (let r = g.length - 1; r >= 0; r--) if (g[r]!.some((v) => v >= 0)) return r; return -1; };

/** Closest empty cell (touching the ceiling or a bubble) to a point. */
export function snap(g: Grid, L: Layout, x: number, y: number): [number, number] | null {
  let best: [number, number] | null = null; let bd = Infinity;
  for (let r = 0; r < g.length; r++) for (let c = 0; c < COLS; c++) {
    if (g[r]![c]! >= 0) continue;
    const touches = r === 0 || neighbors(r, c, L.parity, g.length).some(([nr, nc]) => g[nr]![nc]! >= 0);
    if (!touches) continue;
    const p = cellPos(L, r, c); const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bd) { bd = d; best = [r, c]; }
  }
  return best;
}

export interface Trace { pts: { x: number; y: number }[]; cell: [number, number] | null; x: number; y: number }

/** Straight flight with wall bounces until it hits the ceiling or a bubble. */
export function trace(g: Grid, L: Layout, x0: number, y0: number, angle: number, minX: number, maxX: number): Trace {
  const r = L.r; const step = r * 0.4;
  let x = x0, y = y0; let vx = Math.sin(angle), vy = -Math.cos(angle);
  const pts = [{ x, y }];
  for (let i = 0; i < 4000; i++) {
    x += vx * step; y += vy * step;
    if (x < minX + r) { x = minX + r + (minX + r - x); vx = -vx; pts.push({ x, y }); } else if (x > maxX - r) { x = maxX - r - (x - (maxX - r)); vx = -vx; pts.push({ x, y }); }
    let hit = y <= L.oy + r;
    if (!hit) outer: for (let rr = 0; rr < g.length; rr++) for (let c = 0; c < COLS; c++) { if (g[rr]![c]! < 0) continue; const p = cellPos(L, rr, c); if ((p.x - x) ** 2 + (p.y - y) ** 2 < (r * 1.75) ** 2) { hit = true; break outer; } }
    if (hit) { pts.push({ x, y }); return { pts, cell: snap(g, L, x, y), x, y }; }
  }
  return { pts, cell: null, x, y };
}

export interface Resolved { popped: [number, number][]; dropped: [number, number][] }

/** Place a bubble and resolve pops/drops. Mutates `g`. */
export function place(g: Grid, row: number, col: number, color: number, parity: number): Resolved {
  g[row]![col] = color;
  const cl = cluster(g, row, col, parity);
  if (cl.length < 3) return { popped: [], dropped: [] };
  cl.forEach(([r, c]) => { g[r]![c] = -1; });
  const fl = floating(g, parity); fl.forEach(([r, c]) => { g[r]![c] = -1; });
  return { popped: cl, dropped: fl };
}

/** Insert a fresh row at the top (everything moves down); returns new parity. */
export function pushRow(g: Grid, parity: number, colors: number, rnd: () => number = Math.random): number {
  g.unshift(Array.from({ length: COLS }, () => Math.floor(rnd() * colors))); g.pop();
  return (parity + 1) % 2;
}

export function makeLevel(rows: number, total: number, colors: number, rnd: () => number = Math.random): Grid {
  const g = emptyGrid(total);
  for (let r = 0; r < rows; r++) for (let c = 0; c < COLS; c++) g[r]![c] = Math.floor(rnd() * colors);
  return g;
}

export const colorsLeft = (g: Grid): number[] => [...new Set(g.flat().filter((v) => v >= 0))];

export interface BubbleLevel { rows: number; colors: number; shots: number; goal: { kind: "clear" } | { kind: "collect"; color: number; n: number }; dropEvery: number }
export const LEVELS: BubbleLevel[] = [
  { rows: 4, colors: 3, shots: 36, goal: { kind: "clear" }, dropEvery: 8 },
  { rows: 5, colors: 4, shots: 36, goal: { kind: "collect", color: 0, n: 12 }, dropEvery: 7 },
  { rows: 6, colors: 4, shots: 38, goal: { kind: "clear" }, dropEvery: 7 },
  { rows: 6, colors: 5, shots: 40, goal: { kind: "collect", color: 1, n: 14 }, dropEvery: 6 },
];
export const starsFor = (left: number, total: number): 1 | 2 | 3 => (left >= total * 0.4 ? 3 : left >= total * 0.15 ? 2 : 1);
