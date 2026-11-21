import type { ArtId } from "@/assets/objects/art";
import { shuffle } from "@/lib/game-engine/useFit";

export type Difficulty = "easy" | "medium" | "hard";
export const LEVELS: Record<Difficulty, { pairs: number; cols: number; rows: number; seconds: number; label: string }> = {
  easy: { pairs: 6, cols: 4, rows: 3, seconds: 60, label: "EASY" },
  medium: { pairs: 8, cols: 4, rows: 4, seconds: 90, label: "MEDIUM" },
  hard: { pairs: 12, cols: 6, rows: 4, seconds: 150, label: "HARD" },
};

export interface Symbol { art: ArtId; color: string }
export const SYMBOLS: Symbol[] = [
  { art: "bell", color: "" }, { art: "gift", color: "#D94A4A" }, { art: "star", color: "" }, { art: "candycane", color: "" },
  { art: "snowflake", color: "" }, { art: "ornament", color: "#5B9BD5" }, { art: "tree", color: "" }, { art: "cookie", color: "" },
  { art: "sock", color: "" }, { art: "wreath", color: "" }, { art: "mitten", color: "" }, { art: "candle", color: "" },
];

export interface Card { id: number; sym: number }

export function buildDeck(pairs: number, rnd: () => number = Math.random): Card[] {
  const syms = shuffle(SYMBOLS.map((_, i) => i), rnd).slice(0, pairs);
  return shuffle([...syms, ...syms], rnd).map((sym, id) => ({ id, sym }));
}

export const starsFor = (moves: number, pairs: number): 1 | 2 | 3 => (moves <= Math.ceil(pairs * 1.5) ? 3 : moves <= pairs * 2.5 ? 2 : 1);

export const scoreFor = (moves: number, pairs: number, secondsLeft: number | null): number =>
  Math.max(50, pairs * 100 - Math.max(0, moves - pairs) * 10 + (secondsLeft ?? 0) * 2);
