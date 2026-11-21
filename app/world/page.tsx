import { Suspense } from "react";
import { TopBar } from "@/components/navigation/TopBar";
import { WorldClient } from "./WorldClient";

export const metadata = { title: "Christmas World · WonderDays" };

export default function WorldPage() {
  return (
    <main className="fixed inset-0 bg-[#D9EEF5]">
      <Suspense fallback={null}><WorldClient /></Suspense>
      <TopBar back="/" />
    </main>
  );
}
