export type CharacterId = "santa" | "holly" | "jingle" | "snowy" | "ginger";

export interface PlayerProfile {
  nickname: string;
  avatar: CharacterId;
  favoriteCharacter: CharacterId;
  createdAt: number;
}
