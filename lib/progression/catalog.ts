import type { Badge, Cosmetic } from "@/types/rewards";

export const COSMETICS: Cosmetic[] = [
  { id: "hat-beanie", slot: "hat", name: "Cozy Beanie", cost: 10 },
  { id: "hat-top", slot: "hat", name: "Top Hat", cost: 15 },
  { id: "hat-crown", slot: "hat", name: "Star Crown", cost: 20 },
  { id: "scarf-candy", slot: "scarf", name: "Candy Scarf", cost: 10 },
  { id: "scarf-ice", slot: "scarf", name: "Ice Scarf", cost: 8 },
  { id: "acc-glasses", slot: "accessory", name: "Star Glasses", cost: 12 },
  { id: "acc-bow", slot: "accessory", name: "Gift Bow", cost: 8 },
  { id: "orn-heart", slot: "ornament", name: "Heart Ornament", cost: 10 },
  { id: "orn-star", slot: "ornament", name: "Shooting Star", cost: 12 },
  { id: "dec-rainbow", slot: "decoration", name: "Rainbow Lights", cost: 15 },
  { id: "bg-aurora", slot: "background", name: "Aurora Night", cost: 20 },
  { id: "bg-cozy", slot: "background", name: "Cozy Room", cost: 15 },
];

export const BADGES: Badge[] = [
  { id: "christmas-badge", name: "Christmas Badge", description: "Play your first game" },
  { id: "christmas-explorer", name: "Christmas Explorer", description: "Try 4 different games" },
  { id: "santa-helper", name: "Santa Helper", description: "Earn 2 stars helping Santa" },
  { id: "reindeer-champion", name: "Reindeer Champion", description: "Perfect sleigh delivery" },
  { id: "puzzle-master", name: "Puzzle Master", description: "3 stars on a Christmas Puzzle" },
];

export const getCosmetic = (id: string) => COSMETICS.find((c) => c.id === id);
