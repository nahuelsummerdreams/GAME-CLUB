import type { ReactNode } from "react";
import { PALETTE as P } from "@/assets/objects/art";
import { CharacterArt } from "@/components/characters";
import { Pine } from "@/components/animations/WinterScene";

/** Original code-drawn puzzle illustrations on a 400×400 canvas (PLACEHOLDER art). */
const Stars = ({ n = 18, seed = 1 }: { n?: number; seed?: number }) => (
  <g fill={P.snow}>{Array.from({ length: n }, (_, i) => <circle key={i} cx={(i * 97 * seed + 31) % 400} cy={(i * 53 * seed + 17) % 190} r={1.5 + (i % 3)} opacity={0.6 + (i % 3) * 0.15} />)}</g>
);
const Home = ({ x, y, w, h, wall, roof }: { x: number; y: number; w: number; h: number; wall: string; roof: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={wall} />
    <path d={`M${-w / 2 - 8} ${-h}L0 ${-h - h * 0.7}L${w / 2 + 8} ${-h}z`} fill={roof} />
    <path d={`M${-w / 2 - 8} ${-h}L0 ${-h - h * 0.7}L${w / 2 + 8} ${-h}q-8 -10 -16 -4t-16 -6-16 6-16 -6z`} fill={P.snow} opacity=".95" />
    <rect x={-w / 4 - 7} y={-h * 0.62} width="14" height="16" rx="3" fill={P.gold} /><rect x={w / 4 - 7} y={-h * 0.62} width="14" height="16" rx="3" fill={P.gold} />
    <rect x="-8" y={-h * 0.4} width="16" height={h * 0.4} rx="4" fill={P.pine} />
  </g>
);
const Snow = ({ y = 300 }: { y?: number }) => <path d={`M0 ${y}Q100 ${y - 24} 200 ${y - 6}T400 ${y - 14}V400H0z`} fill={P.snow} />;

export type SceneId = "village" | "sleigh" | "candy" | "friends";
export const SCENES: { id: SceneId; name: string; art: () => ReactNode }[] = [
  { id: "village", name: "Snowy Village", art: () => (<g>
    <rect width="400" height="400" fill="#1F5476" /><Stars /><circle cx="320" cy="70" r="34" fill="#FFF3C4" /><circle cx="332" cy="62" r="30" fill="#1F5476" opacity=".0" />
    <path d="M0 250L90 160 170 240 250 150 340 245 400 200V400H0z" fill="#3C7CA0" /><Snow y={290} />
    <Home x={90} y={330} w={90} h={70} wall={P.red} roof={P.pine} /><Home x={310} y={340} w={80} h={62} wall={P.ice} roof={P.red} />
    <g transform="translate(200 345) scale(2.1) translate(-50 -90)"><path d="M50 8L24 42h12L16 68h68L64 42h12z" fill={P.green} /><rect x="42" y="68" width="16" height="22" fill={P.brown} /><circle cx="38" cy="58" r="3.5" fill={P.red} /><circle cx="60" cy="50" r="3.5" fill={P.gold} /><circle cx="48" cy="34" r="3.5" fill={P.candy} /><path d="M50 -6l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill={P.gold} /></g>
    <Pine x={30} y={360} s={1.1} /><Pine x={375} y={370} s={1.2} />
  </g>) },
  { id: "sleigh", name: "Night Flight", art: () => (<g>
    <rect width="400" height="400" fill="#2B2F6B" /><Stars n={34} seed={3} /><circle cx="90" cy="90" r="52" fill="#FFF3C4" /><circle cx="70" cy="76" r="9" fill="#F1DE9C" /><circle cx="108" cy="104" r="6" fill="#F1DE9C" />
    <path d="M0 330Q100 300 200 330T400 320V400H0z" fill={P.snow} />
    <Home x={70} y={352} w={80} h={56} wall={P.candy} roof={P.redDeep} /><Home x={330} y={356} w={86} h={60} wall={P.cream} roof={P.green} />
    <path d="M110 250Q200 290 330 200" stroke={P.gold} strokeWidth="5" strokeDasharray="2 12" strokeLinecap="round" fill="none" />
    <g transform="translate(200 160)"><path d="M0 60q50 18 100 0l20-26" stroke={P.gold} strokeWidth="8" fill="none" strokeLinecap="round" /><rect x="14" y="14" width="76" height="40" rx="14" fill={P.red} /><rect x="14" y="14" width="76" height="10" rx="5" fill={P.redDeep} />
      <g transform="translate(28 -40) scale(.45)"><CharacterArt id="santa" mood="cheer" /></g>
      <g transform="translate(120 -2) scale(.4)"><CharacterArt id="jingle" mood="happy" /></g></g>
  </g>) },
  { id: "candy", name: "Gingerbread Treat", art: () => (<g>
    <rect width="400" height="400" fill="#FBD9E0" /><circle cx="60" cy="60" r="90" fill="#FDE9ED" /><circle cx="360" cy="40" r="70" fill="#FDE9ED" />
    <path d="M0 310Q100 290 200 308T400 300V400H0z" fill={P.snow} />
    <g transform="translate(200 330)"><rect x="-95" y="-120" width="190" height="120" rx="8" fill="#C98A4B" />
      <path d="M-115-110L0-215 115-110z" fill={P.red} /><path d="M-100-112L0-205 100-112" fill="none" stroke={P.snow} strokeWidth="9" strokeDasharray="14 12" />
      <rect x="-26" y="-70" width="52" height="70" rx="26" fill="#7A4A2A" /><circle cx="-62" cy="-78" r="18" fill={P.snow} /><circle cx="-62" cy="-78" r="9" fill={P.candy} /><circle cx="62" cy="-78" r="18" fill={P.snow} /><circle cx="62" cy="-78" r="9" fill={P.ice} />
      <path d="M-95-120h190" stroke={P.snow} strokeWidth="10" strokeDasharray="20 14" /></g>
    <g transform="translate(70 330)"><rect x="-4" y="-90" width="8" height="90" fill={P.snow} /><circle cx="0" cy="-100" r="30" fill={P.red} /><circle cx="0" cy="-100" r="16" fill="none" stroke={P.snow} strokeWidth="7" strokeDasharray="12 8" /></g>
    <g transform="translate(335 335)"><rect x="-4" y="-80" width="8" height="80" fill={P.snow} /><circle cx="0" cy="-90" r="26" fill={P.ice} /><circle cx="0" cy="-90" r="13" fill="none" stroke={P.blue} strokeWidth="6" strokeDasharray="10 7" /></g>
    <g transform="translate(120 365) scale(.34)"><CharacterArt id="ginger" mood="cheer" /></g>
  </g>) },
  { id: "friends", name: "Winter Friends", art: () => (<g>
    <rect width="400" height="400" fill="#A9D4E6" /><circle cx="330" cy="70" r="46" fill="#FFF3C4" opacity=".9" />
    <path d="M0 230L80 150 150 220 230 130 320 225 400 170V400H0z" fill="#8DB9CF" />
    <Pine x={40} y={300} s={1.4} /><Pine x={365} y={296} s={1.5} c="#174B3C" /><Pine x={110} y={290} s={1} c="#174B3C" /><Pine x={300} y={288} s={1} />
    <path d="M0 300Q100 270 200 296T400 286V400H0z" fill={P.snow} />
    {([["holly", 35, "happy"], ["jingle", 110, "idle"], ["santa", 185, "cheer"], ["snowy", 255, "happy"], ["ginger", 325, "cheer"]] as const).map(([id, x, m]) => (
      <g key={id} transform={`translate(${x} ${id === "santa" ? 205 : 225}) scale(${id === "santa" ? 0.46 : 0.42})`}><CharacterArt id={id} mood={m} /></g>))}
  </g>) },
];

export function Scene({ id }: { id: SceneId }) {
  return <>{SCENES.find((s) => s.id === id)!.art()}</>;
}
