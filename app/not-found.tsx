import Link from "next/link";
import { Character } from "@/components/characters";

export default function NotFound() {
  return (
    <main className="fixed inset-0 grid place-items-center bg-ice p-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-card bg-snow p-6 shadow-soft">
        <Character id="snowy" mood="surprised" className="size-36" />
        <h1 className="font-display text-3xl font-semibold">Oops! Lost in the snow</h1>
        <p className="text-lg font-semibold text-evergreen">We couldn’t find that place.</p>
        <Link href="/" className="font-display inline-flex min-h-14 items-center rounded-full border-b-[6px] border-red-deep bg-red px-8 text-xl font-semibold text-snow">BACK HOME</Link>
      </div>
    </main>
  );
}
