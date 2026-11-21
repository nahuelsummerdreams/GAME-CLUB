import type { GameManifest } from "@/types/game";
import { christmasMemory } from "@/games/christmas-memory";
import { christmasPuzzle } from "@/games/christmas-puzzle";
import { christmasMatch } from "@/games/christmas-match";
import { treeDecoration } from "@/games/tree-decoration";
import { snowmanBuilder } from "@/games/snowman-builder";

/**
 * Single source of truth for games. To add a game: create games/<slug>/,
 * then append its manifest here. Nothing else in the platform changes.
 */
export const GAMES: GameManifest[] = [christmasMemory, christmasPuzzle, christmasMatch, treeDecoration, snowmanBuilder];

export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug);
export const gamesInZone = (zone: GameManifest["zone"]) => GAMES.filter((g) => g.zone === zone);
