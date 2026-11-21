"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameProps } from "@/types/game";
import { Art } from "@/assets/objects/art";
import { BigButton } from "@/components/game-ui/ui";
import { fitCell, useSize } from "@/lib/game-engine/useFit";
import { readJSON } from "@/lib/storage";
import { LEVELS, SYMBOLS, buildDeck, scoreFor, starsFor, type Card, type Difficulty } from "./logic";

function CardFace({ card, open, done, w, h, onFlip }: { card: Card; open: boolean; done: boolean; w: number; h: number; onFlip: () => void }) {
  const s = SYMBOLS[card.sym]!;
  return (
    <button type="button" data-sym={card.sym} aria-label={open || done ? `${s.art} card` : "Hidden card"} aria-pressed={open || done} onClick={onFlip} disabled={open || done}
      style={{ width: w, height: h, perspective: 700 }} className="relative disabled:cursor-default">
      <span className="absolute inset-0 transition-transform duration-300 [transform-style:preserve-3d]" style={{ transform: open || done ? "rotateY(180deg)" : "none" }}>
        <span className="absolute inset-0 grid place-items-center rounded-2xl border-b-[5px] border-pine bg-evergreen shadow-soft [backface-visibility:hidden]">
          <Art id="snowflake" className="w-3/5 opacity-80" />
        </span>
        <span className={`absolute inset-0 grid place-items-center rounded-2xl border-b-[5px] [backface-visibility:hidden] [transform:rotateY(180deg)] ${done ? "border-gold-deep bg-gold/40 ring-4 ring-gold" : "border-cream bg-snow"}`}>
          <Art id={s.art} color={s.color || undefined} className="w-4/5" />
        </span>
      </span>
    </button>
  );
}

export default function Game({ paused, services, onComplete }: GameProps) {
  const [diff, setDiff] = useState<Difficulty | null>(null);
  const [timed, setTimed] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [left, setLeft] = useState(0);
  const lock = useRef(false);
  const [area, size] = useSize<HTMLDivElement>();
  const finished = useRef(false);

  const begin = (d: Difficulty) => {
    setDiff(d); setDeck(buildDeck(LEVELS[d].pairs)); setOpen([]); setFound(new Set()); setMoves(0); setLeft(LEVELS[d].seconds); lock.current = false; finished.current = false;
  };

  const finish = useCallback((d: Difficulty, m: number, secs: number | null, won: boolean) => {
    if (finished.current) return; finished.current = true;
    const pairs = LEVELS[d].pairs;
    onComplete({ stars: won ? starsFor(m, pairs) : 0, score: won ? scoreFor(m, pairs, secs) : 0, level: 1, variant: `${d}${timed ? "-timed" : ""}` });
  }, [onComplete, timed]);

  useEffect(() => {
    if (!diff || !timed || paused || finished.current) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [diff, timed, paused]);
  useEffect(() => { if (diff && timed && left <= 0 && !finished.current) finish(diff, moves, 0, false); }, [left, diff, timed, moves, finish]);

  const flip = (i: number) => {
    if (!diff || paused || lock.current || open.includes(i) || found.has(deck[i]!.id)) return;
    services.sfx("flip");
    const next = [...open, i]; setOpen(next);
    if (next.length < 2) return;
    const m = moves + 1; setMoves(m); lock.current = true;
    const [a, b] = next as [number, number];
    if (deck[a]!.sym === deck[b]!.sym) {
      setTimeout(() => {
        services.sfx("match");
        const f = new Set(found); f.add(deck[a]!.id); f.add(deck[b]!.id); setFound(f); setOpen([]); lock.current = false;
        if (f.size === deck.length) setTimeout(() => finish(diff, m, timed ? left : null, true), 500);
      }, 350);
    } else {
      setTimeout(() => { services.sfx("error"); setOpen([]); lock.current = false; }, 800);
    }
  };

  if (!diff) {
    const best = (d: Difficulty) => readJSON<{ records?: Record<string, number> }>("progress", {}).records?.[`christmas-memory:${d}`] ?? 0;
    return (
      <div className="absolute inset-0 grid place-items-center overflow-y-auto p-4">
        <div className="flex w-full max-w-md flex-col gap-3 rounded-card bg-snow p-5 text-center shadow-soft">
          <h2 className="font-display text-3xl font-semibold">Pick a level</h2>
          {(Object.keys(LEVELS) as Difficulty[]).map((d) => (
            <BigButton key={d} size="lg" variant={d === "easy" ? "green" : d === "medium" ? "gold" : "red"} onClick={() => begin(d)}>
              {LEVELS[d].label} · {LEVELS[d].pairs * 2} cards{best(d) ? ` · best ${best(d)}` : ""}
            </BigButton>
          ))}
          <label className="font-display flex min-h-14 items-center justify-center gap-3 rounded-full bg-cream text-xl font-semibold">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="size-7 accent-red" /> Beat the clock
          </label>
        </div>
      </div>
    );
  }

  const L = LEVELS[diff];
  const portrait = size.h > size.w; // phones held upright get a taller grid → bigger cards
  const cols = portrait ? Math.min(L.cols, L.rows) : Math.max(L.cols, L.rows);
  const rows = L.pairs * 2 / cols;
  const cell = fitCell(size.w, size.h, cols, rows, 0.78, 10);
  return (
    <div className="flex h-full flex-col">
      <div className="font-display flex shrink-0 items-center justify-around bg-snow/80 py-2 text-xl font-semibold text-pine">
        <span>Moves {moves}</span><span>Pairs {found.size / 2}/{L.pairs}</span>{timed && <span aria-live="off">⏱ {Math.max(0, left)}s</span>}
      </div>
      <div ref={area} className="grid min-h-0 flex-1 place-items-center p-3">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, ${cell.width}px)`, gap: 10 }} data-testid="memory-grid">
          {deck.map((c, i) => <CardFace key={c.id} card={c} open={open.includes(i)} done={found.has(c.id)} w={cell.width} h={cell.height} onFlip={() => flip(i)} />)}
        </div>
      </div>
    </div>
  );
}
