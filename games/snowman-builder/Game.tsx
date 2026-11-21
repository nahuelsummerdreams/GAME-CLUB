"use client";
import { useEffect, useRef, useState } from "react";
import type { GameProps } from "@/types/game";
import { PALETTE as P } from "@/assets/objects/art";
import { BigButton } from "@/components/game-ui/ui";
import { FreeStage, type StageItem } from "@/components/game-ui/FreeStage";
import { Palette, type PaletteTab } from "@/components/game-ui/Palette";
import { Backdrop, type Bg } from "@/components/game-ui/Backdrop";
import { IconTrash } from "@/components/game-ui/icons";
import { readJSON, writeJSON } from "@/lib/storage";
import { useAppState } from "@/lib/state/store";

interface SnowState { size: 0 | 1 | 2; bg: Bg; items: StageItem[]; next: number }
const DEFAULT: SnowState = { size: 1, bg: "snow", items: [], next: 1 };
const W = 400, H = 500;
const SIZES = [{ b: 70, m: 52, h: 38 }, { b: 80, m: 60, h: 44 }, { b: 92, m: 68, h: 50 }];
function geo(i: 0 | 1 | 2) { const g = SIZES[i]!; const by = 455 - g.b; const my = by - g.b - g.m * 0.55; const hy = my - g.m - g.h * 0.55; return { ...g, by, my, hy }; }

/** Parts that live in one slot (a new pick replaces the old one). */
const SINGLE = ["eyes", "nose", "mouth", "hat", "scarf", "arms"];
const MID = ["arms", "buttons"];
const OWN: Record<string, string> = { top: "hat-top", beanie: "hat-beanie", crown: "hat-crown", candy: "scarf-candy", ice: "scarf-ice", glasses: "acc-glasses", bow: "acc-bow" };

