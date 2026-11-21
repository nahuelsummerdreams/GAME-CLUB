import type { ComponentType } from "react";

export type ZoneId =
  | "santas-workshop"
  | "reindeer-village"
  | "candy-land"
  | "snowy-mountains"
  | "christmas-square"
  | "santas-house";

export type GameCategory =
  | "simulation"
  | "arcade"
  | "puzzle"
  | "memory"
  | "creative";

export type MusicTheme = "village" | "workshop" | "candy" | "adventure";

export interface GameResult {
  /** 1–3 stars earned in this run (0 = not completed). */
  stars: 0 | 1 | 2 | 3;
  score: number;
  level: number;
  /** Optional free-form id used for personal records (e.g. "hard"). */
  variant?: string;
}

export interface GameServices {
  sfx: (name: SfxName) => void;
}

export type SfxName =
  | "tap"
  | "pop"
  | "match"
  | "flip"
  | "win"
  | "reward"
  | "error"
  | "bell"
  | "whoosh";

export interface GameProps {
  paused: boolean;
  services: GameServices;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

export interface GameManifest {
  slug: string;
  title: string;
  zone: ZoneId;
  category: GameCategory;
  music: MusicTheme;
  tagline: string;
  /** Lazy loader — keeps each game (and Phaser) out of the main bundle. */
  load: () => Promise<{ default: ComponentType<GameProps> }>;
}
