"use client";
import { useEffect, useState } from "react";

/** Measures an element so games can size grids to fit any screen (phone → desktop). */
export function useSize<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(([e]) => { if (e) setSize({ w: e.contentRect.width, h: e.contentRect.height }); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  // callback ref: also works when the element mounts later (e.g. after a menu step)
  return [setEl, size] as const;
}

/** Largest cell of the given aspect (w/h) that fits a cols×rows grid in w×h. */
export function fitCell(w: number, h: number, cols: number, rows: number, aspect = 1, gap = 10) {
  const cw = (w - gap * (cols - 1)) / cols;
  const ch = (h - gap * (rows - 1)) / rows;
  const width = Math.max(0, Math.min(cw, ch * aspect));
  return { width, height: width / aspect };
}

export const shuffle = <T,>(arr: T[], rnd: () => number = Math.random): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
};
