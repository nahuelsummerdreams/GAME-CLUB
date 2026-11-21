"use client";
import { useEffect, useRef, useState } from "react";
import type { GameProps } from "@/types/game";
import { Art, ArtShape, PALETTE as P, type ArtId } from "@/assets/objects/art";
import { BigButton } from "@/components/game-ui/ui";
import { FreeStage, type StageItem } from "@/components/game-ui/FreeStage";
import { Palette, type PaletteTab } from "@/components/game-ui/Palette";
import { IconTrash } from "@/components/game-ui/icons";
import { readJSON, writeJSON } from "@/lib/storage";
import { useAppState } from "@/lib/state/store";
import { Backdrop, type Bg } from "@/components/game-ui/Backdrop";

type Lights = "off" | "warm" | "multi" | "rainbow";
type Topper = "star" | "snowflake" | "heart" | "bell";
interface TreeState { color: string; lights: Lights; topper: Topper; bg: Bg; items: StageItem[]; next: number }
const DEFAULT: TreeState = { color: "#28664D", lights: "warm", topper: "star", bg: "night", items: [], next: 1 };
const W = 400, H = 500;

const BAUBLES = [["red", P.red], ["gold", P.gold], ["blue", P.blue], ["pink", P.candy], ["ice", P.ice], ["purple", P.purple]] as const;
const LIGHT_COLORS: Record<Lights, string[]> = { off: [], warm: [P.gold, "#FFE9A8"], multi: [P.red, P.gold, P.blue, "#7BD389"], rainbow: ["#FF5E5E", "#FFB84D", "#FFF04D", "#6BE08A", "#4DB8FF", "#B07BFF"] };

function Item({ kind }: { kind: string }) {
  const [k, c] = kind.split("|");
  switch (k) {
    case "bauble": return (<g><rect x="-5" y="-22" width="10" height="7" rx="2" fill={P.goldDeep} /><circle cy="2" r="17" fill={c} /><path d="M-10 -2a11 11 0 0 1 11-9" stroke="rgb(255 255 255/.6)" strokeWidth="4" strokeLinecap="round" fill="none" /></g>);
    case "garland": return (<g fill="none" strokeLinecap="round"><path d="M-48 -8Q0 26 48 -8" stroke={c} strokeWidth="8" /><path d="M-48 -8Q0 26 48 -8" stroke="#fff" strokeWidth="3" strokeDasharray="1 11" /></g>);
    case "shoot": return (<g><path d="M-30 20L16 -16" stroke={P.gold} strokeWidth="6" strokeLinecap="round" opacity=".5" /><g transform="translate(-4 -24) scale(.34)"><ArtShape id="star" /></g></g>);
    default: { const id = k as ArtId; return <g transform="translate(-22 -22) scale(.44)"><ArtShape id={id} color={c} /></g>; }
  }
}

