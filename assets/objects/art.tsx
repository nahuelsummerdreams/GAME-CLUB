import type { ReactElement } from "react";

/** Original code-drawn SVG objects (PLACEHOLDER art — see ASSETS_TODO.md). viewBox 0 0 100 100. */
export const PALETTE = {
  red: "#D94A4A", redDeep: "#A93434", pine: "#174B3C", green: "#28664D", snow: "#FFFDF7",
  cream: "#F8F0E2", gold: "#F4C95D", goldDeep: "#C99A2E", ice: "#B9DDEC", candy: "#F2A5B5",
  blue: "#5B9BD5", purple: "#9B7BD0", orange: "#F29A4A", brown: "#8A5A3C",
} as const;

export type ArtId =
  | "bell" | "gift" | "star" | "candycane" | "snowflake" | "ornament" | "tree" | "cookie"
  | "sock" | "bear" | "train" | "ball" | "robot" | "duck" | "drum" | "mitten" | "wreath" | "candle" | "heart";

const P = PALETTE;

export const TOY_IDS: ArtId[] = ["bear", "train", "ball", "robot", "duck", "drum"];

const ART: Record<ArtId, (c: string) => ReactElement> = {
  bell: () => (<g><path d="M50 14c-15 0-23 12-23 29v13l-9 13h64l-9-13V43c0-17-8-29-23-29z" fill={P.gold} stroke={P.goldDeep} strokeWidth="3" /><circle cx="50" cy="82" r="7" fill={P.goldDeep} /><circle cx="50" cy="12" r="5" fill={P.red} /></g>),
  gift: (c) => (<g><rect x="14" y="38" width="72" height="52" rx="8" fill={c} /><rect x="44" y="38" width="12" height="52" fill={P.gold} /><rect x="10" y="30" width="80" height="16" rx="6" fill={c} stroke="rgb(0 0 0 / .12)" strokeWidth="2" /><rect x="44" y="30" width="12" height="16" fill={P.gold} /><path d="M50 30c-14-18-28-6-18 0zM50 30c14-18 28-6 18 0z" fill={P.gold} stroke={P.goldDeep} strokeWidth="2" /></g>),
  star: () => (<path d="M50 8l11.5 25.5 27.5 3-20.5 18.5 5.8 27.2L50 69 25.7 82.2l5.8-27.2L11 36.5l27.5-3z" fill={P.gold} stroke={P.goldDeep} strokeWidth="3" strokeLinejoin="round" />),
  candycane: () => (<g fill="none" strokeLinecap="round"><path d="M62 90V38a20 20 0 1 0-40 0" stroke={P.snow} strokeWidth="16" /><path d="M62 90V38a20 20 0 1 0-40 0" stroke={P.red} strokeWidth="16" strokeDasharray="9 11" /></g>),
  snowflake: () => (<g stroke={P.ice} strokeWidth="7" strokeLinecap="round" fill="none">{[0, 60, 120].map((r) => (<g key={r} transform={`rotate(${r} 50 50)`}><path d="M50 10v80M40 20l10 10 10-10M40 80l10-10 10 10" /></g>))}<circle cx="50" cy="50" r="6" fill={P.snow} stroke="none" /></g>),
  ornament: (c) => (<g><rect x="42" y="8" width="16" height="14" rx="3" fill={P.goldDeep} /><circle cx="50" cy="58" r="33" fill={c} /><path d="M26 54a26 26 0 0 1 26-22" stroke="rgb(255 255 255 / .55)" strokeWidth="7" strokeLinecap="round" fill="none" /><path d="M20 62q30 14 60 0" stroke={P.snow} strokeWidth="5" fill="none" opacity=".7" /></g>),
  tree: () => (<g><rect x="42" y="78" width="16" height="16" fill={P.brown} /><path d="M50 8L24 42h12L16 68h68L64 42h12z" fill={P.green} /><path d="M50 8L36 42h28z" fill="#28664D" /></g>),
  cookie: () => (<g><circle cx="50" cy="24" r="15" fill="#D8A15F" /><path d="M36 38h28l22 10v10l-22-4v18l12 18H52l-2-8-2 8H34l12-18V54l-22 4V48z" fill="#D8A15F" /><circle cx="45" cy="22" r="2.5" fill={P.brown} /><circle cx="56" cy="22" r="2.5" fill={P.brown} /><path d="M44 29q6 5 12 0" stroke={P.snow} strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="50" cy="48" r="3.5" fill={P.red} /><circle cx="50" cy="60" r="3.5" fill={P.green} /></g>),
  sock: () => (<g><path d="M34 12h32v44l22 14c6 4 4 16-6 16H40c-6 0-8-4-8-10z" fill={P.red} /><rect x="32" y="10" width="36" height="14" rx="5" fill={P.snow} /></g>),
  bear: () => (<g><circle cx="26" cy="30" r="12" fill={P.brown} /><circle cx="74" cy="30" r="12" fill={P.brown} /><circle cx="50" cy="52" r="34" fill="#B07A52" /><ellipse cx="50" cy="62" rx="14" ry="11" fill={P.cream} /><circle cx="40" cy="46" r="4" fill={P.pine} /><circle cx="60" cy="46" r="4" fill={P.pine} /><ellipse cx="50" cy="58" rx="5" ry="3.5" fill={P.pine} /></g>),
  train: () => (<g><rect x="14" y="40" width="48" height="30" rx="6" fill={P.red} /><rect x="58" y="28" width="28" height="42" rx="6" fill={P.blue} /><rect x="64" y="34" width="16" height="14" rx="3" fill={P.ice} /><rect x="20" y="28" width="12" height="14" fill={P.pine} /><circle cx="30" cy="76" r="10" fill={P.pine} /><circle cx="68" cy="76" r="10" fill={P.pine} /></g>),
  ball: () => (<g><circle cx="50" cy="50" r="38" fill={P.red} /><path d="M14 50h72" stroke={P.snow} strokeWidth="8" /><circle cx="50" cy="50" r="12" fill={P.snow} /><circle cx="50" cy="50" r="38" fill="none" stroke="rgb(0 0 0 / .12)" strokeWidth="3" /></g>),
  robot: () => (<g><rect x="46" y="6" width="8" height="12" fill={P.goldDeep} /><rect x="22" y="18" width="56" height="42" rx="10" fill="#9FB4C7" /><circle cx="38" cy="36" r="7" fill={P.snow} /><circle cx="62" cy="36" r="7" fill={P.snow} /><circle cx="38" cy="36" r="3" fill={P.pine} /><circle cx="62" cy="36" r="3" fill={P.pine} /><rect x="36" y="48" width="28" height="6" rx="3" fill={P.pine} /><rect x="28" y="62" width="44" height="28" rx="8" fill={P.blue} /></g>),
  duck: () => (<g><ellipse cx="46" cy="66" rx="34" ry="22" fill={P.gold} /><circle cx="64" cy="36" r="20" fill={P.gold} /><path d="M80 36h14l-14 10z" fill={P.orange} /><circle cx="68" cy="31" r="3.5" fill={P.pine} /><path d="M24 62q14 12 30 0" stroke={P.goldDeep} strokeWidth="4" fill="none" /></g>),
  drum: () => (<g><ellipse cx="50" cy="32" rx="34" ry="12" fill={P.snow} /><path d="M16 32v38c0 7 15 14 34 14s34-7 34-14V32c0 7-15 12-34 12S16 39 16 32z" fill={P.red} /><path d="M28 44l12 36M72 44L60 80M50 46v38" stroke={P.gold} strokeWidth="4" /></g>),
  mitten: () => (<g><path d="M30 90V44c-8-8-6-24 4-24 8 0 8 12 8 12V18c0-8 14-8 14 0v20c2-8 16-6 14 4l-2 14c10 8 8 22 0 34z" fill={P.red} /><rect x="28" y="76" width="48" height="16" rx="6" fill={P.snow} /></g>),
  wreath: () => (<g><circle cx="50" cy="50" r="32" fill="none" stroke={P.green} strokeWidth="18" /><circle cx="50" cy="50" r="32" fill="none" stroke={P.pine} strokeWidth="18" strokeDasharray="6 10" opacity=".5" /><circle cx="34" cy="30" r="5" fill={P.red} /><circle cx="70" cy="68" r="5" fill={P.red} /><path d="M50 82q-14 10-8 14 8-2 8-14zM50 82q14 10 8 14-8-2-8-14z" fill={P.red} /></g>),
  candle: () => (<g><rect x="36" y="38" width="28" height="52" rx="6" fill={P.snow} /><path d="M50 10q14 14 0 26-14-12 0-26z" fill={P.gold} /><rect x="36" y="70" width="28" height="8" fill={P.red} opacity=".85" /></g>),
  heart: (c) => (<path d="M50 88C8 58 14 20 36 20c10 0 14 6 14 10 0-4 4-10 14-10 22 0 28 38-14 68z" fill={c} />),
};

export function Art({ id, color = P.red, className, title }: { id: ArtId; color?: string; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      {ART[id](color)}
    </svg>
  );
}
