import { ArtShape, PALETTE as P } from "@/assets/objects/art";
import { CharacterArt } from "@/components/characters";
import { svgUrl } from "@/lib/game-engine/svgTexture";

const NS = { xmlns: "http://www.w3.org/2000/svg" };
export const BUBBLE_COLORS = [P.red, P.gold, "#5B9BD5", "#4DB87A", P.candy, P.purple];

const bubble = (c: string) => (
  <svg {...NS} viewBox="0 0 64 64" width="64" height="64">
    <circle cx="32" cy="32" r="29" fill={c} stroke="rgb(0 0 0 / .18)" strokeWidth="3" />
    <circle cx="32" cy="32" r="29" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeDasharray="30 160" strokeDashoffset="-70" />
    <ellipse cx="21" cy="19" rx="10" ry="6" fill="#fff" opacity=".55" transform="rotate(-35 21 19)" />
    <path d="M44 42l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="#fff" opacity=".7" transform="translate(-4 -4) scale(.8)" />
  </svg>
);

export const TEXTURES: Record<string, { url: string; w: number; h: number }> = {
  ...Object.fromEntries(BUBBLE_COLORS.map((c, i) => [`b${i}`, { w: 64, h: 64, url: svgUrl(bubble(c)) }])),
  spark: { w: 32, h: 32, url: svgUrl(<svg {...NS} viewBox="0 0 100 100" width="32" height="32"><ArtShape id="star" /></svg>) },
  holly: { w: 200, h: 200, url: svgUrl(<svg {...NS} viewBox="0 0 200 200" width="200" height="200"><CharacterArt id="holly" mood="cheer" /></svg>) },
  hollySurprised: { w: 200, h: 200, url: svgUrl(<svg {...NS} viewBox="0 0 200 200" width="200" height="200"><CharacterArt id="holly" mood="surprised" /></svg>) },
};
