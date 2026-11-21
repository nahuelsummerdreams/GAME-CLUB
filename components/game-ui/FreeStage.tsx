"use client";
import { useRef, type PointerEvent, type ReactNode } from "react";

export interface StageItem { uid: number; kind: string; x: number; y: number; s: number }

interface Props {
  w: number; h: number;
  background: ReactNode;
  items: StageItem[];
  selected: number | null;
  onSelect: (uid: number | null) => void;
  onMove: (uid: number, x: number, y: number) => void;
  /** Called when a drag/tap ends — safe moment to reorder (reordering mid-drag would drop pointer capture). */
  onDrop?: (uid: number) => void;
  render: (item: StageItem) => ReactNode;
  /** Extra invisible touch radius per item (default 34). Keep small for tightly packed parts. */
  hit?: (item: StageItem) => number;
  label: string;
  /** Always-on art drawn below items (e.g. the tree). */
  children?: ReactNode;
}

/** Touch/mouse friendly free-placement SVG stage: drag items, tap to select, tap empty space to deselect. */
export function FreeStage({ w, h, background, items, selected, onSelect, onMove, onDrop, render, hit, label, children }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ uid: number; dx: number; dy: number } | null>(null);

  const pt = (e: PointerEvent) => {
    const m = svg.current!.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  };
  const down = (e: PointerEvent, it: StageItem) => {
    e.stopPropagation(); (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = pt(e); drag.current = { uid: it.uid, dx: it.x - p.x, dy: it.y - p.y }; onSelect(it.uid);
  };
  const move = (e: PointerEvent) => {
    const d = drag.current; if (!d) return; const p = pt(e);
    onMove(d.uid, Math.max(0, Math.min(w, p.x + d.dx)), Math.max(0, Math.min(h, p.y + d.dy)));
  };
  const end = () => { const d = drag.current; drag.current = null; if (d) onDrop?.(d.uid); };
  return (
    <svg ref={svg} viewBox={`0 0 ${w} ${h}`} className="touch-game size-full" role="application" aria-label={label} onPointerDown={() => onSelect(null)} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      {background}
      {children}
      {items.map((it) => (
        <g key={it.uid} data-item={it.kind} data-uid={it.uid} transform={`translate(${it.x} ${it.y}) scale(${it.s})`} onPointerDown={(e) => down(e, it)} className="cursor-grab">
          <circle r={hit?.(it) ?? 34} fill="transparent" />
          {render(it)}
          {selected === it.uid && <circle r="38" fill="none" stroke="#D94A4A" strokeWidth="3" strokeDasharray="7 6" pointerEvents="none" />}
        </g>
      ))}
    </svg>
  );
}
