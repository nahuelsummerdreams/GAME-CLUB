import type { GameManifest } from "@/types/game";

export const treeDecoration: GameManifest = {
  slug: "tree-decoration", title: "Decorate the Tree", zone: "christmas-square", category: "creative", music: "village",
  tagline: "Make the coziest tree ever!", hero: "holly",
  howTo: ["Tap a decoration to add it.", "Drag it anywhere on the tree.", "Tap DONE to save your tree!"],
  load: () => import("./Game"),
};
