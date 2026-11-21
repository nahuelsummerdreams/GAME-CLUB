import type { GameResult } from "@/types/game";
import type { BadgeId } from "@/types/rewards";
import type { PlayerProfile } from "@/types/player";
import { readJSON, writeJSON } from "@/lib/storage";

export interface Progress {
  stars: number; // spendable Wonder Stars balance
  totalEarned: number;
  badges: BadgeId[];
  unlocked: string[]; // cosmetic ids
  equipped: Record<string, string>;
  /** best stars per game slug */
  bestStars: Record<string, number>;
  /** high scores keyed by `${slug}:${variant}` */
  records: Record<string, number>;
  plays: Record<string, number>;
  favorites: string[];
}

export const EMPTY_PROGRESS: Progress = {
  stars: 0, totalEarned: 0, badges: [], unlocked: [], equipped: {},
  bestStars: {}, records: {}, plays: {}, favorites: [],
};

export const loadProgress = (): Progress => ({ ...EMPTY_PROGRESS, ...readJSON<Partial<Progress>>("progress", {}) });
export const saveProgress = (p: Progress): void => writeJSON("progress", p);

export const loadProfile = (): PlayerProfile | null => readJSON<PlayerProfile | null>("profile", null);
export const saveProfile = (p: PlayerProfile): void => writeJSON("profile", p);

export interface RewardOutcome {
  progress: Progress;
  starsEarned: number;
  newRecord: boolean;
  newBadges: BadgeId[];
}

/** Pure function: applies a finished game to progress. Easy to unit test. */
export function applyResult(prev: Progress, slug: string, r: GameResult): RewardOutcome {
  const key = `${slug}:${r.variant ?? "default"}`;
  const newRecord = r.score > (prev.records[key] ?? 0);
  const improvement = Math.max(0, r.stars - (prev.bestStars[slug] ?? 0));
  const starsEarned = r.stars * 2 + improvement * 3 + (newRecord ? 2 : 0);
  const plays = { ...prev.plays, [slug]: (prev.plays[slug] ?? 0) + 1 };
  const bestStars = { ...prev.bestStars, [slug]: Math.max(prev.bestStars[slug] ?? 0, r.stars) };
  const records = newRecord ? { ...prev.records, [key]: r.score } : prev.records;
  const badges = new Set(prev.badges);
  const newBadges: BadgeId[] = [];
  const grant = (id: BadgeId, cond: boolean) => {
    if (cond && !badges.has(id)) { badges.add(id); newBadges.push(id); }
  };
  const played = Object.keys(plays).length;
  grant("christmas-badge", Object.values(plays).reduce((a, b) => a + b, 0) >= 1);
  grant("christmas-explorer", played >= 4);
  grant("puzzle-master", slug === "christmas-puzzle" && r.stars === 3);
  grant("santa-helper", ["santas-workshop", "gift-delivery"].includes(slug) && r.stars >= 2);
  grant("reindeer-champion", slug === "gift-delivery" && r.stars === 3);
  return {
    progress: {
      ...prev, plays, bestStars, records, badges: [...badges],
      stars: prev.stars + starsEarned, totalEarned: prev.totalEarned + starsEarned,
    },
    starsEarned, newRecord, newBadges,
  };
}
