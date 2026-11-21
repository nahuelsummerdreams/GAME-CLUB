import type { GameManifest } from "@/types/game";

/**
 * Single source of truth for games. To add a game: create games/<slug>/,
 * then append its manifest here. Nothing else in the platform changes.
 * Manifests are added phase by phase as each game is built and tested.
 */
export const GAMES: GameManifest[] = [];

export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug);
export const gamesInZone = (zone: GameManifest["zone"]) => GAMES.filter((g) => g.zone === zone);
