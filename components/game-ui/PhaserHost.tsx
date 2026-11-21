"use client";
import { useEffect, useRef } from "react";
import type PhaserNS from "phaser";

type PhaserModule = typeof PhaserNS;

/**
 * Mounts a Phaser 3 game (lazy-loaded, CANVAS renderer for maximum device compatibility),
 * honours `paused`, and fully releases resources on unmount.
 */
export function PhaserHost({ create, paused }: { create: (Phaser: PhaserModule, parent: HTMLElement) => PhaserNS.Game | Promise<PhaserNS.Game>; paused: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const game = useRef<PhaserNS.Game | null>(null);
  const pausedRef = useRef(paused);
  const createRef = useRef(create);

  useEffect(() => {
    let cancelled = false;
    void import("phaser").then(async (m) => {
      if (cancelled || !el.current) return;
      const Phaser = ((m as unknown as { default?: PhaserModule }).default ?? m) as PhaserModule;
      const g = await createRef.current(Phaser, el.current);
      if (cancelled) { g.loop.wake(); g.destroy(true); return; } // unmounted while assets were loading
      game.current = g;
      if (pausedRef.current) g.events.once("ready", () => g.loop.sleep());
    });
    return () => {
      cancelled = true;
      const g = game.current;
      game.current = null;
      if (g) {
        // Phaser destroys on its next frame: a sleeping loop (paused / finished game) would never get there and leak.
        g.loop.wake();
        g.destroy(true);
      }
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    const g = game.current;
    if (!g || !g.isBooted) return;
    if (paused) g.loop.sleep(); else g.loop.wake();
  }, [paused]);

  return <div ref={el} className="touch-game absolute inset-0 overflow-hidden" data-testid="phaser-host" />;
}