function TreeBody({ s }: { s: TreeState }) {
  const lights = LIGHT_COLORS[s.lights];
  const dots: [number, number][] = [];
  ([[168, 5], [250, 7], [340, 9]] as [number, number][]).forEach(([y, n], row) => { for (let i = 0; i < n; i++) { const half = 36 + row * 32 + 6; const x = 200 + ((i / (n - 1)) * 2 - 1) * half; dots.push([x, y + Math.sin(i * 1.3) * 10 + (i % 2) * 8]); } });
  return (
    <g>
      <rect x="182" y="404" width="36" height="42" fill={P.brown} />
      <path d="M200 70L112 232h176z" fill={s.color} /><path d="M200 140L92 334h216z" fill={s.color} /><path d="M200 214L72 414h256z" fill={s.color} />
      <path d="M200 70L156 160h88zM200 140l-52 110h104zM200 214l-62 130h124z" fill="#fff" opacity=".09" />
      <path d="M118 232q82 24 164 0M98 334q102 28 204 0M78 414q122 32 244 0" stroke="#fff" strokeWidth="8" fill="none" opacity=".85" strokeLinecap="round" />
      {lights.length > 0 && dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" fill={lights[i % lights.length]} className="anim-twinkle" style={{ animationDelay: `${(i % 6) * 0.3}s`, transformBox: "fill-box", transformOrigin: "center" }} />)}
      <g transform="translate(200 62)"><g className="anim-glow"><g transform="translate(-26 -30) scale(.52)"><ArtShape id={s.topper === "star" ? "star" : s.topper === "snowflake" ? "snowflake" : s.topper === "heart" ? "heart" : "bell"} /></g></g></g>
    </g>
  );
}

export default function Game({ paused, onComplete, services }: GameProps) {
  const { progress } = useAppState();
  const [s, setS] = useState<TreeState>(() => ({ ...DEFAULT, ...readJSON<Partial<TreeState>>("tree", {}) }));
  const [sel, setSel] = useState<number | null>(null);
  const [tab, setTab] = useState("ornaments");
  const [msg, setMsg] = useState("");
  const [sure, setSure] = useState(false);
  const saved = useRef(false);
  useEffect(() => { if (!saved.current) { saved.current = true; return; } writeJSON("tree", s); }, [s]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 2200); return () => clearTimeout(t); }, [msg]);
  useEffect(() => { if (!sure) return; const t = setTimeout(() => setSure(false), 3000); return () => clearTimeout(t); }, [sure]);

  const own = (id: string) => progress.unlocked.includes(id);
  const add = (kind: string) => { services.sfx("pop"); setS((p) => { const uid = p.next; const n = p.items.length; return { ...p, next: uid + 1, items: [...p.items, { uid, kind, s: 1, x: 200 + ((n * 37) % 90) - 45, y: kind.startsWith("gift") ? 440 : 250 + ((n * 53) % 120) }] }; }); };
  const patch = (u: Partial<TreeState>) => { services.sfx("tap"); setS((p) => ({ ...p, ...u })); };

  const tabs: PaletteTab[] = [
    { id: "ornaments", label: "Ornaments", options: [
      ...BAUBLES.map(([n, c]) => ({ id: `bauble|${c}`, label: `${n} ball`, preview: <svg viewBox="-24 -28 48 52"><Item kind={`bauble|${c}`} /></svg> })),
      ...(["bell", "candycane", "snowflake"] as const).map((a) => ({ id: a, label: a, preview: <Art id={a} /> })),
      { id: "heart|#D94A4A", label: "Heart ornament", locked: !own("orn-heart"), preview: <Art id="heart" /> },
      { id: "shoot", label: "Shooting star", locked: !own("orn-star"), preview: <svg viewBox="-34 -34 68 68"><Item kind="shoot" /></svg> },
    ] },
    { id: "garland", label: "Garland", options: [["gold", P.gold], ["red", P.red], ["silver", "#C9D3D7"], ["green", "#7BD389"]].map(([n, c]) => ({ id: `garland|${c}`, label: `${n} garland`, preview: <svg viewBox="-56 -20 112 50"><Item kind={`garland|${c}`} /></svg> })) },
    { id: "gifts", label: "Gifts", options: [P.red, P.blue, P.gold, P.candy, P.green].map((c) => ({ id: `gift|${c}`, label: "gift", preview: <Art id="gift" color={c} /> })) },
    { id: "lights", label: "Lights", options: (["off", "warm", "multi", "rainbow"] as const).map((l) => ({ id: l, label: `${l} lights`, active: s.lights === l, locked: l === "rainbow" && !own("dec-rainbow"), preview: <div className="grid size-full place-items-center text-sm font-bold">{l === "off" ? "Off" : <span className="flex gap-0.5">{LIGHT_COLORS[l].slice(0, 4).map((c) => <i key={c} className="size-3 rounded-full" style={{ background: c }} />)}</span>}</div> })) },
    { id: "color", label: "Tree", options: [["#28664D", "Green"], ["#174B3C", "Pine"], ["#8FBFD3", "Frost"], ["#E58FA3", "Candy"]].map(([c, n]) => ({ id: c!, label: `${n} tree`, active: s.color === c, preview: <div className="size-full rounded-xl" style={{ background: c }} /> })) },
    { id: "topper", label: "Top", options: (["star", "snowflake", "heart", "bell"] as const).map((t) => ({ id: t, label: `${t} topper`, active: s.topper === t, preview: <Art id={t} /> })) },
    { id: "bg", label: "Scene", options: ([["night", "Night"], ["snow", "Snowy day"], ["cozy", "Cozy room"], ["aurora", "Aurora"]] as const).map(([b, n]) => ({ id: b, label: n, active: s.bg === b, locked: (b === "cozy" && !own("bg-cozy")) || (b === "aurora" && !own("bg-aurora")), preview: <svg viewBox="0 0 400 500" className="size-full rounded-lg"><Backdrop bg={b} /></svg> })) },
  ];

  const pick = (t: string, id: string) => {
    if (t === "lights") patch({ lights: id as Lights }); else if (t === "color") patch({ color: id }); else if (t === "topper") patch({ topper: id as Topper }); else if (t === "bg") patch({ bg: id as Bg }); else add(id);
  };
  const selItem = s.items.find((i) => i.uid === sel);
  const resize = (d: number) => setS((p) => ({ ...p, items: p.items.map((i) => (i.uid === sel ? { ...i, s: Math.max(0.5, Math.min(2.4, +(i.s + d).toFixed(2))) } : i)) }));
  const finish = () => { const n = s.items.length; onComplete({ stars: n >= 14 ? 3 : n >= 6 ? 2 : 1, score: n * 10 + (s.lights !== "off" ? 20 : 0), level: 1 }); };

  return (
    <div className="flex h-full flex-col" data-testid="tree-game" data-items={s.items.length}>
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto bg-snow/90 p-2 [scrollbar-width:none]">
        <BigButton variant="gold" size="md" disabled={!selItem} onClick={() => resize(0.2)} aria-label="Bigger">Bigger +</BigButton>
        <BigButton variant="gold" size="md" disabled={!selItem} onClick={() => resize(-0.2)} aria-label="Smaller">Smaller −</BigButton>
        <BigButton variant="ice" size="md" disabled={!selItem} aria-label="Remove" onClick={() => { setS((p) => ({ ...p, items: p.items.filter((i) => i.uid !== sel) })); setSel(null); }}><IconTrash /> Remove</BigButton>
        <BigButton variant="snow" size="md" onClick={() => { if (sure) { setS({ ...DEFAULT, next: 1 }); setSel(null); setSure(false); } else setSure(true); }}>{sure ? "Sure?" : "Start over"}</BigButton>
        <BigButton variant="red" size="md" className="ml-auto" onClick={finish}>DONE ✓</BigButton>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col landscape:flex-row">
        <div className="relative min-h-0 flex-[3] landscape:flex-1">
          <div className="absolute inset-0"><FreeStage w={W} h={H} label="Christmas tree" background={<Backdrop bg={s.bg} />} items={s.items} selected={sel}
            onSelect={(u) => { if (!paused) setSel(u); }} onDrop={(u) => setS((p) => ({ ...p, items: [...p.items.filter((i) => i.uid !== u), ...p.items.filter((i) => i.uid === u)] }))}
            onMove={(u, x, y) => !paused && setS((p) => ({ ...p, items: p.items.map((i) => (i.uid === u ? { ...i, x, y } : i)) }))} render={(it) => <Item kind={it.kind} />}>
            <TreeBody s={s} />
          </FreeStage></div>
          {msg && <p className="font-display absolute inset-x-0 top-2 mx-auto w-fit rounded-full bg-pine px-4 py-2 text-lg font-semibold text-snow shadow-soft">{msg}</p>}
        </div>
        <div className="h-[38%] shrink-0 landscape:h-auto landscape:w-[38%] landscape:max-w-sm"><Palette tabs={tabs} tab={tab} onTab={setTab} onPick={pick} onLocked={(l) => { services.sfx("error"); setMsg(`${l}: earn Wonder Stars, then unlock it in the Wish Room!`); }} /></div>
      </div>
    </div>
  );
}
