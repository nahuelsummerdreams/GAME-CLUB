import { PALETTE as P } from "@/assets/objects/art";

const W = 400, H = 500;
export type Bg = "night" | "snow" | "cozy" | "aurora";
export const BG_UNLOCK: Partial<Record<Bg, string>> = { cozy: "bg-cozy", aurora: "bg-aurora" };

/** Shared 400×500 scenes for the creative games. */
export function Backdrop({ bg }: { bg: Bg }) {
  const snowGround = <path d="M0 440Q100 420 200 436T400 430V500H0z" fill={P.snow} />;
  if (bg === "snow") return (<g><rect width={W} height={H} fill="#CFE8F2" />{[40, 120, 250, 340, 90, 300].map((x, i) => <circle key={i} cx={x} cy={40 + i * 60} r="4" fill="#fff" />)}{snowGround}</g>);
  if (bg === "cozy") return (<g><rect width={W} height={H} fill="#F3D9B1" /><rect y="400" width={W} height="100" fill="#B98254" /><rect x="40" y="70" width="120" height="150" rx="8" fill="#1F4E6B" stroke="#8A5A3C" strokeWidth="10" /><path d="M100 70v150M40 145h120" stroke="#8A5A3C" strokeWidth="6" /><circle cx="70" cy="100" r="3" fill="#fff" /><circle cx="130" cy="180" r="3" fill="#fff" /><path d="M250 120q50 20 100 0" stroke={P.green} strokeWidth="10" fill="none" strokeLinecap="round" /><circle cx="270" cy="135" r="6" fill={P.red} /><circle cx="330" cy="130" r="6" fill={P.gold} /></g>);
  if (bg === "aurora") return (<g><rect width={W} height={H} fill="#0F2A3A" />{["#5BE3A0", "#7FB8FF", "#B07BFF"].map((c, i) => <path key={c} d={`M0 ${120 + i * 30}Q100 ${60 + i * 20} 200 ${130 + i * 20}T400 ${100 + i * 30}V${200 + i * 30}Q300 ${160 + i * 20} 200 ${210 + i * 20}T0 ${200 + i * 30}z`} fill={c} opacity=".35" />)}{[30, 110, 260, 350, 190].map((x, i) => <circle key={i} cx={x} cy={30 + i * 22} r="2" fill="#fff" />)}{snowGround}</g>);
  return (<g><rect width={W} height={H} fill="#1F4E6B" />{[30, 90, 160, 230, 300, 370, 60, 200, 330].map((x, i) => <circle key={i} cx={x} cy={25 + ((i * 47) % 160)} r={1.5 + (i % 3)} fill="#fff" opacity=".8" />)}<circle cx="335" cy="70" r="30" fill="#FFF3C4" />{snowGround}</g>);
}
