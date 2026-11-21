"use client";
import type { ReactNode } from "react";
import { IconLock } from "./icons";

export interface PaletteOption { id: string; label: string; preview: ReactNode; locked?: boolean; active?: boolean }
export interface PaletteTab { id: string; label: string; options: PaletteOption[] }

/** Tabbed tray of big touch buttons. */
export function Palette({ tabs, tab, onTab, onPick, onLocked }: { tabs: PaletteTab[]; tab: string; onTab: (id: string) => void; onPick: (tab: string, id: string) => void; onLocked: (label: string) => void }) {
  const cur = tabs.find((t) => t.id === tab) ?? tabs[0]!;
  return (
    <div className="flex h-full min-h-0 flex-col bg-snow/90">
      <div role="tablist" className="flex shrink-0 gap-1 overflow-x-auto p-2 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === cur.id} onClick={() => onTab(t.id)} className={`font-display min-h-12 shrink-0 rounded-full px-4 text-lg font-semibold ${t.id === cur.id ? "bg-red text-snow" : "bg-cream"}`}>{t.label}</button>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[repeat(auto-fill,minmax(72px,1fr))] content-start gap-2 overflow-y-auto p-2">
        {cur.options.map((o) => (
          <button key={o.id} type="button" aria-label={o.label} aria-pressed={o.active} data-opt={`${cur.id}:${o.id}`} onClick={() => (o.locked ? onLocked(o.label) : onPick(cur.id, o.id))}
            className={`relative grid aspect-square min-h-16 place-items-center rounded-2xl border-b-4 p-1 ${o.active ? "border-gold-deep bg-gold" : "border-cream bg-cream"} ${o.locked ? "opacity-60" : ""}`}>
            <span className="size-full">{o.preview}</span>
            {o.locked && <IconLock className="absolute right-1 top-1 rounded-full bg-pine p-0.5 text-lg text-gold" />}
          </button>
        ))}
      </div>
    </div>
  );
}
