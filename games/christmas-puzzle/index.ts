import type { GameManifest } from "@/types/game";

export const christmasPuzzle: GameManifest = {
  slug: "christmas-puzzle", title: "Christmas Puzzle", zone: "santas-house", category: "puzzle", music: "village",
  tagline: "Build a cozy Christmas picture.", hero: "santa",
  howTo: ["Drag a piece onto the board.", "Or tap a piece, then tap a spot.", "Fill every spot to finish!"],
  load: () => import("./Game"),
};
