import type { ArtId } from "@/assets/objects/art";
import { PALETTE as P } from "@/assets/objects/art";

export type Cat = "cuddly" | "fun" | "machines";
export const TOYS: { id: ArtId; name: string; cat: Cat }[] = [
  { id: "bear", name: "Teddy bear", cat: "cuddly" }, { id: "duck", name: "Rubber duck", cat: "cuddly" },
  { id: "ball", name: "Ball", cat: "fun" }, { id: "drum", name: "Drum", cat: "fun" },
  { id: "train", name: "Toy train", cat: "machines" }, { id: "robot", name: "Robot", cat: "machines" },
];
export const BINS: { id: Cat; name: string; color: string }[] = [
  { id: "cuddly", name: "Cuddly", color: P.candy }, { id: "fun", name: "Fun & games", color: P.gold }, { id: "machines", name: "Machines", color: P.ice },
];
export interface Opt { id: string; name: string; c: string; special?: boolean }
export const PAPERS: Opt[] = [
  { id: "red", name: "Red paper", c: P.red }, { id: "green", name: "Green paper", c: "#3C9A6B" }, { id: "blue", name: "Blue paper", c: P.blue }, { id: "gold", name: "Gold paper", c: P.gold },
  { id: "silver", name: "Silver paper", c: "#C9D3D7", special: true }, { id: "candy", name: "Candy paper", c: P.candy, special: true },
];
export const BOWS: Opt[] = [
  { id: "red", name: "Red bow", c: P.redDeep }, { id: "gold", name: "Gold bow", c: P.goldDeep }, { id: "blue", name: "Blue bow", c: "#3E78B2" }, { id: "star", name: "Star bow", c: P.purple, special: true },
];
export const NAMES = ["Emma", "Leo", "Mia", "Noah", "Zoe", "Max"];

export interface Order { toy: number; paper: string; bow: string; name: string }
const pick = <T,>(a: T[], rnd: () => number) => a[Math.floor(rnd() * a.length)]!;

export function makeOrders(n: number, special: boolean, rnd: () => number = Math.random): Order[] {
  const papers = PAPERS.filter((p) => special ? p.special || p.id === "gold" : !p.special); const bows = BOWS.filter((b) => special ? b.special || b.id === "gold" : !b.special);
  const out: Order[] = []; let lastToy = -1;
  for (let i = 0; i < n; i++) { let toy = Math.floor(rnd() * TOYS.length); if (toy === lastToy) toy = (toy + 1) % TOYS.length; lastToy = toy; out.push({ toy, paper: pick(papers, rnd).id, bow: pick(bows, rnd).id, name: NAMES[(i * 2 + Math.floor(rnd() * 2)) % NAMES.length]! }); }
  return out;
}

export interface PackOrder { need: Record<number, number> }
export function makePackOrders(n: number, rnd: () => number = Math.random): PackOrder[] {
  return Array.from({ length: n }, (_, i) => { const need: Record<number, number> = {}; const kinds = 2 + (i > 0 ? 1 : 0); while (Object.keys(need).length < kinds) { const t = Math.floor(rnd() * TOYS.length); need[t] = (need[t] ?? 0) + 1 + (rnd() < 0.4 ? 1 : 0); } return { need }; });
}

export const starsFor = (mistakes: number): 1 | 2 | 3 => (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);
export const scoreFor = (level: number, mistakes: number, secs: number, timed: boolean) => Math.max(50, 300 + level * 100 - mistakes * 25 + (timed ? Math.max(0, 90 - secs) * 3 : 0));
