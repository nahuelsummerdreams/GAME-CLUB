"use client";
import { useCallback, useState } from "react";
import type { GameProps } from "@/types/game";
import { BigButton } from "@/components/game-ui/ui";
import { IconLock, IconStar } from "@/components/game-ui/icons";
import { PhaserHost } from "@/components/game-ui/PhaserHost";
import { readJSON, writeJSON } from "@/lib/storage";
import { TEXTURES } from "./art";
import { loadImages } from "@/lib/game-engine/svgTexture";
import { ROUTES, createDelivery, type End, type Hud } from "./scene";

export default function Game({ paused, services, onComplete }: GameProps) {
  const [route, setRoute] = useState<number | null>(null);
  const [hud, setHud] = useState<Hud | null>(null);
  const unlocked = readJSON<number>("delivery-route", 1);
  const e2e = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("e2e");

  const finish = useCallback((e: End, r: number) => {
    if (!e.failed) writeJSON("delivery-route", Math.max(readJSON<number>("delivery-route", 1), Math.min(ROUTES.length, r + 2)));
    onComplete({ stars: e.stars as 0 | 1 | 2 | 3, score: e.delivered * 100 + (e.bonusDone ? 100 : 0) + e.hearts * 25, level: r + 1, variant: `route${r + 1}` });
  }, [onComplete]);

  if (route === null) {
    return (
      <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-gradient-to-b from-[#7FB8D2] to-[#D9EEF5] p-4">
        <div className="flex w-full max-w-md flex-col gap-3 rounded-card bg-snow p-5 text-center shadow-soft">
          <h2 className="font-display text-3xl font-semibold">Pick a route</h2>
          {ROUTES.map((r, i) => (
            <BigButton key={r.name} size="lg" variant={i < unlocked ? "gold" : "ice"} disabled={i >= unlocked} onClick={() => setRoute(i)} aria-label={`Route ${i + 1}: ${r.name}${i >= unlocked ? " locked" : ""}`} className="flex-col !gap-0 !py-2">
              <span className="flex items-center gap-2">{i >= unlocked && <IconLock />}{r.name}</span>
              <span className="text-base font-semibold opacity-80">{r.houses} houses · collect {r.bonusStars} stars</span>
            </BigButton>
          ))}
        </div>
      </div>
    );
  }

  const R = ROUTES[route]!;
  return (
    <div className="absolute inset-0 select-none">
      <PhaserHost key={route} paused={paused} create={async (Phaser, parent) => {
        const images = await loadImages(TEXTURES);
        return createDelivery(Phaser, parent, { route: R, images, onHud: setHud, onEnd: (e) => finish(e, route), sfx: services.sfx, e2e });
      }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-2 font-display text-xl font-semibold text-pine" data-testid="delivery-hud" data-delivered={hud?.delivered ?? 0} data-hearts={hud?.hearts ?? 3} data-stars={hud?.stars ?? 0}>
        <span className="rounded-full bg-snow/90 px-3 py-1 shadow-soft" aria-label={`${hud?.hearts ?? 3} hearts`}>{"♥".repeat(hud?.hearts ?? 3)}<span className="text-ice">{"♥".repeat(3 - (hud?.hearts ?? 3))}</span></span>
        <span className="rounded-full bg-snow/90 px-3 py-1 shadow-soft">Gifts {hud?.delivered ?? 0}/{R.houses}</span>
        <span className="flex items-center gap-1 rounded-full bg-snow/90 px-3 py-1 shadow-soft"><IconStar className="text-gold" /> {hud?.stars ?? 0}/{R.bonusStars}</span>
      </div>
    </div>
  );
}
