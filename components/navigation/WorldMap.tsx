"use client";
import { useEffect, useRef, useState } from "react";
import { useSize } from "@/lib/game-engine/useFit";
import Link from "next/link";
import { PALETTE as P, Art } from "@/assets/objects/art";
import { CharacterArt } from "@/components/characters";
import { Pine, Lights } from "@/components/animations/WinterScene";
import { Snowfall } from "@/components/animations/Snowfall";
import { BigButton } from "@/components/game-ui/ui";
import { IconStar } from "@/components/game-ui/icons";
import { ZONES, type Zone } from "@/lib/game-engine/zones";
import { GAMES } from "@/lib/game-engine/registry";
import { audio } from "@/lib/audio";
import { useAppState } from "@/lib/state/store";
import type { ZoneId } from "@/types/game";

function House({ w, h, wall, roof, lit = true }: { w: number; h: number; wall: string; roof: string; lit?: boolean }) {
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} rx="5" fill={wall} />
      <path d={`M${-w / 2 - 12} ${-h + 6}L0 ${-h - h * 0.62}L${w / 2 + 12} ${-h + 6}z`} fill={roof} />
      <path d={`M${-w / 2 - 12} ${-h + 6}L0 ${-h - h * 0.62}L${w / 2 + 12} ${-h + 6}q-10-14-20-8t-20-6-20 8-20-6-20 8-20-8z`} fill={P.snow} opacity=".95" />
      <rect x={-w / 4 - 9} y={-h * 0.62} width="18" height="20" rx="4" fill={lit ? P.gold : P.ice} />
      <rect x={w / 4 - 9} y={-h * 0.62} width="18" height="20" rx="4" fill={lit ? P.gold : P.ice} />
      <rect x="-9" y={-h * 0.38} width="18" height={h * 0.38} rx="5" fill={P.pine} />
    </g>
  );
}
const Smoke = ({ x, y }: { x: number; y: number }) => (
  <g>{[0, 1, 2].map((i) => <circle key={i} cx={x} cy={y} r="9" fill={P.snow} opacity=".8" className="anim-smoke" style={{ animationDelay: `${i}s` }} />)}</g>
);

