import type { GameManifest } from "@/types/game";

export const snowmanBuilder: GameManifest = {
  slug: "snowman-builder", title: "Build a Snowman", zone: "snowy-mountains", category: "creative", music: "village",
  tagline: "Invent your own snowy friend!", hero: "snowy",
  howTo: ["Pick a body size.", "Tap eyes, hats and more to add them.", "Drag any part to move it!"],
  load: () => import("./Game"),
};
