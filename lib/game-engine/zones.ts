import type { CharacterId } from "@/types/player";
import type { MusicTheme, ZoneId } from "@/types/game";

export interface Zone {
  id: ZoneId; name: string; blurb: string;
  /** Position in the 1200×800 map scene. */
  x: number; y: number;
  music: MusicTheme; guide: CharacterId;
}

export const ZONES: Zone[] = [
  { id: "santas-workshop", name: "SANTA’S WORKSHOP", blurb: "Wrap toys before Christmas Eve!", x: 235, y: 360, music: "workshop", guide: "holly" },
  { id: "reindeer-village", name: "REINDEER VILLAGE", blurb: "Hop on the sleigh with Jingle.", x: 440, y: 250, music: "adventure", guide: "jingle" },
  { id: "snowy-mountains", name: "SNOWY MOUNTAINS", blurb: "Build a funny snowman.", x: 930, y: 265, music: "village", guide: "snowy" },
  { id: "christmas-square", name: "CHRISTMAS SQUARE", blurb: "Games around the giant tree.", x: 640, y: 500, music: "village", guide: "santa" },
  { id: "candy-land", name: "CANDY LAND", blurb: "Sweet puzzles and pops!", x: 960, y: 590, music: "candy", guide: "ginger" },
  { id: "santas-house", name: "SANTA’S HOUSE", blurb: "Cozy puzzles by the fire.", x: 250, y: 640, music: "village", guide: "santa" },
];

export const getZone = (id: string) => ZONES.find((z) => z.id === id);
