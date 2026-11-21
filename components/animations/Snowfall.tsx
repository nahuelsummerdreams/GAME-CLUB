"use client";
import { useEffect, useRef } from "react";

/** Canvas snow. Off for reduced motion, paused when the tab is hidden. */
export function Snowfall({ count = 60, className = "" }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const flakes = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), r: 1.5 + Math.random() * 3.5, v: 0.25 + Math.random() * 0.7, s: Math.random() * Math.PI * 2 }));
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,253,247,.9)";
      for (const f of flakes) {
        f.y += (f.v * 0.0016) ; f.s += 0.012;
        if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        ctx.beginPath();
        ctx.arc(f.x * w + Math.sin(f.s) * 14, f.y * h, f.r, 0, 7);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(tick); };
    resize(); tick();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis); };
  }, [count]);
  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