function Art_({ id }: { id: ZoneId }) {
  switch (id) {
    case "santas-workshop": return (<g>
      <Smoke x={52} y={-190} />
      <rect x="40" y="-190" width="24" height="60" fill={P.redDeep} />
      <House w={190} h={110} wall={P.red} roof="#8E2F2F" />
      <circle cx="0" cy="-74" r="22" fill={P.gold} stroke={P.goldDeep} strokeWidth="5" strokeDasharray="8 5" />
      <g transform="translate(-130 0)"><rect x="-26" y="-34" width="52" height="34" rx="4" fill={P.green} /><rect x="-26" y="-40" width="52" height="8" fill={P.gold} /></g>
      <g transform="translate(130 0)"><rect x="-22" y="-26" width="44" height="26" rx="4" fill={P.blue} /><rect x="-4" y="-26" width="8" height="26" fill={P.gold} /></g>
      <g transform="translate(-92 -18) scale(.3)"><CharacterArt id="holly" mood="happy" /></g>
    </g>);
    case "reindeer-village": return (<g>
      <Pine x={-110} y={0} s={1.1} /><Pine x={-70} y={6} s={.8} c="#174B3C" /><Pine x={120} y={0} s={1.2} /><Pine x={85} y={8} s={.8} c="#174B3C" />
      <House w={110} h={72} wall="#9A6A44" roof={P.pine} />
      <path d="M-100 20h200" stroke="#B88A5F" strokeWidth="6" strokeLinecap="round" /><path d="M-90 8v24M-40 8v24M10 8v24M60 8v24M100 8v24" stroke="#B88A5F" strokeWidth="6" strokeLinecap="round" />
      <g transform="translate(-30 -26) scale(.34)"><CharacterArt id="jingle" mood="happy" /></g>
    </g>);
    case "snowy-mountains": return (<g>
      <path d="M-170 10L-60-150 20-60 80-170 190 10z" fill="#7FA6BD" /><path d="M-60-150l-34 44 20-8 14 14 14-14 20 8zM80-170l-38 52 24-10 14 16 14-16 22 10z" fill={P.snow} />
      <path d="M-170 10L-60-150" stroke="#6B93AB" strokeWidth="2" /><path d="M-130 10Q0-40 150 10" fill="none" stroke={P.snow} strokeWidth="14" strokeLinecap="round" opacity=".9" />
      <Pine x={-120} y={10} s={.7} /><Pine x={140} y={14} s={.8} c="#174B3C" />
      <g transform="translate(-34 -26) scale(.34)"><CharacterArt id="snowy" mood="cheer" /></g>
    </g>);
    case "christmas-square": return (<g>
      <ellipse cx="0" cy="10" rx="170" ry="40" fill={P.cream} /><ellipse cx="0" cy="10" rx="170" ry="40" fill="none" stroke={P.ice} strokeWidth="4" />
      <g transform="translate(0 -6) scale(2.3) translate(-50 -88)">
        <path d="M50 8L24 42h12L16 68h68L64 42h12z" fill={P.green} />
        <path d="M50 8L36 42h28z" fill="#28664D" /><rect x="42" y="68" width="16" height="22" fill={P.brown} />
        <path d="M26 56q24 10 50-2M32 36q18 8 38-2" stroke={P.gold} strokeWidth="2.4" fill="none" />
        {[[34, 62, P.red], [60, 52, P.gold], [46, 36, P.candy], [66, 66, P.ice], [40, 50, P.gold]].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r="3.4" fill={c as string} className="anim-twinkle" style={{ animationDelay: `${i * .3}s`, transformBox: "fill-box", transformOrigin: "center" }} />)}
        <path d="M50 -10l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill={P.gold} className="anim-glow" />
      </g>
      <g transform="translate(-150 6) scale(.55)"><House w={110} h={80} wall={P.candy} roof={P.redDeep} /></g>
      <g transform="translate(150 6) scale(.55)"><House w={110} h={80} wall={P.ice} roof={P.pine} /></g>
      <g transform="translate(-60 -12) scale(.28)"><CharacterArt id="santa" mood="happy" /></g>
    </g>);
    case "candy-land": return (<g>
      <rect x="-100" y="-110" width="200" height="110" rx="14" fill={P.candy} />
      <path d="M-100-110h200" stroke={P.snow} strokeWidth="14" strokeDasharray="20 20" />
      <path d="M-116-100L0-190 116-100z" fill={P.red} /><path d="M-116-100L0-190 116-100q-14-14-28-6t-30-8-28 8-30-8-28 8-28-8z" fill={P.snow} opacity=".9" />
      <rect x="-14" y="-52" width="28" height="52" rx="14" fill={P.pine} />
      {[-70, 70].map((x) => <g key={x} transform={`translate(${x} -150)`}><rect x="-9" y="0" width="18" height="46" fill={P.snow} /><path d="M-9 4h18M-9 18h18M-9 32h18" stroke={P.red} strokeWidth="7" /></g>)}
      <g transform="translate(-150 0)"><rect x="-3" y="-60" width="6" height="60" fill={P.snow} /><circle cx="0" cy="-70" r="22" fill={P.candy} /><circle cx="0" cy="-70" r="12" fill="none" stroke={P.snow} strokeWidth="6" strokeDasharray="9 6" /></g>
      <g transform="translate(150 0)"><rect x="-3" y="-50" width="6" height="50" fill={P.snow} /><circle cx="0" cy="-60" r="20" fill={P.ice} /><circle cx="0" cy="-60" r="10" fill="none" stroke={P.blue} strokeWidth="6" strokeDasharray="8 6" /></g>
      <g transform="translate(-60 -22) scale(.32)"><CharacterArt id="ginger" mood="cheer" /></g>
    </g>);
    case "santas-house": return (<g>
      <Smoke x={50} y={-170} /><rect x="38" y="-170" width="24" height="56" fill="#7A4A32" />
      <House w={170} h={100} wall="#A9724B" roof={P.red} />
      <path d="M70 0v-40" stroke="#6B4630" strokeWidth="6" /><rect x="58" y="-58" width="26" height="18" rx="3" fill={P.red} />
      <g transform="translate(-110 -34) scale(.38)"><CharacterArt id="santa" mood="cheer" /></g>
      <Pine x={-150} y={6} s={.9} c="#174B3C" /><Pine x={140} y={6} s={1} />
    </g>);
  }
}