function Part({ kind }: { kind: string }) {
  const [slot, v] = kind.split("|");
  const k = `${slot}|${v}`;
  switch (k) {
    case "eyes|dots": return <g fill={P.pine}><circle cx="-14" r="5" /><circle cx="14" r="5" /></g>;
    case "eyes|happy": return <g stroke={P.pine} strokeWidth="4.5" strokeLinecap="round" fill="none"><path d="M-21 3q7-11 14 0M7 3q7-11 14 0" /></g>;
    case "eyes|big": return <g><circle cx="-15" r="10" fill="#fff" stroke={P.pine} strokeWidth="2" /><circle cx="15" r="10" fill="#fff" stroke={P.pine} strokeWidth="2" /><circle cx="-13" cy="1" r="4.5" fill={P.pine} /><circle cx="17" cy="1" r="4.5" fill={P.pine} /></g>;
    case "eyes|sleepy": return <g stroke={P.pine} strokeWidth="4.5" strokeLinecap="round"><path d="M-21 0h14M7 0h14" /></g>;
    case "nose|carrot": return <g><path d="M-6 -3h12l-5 25z" fill={P.orange} /><path d="M-3 5h5M-2 12h4" stroke="#C97430" strokeWidth="1.5" /></g>;
    case "nose|long": return <g><path d="M-5 -2h10l-3 44z" fill={P.orange} /></g>;
    case "nose|button": return <g><circle r="8" fill={P.red} /><circle cx="-2" cy="-2" r="2.5" fill="#fff" opacity=".6" /></g>;
    case "mouth|smile": return <path d="M-20 -2q20 22 40 0" stroke={P.pine} strokeWidth="4.5" strokeLinecap="round" fill="none" />;
    case "mouth|grin": return <path d="M-20 -3q20 28 40 0z" fill={P.pine} />;
    case "mouth|o": return <ellipse rx="7" ry="9" fill={P.pine} />;
    case "mouth|coal": return <g fill={P.pine}>{[-18, -9, 0, 9, 18].map((x, i) => <circle key={x} cx={x} cy={[-2, 4, 7, 4, -2][i]} r="3" />)}</g>;
    case "hat|santa": return <g><path d="M-30 0C-30 -34 10 -58 32 -34c-8 4-8 14-12 34z" fill={P.red} /><rect x="-36" y="-8" width="72" height="14" rx="7" fill="#fff" /><circle cx="32" cy="-36" r="9" fill="#fff" /></g>;
    case "hat|pail": return <g><path d="M-26 -42h52l8 42h-68z" fill="#9AA7B0" stroke="#7A8791" strokeWidth="3" /><path d="M-30 -22h60" stroke="#7A8791" strokeWidth="3" /><rect x="-36" y="-4" width="72" height="9" rx="4" fill="#7A8791" /></g>;
    case "hat|top": return <g><rect x="-22" y="-52" width="44" height="50" rx="4" fill="#2B2B2B" /><rect x="-40" y="-6" width="80" height="10" rx="5" fill="#2B2B2B" /><rect x="-22" y="-20" width="44" height="9" fill={P.red} /></g>;
    case "hat|beanie": return <g><path d="M-32 0C-32 -44 32 -44 32 0z" fill={P.blue} /><rect x="-36" y="-10" width="72" height="14" rx="7" fill="#fff" /><circle cy="-42" r="9" fill="#fff" /></g>;
    case "hat|crown": return <g><path d="M-34 4l6-34 16 16 12-26 12 26 16-16 6 34z" fill={P.gold} stroke={P.goldDeep} strokeWidth="3" strokeLinejoin="round" /><circle cy="-8" r="5" fill={P.red} /></g>;
    case "scarf|red": case "scarf|green": return <g><path d="M-46 0q46 26 92 0v16q-46 26-92 0z" fill={v === "red" ? P.red : "#3C9A6B"} /><path d="M18 14l8 38 16-4-6-36z" fill={v === "red" ? P.red : "#3C9A6B"} /><path d="M-30 6v16M-10 10v16M10 10v16M30 6v16" stroke="rgb(255 255 255/.4)" strokeWidth="4" /></g>;
    case "scarf|candy": return <g><path d="M-46 0q46 26 92 0v16q-46 26-92 0z" fill="#fff" /><path d="M-46 8q46 26 92 0" stroke={P.red} strokeWidth="14" strokeDasharray="9 9" fill="none" /><path d="M18 14l8 38 16-4-6-36z" fill={P.red} /></g>;
    case "scarf|ice": return <g><path d="M-46 0q46 26 92 0v16q-46 26-92 0z" fill={P.ice} stroke="#8FBFD3" strokeWidth="3" /><path d="M18 14l8 38 16-4-6-36z" fill={P.ice} stroke="#8FBFD3" strokeWidth="3" /></g>;
    case "arms|sticks": return <g stroke="#6B4630" strokeWidth="6" strokeLinecap="round" fill="none"><path d="M-62 0L-112 -30M-95 -22l-4-22M-98 -24l-18 -6M62 0L112 -30M95 -22l4-22M98 -24l18-6" /></g>;
    case "arms|mittens": return <g><path d="M-62 0L-104 -24M62 0L104 -24" stroke="#6B4630" strokeWidth="6" strokeLinecap="round" /><circle cx="-108" cy="-27" r="13" fill={P.red} /><circle cx="108" cy="-27" r="13" fill={P.red} /><rect x="-118" y="-20" width="20" height="6" fill="#fff" /><rect x="98" y="-20" width="20" height="6" fill="#fff" /></g>;
    case "buttons|coal": return <g fill={P.pine}>{[-26, 0, 26].map((y) => <circle key={y} cy={y} r="6" />)}</g>;
    case "buttons|colors": return <g>{[[-26, P.red], [0, P.gold], [26, P.blue]].map(([y, c]) => <circle key={y as number} cy={y as number} r="7" fill={c as string} />)}</g>;
    case "acc|glasses": return <g fill={P.gold} fillOpacity=".55" stroke={P.goldDeep} strokeWidth="4"><circle cx="-17" r="12" /><circle cx="17" r="12" /><path d="M-5 0h10" /></g>;
    case "acc|bow": return <g><path d="M0 0c-14-16-30-8-22 4zM0 0c14-16 30-8 22 4z" fill={P.candy} stroke={P.red} strokeWidth="3" /><circle r="5" fill={P.red} /></g>;
    case "acc|star": return <g transform="translate(-14 -14) scale(.28)"><path d="M50 8l11.5 25.5 27.5 3-20.5 18.5 5.8 27.2L50 69 25.7 82.2l5.8-27.2L11 36.5l27.5-3z" fill={P.gold} stroke={P.goldDeep} strokeWidth="5" /></g>;
    default: return null;
  }
}

function SnowmanBody({ size }: { size: 0 | 1 | 2 }) {
  const g = geo(size);
  return (
    <g>
      <ellipse cx="200" cy="458" rx={g.b + 14} ry="9" fill="rgb(23 75 60/.14)" />
      {[[g.by, g.b], [g.my, g.m], [g.hy, g.h]].map(([y, r], i) => (<g key={i}><circle cx="200" cy={y} r={r} fill="#FFFDF7" stroke="#B9DDEC" strokeWidth="4" /><path d={`M${200 - r! * 0.55} ${y! - r! * 0.5}a${r! * 0.7} ${r! * 0.7} 0 0 1 ${r! * 0.55} ${-r! * 0.3}`} stroke="#E5F2F8" strokeWidth="6" strokeLinecap="round" fill="none" /></g>))}
    </g>
  );
}

