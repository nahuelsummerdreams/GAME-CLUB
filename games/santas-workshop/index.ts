import type { GameManifest } from "@/types/game";

export const santasWorkshop: GameManifest = {
  slug: "santas-workshop", title: "Santa's Workshop", zone: "santas-workshop", category: "simulation", music: "workshop",
  tagline: "Get every gift ready for Christmas Eve!", hero: "holly",
  howTo: ["Read the order card.", "Pick the toy, paper, bow and tag.", "Send it to Santa's bag!"],
  load: () => import("./Game"),
};
