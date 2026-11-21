"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { GameProps } from "@/types/game";
import { BigButton } from "@/components/game-ui/ui";
import { useSize } from "@/lib/game-engine/useFit";
import { readJSON, writeJSON } from "@/lib/storage";
import { SCENES, Scene, type SceneId } from "./scenes";
import { SIZES, scoreFor, starsFor, trayOrder, type Size } from "./logic";

function Piece({ scene, n, id, px }: { scene: SceneId; n: number; id: number; px: number }) {
  const s = 400 / n; const c = id % n; const r = Math.floor(id / n);
  return <svg width={px} height={px} viewBox={`${c * s} ${r * s} ${s} ${s}`} className="block rounded-[6px]" aria-hidden><Scene id={scene} /></svg>;
}

export default function Game({ paused, services, onComplete }: GameProps) {
  const [scene, setScene] = useState<SceneId>("village");
  const [n, setN] = useState<Size>(3);
  const [timed, setTimed] = useState(false);
  const [started, setStarted] = useState(false);
  const [tray, setTray] = useState<number[]>([]);
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const [sel, setSel] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [secs, setSecs] = useState(0);
  const [peek, setPeek] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [area, size] = useSize<HTMLDivElement>();
  const finished = useRef(false);
  const doneList = started ? [] : readJSON<string[]>("puzzle-done", []);

  useEffect(() => {
    if (!started || paused || solved) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, paused, solved]);

  const begin = () => { setTray(trayOrder(n)); setPlaced(new Set()); setSel(null); setMistakes(0); setSecs(0); setSolved(false); finished.current = false; setStarted(true); };

  const drop = (id: number, cell: number) => {
    if (paused || placed.has(cell) || placed.has(id)) return;
    if (id === cell) {
      services.sfx("match");
      const p = new Set(placed); p.add(id); setPlaced(p); setTray((t) => t.filter((x) => x !== id)); setSel(null);
      if (p.size === n * n) {
        setSolved(true); services.sfx("bell");
        const list = readJSON<string[]>("puzzle-done", []); const key = `${scene}:${n}`;
        if (!list.includes(key)) writeJSON("puzzle-done", [...list, key]);
        setTimeout(() => { if (!finished.current) { finished.current = true; onComplete({ stars: starsFor(mistakes, n * n), score: scoreFor(n * n, mistakes, secs, timed), level: n, variant: `${n * n}` }); } }, 1600);
      }
    } else {
      services.sfx("error"); setMistakes((m) => m + 1); setShakeId(id); setTimeout(() => setShakeId(null), 400);
    }
  };

  const down = (e: PointerEvent, id: number) => { if (paused || solved) return; e.currentTarget.setPointerCapture(e.pointerId); setDrag({ id, x: e.clientX, y: e.clientY, moved: false }); };
  const move = (e: PointerEvent) => setDrag((d) => d && { ...d, x: e.clientX, y: e.clientY, moved: d.moved || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 });
  const up = (e: PointerEvent) => {
    if (!drag) return;
    if (drag.moved) {
      const cellEl = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-cell]");
      if (cellEl) drop(drag.id, Number(cellEl.dataset.cell)); else services.sfx("tap");
    } else { services.sfx("tap"); setSel((s) => (s === drag.id ? null : drag.id)); }
    setDrag(null);
  };

  if (!started) {
    return (
      <div className="absolute inset-0 overflow-y-auto p-3">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-card bg-snow p-4 text-center shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Choose a picture</h2>
          <div className="grid grid-cols-2 gap-3">
            {SCENES.map((s) => (
              <button key={s.id} type="button" aria-pressed={scene === s.id} onClick={() => setScene(s.id)} className={`relative overflow-hidden rounded-2xl border-4 ${scene === s.id ? "border-red" : "border-cream"}`}>
                <svg viewBox="0 0 400 400" className="block w-full" role="img" aria-label={s.name}><Scene id={s.id} /></svg>
                <span className="font-display absolute inset-x-0 bottom-0 bg-pine/80 py-1 text-sm font-semibold text-snow">{s.name}{doneList.some((k) => k.startsWith(s.id)) ? " ✓" : ""}</span>
              </button>
            ))}
          </div>
          <h2 className="font-display text-2xl font-semibold">How many pieces?</h2>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((k) => <button key={k} type="button" aria-pressed={n === k} onClick={() => setN(k)} className={`font-display min-h-14 rounded-full text-xl font-semibold ${n === k ? "bg-red text-snow" : "bg-cream"}`}>{k * k}</button>)}
          </div>
          <label className="font-display flex min-h-14 items-center justify-center gap-3 rounded-full bg-cream text-xl font-semibold"><input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="size-7 accent-red" /> Show timer</label>
          <BigButton size="lg" onClick={begin}>START PUZZLE</BigButton>
        </div>
      </div>
    );
  }

  const side = Math.max(120, Math.min(size.w, size.h) - 8);
  const cell = Math.floor(side / n);
  const trayPx = Math.max(48, Math.min(cell, 84));
  return (
    <div className="flex h-full flex-col" onPointerMove={move} onPointerUp={up} onPointerCancel={() => setDrag(null)}>
      <div className="font-display flex shrink-0 items-center justify-between gap-2 bg-snow/80 px-3 py-1 text-lg font-semibold">
        <span>Pieces {placed.size}/{n * n}</span>
        {timed && <span>⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</span>}
        <button type="button" aria-pressed={peek} onClick={() => setPeek((p) => !p)} className="min-h-11 rounded-full bg-gold px-4">Peek</button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col landscape:flex-row">
        <div ref={area} className="grid min-h-0 flex-[3] place-items-center p-1 landscape:flex-1">
          <div className="relative touch-game overflow-hidden rounded-2xl bg-snow shadow-soft" style={{ width: cell * n, height: cell * n }} data-testid="board">
            {peek && <svg viewBox="0 0 400 400" className="absolute inset-0 size-full opacity-40" aria-hidden><Scene id={scene} /></svg>}
            <div className="grid size-full" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
              {Array.from({ length: n * n }, (_, i) => (
                <button key={i} type="button" data-cell={i} aria-label={placed.has(i) ? `Piece ${i + 1} placed` : `Empty spot ${i + 1}`} disabled={placed.has(i)} onClick={() => { if (sel !== null) drop(sel, i); }}
                  className={`relative ${placed.has(i) ? "" : "border border-dashed border-ice bg-cream/40"} ${solved ? "anim-pop" : ""}`}>
                  {placed.has(i) && <Piece scene={scene} n={n} id={i} px={cell} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-[2] overflow-y-auto bg-ice/60 p-2 landscape:max-w-[34%] landscape:flex-1" data-testid="tray">
          <div className="flex flex-wrap content-start justify-center gap-2">
            {tray.map((id) => (
              <button key={id} type="button" data-piece={id} aria-label={`Puzzle piece ${id + 1}`} aria-pressed={sel === id} onPointerDown={(e) => down(e, id)}
                className={`touch-game shrink-0 rounded-lg shadow-soft ${sel === id ? "ring-4 ring-red" : "ring-2 ring-snow"} ${shakeId === id ? "anim-shake" : ""} ${drag?.id === id && drag.moved ? "opacity-30" : ""}`}>
                <Piece scene={scene} n={n} id={id} px={trayPx} />
              </button>
            ))}
          </div>
        </div>
      </div>
      {drag?.moved && (
        <div className="pointer-events-none fixed z-50 drop-shadow-xl" style={{ left: drag.x - cell / 2, top: drag.y - cell / 2, width: cell, height: cell }}>
          <Piece scene={scene} n={n} id={drag.id} px={cell} />
        </div>
      )}
    </div>
  );
}
