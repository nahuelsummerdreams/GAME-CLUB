"use client";
import { useEffect } from "react";
import { GAMES } from "@/lib/game-engine/registry";

/** Registers the service worker (production only) and warms game chunks when idle so every game works offline. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || (conn?.effectiveType && conn.effectiveType !== "4g")) return; // never burn a kid's data plan on pre-caching
    const warm = () => { GAMES.forEach((g) => void g.load().catch(() => {})); void import("phaser").catch(() => {}); }; // Phaser is fetched on demand, so warm it too
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    // wait until the player is already enjoying the app, then fill the offline cache in the background
    const t = setTimeout(() => { if (w.requestIdleCallback) w.requestIdleCallback(warm, { timeout: 10000 }); else warm(); }, 6000);
    return () => clearTimeout(t);
  }, []);
  return null;
}
