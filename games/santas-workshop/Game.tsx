"use client";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { GameProps } from "@/types/game";
import { Art, PALETTE as P } from "@/assets/objects/art";
import { BigButton } from "@/components/game-ui/ui";
import { IconLock } from "@/components/game-ui/icons";
import { readJSON, writeJSON } from "@/lib/storage";
import { BINS, BOWS, PAPERS, TOYS, makeOrders, makePackOrders, scoreFor, starsFor, type Order } from "./data";

const LEVEL_NAMES = ["Wrap gifts", "Sort toys", "Pack orders", "Special gifts"];
const opt = <T extends { id: string }>(list: T[], id: string) => list.find((o) => o.id === id)!;

function GiftArt({ toy, paper, bow, label, folds = 4, wrapped = false }: { toy: number; paper?: string; bow?: string; label?: string; folds?: number; wrapped?: boolean }) {
  const pc = paper ? opt(PAPERS, paper).c : "#fff"; const bc = bow ? opt(BOWS, bow).c : P.red;
  return (
    <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
      <rect x="30" y="60" width="140" height="120" rx="10" fill={wrapped || folds > 0 ? "#EDE3CF" : "none"} />
      {!wrapped && folds < 4 && <foreignObject x="55" y="75" width="90" height="90"><Art id={TOYS[toy]!.id} className="size-full" /></foreignObject>}
      {(wrapped || folds > 0) && (<g>
        {(wrapped || folds >= 1) && <path d="M30 60h140v40L100 120z" fill={pc} />}{(wrapped || folds >= 2) && <path d="M30 60v120l70-60z" fill={pc} opacity=".92" />}
        {(wrapped || folds >= 3) && <path d="M170 60v120l-70-60z" fill={pc} opacity=".92" />}{(wrapped || folds >= 4) && <path d="M30 180h140l-70-60z" fill={pc} opacity=".85" />}
        {(wrapped || folds >= 4) && <rect x="30" y="60" width="140" height="120" rx="10" fill="none" stroke="rgb(0 0 0/.12)" strokeWidth="3" />}
      </g>)}
      {bow && wrapped && (<g><rect x="92" y="60" width="16" height="120" fill={bc} /><rect x="30" y="112" width="140" height="16" fill={bc} />
        {bow === "star" ? <path d="M100 26l9 20 22 2-16 15 5 22-20-11-20 11 5-22-16-15 22-2z" fill={bc} stroke="#fff" strokeWidth="2" /> : <path d="M100 62c-30-34-56-6-34 8zM100 62c30-34 56-6 34 8z" fill={bc} stroke="#fff" strokeWidth="2" />}<circle cx="100" cy="62" r="9" fill={bc} /></g>)}
      {label && wrapped && (<g transform="translate(118 128) rotate(-8)"><rect width="64" height="30" rx="6" fill="#fff" stroke={P.goldDeep} strokeWidth="2" /><circle cx="8" cy="15" r="3" fill={P.goldDeep} /><text x="38" y="21" textAnchor="middle" fontSize="15" fontWeight="700" fill={P.pine} fontFamily="Fredoka Variable, sans-serif">{label}</text></g>)}
    </svg>
  );
}

