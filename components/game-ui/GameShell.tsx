"use client";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GameProps, GameResult, SfxName } from "@/types/game";
import { getGame } from "@/lib/game-engine/registry";
import type { BadgeId } from "@/types/rewards";
import { applyResult } from "@/lib/progression";
import { BADGES } from "@/lib/progression/catalog";
import { audio } from "@/lib/audio";
import { getProgress, setProgress } from "@/lib/state/store";
import { Character } from "@/components/characters";
import { Confetti } from "@/components/animations/Confetti";
import { BigButton } from "./ui";
import { IconMap, IconPause, IconPlay, IconReplay, IconStar } from "./icons";

interface Outcome { result: GameResult; starsEarned: number; newRecord: boolean; newBadges: BadgeId[] }

const services = { sfx: (n: SfxName) => audio.sfx(n) };

export function GameShell({ slug }: { slug: string }) {
  const manifest = getGame(slug)!;
  const [phase, setPhase] = useState<"tutorial" | "playing" | "done">("tutorial");
  const [paused, setPaused] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [Game, setGame] = useState<ComponentType<GameProps> | null>(null);
  const router = useRouter();
  const completed = useRef(false);

  useEffect(() => { // load the game chunk (and Phaser, if used) while the tutorial is on screen
    let live = true;
    void manifest.load().then((m) => { if (live) setGame(() => m.default); });
    return () => { live = false; };
  }, [manifest]);

  const pause = useCallback(() => { setPaused(true); audio.suspend(); }, []);
  useEffect(() => {
    const onHide = () => { if (document.hidden && phase === "playing") pause(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [phase, pause]);
  useEffect(() => () => audio.suspend(), []); // leaving the game stops its music

  const start = () => {
    audio.unlock(); audio.resume(); audio.playMusic(manifest.music);
    completed.current = false; setOutcome(null); setPaused(false); setPhase("playing");
  };
  const resume = () => { setPaused(false); audio.resume(); };
  const again = () => { setRunKey((k) => k + 1); start(); };

  const onComplete = useCallback((result: GameResult) => {
    if (completed.current) return;
    completed.current = true;
    const o = applyResult(getProgress(), manifest.slug, result);
    setProgress(o.progress);
    setOutcome({ result, starsEarned: o.starsEarned, newRecord: o.newRecord, newBadges: o.newBadges });
    audio.sfx(result.stars > 0 ? "win" : "error");
    setPhase("done");
  }, [manifest.slug]);

  return (
    <main className="fixed inset-0 flex flex-col bg-ice" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 bg-pine px-3 text-snow">
        <Link href="/world" aria-label="Back to map" className="grid size-12 place-items-center rounded-full bg-snow/15 text-2xl"><IconMap /></Link>
        <h1 className="font-display truncate text-xl font-semibold">{manifest.title}</h1>
        <button type="button" aria-label="Pause" disabled={phase !== "playing"} onClick={() => { audio.sfx("tap"); pause(); }} className="grid size-12 place-items-center rounded-full bg-snow/15 text-2xl disabled:opacity-30"><IconPause /></button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {phase !== "tutorial" && (Game ? (
          <Game key={runKey} paused={paused || phase === "done"} services={services} onComplete={onComplete} onExit={() => router.push("/world")} />
        ) : (
          <div className="grid h-full place-items-center font-display text-2xl text-pine">Getting ready…</div>
        ))}

        {phase === "tutorial" && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-ice/90 p-4">
            <div className="anim-pop flex w-full max-w-xl flex-col items-center gap-4 rounded-card bg-snow p-6 text-center shadow-soft" role="dialog" aria-label="How to play">
              <Character id={manifest.hero} mood="happy" className="h-32 w-32 sm:h-40 sm:w-40" />
              <h2 className="font-display text-3xl font-semibold">{manifest.title}</h2>
              <p className="text-lg font-semibold text-evergreen">{manifest.tagline}</p>
              <ol className="w-full space-y-2 text-left">
                {manifest.howTo.map((t, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-2xl bg-cream p-3 text-lg font-bold">
                    <span className="font-display grid size-9 shrink-0 place-items-center rounded-full bg-red text-snow">{i + 1}</span>{t}
                  </li>
                ))}
              </ol>
              <BigButton size="lg" onClick={start}><IconPlay /> LET&apos;S PLAY</BigButton>
            </div>
          </div>
        )}

        {phase === "playing" && paused && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-pine/70 p-4" role="dialog" aria-label="Paused">
            <div className="anim-pop flex w-full max-w-sm flex-col gap-3 rounded-card bg-snow p-6 text-center shadow-soft">
              <h2 className="font-display text-3xl font-semibold">Paused</h2>
              <BigButton size="lg" onClick={resume}><IconPlay /> KEEP PLAYING</BigButton>
              <BigButton variant="gold" onClick={again}><IconReplay /> START OVER</BigButton>
              <Link href="/world" className="font-display inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-b-[6px] border-ice bg-snow px-6 text-xl font-semibold text-pine"><IconMap /> BACK TO MAP</Link>
            </div>
          </div>
        )}

        {phase === "done" && outcome && (
          <div className="absolute inset-0 z-20 grid place-items-center overflow-y-auto bg-pine/75 p-4" role="dialog" aria-label="Results">
            {outcome.result.stars > 0 && <Confetti />}
            <div className="anim-pop relative flex w-full max-w-md flex-col items-center gap-3 rounded-card bg-snow p-6 text-center shadow-soft">
              <Character id={manifest.hero} mood={outcome.result.stars > 0 ? "cheer" : "surprised"} className="h-28 w-28" />
              <h2 className="font-display text-3xl font-semibold">{outcome.result.stars === 3 ? "Amazing!" : outcome.result.stars > 0 ? "Great job!" : "So close!"}</h2>
              <div className="flex gap-2" aria-label={`${outcome.result.stars} of 3 stars`}>
                {[1, 2, 3].map((n) => (
                  <IconStar key={n} className={`size-14 ${n <= outcome.result.stars ? "anim-pop text-gold drop-shadow" : "text-cream"}`} />
                ))}
              </div>
              <p className="font-display text-2xl font-semibold">Score {outcome.result.score}{outcome.newRecord ? " · New record!" : ""}</p>
              {outcome.starsEarned > 0 && <p className="font-display rounded-full bg-gold px-4 py-2 text-xl font-semibold text-pine">+{outcome.starsEarned} Wonder Stars</p>}
              {outcome.newBadges.map((b) => (
                <p key={b} className="rounded-2xl bg-ice px-4 py-2 font-bold">New badge: {BADGES.find((x) => x.id === b)?.name}</p>
              ))}
              <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
                <BigButton className="flex-1 px-4" onClick={again}><IconReplay /> PLAY AGAIN</BigButton>
                <Link href="/world" className="font-display inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border-b-[6px] border-ice bg-cream px-6 text-xl font-semibold text-pine"><IconMap /> MAP</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
