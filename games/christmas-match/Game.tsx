"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { GameProps } from "@/types/game";
import { Art, type ArtId } from "@/assets/objects/art";
import { BigButton } from "@/components/game-ui/ui";
import { IconLock, IconStar } from "@/components/game-ui/icons";
import { fitCell, useSize } from "@/lib/game-engine/useFit";
import { readJSON, writeJSON } from "@/lib/storage";
import { LEVELS, createBoard, findMove, reshuffle, starsFor, trySwap, type Board, type Frame, type Gem } from "./logic";

const ROWS = 7, COLS = 7, TYPES = 6;
const GEMS: { art: ArtId; color?: string; bg: string }[] = [
  { art: "bell", bg: "#FFF1C9" }, { art: "gift", color: "#D94A4A", bg: "#FADADA" }, { art: "star", bg: "#FFF6D6" },
  { art: "candycane", bg: "#FFE3E8" }, { art: "snowflake", bg: "#E3F3FA" }, { art: "ornament", color: "#5B9BD5", bg: "#DCEBF8" },
];
const GLYPH = { h: "↔", v: "↕", bomb: "✸", rainbow: "" } as const;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function GemView({ g, cell, idx, fresh, hint, selected, ghost }: { g: Gem; cell: number; idx: number; fresh?: number; hint?: boolean; selected?: boolean; ghost?: boolean }) {
  const x = (idx % COLS) * cell, y = Math.floor(idx / COLS) * cell; const d = GEMS[g.t] ?? GEMS[0]!;
  return (
    <div className="absolute left-0 top-0 p-[3px]" data-i={ghost ? undefined : idx} data-t={g.t} data-s={g.s ?? ""} style={{ width: cell, height: cell, transform: `translate(${x}px, ${y}px)`, transition: ghost ? "none" : "transform 260ms cubic-bezier(.3,.7,.4,1)", zIndex: ghost ? 5 : 1 }}>
      <div className={`relative grid size-full place-items-center rounded-2xl shadow-[inset_0_-4px_0_rgb(0_0_0/.1)] ${ghost ? "anim-pop-out" : fresh ? "anim-gem-in" : ""} ${hint ? "anim-hint" : ""} ${selected ? "ring-4 ring-red" : ""}`}
        style={{ background: g.s === "rainbow" ? "conic-gradient(#D94A4A,#F4C95D,#7BD389,#5B9BD5,#9B7BD0,#D94A4A)" : d.bg, ["--dy" as string]: `${-fresh! * cell || -cell}px` }}>
        {g.s !== "rainbow" && <Art id={d.art} color={d.color} className="w-4/5" />}
        {g.s === "rainbow" && <Art id="star" className="w-3/5 drop-shadow" />}
        {g.s && g.s !== "rainbow" && <span className="font-display absolute -right-0.5 -top-0.5 grid size-6 place-items-center rounded-full bg-pine text-xs font-bold text-gold ring-2 ring-gold">{GLYPH[g.s]}</span>}
      </div>
    </div>
  );
}