const Choice = ({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" aria-label={label} data-choice={label} onClick={onClick} className={`grid size-20 place-items-center rounded-2xl border-b-[5px] p-1.5 sm:size-24 ${active ? "border-gold-deep bg-gold" : "border-cream bg-snow"} shadow-soft active:translate-y-1`}>{children}</button>
);
const Swatch = ({ c }: { c: string }) => <span className="block size-full rounded-xl" style={{ background: c }} />;

/* ───────── Levels 1 & 4: wrap a gift ───────── */
function WrapFlow({ orders, special, onMistake, onDone, sfx, paused }: { orders: Order[]; special: boolean; onMistake: () => void; onDone: () => void; sfx: GameProps["services"]["sfx"]; paused: boolean }) {
  const [i, setI] = useState(0); const [step, setStep] = useState<"toy" | "paper" | "wrap" | "bow" | "label" | "bag">("toy");
  const [pick, setPick] = useState<{ toy?: number; paper?: string; bow?: string; label?: string }>({}); const [folds, setFolds] = useState(0); const [shake, setShake] = useState(false); const [peek, setPeek] = useState(true);
  const o = orders[i]!; const toyOrder = TOYS[o.toy]!;
  useEffect(() => { if (!special) return; const t = setTimeout(() => setPeek(false), 5000); return () => clearTimeout(t); }, [special, i]);
  const bad = () => { sfx("error"); onMistake(); setShake(true); setTimeout(() => setShake(false), 350); };
  const good = () => sfx("match");
  const next = () => { sfx("reward"); if (i + 1 >= orders.length) onDone(); else { setI(i + 1); setStep("toy"); setPick({}); setFolds(0); setPeek(true); } };
  const belt = useMemo(() => [0, 1, 2, 3, 4, 5].map((k) => (o.toy + k * 5 + i) % 6), [o.toy, i]);
  const FOLD = ["top", "left", "right", "bottom"];
  const optsPaper = PAPERS.filter((p) => (special ? p.special || ["gold", "red"].includes(p.id) : !p.special));
  const optsBow = BOWS.filter((b) => (special ? b.special || b.id !== "blue" : !b.special));
  const nameOpts = useMemo(() => [o.name, ...["Emma", "Leo", "Mia", "Noah", "Zoe", "Max"].filter((n) => n !== o.name).slice(i % 2, (i % 2) + 2)].sort(), [o.name, i]);

  return (
    <div className="flex h-full flex-col" data-testid="wrap-flow" data-step={step} data-order-toy={toyOrder.name} data-order-paper={opt(PAPERS, o.paper).name} data-order-bow={opt(BOWS, o.bow).name} data-order-name={o.name} data-index={i}>
      <button type="button" onClick={() => setPeek((p) => !p)} className="mx-2 mt-2 flex shrink-0 items-center gap-3 rounded-2xl bg-snow p-2 text-left shadow-soft" aria-label="Order card">
        <span className="font-display rounded-full bg-red px-3 py-1 text-lg font-semibold text-snow">Order {i + 1}/{orders.length}</span>
        {peek || !special ? (
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2" title={`${toyOrder.name}, ${opt(PAPERS, o.paper).name}, ${opt(BOWS, o.bow).name}, tag ${o.name}`}>
            <Art id={toyOrder.id} className="size-10" />
            <i className="block size-8 rounded-lg ring-2 ring-white" style={{ background: opt(PAPERS, o.paper).c }} />
            <i className="block size-8 rounded-full ring-2 ring-white" style={{ background: opt(BOWS, o.bow).c }} />
            <span className="font-display rounded-lg bg-cream px-2 py-1 text-lg font-semibold">“{o.name}”</span>
            <span className="text-sm font-bold leading-tight text-evergreen">{toyOrder.name} · {opt(PAPERS, o.paper).name} · {opt(BOWS, o.bow).name}</span>
          </span>
        ) : <span className="text-base font-bold text-evergreen">Tap to see the order again</span>}
      </button>
      <div className={`grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] place-items-center p-2 ${shake ? "anim-shake" : ""}`}>
        {step === "toy" ? (
          <div className="w-full max-w-xl">
            <p className="font-display mb-2 text-center text-xl font-semibold">Find the {toyOrder.name.toLowerCase()} on the belt</p>
            <div className="overflow-hidden rounded-2xl bg-pine/80 p-3 shadow-soft [container-type:inline-size]"><div className="flex w-max gap-4 anim-belt" style={{ animationPlayState: paused ? "paused" : "running" }}>
              {belt.map((t, k) => <Choice key={k} label={TOYS[t]!.name} onClick={() => { if (t === o.toy) { good(); setPick({ toy: t }); setStep("paper"); } else bad(); }}><Art id={TOYS[t]!.id} className="size-16" /></Choice>)}
            </div></div>
          </div>
        ) : (
          <div className="aspect-square h-full max-h-72 min-h-40"><GiftArt toy={o.toy} paper={pick.paper} bow={pick.bow} label={pick.label} folds={folds} wrapped={step === "bow" || step === "label" || step === "bag"} /></div>
        )}
      </div>
      <div className="shrink-0 bg-snow/90 p-2">
        <p className="font-display mb-1 text-center text-lg font-semibold">{{ toy: "1 · Pick the toy", paper: "2 · Pick the paper", wrap: "3 · Fold it up!", bow: "4 · Add the bow", label: "5 · Choose the tag", bag: "6 · Into Santa’s bag!" }[step]}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {step === "paper" && optsPaper.map((p) => <Choice key={p.id} label={p.name} onClick={() => { if (p.id === o.paper) { good(); setPick((s) => ({ ...s, paper: p.id })); setStep("wrap"); } else bad(); }}><Swatch c={p.c} /></Choice>)}
          {step === "wrap" && <BigButton size="lg" data-fold={FOLD[folds]} aria-label={`Fold ${FOLD[folds]}`} onClick={() => { sfx("pop"); if (folds + 1 >= 4) { setFolds(4); setStep("bow"); } else setFolds(folds + 1); }}>FOLD {FOLD[folds]?.toUpperCase()} ({folds + 1}/4)</BigButton>}
          {step === "bow" && optsBow.map((b) => <Choice key={b.id} label={b.name} onClick={() => { if (b.id === o.bow) { good(); setPick((s) => ({ ...s, bow: b.id })); setStep("label"); } else bad(); }}><Swatch c={b.c} /></Choice>)}
          {step === "label" && nameOpts.map((n) => <button key={n} type="button" aria-label={`Tag ${n}`} onClick={() => { if (n === o.name) { good(); setPick((s) => ({ ...s, label: n })); setStep("bag"); } else bad(); }} className="font-display min-h-16 min-w-24 rounded-2xl border-b-[5px] border-gold-deep bg-snow px-4 text-xl font-semibold shadow-soft">{n}</button>)}
          {step === "bag" && <BigButton size="lg" variant="green" aria-label="Send to Santa's bag" onClick={next}>🎁 SEND TO SANTA’S BAG</BigButton>}
        </div>
      </div>
    </div>
  );
}

/* ───────── Level 2: sort toys by drag & drop ───────── */
function SortFlow({ total, onMistake, onDone, sfx }: { total: number; onMistake: () => void; onDone: () => void; sfx: GameProps["services"]["sfx"] }) {
  const [queue] = useState(() => Array.from({ length: total }, (_, k) => (k * 5 + Math.floor(Math.random() * 6)) % 6));
  const [i, setI] = useState(0); const [drag, setDrag] = useState<{ x: number; y: number; moved: boolean } | null>(null); const [sel, setSel] = useState(false); const [shake, setShake] = useState(false); const [fx, setFx] = useState("");
  const toy = TOYS[queue[i]!]!; const start = useRef({ x: 0, y: 0 });
  const sortInto = (cat: string) => {
    if (cat === toy.cat) { sfx("match"); setFx(cat); setTimeout(() => setFx(""), 300); setSel(false); if (i + 1 >= total) onDone(); else setI(i + 1); }
    else { sfx("error"); onMistake(); setShake(true); setTimeout(() => setShake(false), 350); }
  };
  const down = (e: PointerEvent) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); start.current = { x: e.clientX, y: e.clientY }; setDrag({ x: e.clientX, y: e.clientY, moved: false }); };
  const move = (e: PointerEvent) => setDrag((d) => d && { x: e.clientX, y: e.clientY, moved: d.moved || Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8 });
  const up = (e: PointerEvent) => { const d = drag; setDrag(null); if (!d) return; if (!d.moved) { setSel((s) => !s); return; } const bin = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-bin]"); if (bin) sortInto(bin.dataset.bin!); };
  return (
    <div className="flex h-full flex-col" data-testid="sort-flow" data-toy-cat={toy.cat} data-index={i}>
      <p className="font-display shrink-0 p-2 text-center text-xl font-semibold">Sorted {i}/{total} · drag the toy into its box</p>
      <div className={`grid min-h-0 flex-1 place-items-center ${shake ? "anim-shake" : ""}`}>
        <div className="rounded-3xl bg-pine/80 p-4 shadow-soft"><button type="button" data-toy aria-label={`${toy.name}. Drag to a box or tap it, then tap a box`} onPointerDown={down} onPointerMove={move} onPointerUp={up} className={`touch-game grid size-28 place-items-center rounded-2xl bg-snow shadow-soft ${sel ? "ring-4 ring-red" : ""} ${drag?.moved ? "opacity-30" : ""}`}><Art id={toy.id} className="size-20" /></button></div>
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-2 bg-snow/90 p-2">
        {BINS.map((b) => (
          <button key={b.id} type="button" data-bin={b.id} aria-label={`${b.name} box`} onClick={() => { if (sel) sortInto(b.id); }} className={`font-display grid min-h-24 place-items-center rounded-2xl border-b-[6px] border-black/10 text-lg font-semibold ${fx === b.id ? "anim-pop" : ""}`} style={{ background: b.color }}>
            <span>{b.name}</span><span className="text-sm opacity-70">{b.id === "cuddly" ? "bear · duck" : b.id === "fun" ? "ball · drum" : "train · robot"}</span>
          </button>
        ))}
      </div>
      {drag?.moved && <div className="pointer-events-none fixed z-50 size-20 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl" style={{ left: drag.x, top: drag.y }}><Art id={toy.id} className="size-full" /></div>}
    </div>
  );
}

