"use client";
import Link from "next/link";
import { PageFrame } from "@/components/navigation/PageFrame";
import { Character, CHARACTERS } from "@/components/characters";
import { BadgeMedal } from "@/components/rewards/BadgeMedal";
import { IconStar } from "@/components/game-ui/icons";
import { BADGES } from "@/lib/progression/catalog";
import { GAMES } from "@/lib/game-engine/registry";
import { getProgress, setProfile, setProgress, useAppState } from "@/lib/state/store";
import { audio } from "@/lib/audio";
import type { CharacterId } from "@/types/player";

const IDS = Object.keys(CHARACTERS) as CharacterId[];

function Picker({ label, value, onPick }: { label: string; value: CharacterId; onPick: (id: CharacterId) => void }) {
  return (
    <fieldset className="rounded-card bg-snow p-4 shadow-soft">
      <legend className="font-display px-2 text-xl font-semibold">{label}</legend>
      <div className="grid grid-cols-5 gap-2">
        {IDS.map((id) => (
          <button key={id} type="button" aria-label={CHARACTERS[id].name} aria-pressed={value === id} onClick={() => { audio.sfx("tap"); onPick(id); }}
            className={`rounded-2xl p-1 ${value === id ? "bg-gold ring-4 ring-red" : "bg-cream"}`}>
            <Character id={id} animate={false} className="aspect-square w-full" />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function ProfilePage() {
  const { profile, progress } = useAppState();
  const save = (patch: Partial<typeof profile>) => setProfile({ ...profile, ...patch, createdAt: profile.createdAt || Date.now() });
  const fav = (slug: string) => { const p = getProgress(); audio.sfx("tap"); setProgress({ ...p, favorites: p.favorites.includes(slug) ? p.favorites.filter((s) => s !== slug) : [...p.favorites, slug] }); };

  return (
    <PageFrame title="My Profile" back="/world">
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-card bg-snow p-4 shadow-soft">
          <Character id={profile.avatar} mood="happy" equipped={progress.equipped} className="size-28 shrink-0 rounded-full bg-ice" />
          <div className="min-w-0 flex-1">
            <label htmlFor="nick" className="font-display text-lg font-semibold">Nickname</label>
            <input id="nick" value={profile.nickname} maxLength={14} autoComplete="off" onChange={(e) => save({ nickname: e.target.value })} onBlur={() => { if (!profile.nickname.trim()) save({ nickname: "Little Elf" }); }}
              className="font-display mt-1 min-h-14 w-full rounded-2xl border-4 border-ice bg-cream px-4 text-2xl font-semibold outline-none focus:border-gold" />
            <p className="mt-1 text-sm font-bold text-evergreen">Pick a fun nickname, not a real name. It stays on this device.</p>
          </div>
        </div>
        <Picker label="My avatar" value={profile.avatar} onPick={(id) => save({ avatar: id })} />
        <Picker label="Favorite character" value={profile.favoriteCharacter} onPick={(id) => save({ favoriteCharacter: id })} />
        <p className="font-display rounded-card bg-snow p-4 text-center text-lg font-semibold shadow-soft">{CHARACTERS[profile.favoriteCharacter].name}: {CHARACTERS[profile.favoriteCharacter].blurb}</p>

        <section className="rounded-card bg-snow p-4 shadow-soft">
          <h2 className="font-display mb-3 text-xl font-semibold">My progress · <span className="text-gold-deep"><IconStar className="inline" /> {progress.totalEarned} earned</span></h2>
          <ul className="space-y-2">
            {GAMES.map((g) => (
              <li key={g.slug} className="flex items-center gap-2 rounded-2xl bg-cream p-2 pl-4">
                <Link href={`/games/${g.slug}`} className="font-display min-w-0 flex-1 truncate text-lg font-semibold">{g.title}</Link>
                <span className="flex">{[1, 2, 3].map((n) => <IconStar key={n} className={`text-xl ${n <= (progress.bestStars[g.slug] ?? 0) ? "text-gold" : "text-ice"}`} />)}</span>
                <button type="button" aria-label={`Favorite ${g.title}`} aria-pressed={progress.favorites.includes(g.slug)} onClick={() => fav(g.slug)} className={`grid size-12 place-items-center rounded-full text-2xl ${progress.favorites.includes(g.slug) ? "text-red" : "text-ice"}`}>♥</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card bg-snow p-4 shadow-soft">
          <h2 className="font-display mb-3 text-xl font-semibold">My badges</h2>
          <div className="grid grid-cols-5 gap-1">{BADGES.map((b) => <div key={b.id} className="text-center"><BadgeMedal id={b.id} locked={!progress.badges.includes(b.id)} className="w-full" /><p className="text-[11px] font-bold leading-tight">{b.name}</p></div>)}</div>
        </section>
      </div>
    </PageFrame>
  );
}
