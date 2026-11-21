import type { GameManifest } from "@/types/game";

export const christmasMatch: GameManifest = {
  slug: "christmas-match", title: "Christmas Match", zone: "candy-land", category: "puzzle", music: "candy",
  tagline: "Match sparkly Christmas treats!", hero: "ginger",
  howTo: ["Swipe or tap to swap neighbors.", "Match 3 or more in a row.", "Match 4 or 5 for power-ups!"],
  load: () => import("./Game"),
};
