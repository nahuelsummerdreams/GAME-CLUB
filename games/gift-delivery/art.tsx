import { ArtShape, PALETTE as P } from "@/assets/objects/art";
import { CharacterArt } from "@/components/characters";
import { svgUrl } from "@/lib/game-engine/svgTexture";

const NS = { xmlns: "http://www.w3.org/2000/svg" };
const house = (wall: string, roof: string) => (
  <svg {...NS} viewBox="0 0 160 150" width="160" height="150">
    <rect x="28" y="64" width="104" height="82" rx="6" fill={wall} /><rect x="96" y="22" width="18" height="40" fill={P.redDeep} />
    <rect x="94" y="16" width="22" height="10" rx="3" fill="#fff" />
    <path d="M14 70L80 8l66 62z" fill={roof} /><path d="M14 70L80 8l66 62q-10-12-22-6t-22-8-22 8-22-8-22 8-22-8z" fill="#fff" opacity=".95" />
    <rect x="44" y="88" width="24" height="26" rx="4" fill={P.gold} /><rect x="92" y="88" width="24" height="26" rx="4" fill={P.gold} /><rect x="70" y="108" width="20" height="38" rx="5" fill={P.pine} />
  </svg>
);

export const TEXTURES: Record<string, { url: string; w: number; h: number }> = {
  sleigh: { w: 300, h: 150, url: svgUrl(
    <svg {...NS} viewBox="0 0 300 150" width="300" height="150">
      <path d="M20 118q86 26 172 0l30-34" stroke={P.gold} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M24 70h150l-16 44H44z" fill={P.red} /><rect x="24" y="64" width="150" height="14" rx="7" fill={P.redDeep} />
      <rect x="50" y="86" width="34" height="22" rx="6" fill="#8A5A3C" /><rect x="90" y="86" width="34" height="22" rx="6" fill={P.green} />
      <g transform="translate(60 6) scale(.52)"><CharacterArt id="santa" mood="cheer" /></g>
      <path d="M170 92Q196 86 214 66" stroke={P.gold} strokeWidth="5" fill="none" />
      <g transform="translate(196 14) scale(.58)"><CharacterArt id="jingle" mood="happy" /></g>
    </svg>) },
  gift: { w: 64, h: 64, url: svgUrl(<svg {...NS} viewBox="0 0 100 100" width="64" height="64"><ArtShape id="gift" color={P.red} /></svg>) },
  star: { w: 64, h: 64, url: svgUrl(<svg {...NS} viewBox="0 0 100 100" width="64" height="64"><ArtShape id="star" /></svg>) },
  houseA: { w: 160, h: 150, url: svgUrl(house(P.candy, P.redDeep)) },
  houseB: { w: 160, h: 150, url: svgUrl(house(P.ice, P.pine)) },
  houseC: { w: 160, h: 150, url: svgUrl(house("#F3D9B1", P.red)) },
  tree: { w: 90, h: 120, url: svgUrl(<svg {...NS} viewBox="0 0 100 110" width="90" height="120"><rect x="44" y="84" width="12" height="24" fill="#6B4630" /><path d="M50 4L22 44h14L14 76h72L64 44h14z" fill={P.green} /><path d="M50 4L36 38h28zM28 64l22-14 22 14z" fill="#fff" opacity=".9" /></svg>) },
  cloud: { w: 200, h: 110, url: svgUrl(<svg {...NS} viewBox="0 0 200 110" width="200" height="110"><g fill="#5C6B7A"><circle cx="60" cy="64" r="34" /><circle cx="102" cy="46" r="42" /><circle cx="146" cy="64" r="34" /><rect x="40" y="64" width="126" height="34" rx="17" /></g><path d="M96 92l-10 18 16-6-4 14" stroke={P.gold} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>) },
  owl: { w: 90, h: 90, url: svgUrl(<svg {...NS} viewBox="0 0 90 90" width="90" height="90"><ellipse cx="45" cy="52" rx="26" ry="30" fill="#8A6B52" /><path d="M10 40q14-20 26 0M80 40q-14-20-26 0" fill="#6B4F3A" /><circle cx="35" cy="42" r="11" fill="#fff" /><circle cx="55" cy="42" r="11" fill="#fff" /><circle cx="35" cy="43" r="5" fill="#1B2B3A" /><circle cx="55" cy="43" r="5" fill="#1B2B3A" /><path d="M45 48l-6 10h12z" fill={P.orange} /><path d="M16 64q-12 8-8 20 10-8 14-14zM74 64q12 8 8 20-10-8-14-14z" fill="#6B4F3A" /></svg>) },
  mountain: { w: 800, h: 260, url: svgUrl(<svg {...NS} viewBox="0 0 800 260" width="800" height="260"><path d="M0 260V150L120 90 210 190 330 40 450 200 560 100 690 210 800 150V260z" fill="#8DB9CF" /><path d="M330 40l40 52-24-8-16 22-16-22-24 8zM120 90l34 42-20-6-14 18-14-18-20 6zM560 100l34 44-22-8-12 16-14-16-22 8z" fill="#fff" opacity=".92" /></svg>) },
  hills: { w: 800, h: 160, url: svgUrl(<svg {...NS} viewBox="0 0 800 160" width="800" height="160"><path d="M0 160V70Q100 20 220 66T440 56T660 72T800 70V160z" fill="#E7F3F7" /></svg>) },
  heart: { w: 48, h: 48, url: svgUrl(<svg {...NS} viewBox="0 0 100 100" width="48" height="48"><ArtShape id="heart" color={P.red} /></svg>) },
};
