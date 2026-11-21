"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WinterScene } from "@/components/animations/WinterScene";
import { Snowfall } from "@/components/animations/Snowfall";
import { Character } from "@/components/characters";
import { TopBar } from "./TopBar";
import { ZONES } from "@/lib/game-engine/zones";
import { audio } from "@/lib/audio";
import { useAppState } from "@/lib/state/store";

function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`font-display text-center font-semibold leading-none ${small ? "text-4xl" : "text-5xl sm:text-6xl"}`}>
      <span className="text-snow [text-shadow:0_4px_0_#A93434,0_8px_18px_rgb(23_75_60/.45)]">Wonder</span>
      <span className="text-gold [text-shadow:0_4px_0_#C99A2E,0_8px_18px_rgb(23_75_60/.45)]">Days</span>
    </div>
  );
}

export function Landing() {
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const { profile, progress } = useAppState();

  useEffect(() => {
    let raf = 0; const t0 = performance.now(); const DUR = 1800;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / DUR);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(step); else setReady(true);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!ready) {
    return (
      <main className="fixed inset-0 overflow-hidden bg-pine" aria-busy="true">
        <WinterScene className="absolute inset-0 h-full w-full" />
        <Snowfall />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6">
          <div className="anim-pop"><Logo /></div>
          <div className="flex items-end gap-2">
            <Character id="santa" mood="happy" className="h-28 w-28 sm:h-40 sm:w-40" />
            <Character id="holly" className="h-24 w-24 sm:h-32 sm:w-32" />
            <Character id="jingle" mood="happy" className="h-24 w-24 sm:h-32 sm:w-32" />
            <Character id="snowy" className="hidden h-28 w-28 sm:block sm:h-36 sm:w-36" />
            <Character id="ginger" mood="cheer" className="hidden h-24 w-24 md:block" />
          </div>
          <div className="w-full max-w-sm" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Loading">
            <div className="h-5 overflow-hidden rounded-full bg-snow/70 p-1 shadow-soft"><div className="h-full rounded-full bg-red transition-[width]" style={{ width: `${pct}%` }} /></div>
            <p className="font-display mt-3 text-center text-lg font-semibold tracking-wide text-pine">GETTING THE CHRISTMAS MAGIC READY…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-pine">
      <WinterScene className="absolute inset-0 h-full w-full" />
      <Snowfall />
      <TopBar />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-y-auto px-4 pb-6 pt-24 text-center">
        <div className="flex items-end justify-center gap-3">
          <div className="anim-pop relative max-w-56 rounded-3xl bg-snow p-3 text-left shadow-soft sm:max-w-xs">
            <p className="font-display text-lg font-semibold leading-snug">Ho ho ho, {profile.nickname}! Ready for a magical day?</p>
            <span className="absolute -bottom-2 right-8 size-5 rotate-45 bg-snow" />
          </div>
          <Character id="santa" mood="cheer" className="h-36 w-36 sm:h-52 sm:w-52" equipped={progress.equipped} />
        </div>
        <h1 className="font-display text-4xl font-semibold text-snow [text-shadow:0_4px_0_#174B3C] sm:text-5xl">Welcome to WonderDays!</h1>
        <p className="text-xl font-bold text-pine">Your Christmas adventure starts here.</p>
        <Link href="/world" onClick={() => { audio.unlock(); audio.sfx("bell"); }}
          className="font-display mt-1 inline-flex min-h-[72px] items-center justify-center rounded-full border-b-[8px] border-red-deep bg-red px-8 text-2xl font-semibold tracking-wide text-snow shadow-soft active:translate-y-1 active:border-b-2 sm:px-12 sm:text-3xl">
          EXPLORE CHRISTMAS WORLD
        </Link>
        <nav aria-label="Worlds" className="mt-2 flex max-w-3xl flex-wrap justify-center gap-2">
          {ZONES.map((z) => (
            <Link key={z.id} href={`/world?zone=${z.id}`} className="font-display inline-flex min-h-11 items-center rounded-full bg-snow/90 px-4 text-sm font-semibold text-pine shadow-soft">{z.name}</Link>
          ))}
        </nav>
        <div className="mt-3 flex items-end justify-center gap-1 sm:gap-4" aria-hidden>
          <Character id="holly" mood="happy" className="size-24 sm:size-32" />
          <Character id="jingle" className="size-24 sm:size-32" />
          <Character id="snowy" mood="cheer" className="size-28 sm:size-40" />
          <Character id="ginger" mood="happy" className="size-24 sm:size-32" />
        </div>
        <p className="text-sm font-bold text-pine/80">Powered by WonderDays · Safe play: no chat, no ads, no sign-up.</p>
      </div>
    </main>
  );
}
