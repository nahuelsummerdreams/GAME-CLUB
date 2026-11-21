"use client";
import { useState } from "react";
import { PageFrame } from "@/components/navigation/PageFrame";
import { BadgeMedal } from "@/components/rewards/BadgeMedal";
import { Character } from "@/components/characters";
import { Art } from "@/assets/objects/art";
import { BigButton } from "@/components/game-ui/ui";
import { IconLock, IconStar } from "@/components/game-ui/icons";
import { BADGES, COSMETICS } from "@/lib/progression/catalog";
import { getProgress, setProgress, useAppState } from "@/lib/state/store";
import { audio } from "@/lib/audio";
import type { Cosmetic, CosmeticSlot } from "@/types/rewards";

const SLOT_LABEL: Record<CosmeticSlot, string> = { hat: "Hats", scarf: "Scarves", accessory: "Accessories", ornament: "Tree ornaments", decoration: "Decorations", background: "Backgrounds" };
const WEARABLE: CosmeticSlot[] = ["hat", "scarf", "accessory"];
const PREVIEW: Record<string, () => React.ReactNode> = {
  "hat-beanie": () => <Art id="mitten" color="#5B9BD5" className="size-10" />,
  "hat-top": () => <Art id="drum" color="#2B2B2B" className="size-10" />,
  "hat-crown": () => <Art id="star" className="size-10" />,
  "scarf-candy": () => <Art id="candycane" className="size-10" />,
  "scarf-ice": () => <Art id="snowflake" className="size-10" />,
  "acc-glasses": () => <Art id="star" color="#F4C95D" className="size-10" />,
  "acc-bow": () => <Art id="gift" className="size-10" />,
  "orn-heart": () => <Art id="heart" className="size-10" />,
  "orn-star": () => <Art id="star" className="size-10" />,
  "dec-rainbow": () => <Art id="wreath" className="size-10" />,
  "bg-aurora": () => <Art id="snowflake" className="size-10" />,
  "bg-cozy": () => <Art id="candle" className="size-10" />,
};

export default function RewardsPage() {
  const { profile, progress } = useAppState();
  const [tab, setTab] = useState<"badges" | "goodies">("badges");

  const buy = (c: Cosmetic) => {
    const p = getProgress();
    if (p.unlocked.includes(c.id) || p.stars < c.cost) { audio.sfx("error"); return; }
    audio.sfx("reward");
    setProgress({ ...p, stars: p.stars - c.cost, unlocked: [...p.unlocked, c.id] });
  };
  const toggle = (c: Cosmetic) => {
    const p = getProgress(); audio.sfx("tap");
    const eq = { ...p.equipped };
    if (eq[c.slot] === c.id) delete eq[c.slot]; else eq[c.slot] = c.id;
    setProgress({ ...p, equipped: eq });
  };

  return (
    <PageFrame title="Wish Room" back="/world">
      <div className="mb-4 flex items-center gap-4 rounded-card bg-snow p-4 shadow-soft">
        <Character id={profile.avatar} mood="happy" equipped={progress.equipped} className="size-24 shrink-0 rounded-full bg-ice" />
        <div><p className="font-display text-2xl font-semibold">{profile.nickname}</p>
          <p className="font-display flex items-center gap-1 text-xl font-semibold text-gold-deep"><IconStar /> {progress.stars} Wonder Stars</p>
          <p className="text-sm font-bold text-evergreen">Stars are earned by playing. Nothing here costs real money.</p></div>
      </div>
      <div role="tablist" className="mb-4 grid grid-cols-2 gap-2">
        {(["badges", "goodies"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => { audio.sfx("tap"); setTab(t); }} className={`font-display min-h-14 rounded-full text-xl font-semibold ${tab === t ? "bg-red text-snow" : "bg-snow text-pine"}`}>{t === "badges" ? "Badges" : "Goodies"}</button>
        ))}
      </div>
      {tab === "badges" ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGES.map((b) => { const got = progress.badges.includes(b.id); return (
            <li key={b.id} className="flex flex-col items-center rounded-card bg-snow p-3 text-center shadow-soft">
              <BadgeMedal id={b.id} locked={!got} className="size-24" />
              <p className="font-display text-lg font-semibold">{b.name}</p>
              <p className="text-sm font-bold text-evergreen">{got ? "Earned!" : b.description}</p>
            </li>); })}
        </ul>
      ) : (
        <div className="space-y-5">
          {(Object.keys(SLOT_LABEL) as CosmeticSlot[]).map((slot) => (
            <section key={slot}>
              <h2 className="font-display mb-2 text-xl font-semibold text-snow">{SLOT_LABEL[slot]}</h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {COSMETICS.filter((c) => c.slot === slot).map((c) => {
                  const own = progress.unlocked.includes(c.id); const on = progress.equipped[c.slot] === c.id; const wear = WEARABLE.includes(slot);
                  return (
                    <li key={c.id} className="flex flex-col items-center gap-2 rounded-card bg-snow p-3 text-center shadow-soft">
                      <span className="grid size-16 place-items-center rounded-2xl bg-cream">{PREVIEW[c.id]?.()}</span>
                      <p className="font-display text-lg font-semibold leading-tight">{c.name}</p>
                      {own ? (wear ? <BigButton variant={on ? "green" : "gold"} className="w-full" onClick={() => toggle(c)}>{on ? "WEARING" : "WEAR"}</BigButton> : <p className="font-bold text-evergreen">Unlocked · use it in games</p>)
                        : <BigButton variant="gold" className="w-full" disabled={progress.stars < c.cost} onClick={() => buy(c)}>{progress.stars < c.cost ? <IconLock /> : null}<IconStar /> {c.cost}</BigButton>}
                    </li>);
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PageFrame>
  );
}
