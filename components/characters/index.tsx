import type { ReactNode } from "react";
import type { CharacterId } from "@/types/player";
import { PALETTE as P } from "@/assets/objects/art";

export type Mood = "idle" | "happy" | "surprised" | "cheer";

export const CHARACTERS: Record<CharacterId, { name: string; blurb: string; color: string }> = {
  santa: { name: "Santa", blurb: "Warm, jolly, and always on time.", color: P.red },
  holly: { name: "Holly", blurb: "Santa's quick little elf helper.", color: P.green },
  jingle: { name: "Jingle", blurb: "A brave reindeer who loves adventure.", color: P.brown },
  snowy: { name: "Snowy", blurb: "A funny snowman who never melts.", color: P.ice },
  ginger: { name: "Ginger", blurb: "A sweet, sneaky gingerbread cookie.", color: "#D8A15F" },
};

/** Shared face: every character's head is centered at (100,84) so cosmetics line up. */
function Face({ mood, tone = P.pine }: { mood: Mood; tone?: string }) {
  const eyes =
    mood === "cheer" ? (
      <g stroke={tone} strokeWidth="4" strokeLinecap="round" fill="none"><path d="M76 84q8-9 16 0M108 84q8-9 16 0" /></g>
    ) : (
      <g fill={tone}>
        <ellipse cx="84" cy="84" rx="5.5" ry={mood === "surprised" ? 8 : 7}><animate attributeName="ry" values="7;7;0.8;7;7" keyTimes="0;.9;.94;.97;1" dur="4s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="116" cy="84" rx="5.5" ry={mood === "surprised" ? 8 : 7}><animate attributeName="ry" values="7;7;0.8;7;7" keyTimes="0;.9;.94;.97;1" dur="4s" repeatCount="indefinite" /></ellipse>
        <circle cx="86" cy="81" r="2" fill="#fff" /><circle cx="118" cy="81" r="2" fill="#fff" />
      </g>
    );
  const mouth =
    mood === "surprised" ? <ellipse cx="100" cy="106" rx="6" ry="8" fill={tone} />
    : mood === "idle" ? <path d="M90 102q10 8 20 0" stroke={tone} strokeWidth="4" strokeLinecap="round" fill="none" />
    : <path d="M86 98q14 22 28 0z" fill={tone} stroke={tone} strokeWidth="3" strokeLinejoin="round" />;
  return (<g>{eyes}<circle cx="72" cy="98" r="7" fill={P.candy} opacity=".55" /><circle cx="128" cy="98" r="7" fill={P.candy} opacity=".55" />{mouth}</g>);
}

const Shadow = () => <ellipse cx="100" cy="190" rx="52" ry="7" fill="rgb(23 75 60 / .18)" />;

