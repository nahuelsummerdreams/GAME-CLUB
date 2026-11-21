import type { GameManifest } from "@/types/game";

export const giftDelivery: GameManifest = {
  slug: "gift-delivery", title: "Help Santa Deliver Gifts", zone: "reindeer-village", category: "arcade", music: "adventure",
  tagline: "Fly the sleigh and drop gifts on every house!", hero: "jingle",
  howTo: ["Drag or press ↑ ↓ to steer the sleigh.", "Tap GIFT (or Space) when a house is just ahead.", "Dodge storm clouds and owls. Grab stars!"],
  load: () => import("./Game"),
};