/* ───────── Level 3: pack an order ───────── */
function PackFlow({ onMistake, onDone, sfx }: { onMistake: () => void; onDone: () => void; sfx: GameProps["services"]["sfx"] }) {
  const [orders] = useState(() => makePackOrders(3));
  const [i, setI] = useState(0); const [box, setBox] = useState<Record<number, number>>({}); const [shake, setShake] = useState(false);
  const need = orders[i]!.need; const have = (t: number) => box[t] ?? 0;
  const add = (t: number) => { sfx("pop"); setBox((b) => ({ ...b, [t]: (b[t] ?? 0) + 1 })); };
  const remove = (t: number) => { sfx("tap"); setBox((b) => ({ ...b, [t]: Math.max(0, (b[t] ?? 0) - 1) })); };
  const ok = Object.keys(TOYS).every((k) => have(+k) === (need[+k] ?? 0));
  const pack = () => { if (!ok) { sfx("error"); onMistake(); setShake(true); setTimeout(() => setShake(false), 350); return; } sfx("reward"); setBox({}); if (i + 1 >= orders.length) onDone(); else setI(i + 1); };
  return (
    <div className="flex h-full flex-col" data-testid="pack-flow" data-need={JSON.stringify(need)} data-index={i}>
      <div className="mx-2 mt-2 shrink-0 rounded-2xl bg-snow p-2 shadow-soft"><p className="font-display text-lg font-semibold">Order {i + 1}/{orders.length}: pack exactly</p>
        <div className="flex flex-wrap gap-2">{Object.entries(need).map(([t, n]) => <span key={t} className="font-display flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-lg font-semibold"><Art id={TOYS[+t]!.id} className="size-8" /> × {n}</span>)}</div></div>
      <div className={`grid min-h-0 flex-1 place-items-center p-2 ${shake ? "anim-shake" : ""}`}>
        <div className="w-full max-w-md rounded-3xl border-b-[8px] border-[#8A5A3C] bg-[#C99A6A] p-3 shadow-soft" aria-label="Gift box"><p className="font-display text-center font-semibold text-pine">Your box (tap to take out)</p>
          <div className="flex min-h-20 flex-wrap justify-center gap-1">{Object.entries(box).flatMap(([t, n]) => Array.from({ length: n }, (_, k) => <button key={`${t}${k}`} type="button" aria-label={`Remove ${TOYS[+t]!.name}`} onClick={() => remove(+t)} className="grid size-14 place-items-center rounded-xl bg-snow"><Art id={TOYS[+t]!.id} className="size-10" /></button>))}</div></div>
      </div>
      <div className="shrink-0 bg-snow/90 p-2"><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{TOYS.map((t, k) => <Choice key={t.id} label={`Add ${t.name}`} onClick={() => add(k)}><Art id={t.id} className="size-14" /></Choice>)}</div>
        <BigButton size="lg" className="mt-2 w-full" variant="green" onClick={pack}>PACK IT!</BigButton></div>
    </div>
  );
}

