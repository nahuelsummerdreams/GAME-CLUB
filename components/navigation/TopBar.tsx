"use client";
import Link from "next/link";
import { Character } from "@/components/characters";
import { BigButton } from "@/components/game-ui/ui";
import { IconGear, IconMusic, IconMusicOff, IconStar } from "@/components/game-ui/icons";
import { audio } from "@/lib/audio";
import { useAppState, useAudioSettings } from "@/lib/state/store";

export function StarCounter({ className = "" }: { className?: string }) {
  const { progress } = useAppState();
  return (
    <Link href="/rewards" aria-label={`${progress.stars} Wonder Stars. Open rewards`} className={`font-display flex min-h-14 items-center gap-2 rounded-full bg-snow px-4 text-xl font-semibold text-pine shadow-soft max-[420px]:min-h-12 max-[420px]:px-3 ${className}`}>
      <IconStar className="text-2xl text-gold" /> {progress.stars}
    </Link>
  );
}

export function TopBar({ back }: { back?: string }) {
  const { profile, progress } = useAppState();
  const { musicOn } = useAudioSettings();
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-1.5 p-3 max-[420px]:p-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
        {back ? (
          <Link href={back} aria-label="Back" className="font-display grid size-14 place-items-center rounded-full bg-snow text-2xl text-pine shadow-soft max-[420px]:size-12">‹</Link>
        ) : null}
        <Link href="/profile" aria-label={`Profile: ${profile.nickname}`} className="flex min-h-14 items-center gap-2 rounded-full bg-snow py-1 pl-1 pr-4 shadow-soft max-[420px]:min-h-12 max-[420px]:pr-1">
          <Character id={profile.avatar} animate={false} equipped={progress.equipped} className="size-12 rounded-full bg-ice max-[420px]:size-10" />
          <span className="font-display max-w-24 truncate text-lg font-semibold text-pine max-[420px]:hidden">{profile.nickname}</span>
        </Link>
      </div>
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
        <StarCounter />
        <BigButton variant="snow" size="icon" className="max-[420px]:size-12" aria-label={musicOn ? "Turn music off" : "Turn music on"} aria-pressed={musicOn}
          onClick={() => { audio.update({ musicOn: !musicOn }); }}>
          {musicOn ? <IconMusic /> : <IconMusicOff />}
        </BigButton>
        <Link href="/settings" aria-label="Settings" className="grid size-14 place-items-center rounded-full border-b-[6px] border-ice bg-snow text-2xl text-pine shadow-soft max-[420px]:size-12"><IconGear /></Link>
      </div>
    </header>
  );
}
