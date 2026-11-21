import type { GameManifest } from "@/types/game";
import { christmasMemory } from "@/games/christmas-memory";

/**
 * Single source of truth for games. To add a game: create games/<slug>/,
 * then append its manifest here. Nothing else in the platform changes.
 */
export const GAMES: GameManifest[] = [christmasMemory];

export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug);
export const gamesInZone = (zone: GameManifest["zone"]) => GAMES.filter((g) => g.zone === zone);
