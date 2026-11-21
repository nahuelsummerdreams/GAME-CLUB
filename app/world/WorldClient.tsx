"use client";
import { useSearchParams } from "next/navigation";
import { WorldMap } from "@/components/navigation/WorldMap";
import { ZONES } from "@/lib/game-engine/zones";

export function WorldClient() {
  const q = useSearchParams().get("zone");
  const initial = ZONES.find((z) => z.id === q)?.id;
  return <WorldMap initial={initial} />;
}
