export type CosmeticSlot = "hat" | "scarf" | "ornament" | "decoration" | "accessory" | "background";

export interface Cosmetic {
  id: string;
  slot: CosmeticSlot;
  name: string;
  cost: number; // Wonder Stars (never real money)
}

export type BadgeId =
  | "christmas-explorer"
  | "santa-helper"
  | "reindeer-champion"
  | "puzzle-master"
  | "christmas-badge";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
}
