import type { GameManifest } from "@/types/game";

export const christmasMemory: GameManifest = {
  slug: "christmas-memory", title: "Christmas Memory", zone: "christmas-square", category: "memory", music: "village",
  tagline: "Find every matching pair!", hero: "holly",
  howTo: ["Tap a card to flip it.", "Find two that match.", "Match them all to win!"],
  load: () => import("./Game"),
};
