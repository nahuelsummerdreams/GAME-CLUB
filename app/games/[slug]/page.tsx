import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/lib/game-engine/registry";
import { GameShell } from "@/components/game-ui/GameShell";

export const dynamicParams = false;
export const generateStaticParams = () => GAMES.map((g) => ({ slug: g.slug }));

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();
  return <GameShell slug={game.slug} />;
}
