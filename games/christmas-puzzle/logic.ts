import { shuffle } from "@/lib/game-engine/useFit";

export const SIZES = [3, 4, 5, 6] as const; // 9, 16, 25, 36 pieces
export type Size = (typeof SIZES)[number];

/** Tray order: never already in solved order. */
export function trayOrder(n: number, rnd: () => number = Math.random): number[] {
  const ids = Array.from({ length: n * n }, (_, i) => i);
  let out = shuffle(ids, rnd);
  if (out.every((v, i) => v === i)) out = [...out.slice(1), out[0]!];
  return out;
}

export const starsFor = (mistakes: number, pieces: number): 1 | 2 | 3 => (mistakes <= Math.floor(pieces * 0.2) ? 3 : mistakes <= Math.floor(pieces * 0.7) ? 2 : 1);
export const scoreFor = (pieces: number, mistakes: number, seconds: number, timed: boolean) =>
  Math.max(50, pieces * 100 - mistakes * 15 + (timed ? Math.max(0, pieces * 12 - seconds) * 2 : 0));
