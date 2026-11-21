"use client";
import { useCallback, useState } from "react";
import type { GameProps } from "@/types/game";
import { BigButton } from "@/components/game-ui/ui";
import { IconLock } from "@/components/game-ui/icons";
import { PhaserHost } from "@/components/game-ui/PhaserHost";
import { loadImages } from "@/lib/game-engine/svgTexture";
import { readJSON, writeJSON } from "@/lib/storage";
import { BUBBLE_COLORS, TEXTURES } from "./art";
import { LEVELS, starsFor } from "./logic";
import { createBubble, type End, type Hud } from "./scene";

export default function Game({ paused, services, onComplete }: GameProps) {
  const [lv, setLv] = useState<number | null>(null);
  const [hud, setHud] = useState<Hud | null>(null);
  const unlocked = readJSON<number>("bubble-level", 1);
  const e2e = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("e2e");

  const finish = useCallback((e: End, i: number) => {
    const L = LEVELS[i]!;
    if (e.won) writeJSON("bubble-level", Math.max(readJSON<number>("bubble-level", 1), Math.min(LEVELS.length, i + 2)));
    onComplete({ stars: e.won ? starsFor(e.shotsLeft, L.shots) : 0, score: e.score + (e.won ? e.shotsLeft * 20 : 0), level: i + 1, variant: `l${i + 1}` });
  }, [onComplete]);

  if (lv === null) {
    return (
      <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-evergreen p-4">
        <div className="flex w-full max-w-md flex-col gap-3 rounded-card bg-snow p-5 text-center shadow-soft">
          <h2 className="font-display text-3xl font-semibold">Choose a level</h2>
          <div className="grid grid-cols-2 gap-3">
            {LEVELS.map((L, i) => (
              <BigButton key={i} size="lg" variant={i < unlocked ? "gold" : "ice"} disabled={i >= unlocked} onClick={() => setLv(i)} aria-label={`Level ${i + 1}${i >= unlocked ? " locked" : ""}`} className="flex-col !gap-0 !py-2">
                <span>{i < unlocked ? i + 1 : <IconLock />}</span>
                <span className="text-sm font-semibold opacity-80">{L.goal.kind === "clear" ? "Clear the board" : "Pop 12+ of one color"}</span>
              </BigButton>
            ))}
          </div>
        </div>
      </div>
    );
  }
  const L = LEVELS[lv]!;
  return (
    <div className="absolute inset-0 select-none">
      <PhaserHost key={lv} paused={paused} create={async (Phaser, parent) => {
        const images = await loadImages(TEXTURES);
        return createBubble(Phaser, parent, { level: L, images, onHud: setHud, onEnd: (e) => finish(e, lv), sfx: services.sfx, e2e });
      }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-2 font-display text-lg font-semibold text-pine" data-testid="bubble-hud" data-shots={hud?.shots ?? L.shots} data-score={hud?.score ?? 0}>
        <span className="rounded-full bg-snow/90 px-3 py-1 shadow-soft">Shots {hud?.shots ?? L.shots}</span>
        <span className="flex items-center gap-1 rounded-full bg-snow/90 px-3 py-1 shadow-soft">
          {L.goal.kind === "clear" ? "Clear all" : <><i className="inline-block size-5 rounded-full" style={{ background: BUBBLE_COLORS[L.goal.color] }} /> {Math.min(hud?.collected ?? 0, L.goal.n)}/{L.goal.n}</>}
        </span>
        <span className="rounded-full bg-snow/90 px-3 py-1 shadow-soft">Score {hud?.score ?? 0}</span>
      </div>
    </div>
  );
}
