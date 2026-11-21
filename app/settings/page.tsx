"use client";
import { useState } from "react";
import { PageFrame } from "@/components/navigation/PageFrame";
import { BigButton } from "@/components/game-ui/ui";
import { IconMusic, IconMusicOff } from "@/components/game-ui/icons";
import { audio } from "@/lib/audio";
import { setProfile, setProgress, useAudioSettings, DEFAULT_PROFILE } from "@/lib/state/store";
import { EMPTY_PROGRESS } from "@/lib/progression";
import { removeKey } from "@/lib/storage";
import { InstallCard } from "@/components/navigation/InstallCard";

function Row({ label, on, onToggle, vol, onVol }: { label: string; on: boolean; onToggle: () => void; vol: number; onVol: (v: number) => void }) {
  return (
    <div className="rounded-card bg-snow p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{label}</h2>
        <BigButton variant={on ? "green" : "ice"} size="md" aria-pressed={on} onClick={onToggle}>{on ? <IconMusic /> : <IconMusicOff />}{on ? "ON" : "OFF"}</BigButton>
      </div>
      <label className="mt-3 block text-lg font-bold">Volume
        <input type="range" min={0} max={100} value={Math.round(vol * 100)} onChange={(e) => onVol(Number(e.target.value) / 100)} onPointerUp={() => audio.sfx("bell")}
          className="mt-2 h-10 w-full accent-red" aria-label={`${label} volume`} />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const s = useAudioSettings();
  const [confirm, setConfirm] = useState(false);
  return (
    <PageFrame title="Settings" back="/world">
      <div className="space-y-4">
        <Row label="Music" on={s.musicOn} onToggle={() => { audio.unlock(); audio.update({ musicOn: !s.musicOn }); }} vol={s.musicVolume} onVol={(v) => { audio.unlock(); audio.update({ musicVolume: v }); }} />
        <Row label="Sounds" on={s.sfxOn} onToggle={() => { audio.unlock(); audio.update({ sfxOn: !s.sfxOn }); }} vol={s.sfxVolume} onVol={(v) => { audio.unlock(); audio.update({ sfxVolume: v }); }} />
        <InstallCard />
        <section className="rounded-card bg-snow p-4 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">For grown-ups</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-lg font-semibold">
            <li>No accounts, chat, ads, tracking or location.</li>
            <li>Progress is saved only on this device.</li>
            <li>Wonder Stars can’t be bought. They’re earned by playing.</li>
          </ul>
        </section>
        <section className="rounded-card bg-snow p-4 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Start fresh</h2>
          <p className="mb-3 text-lg font-semibold text-evergreen">Erase stars, badges and saved creations on this device.</p>
          {confirm ? (
            <div className="flex gap-2">
              <BigButton variant="red" className="flex-1" onClick={() => {
                setProgress(EMPTY_PROGRESS); setProfile(DEFAULT_PROFILE);
                ["tree", "snowman", "puzzle-done", "match-level", "delivery-route", "bubble-level", "workshop-level"].forEach(removeKey); setConfirm(false);
              }}>YES, ERASE</BigButton>
              <BigButton variant="snow" className="flex-1" onClick={() => setConfirm(false)}>CANCEL</BigButton>
            </div>
          ) : <BigButton variant="ice" onClick={() => setConfirm(true)}>ERASE MY PROGRESS</BigButton>}
        </section>
      </div>
    </PageFrame>
  );
}