export default function Game({ paused, services, onComplete }: GameProps) {
  const [level, setLevel] = useState<number | null>(null);
  const [board, setBoard] = useState<Board>([]);
  const [fresh, setFresh] = useState<Record<number, number>>({});
  const [ghosts, setGhosts] = useState<{ idx: number; gem: Gem }[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [got, setGot] = useState<Record<number, number>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [toast, setToast] = useState("");
  const busy = useRef(false);
  const live = useRef({ score: 0, moves: 0, got: {} as Record<number, number> });
  const [area, size] = useSize<HTMLDivElement>();
  const down = useRef<{ i: number; x: number; y: number } | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const unlocked = readJSON<number>("match-level", 1);

  const start = (lv: number) => {
    const L = LEVELS[lv]!; setLevel(lv); setBoard(createBoard(ROWS, COLS, TYPES)); setFresh({}); setGhosts([]); setScore(0); setMoves(L.moves); setGot({}); setSel(null); setHint(null);
    live.current = { score: 0, moves: L.moves, got: {} }; busy.current = false;
  };

  const metGoal = (lv: number) => { const g = LEVELS[lv]!.goal; return g.kind === "score" ? live.current.score >= g.target : (live.current.got[g.type] ?? 0) >= g.target; };

  const play = useCallback(async (lv: number, a: number, b: number, current: Board) => {
    busy.current = true; setSel(null); setHint(null);
    const r = trySwap(current, ROWS, COLS, TYPES, a, b);
    const swapped = [...current]; [swapped[a], swapped[b]] = [swapped[b]!, swapped[a]!];
    setBoard(swapped); services.sfx("whoosh"); await wait(230);
    if (!alive.current) return;
    if (!r.ok) { services.sfx("error"); setBoard(current); await wait(230); busy.current = false; return; }
    live.current.moves -= 1; setMoves(live.current.moves);
    let b2: Board = swapped;
    for (const f of r.frames as Frame[]) {
      setGhosts(f.cleared.map((c) => ({ idx: c.idx, gem: c.gem }))); services.sfx(f.cascade ? "bell" : "match");
      await wait(240); if (!alive.current) return;
      setGhosts([]);
      const fr: Record<number, number> = {}; f.after.forEach((g, i) => { if (g && !b2.some((o) => o?.id === g.id)) fr[g.id] = Math.floor(i / COLS) + 1; });
      setFresh(fr); setBoard(f.after); b2 = f.after;
      live.current.score += f.gained; setScore(live.current.score);
      for (const [t, n] of Object.entries(f.collected)) live.current.got[+t] = (live.current.got[+t] ?? 0) + n;
      setGot({ ...live.current.got });
      await wait(380); if (!alive.current) return;
    }
    let final = r.frames.length ? r.frames[r.frames.length - 1]!.after : swapped;
    if (!findMove(final, ROWS, COLS)) { setToast("Shuffle!"); final = reshuffle(final, ROWS, COLS); setBoard(final); services.sfx("bell"); await wait(700); setToast(""); }
    const L = LEVELS[lv]!;
    if (metGoal(lv)) {
      const left = live.current.moves; const stars = starsFor(left, L.moves);
      writeJSON("match-level", Math.max(readJSON<number>("match-level", 1), Math.min(LEVELS.length, lv + 2)));
      onComplete({ stars, score: live.current.score + left * 20, level: lv + 1, variant: `l${lv + 1}` });
    } else if (live.current.moves <= 0) {
      onComplete({ stars: 0, score: live.current.score, level: lv + 1, variant: `l${lv + 1}` });
    } else busy.current = false;
  }, [onComplete, services]);

  // idle hint
  useEffect(() => {
    if (level === null || paused || hint) return;
    const t = setTimeout(() => { if (!busy.current) setHint(findMove(board, ROWS, COLS)); }, 7000);
    return () => clearTimeout(t);
  }, [level, board, paused, hint, sel]);

  if (level === null) {
    return (
      <div className="absolute inset-0 grid place-items-center overflow-y-auto p-4">
        <div className="flex w-full max-w-md flex-col gap-3 rounded-card bg-snow p-5 text-center shadow-soft">
          <h2 className="font-display text-3xl font-semibold">Choose a level</h2>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((L, i) => (
              <BigButton key={i} variant={i < unlocked ? "gold" : "ice"} size="lg" disabled={i >= unlocked} onClick={() => start(i)} aria-label={`Level ${i + 1}${i >= unlocked ? " locked" : ""}`}>
                {i < unlocked ? i + 1 : <IconLock />}
              </BigButton>
            ))}
          </div>
          <p className="text-lg font-bold text-evergreen">Swap neighbors to match 3 or more. Match 4 or 5 for power-ups!</p>
        </div>
      </div>
    );
  }

  const L = LEVELS[level]!; const g = L.goal;
  const cell = Math.floor(fitCell(size.w, size.h, COLS, ROWS, 1, 0).width);
  const progress = g.kind === "score" ? Math.min(1, score / g.target) : Math.min(1, (got[g.type] ?? 0) / g.target);
  const pos = (e: PointerEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const idxAt = (x: number, y: number) => (x < 0 || y < 0 || x >= cell * COLS || y >= cell * ROWS ? -1 : Math.floor(y / cell) * COLS + Math.floor(x / cell));
  const onDown = (e: PointerEvent) => { if (paused || busy.current) return; const p = pos(e); const i = idxAt(p.x, p.y); if (i >= 0) down.current = { i, ...p }; };
  const onUp = (e: PointerEvent) => {
    const d = down.current; down.current = null; if (!d || paused || busy.current) return;
    const p = pos(e); const dx = p.x - d.x, dy = p.y - d.y; let target = -1;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > cell * 0.3) {
      const horiz = Math.abs(dx) > Math.abs(dy); const c = d.i % COLS, r = Math.floor(d.i / COLS);
      const nc = horiz ? c + Math.sign(dx) : c, nr = horiz ? r : r + Math.sign(dy);
      if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) target = nr * COLS + nc;
    } else if (sel !== null && sel !== d.i && (Math.abs(sel - d.i) === COLS || (Math.abs(sel - d.i) === 1 && Math.floor(sel / COLS) === Math.floor(d.i / COLS)))) { target = d.i; services.sfx("tap"); d.i = sel; }
    else { services.sfx("tap"); setSel(sel === d.i ? null : d.i); return; }
    if (target >= 0) void play(level, d.i, target, board);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="font-display shrink-0 bg-snow/80 px-3 py-2 text-lg font-semibold">
        <div className="flex items-center justify-between"><span>Moves <b className="text-red">{moves}</b></span><span>Score {score}</span>
          <span className="flex items-center gap-1">{g.kind === "collect" ? <><Art id={GEMS[g.type]!.art} color={GEMS[g.type]!.color} className="size-7" />{Math.min(got[g.type] ?? 0, g.target)}/{g.target}</> : <>Goal {g.target}</>}</span></div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-cream" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Goal progress"><div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${progress * 100}%` }} /></div>
      </div>
      <div ref={area} className="grid min-h-0 flex-1 place-items-center p-2">
        <div className="touch-game relative rounded-2xl bg-snow/70 shadow-soft" style={{ width: cell * COLS, height: cell * ROWS }} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { down.current = null; }} data-testid="match-board" data-moves={moves} data-score={score}>
          {board.map((gm, i) => gm && <GemView key={gm.id} g={gm} idx={i} cell={cell} fresh={fresh[gm.id]} hint={!!hint && (hint[0] === i || hint[1] === i)} selected={sel === i} />)}
          {ghosts.map((gh) => <GemView key={`g${gh.gem.id}`} g={gh.gem} idx={gh.idx} cell={cell} ghost />)}
          {toast && <div className="font-display absolute inset-0 z-10 grid place-items-center text-4xl font-semibold text-pine"><span className="anim-pop rounded-full bg-gold px-6 py-3 shadow-soft">{toast}</span></div>}
        </div>
      </div>
      <p className="sr-only"><IconStar /> Level {level + 1}</p>
    </div>
  );
}