export default function Game({ paused, services, onComplete }: GameProps) {
  const [level, setLevel] = useState<number | null>(null); const [timed, setTimed] = useState(false); const [secs, setSecs] = useState(0); const [mistakes, setMistakes] = useState(0);
  const unlocked = readJSON<number>("workshop-level", 1); const finished = useRef(false);
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { if (level === null || paused) return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, [level, paused]);
  const mistakeRef = useRef(0);
  const mistake = () => { mistakeRef.current++; setMistakes((m) => m + 1); };
  const done = () => {
    if (finished.current || level === null) return; finished.current = true;
    writeJSON("workshop-level", Math.max(readJSON<number>("workshop-level", 1), Math.min(4, level + 2)));
    onComplete({ stars: starsFor(mistakeRef.current), score: scoreFor(level, mistakeRef.current, secs, timed), level: level + 1, variant: `l${level + 1}` });
  };

  if (level === null) {
    return (
      <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-gradient-to-b from-[#F3D9B1] to-[#E7C894] p-4">
        <div className="flex w-full max-w-md flex-col gap-3 rounded-card bg-snow p-5 text-center shadow-soft">
          <h2 className="font-display text-3xl font-semibold">Pick a job</h2>
          {LEVEL_NAMES.map((n, i) => <BigButton key={n} size="lg" variant={i < unlocked ? "gold" : "ice"} disabled={i >= unlocked} onClick={() => { setOrders(i === 0 ? makeOrders(3, false) : i === 3 ? makeOrders(3, true) : []); setLevel(i); setSecs(0); setMistakes(0); mistakeRef.current = 0; finished.current = false; }} aria-label={`Level ${i + 1}: ${n}${i >= unlocked ? " locked" : ""}`}>{i >= unlocked && <IconLock />} {i + 1} · {n}</BigButton>)}
          <label className="font-display flex min-h-14 items-center justify-center gap-3 rounded-full bg-cream text-xl font-semibold"><input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="size-7 accent-red" /> Beat the clock</label>
        </div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-[#F3D9B1] to-[#E7C894]" data-testid="workshop" data-mistakes={mistakes}>
      {timed && <p className="font-display shrink-0 bg-pine/80 py-1 text-center text-lg font-semibold text-snow">⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</p>}
      <div className="min-h-0 flex-1">
        {level === 0 || level === 3 ? <WrapFlow key={level} orders={orders} special={level === 3} onMistake={mistake} onDone={done} sfx={services.sfx} paused={paused} /> : level === 1 ? <SortFlow total={8} onMistake={mistake} onDone={done} sfx={services.sfx} /> : <PackFlow onMistake={mistake} onDone={done} sfx={services.sfx} />}
      </div>
    </div>
  );
}