function Santa({ mood }: { mood: Mood }) {
  return (<g>
    <Shadow />
    <path d="M52 188c0-34 14-62 48-62s48 28 48 62z" fill={P.red} />
    <rect x="52" y="160" width="96" height="12" fill={P.pine} /><rect x="92" y="158" width="16" height="16" rx="3" fill={P.gold} />
    <circle cx="52" cy="166" r="12" fill={P.snow} /><circle cx="148" cy="166" r="12" fill={P.snow} />
    <circle cx="100" cy="84" r="44" fill="#F6C9A6" />
    <Face mood={mood} />
    <circle cx="100" cy="97" r="7" fill="#E9967F" />
    <path d="M56 92c0 40 22 56 44 56s44-16 44-56c-10 22-28 18-44 18S66 114 56 92z" fill={P.snow} />
    <path d="M86 100q14 6 28 0 0-6-14-4t-14 4z" fill={P.snow} stroke="#E9E2D0" strokeWidth="1" />
    <path d="M52 58c4-38 36-52 60-44 20 6 36 22 36 44z" fill={P.red} /><rect x="48" y="52" width="104" height="18" rx="9" fill={P.snow} />
    <circle cx="150" cy="22" r="11" fill={P.snow} />
  </g>);
}
function Holly({ mood }: { mood: Mood }) {
  return (<g>
    <Shadow />
    <path d="M60 188l12-60h56l12 60z" fill={P.green} /><path d="M72 150h56" stroke={P.red} strokeWidth="8" /><path d="M60 188l12-18h56l12 18" fill={P.pine} opacity=".25" />
    <path d="M58 82L28 66l10 32z" fill="#F6C9A6" /><path d="M142 82l30-16-10 32z" fill="#F6C9A6" />
    <circle cx="100" cy="84" r="44" fill="#F6C9A6" />
    <path d="M58 76c4-34 40-34 44-34s40 0 44 34c-14-14-30-18-44-18s-30 4-44 18z" fill="#B5542E" />
    <circle cx="52" cy="96" r="10" fill="#B5542E" /><circle cx="148" cy="96" r="10" fill="#B5542E" />
    <Face mood={mood} />
    <path d="M56 56C70 26 96 8 148 10c-10 12-14 26-20 46z" fill={P.green} /><path d="M52 58h92" stroke={P.red} strokeWidth="12" strokeLinecap="round" />
    <circle cx="150" cy="12" r="9" fill={P.gold} stroke={P.goldDeep} strokeWidth="3" />
  </g>);
}
function Jingle({ mood }: { mood: Mood }) {
  return (<g>
    <Shadow />
    <path d="M56 188c0-30 14-58 44-58s44 28 44 58z" fill={P.brown} /><path d="M80 188c0-20 8-40 20-40s20 20 20 40z" fill={P.cream} />
    <path d="M62 52c-6-18-24-24-28-32 12-2 22 8 30 20zM138 52c6-18 24-24 28-32-12-2-22 8-30 20z" fill="none" stroke="#6B4630" strokeWidth="7" strokeLinecap="round" />
    <path d="M40 34c-8 0-12 6-12 12M160 34c8 0 12 6 12 12" stroke="#6B4630" strokeWidth="7" strokeLinecap="round" fill="none" />
    <ellipse cx="58" cy="70" rx="14" ry="22" fill="#A8704A" transform="rotate(-25 58 70)" /><ellipse cx="142" cy="70" rx="14" ry="22" fill="#A8704A" transform="rotate(25 142 70)" />
    <circle cx="100" cy="84" r="44" fill="#A8704A" /><ellipse cx="100" cy="104" rx="26" ry="20" fill={P.cream} />
    <Face mood={mood} />
    <circle cx="100" cy="97" r="9" fill={P.gold} stroke={P.goldDeep} strokeWidth="3" />
    <circle cx="100" cy="132" r="9" fill={P.gold} stroke={P.goldDeep} strokeWidth="3" /><path d="M72 132q28 10 56 0" stroke={P.red} strokeWidth="8" fill="none" strokeLinecap="round" />
  </g>);
}
function Snowy({ mood }: { mood: Mood }) {
  return (<g>
    <Shadow />
    <circle cx="100" cy="150" r="42" fill={P.snow} stroke={P.ice} strokeWidth="3" />
    <circle cx="100" cy="84" r="44" fill={P.snow} stroke={P.ice} strokeWidth="3" />
    <circle cx="100" cy="146" r="5" fill={P.pine} /><circle cx="100" cy="164" r="5" fill={P.pine} />
    <Face mood={mood} />
    <path d="M100 92l34 6-34 6z" fill={P.orange} />
    <path d="M62 126q38 18 76 0v14q-38 18-76 0z" fill={P.red} /><path d="M118 134l8 34 14-4-6-32z" fill={P.red} />
    <path d="M62 150l-26-14M138 150l26-14" stroke={P.brown} strokeWidth="6" strokeLinecap="round" />
    <rect x="68" y="34" width="64" height="8" rx="4" fill={P.pine} /><rect x="76" y="6" width="48" height="34" rx="6" fill={P.pine} /><rect x="76" y="26" width="48" height="8" fill={P.red} />
  </g>);
}
function Ginger({ mood }: { mood: Mood }) {
  const dough = "#D8A15F";
  return (<g>
    <Shadow />
    <path d="M70 124h60l36 22c6 4 4 14-4 14l-30-10v22l14 14c6 6 2 14-6 14h-22l-8-16-8 16H80c-8 0-12-8-6-14l14-14v-22l-30 10c-8 0-10-10-4-14z" fill={dough} stroke="#B97E3F" strokeWidth="3" strokeLinejoin="round" />
    <path d="M66 170l-14 14M134 170l14 14" stroke={P.snow} strokeWidth="5" strokeLinecap="round" />
    <circle cx="100" cy="84" r="46" fill={dough} stroke="#B97E3F" strokeWidth="3" />
    <path d="M60 104q40 40 80 0" fill="none" stroke={P.snow} strokeWidth="0" />
    <Face mood={mood} tone="#6B3F20" />
    <path d="M62 62q38-32 76 0" stroke={P.snow} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="1 12" />
    <circle cx="100" cy="140" r="6" fill={P.red} /><circle cx="100" cy="158" r="6" fill={P.green} />
  </g>);
}

