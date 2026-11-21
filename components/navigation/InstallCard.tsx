"use client";
import { useEffect, useState } from "react";
import { BigButton } from "@/components/game-ui/ui";

interface InstallEvent extends Event { prompt: () => Promise<void> }

/** Install help: native prompt where the browser offers it, plain steps everywhere else (iOS has no prompt API). */
export function InstallCard() {
  const [ev, setEv] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEv(e as InstallEvent); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  return (
    <section className="rounded-card bg-snow p-4 shadow-soft">
      <h2 className="font-display text-2xl font-semibold">Install WonderDays</h2>
      <p className="mb-3 text-lg font-semibold text-evergreen">Play full screen, even without internet.</p>
      {ev ? <BigButton variant="green" onClick={() => { void ev.prompt(); setEv(null); }}>INSTALL APP</BigButton> : (
        <ul className="list-disc space-y-1 pl-5 text-lg font-semibold">
          <li><b>iPhone / iPad:</b> tap Share, then “Add to Home Screen”.</li>
          <li><b>Android / Chrome:</b> open the menu, then “Install app”.</li>
        </ul>
      )}
    </section>
  );
}
