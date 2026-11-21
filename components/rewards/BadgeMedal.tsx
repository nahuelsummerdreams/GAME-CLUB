import type { BadgeId } from "@/types/rewards";
import { PALETTE as P } from "@/assets/objects/art";

const ICONS: Record<BadgeId, { bg: string; glyph: React.ReactNode }> = {
  "christmas-badge": { bg: P.red, glyph: <path d="M50 24l7 15 17 2-12 11 3 17-15-8-15 8 3-17-12-11 17-2z" fill={P.gold} /> },
  "christmas-explorer": { bg: P.green, glyph: <g><circle cx="50" cy="50" r="18" fill="none" stroke={P.snow} strokeWidth="5" /><path d="M50 34l6 16-6 16-6-16z" fill={P.gold} /></g> },
  "santa-helper": { bg: P.red, glyph: <g><rect x="30" y="46" width="40" height="26" rx="4" fill={P.snow} /><rect x="47" y="46" width="6" height="26" fill={P.gold} /><path d="M50 46c-12-14-22-4-14 0zM50 46c12-14 22-4 14 0z" fill={P.gold} /></g> },
  "reindeer-champion": { bg: P.brown, glyph: <g stroke={P.snow} strokeWidth="5" strokeLinecap="round" fill="none"><path d="M36 40l-6-12M64 40l6-12M40 40l-2-10M60 40l2-10" /><circle cx="50" cy="56" r="16" fill={P.snow} stroke="none" /><circle cx="50" cy="60" r="5" fill={P.red} stroke="none" /></g> },
  "puzzle-master": { bg: "#5B9BD5", glyph: <path d="M32 38h14a6 6 0 1 1 12 0h10v14a6 6 0 1 0 0 12v10H58a6 6 0 1 0-12 0H32z" fill={P.snow} /> },
};

export function BadgeMedal({ id, locked = false, className = "" }: { id: BadgeId; locked?: boolean; className?: string }) {
  const { bg, glyph } = ICONS[id];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M32 6h14l4 22H30zM54 6h14l2 22H50z" fill={locked ? "#B9C4C9" : P.gold} />
      <circle cx="50" cy="58" r="36" fill={locked ? "#C9D3D7" : P.goldDeep} />
      <circle cx="50" cy="56" r="33" fill={locked ? "#DCE3E6" : bg} stroke={locked ? "#B9C4C9" : P.gold} strokeWidth="4" />
      <g opacity={locked ? 0.3 : 1} transform="translate(0 4)">{glyph}</g>
    </svg>
  );
}