function defaults(kind: string, size: 0 | 1 | 2) {
  const g = geo(size); const hs = g.h / 44; const [slot] = kind.split("|");
  switch (slot) {
    case "eyes": return { x: 200, y: g.hy - g.h * 0.12, s: hs };
    case "nose": return { x: 200, y: g.hy + g.h * 0.1, s: hs };
    case "mouth": return { x: 200, y: g.hy + g.h * 0.62, s: hs };
    case "hat": return { x: 200, y: g.hy - g.h * 0.82, s: hs };
    case "scarf": return { x: 200, y: g.hy + g.h * 0.88, s: hs * 1.05 };
    case "arms": return { x: 200, y: g.my - g.m * 0.1, s: g.m / 60 };
    case "buttons": return { x: 200, y: g.my + g.m * 0.05, s: g.m / 60 };
    default: return { x: 200, y: g.hy - g.h * 0.1, s: hs };
  }
}

export default function Game({ paused, onComplete, services }: GameProps) {
  const { progress } = useAppState();
  const [s, setS] = useState<SnowState>(() => ({ ...DEFAULT, ...readJSON<Partial<SnowState>>("snowman", {}) }));
  const [sel, setSel] = useState<number | null>(null);
  const [tab, setTab] = useState("body");
  const [msg, setMsg] = useState("");
  const [sure, setSure] = useState(false);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } writeJSON("snowman", s); }, [s]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 2200); return () => clearTimeout(t); }, [msg]);
  useEffect(() => { if (!sure) return; const t = setTimeout(() => setSure(false), 3000); return () => clearTimeout(t); }, [sure]);
  const own = (v: string) => !OWN[v] || progress.unlocked.includes(OWN[v]!);

  const addPart = (kind: string) => {
    services.sfx("pop");
    setS((p) => { const slot = kind.split("|")[0]!; const d = defaults(kind, p.size); const keep = SINGLE.includes(slot) ? p.items.filter((i) => i.kind.split("|")[0] !== slot) : p.items;
      return { ...p, next: p.next + 1, items: [...keep, { uid: p.next, kind, ...d, ...(slot === "acc" ? { x: 200 + (p.next % 2 ? -1 : 1) * geo(p.size).h * 1.0, y: geo(p.size).hy + geo(p.size).h * 0.45 } : {}) }] }; });
  };
  const changeSize = (size: 0 | 1 | 2) => {
    services.sfx("tap");
    setS((p) => { const a = geo(p.size), b = geo(size);
      return { ...p, size, items: p.items.map((i) => { const mid = MID.includes(i.kind.split("|")[0]!); const dy = mid ? b.my - a.my : b.hy - a.hy; const r = mid ? b.m / a.m : b.h / a.h; return { ...i, x: 200 + (i.x - 200) * r, y: i.y + dy, s: i.s * r }; }) }; });
  };
  const bodyTab: PaletteTab = { id: "body", label: "Body", options: ([["Small", 0], ["Medium", 1], ["Large", 2]] as const).map(([n, v]) => ({ id: String(v), label: `${n} snowman`, active: s.size === v, preview: <svg viewBox="100 40 200 430"><SnowmanBody size={v} /></svg> })) };
  const mk = (id: string, label: string, slot: string, variants: [string, string][]): PaletteTab => ({ id, label, options: variants.map(([v, n]) => ({ id: `${slot}|${v}`, label: n, locked: !own(v), preview: <svg viewBox="-60 -60 120 120"><Part kind={`${slot}|${v}`} /></svg> })) });
  const tabs: PaletteTab[] = [
    bodyTab,
    mk("eyes", "Eyes", "eyes", [["dots", "Dot eyes"], ["happy", "Happy eyes"], ["big", "Big eyes"], ["sleepy", "Sleepy eyes"]]),
    mk("nose", "Nose", "nose", [["carrot", "Carrot nose"], ["long", "Long carrot"], ["button", "Button nose"]]),
    mk("mouth", "Mouth", "mouth", [["smile", "Smile"], ["grin", "Big grin"], ["o", "Surprised"], ["coal", "Coal smile"]]),
    mk("hat", "Hats", "hat", [["santa", "Santa hat"], ["pail", "Tin pail"], ["top", "Top hat"], ["beanie", "Beanie"], ["crown", "Crown"]]),
    mk("scarf", "Scarf", "scarf", [["red", "Red scarf"], ["green", "Green scarf"], ["candy", "Candy scarf"], ["ice", "Ice scarf"]]),
    mk("arms", "Arms", "arms", [["sticks", "Stick arms"], ["mittens", "Mittens"]]),
    mk("extras", "Extras", "x", []),
    { id: "bg", label: "Scene", options: ([["night", "Night"], ["snow", "Snowy day"], ["cozy", "Cozy room"], ["aurora", "Aurora"]] as const).map(([b, n]) => ({ id: b, label: n, active: s.bg === b, locked: (b === "cozy" && !progress.unlocked.includes("bg-cozy")) || (b === "aurora" && !progress.unlocked.includes("bg-aurora")), preview: <svg viewBox="0 0 400 500" className="size-full rounded-lg"><Backdrop bg={b} /></svg> })) },
  ];
  const extras = tabs.find((t) => t.id === "extras")!;
  extras.options = ([["buttons|coal", "Coal buttons"], ["buttons|colors", "Candy buttons"], ["acc|star", "Star pin"], ["acc|glasses", "Star glasses"], ["acc|bow", "Gift bow"]] as const).map(([id, n]) => ({ id, label: n, locked: !own(id.split("|")[1]!), preview: <svg viewBox="-60 -60 120 120"><Part kind={id} /></svg> }));

  const pick = (t: string, id: string) => { if (t === "body") changeSize(Number(id) as 0 | 1 | 2); else if (t === "bg") { services.sfx("tap"); setS((p) => ({ ...p, bg: id as Bg })); } else addPart(id); };
  const selItem = s.items.find((i) => i.uid === sel);
  const resize = (d: number) => setS((p) => ({ ...p, items: p.items.map((i) => (i.uid === sel ? { ...i, s: Math.max(0.3, Math.min(3, +(i.s + d).toFixed(2))) } : i)) }));
  const finish = () => { const n = s.items.length; onComplete({ stars: n >= 8 ? 3 : n >= 4 ? 2 : 1, score: n * 10 + s.size * 5, level: 1 }); };

  return (
    <div className="flex h-full flex-col" data-testid="snowman-game" data-items={s.items.length}>
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto bg-snow/90 p-2 [scrollbar-width:none]">
        <BigButton variant="gold" disabled={!selItem} onClick={() => resize(0.15)} aria-label="Bigger">Bigger +</BigButton>
        <BigButton variant="gold" disabled={!selItem} onClick={() => resize(-0.15)} aria-label="Smaller">Smaller −</BigButton>
        <BigButton variant="ice" disabled={!selItem} aria-label="Remove" onClick={() => { setS((p) => ({ ...p, items: p.items.filter((i) => i.uid !== sel) })); setSel(null); }}><IconTrash /> Remove</BigButton>
        <BigButton variant="snow" onClick={() => { if (sure) { setS({ ...DEFAULT, next: 1 }); setSel(null); setSure(false); } else setSure(true); }}>{sure ? "Sure?" : "Start over"}</BigButton>
        <BigButton variant="red" className="ml-auto" onClick={finish}>DONE ✓</BigButton>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col landscape:flex-row">
        <div className="relative min-h-0 flex-[3] landscape:flex-1">
          <div className="absolute inset-0">
            <FreeStage w={W} h={H} label="Snowman" background={<Backdrop bg={s.bg} />} items={s.items} selected={sel}
              onSelect={(u) => { if (!paused) setSel(u); }} onDrop={(u) => setS((p) => ({ ...p, items: [...p.items.filter((i) => i.uid !== u), ...p.items.filter((i) => i.uid === u)] }))}
              onMove={(u, x, y) => !paused && setS((p) => ({ ...p, items: p.items.map((i) => (i.uid === u ? { ...i, x, y } : i)) }))} render={(it) => <Part kind={it.kind} />} hit={(it) => { const k = it.kind.split("|")[0]!; return ["hat", "scarf", "eyes"].includes(k) ? 0 : ["nose", "mouth", "acc", "buttons"].includes(k) ? 13 : 34; }}>
              <SnowmanBody size={s.size} />
            </FreeStage>
          </div>
          {msg && <p className="font-display absolute inset-x-0 top-2 mx-auto w-fit max-w-[92%] rounded-full bg-pine px-4 py-2 text-center text-lg font-semibold text-snow shadow-soft">{msg}</p>}
        </div>
        <div className="h-[38%] shrink-0 landscape:h-auto landscape:w-[38%] landscape:max-w-sm"><Palette tabs={tabs} tab={tab} onTab={setTab} onPick={pick} onLocked={(l) => { services.sfx("error"); setMsg(`${l}: earn Wonder Stars, then unlock it in the Wish Room!`); }} /></div>
      </div>
    </div>
  );
}
