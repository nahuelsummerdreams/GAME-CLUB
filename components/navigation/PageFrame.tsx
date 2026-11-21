import Link from "next/link";
import type { ReactNode } from "react";
import { Snowfall } from "@/components/animations/Snowfall";
import { StarCounter } from "./TopBar";

/** Scrollable full-screen page used by Rewards / Profile / Settings. */
export function PageFrame({ title, back, children }: { title: string; back: string; children: ReactNode }) {
  return (
    <main className="fixed inset-0 overflow-y-auto bg-evergreen">
      <Snowfall count={30} className="opacity-70" />
      <div className="relative mx-auto flex min-h-full w-full max-w-3xl flex-col p-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="mb-4 flex items-center justify-between gap-3">
          <Link href={back} aria-label="Back" className="font-display grid size-14 place-items-center rounded-full bg-snow text-3xl text-pine shadow-soft">‹</Link>
          <h1 className="font-display text-3xl font-semibold text-snow">{title}</h1>
          <StarCounter />
        </header>
        {children}
      </div>
    </main>
  );
}