const BODY: Record<CharacterId, (p: { mood: Mood }) => ReactNode> = { santa: Santa, holly: Holly, jingle: Jingle, snowy: Snowy, ginger: Ginger };

/** Cosmetic overlays, positioned on the shared head layout. */
function Overlay({ equipped }: { equipped: Record<string, string> }) {
  const hat = equipped.hat, scarf = equipped.scarf, acc = equipped.accessory;
  return (<g>
    {scarf === "scarf-candy" && <g><path d="M58 128q42 22 84 0v16q-42 22-84 0z" fill={P.snow} /><path d="M58 128q42 22 84 0v16q-42 22-84 0z" fill="none" stroke={P.red} strokeWidth="14" strokeDasharray="8 10" opacity=".85" /></g>}
    {scarf === "scarf-ice" && <path d="M58 128q42 22 84 0v16q-42 22-84 0z" fill={P.ice} stroke="#8FBFD3" strokeWidth="3" />}
    {acc === "acc-glasses" && <g fill="none" stroke={P.goldDeep} strokeWidth="4"><path d="M72 84l10-8h4l6 8-6 8h-4zM128 84l-10-8h-4l-6 8 6 8h4z" fill={P.gold} fillOpacity=".5" /><path d="M96 84h8" /></g>}
    {acc === "acc-bow" && <path d="M124 52c12-14 28-6 18 4zM124 52c-2-16-20-16-14-4z" transform="translate(8 -4)" fill={P.candy} stroke={P.red} strokeWidth="3" />}
    {hat === "hat-beanie" && <g><path d="M58 60c0-32 84-32 84 0z" fill={P.blue} /><rect x="54" y="54" width="92" height="14" rx="7" fill={P.snow} /><circle cx="100" cy="24" r="10" fill={P.snow} /></g>}
    {hat === "hat-top" && <g><rect x="62" y="56" width="76" height="9" rx="4" fill="#2B2B2B" /><rect x="74" y="16" width="52" height="44" rx="5" fill="#2B2B2B" /><rect x="74" y="42" width="52" height="9" fill={P.red} /></g>}
    {hat === "hat-crown" && <g><path d="M62 56l8-30 16 16 14-22 14 22 16-16 8 30z" fill={P.gold} stroke={P.goldDeep} strokeWidth="4" strokeLinejoin="round" /><circle cx="100" cy="40" r="5" fill={P.red} /></g>}
  </g>);
}

export interface CharacterProps {
  id: CharacterId;
  mood?: Mood;
  equipped?: Record<string, string>;
  animate?: boolean;
  className?: string;
  title?: string;
}

export function Character({ id, mood = "idle", equipped, animate = true, className = "", title }: CharacterProps) {
  const Body = BODY[id];
  return (
    <svg viewBox="0 0 200 200" className={`${animate ? "anim-bob" : ""} ${className}`} role="img" aria-label={title ?? CHARACTERS[id].name}>
      <Body mood={mood} />
      {equipped ? <Overlay equipped={equipped} /> : null}
    </svg>
  );
}

/** Bare <g> of a character for embedding inside another SVG scene (e.g. the world map). */
export function CharacterArt({ id, mood = "idle" }: { id: CharacterId; mood?: Mood }) {
  const Body = BODY[id];
  return <Body mood={mood} />;
}
