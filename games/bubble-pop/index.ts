import type { GameManifest } from "@/types/game";

export const bubblePop: GameManifest = {
  slug: "bubble-pop", title: "Christmas Bubble Pop", zone: "candy-land", category: "arcade", music: "candy",
  tagline: "Match 3 colors to pop the ornaments!", hero: "holly",
  howTo: ["Drag to aim, let go to shoot.", "Match 3 or more of the same color.", "Pop everything before the shots run out!"],
  load: () => import("./Game"),
};