export function WorldMap({ initial }: { initial?: ZoneId }) {
  const [sel, setSel] = useState<ZoneId | null>(initial ?? null);
  const scroller = useRef<HTMLDivElement>(null);
  const [box, size] = useSize<HTMLDivElement>();
  // Landscape: scene fills the height. Portrait: scene is scaled down (not cropped) and pans horizontally.
  const sceneH = size.h >= size.w ? Math.max(size.w * 0.9, size.h * 0.6) : size.h;
  const sceneW = Math.max(size.w, sceneH * 1.5);
  const sceneHFinal = sceneW / 1.5;
  const { progress } = useAppState();
  const zone = ZONES.find((z) => z.id === sel) ?? null;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [sceneW]);

  useEffect(() => {
    audio.playMusic(zone?.music ?? "village");
  }, [zone]);

  const pick = (z: Zone) => {
    audio.unlock(); audio.sfx("bell");
    setSel(z.id);
    const el = scroller.current;
    if (el) el.scrollTo({ left: (z.x / 1200) * el.scrollWidth - el.clientWidth / 2, behavior: "smooth" });
  };

  const games = zone ? GAMES.filter((g) => g.zone === zone.id) : [];

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#8EC5DC] via-[#DCEFF5] to-[#FFFDF7]">
      <div ref={scroller} className="h-full overflow-x-auto overflow-y-hidden [scrollbar-width:none]" onClick={(e) => { if (e.target === e.currentTarget) setSel(null); }}>
        <div className="relative transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ width: sceneW, height: sceneHFinal, marginTop: Math.max(0, (size.h - sceneHFinal) / 2), transformOrigin: zone ? `${(zone.x / 1200) * 100}% ${(zone.y / 800) * 100}%` : "50% 50%", transform: zone ? "scale(1.25) translateY(-6%)" : "none" }}>
          <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="group" aria-label="WonderDays Christmas World map">
            <defs>
              <linearGradient id="msky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8EC5DC" /><stop offset=".5" stopColor="#DCEFF5" /></linearGradient>
              <filter id="zglow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#F4C95D" floodOpacity=".95" /></filter>
            </defs>
            <rect width="1200" height="800" fill="url(#msky)" />
            <path d="M0 250L140 150 260 230 420 120 560 230 700 140 860 240 1000 130 1200 240V800H0z" fill="#A9CCDC" opacity=".8" />
            <path d="M0 330Q300 250 600 320T1200 300V800H0z" fill="#EAF5F8" />
            <path d="M0 430Q300 360 600 430T1200 410V800H0z" fill={P.snow} />
            <ellipse cx="560" cy="705" rx="190" ry="48" fill={P.ice} /><ellipse cx="560" cy="700" rx="190" ry="48" fill="#CFEAF5" />
            <path d="M440 705q60-14 120 0M520 718q70-12 130-4" stroke={P.snow} strokeWidth="4" fill="none" strokeLinecap="round" />
            <g transform="translate(640 690) scale(.26)"><CharacterArt id="snowy" mood="happy" /></g>
            <path d="M250 640Q420 600 430 470T640 500M235 360Q300 420 440 440T640 500M480 270Q520 380 640 500M640 500Q800 540 960 590M640 500Q780 400 930 265" fill="none" stroke={P.cream} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M250 640Q420 600 430 470T640 500M235 360Q300 420 440 440T640 500M480 270Q520 380 640 500M640 500Q800 540 960 590M640 500Q780 400 930 265" fill="none" stroke="#E9DCC3" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
            {[[90, 470], [60, 560], [1130, 440], [1150, 700], [370, 760], [760, 740], [840, 450]].map(([x, y], i) => <Pine key={i} x={x!} y={y!} s={.8 + (i % 3) * .15} c={i % 2 ? "#28664D" : "#174B3C"} />)}
            {[[1110, 730], [70, 420]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><House w={70} h={50} wall={i ? P.candy : P.ice} roof={i ? P.pine : P.red} /></g>)}
            <Lights y={36} />
            <g className="anim-bob" style={{ transformBox: "fill-box" }}>
              <g style={{ animation: "drift 38s linear infinite" }}>
                <g transform="translate(0 90) scale(.8)"><path d="M0 10q30 14 60 0l22-14" stroke={P.gold} strokeWidth="5" fill="none" /><rect x="10" y="-16" width="40" height="22" rx="8" fill={P.red} /><g transform="translate(70 -16) scale(.22)"><CharacterArt id="jingle" mood="happy" /></g></g>
              </g>
            </g>
            {[...ZONES].sort((a, b) => a.y - b.y).map((z) => {
              const on = sel === z.id;
              return (
                <g key={z.id} transform={`translate(${z.x} ${z.y})`} role="button" tabIndex={0} aria-label={`${z.name}. ${z.blurb}`} aria-pressed={on} className="cursor-pointer outline-none"
                  onClick={(e) => { e.stopPropagation(); pick(z); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(z); } }}>
                  <rect x="-150" y="-210" width="300" height="310" fill="transparent" />
                  <g filter={on ? "url(#zglow)" : undefined} style={{ transition: "transform .3s", transform: on ? "scale(1.08)" : "scale(1)", transformBox: "fill-box", transformOrigin: "50% 100%" }} className={on ? "" : "anim-bob"}>
                    <Art_ id={z.id} />
                  </g>
                </g>
              );
            })}
            {ZONES.map((z) => {
              const on = sel === z.id;
              return (
                <g key={z.id} transform={`translate(${z.x} ${z.y + 72})`} pointerEvents="none">
                  <rect x={-z.name.length * 7.2 - 14} y="-20" width={z.name.length * 14.4 + 28} height="36" rx="18" fill={on ? P.red : P.snow} stroke={on ? P.redDeep : P.ice} strokeWidth="3" />
                  <text textAnchor="middle" y="6" className="font-display" fontSize="20" fontWeight="600" fill={on ? P.snow : P.pine}>{z.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <Snowfall count={45} />

      {!zone && <p className="font-display pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-snow/90 px-5 py-2 text-lg font-semibold text-pine shadow-soft">Tap a place to explore</p>}

      {zone && (
        <section className="anim-sheet absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-3xl rounded-t-[32px] bg-snow p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-10px_rgb(23_75_60/.45)]" aria-label={zone.name}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">{zone.name}</h2>
              <p className="text-lg font-semibold text-evergreen">{zone.blurb}</p>
            </div>
            <button type="button" aria-label="Close" onClick={() => setSel(null)} className="grid size-12 shrink-0 place-items-center rounded-full bg-cream text-2xl font-bold">×</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {games.map((g) => {
              const best = progress.bestStars[g.slug] ?? 0;
              return (
                <Link key={g.slug} href={`/games/${g.slug}`} onClick={() => audio.sfx("tap")} className="flex min-h-20 items-center gap-3 rounded-3xl border-b-[6px] border-gold-deep bg-gold p-3 active:translate-y-1 active:border-b-2">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-snow"><Art id={ICON[g.slug] ?? "star"} className="size-10" /></span>
                  <span className="min-w-0 flex-1"><span className="font-display block truncate text-xl font-semibold">{g.title}</span>
                    <span className="flex gap-0.5 text-gold-deep">{[1, 2, 3].map((n) => <IconStar key={n} className={`text-lg ${n <= best ? "text-red" : "text-snow"}`} />)}</span></span>
                  <span className="font-display rounded-full bg-red px-4 py-2 text-lg font-semibold text-snow">PLAY</span>
                </Link>
              );
            })}
            {zone.id === "santas-house" && (
              <Link href="/rewards" className="flex min-h-20 items-center gap-3 rounded-3xl border-b-[6px] border-pine bg-evergreen p-3 text-snow"><span className="grid size-14 place-items-center rounded-2xl bg-snow"><Art id="gift" className="size-10" /></span><span className="font-display flex-1 text-xl font-semibold">Wish Room: badges &amp; goodies</span></Link>
            )}
            {games.length === 0 && zone.id !== "santas-house" && <BigButton variant="ice" disabled>Coming soon</BigButton>}
          </div>
        </section>
      )}
    </div>
  );
}

const ICON: Record<string, import("@/assets/objects/art").ArtId> = {
  "santas-workshop": "gift", "gift-delivery": "bell", "christmas-match": "candycane", "christmas-memory": "snowflake",
  "bubble-pop": "ornament", "tree-decoration": "tree", "snowman-builder": "snowflake", "christmas-puzzle": "star",
};
