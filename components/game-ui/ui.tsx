"use client";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { audio } from "@/lib/audio";

type Variant = "red" | "gold" | "green" | "snow" | "ice";
const VARIANTS: Record<Variant, string> = {
  red: "bg-red text-snow border-red-deep",
  gold: "bg-gold text-pine border-gold-deep",
  green: "bg-evergreen text-snow border-pine",
  snow: "bg-snow text-pine border-ice",
  ice: "bg-ice text-pine border-[#8fbfd3]",
};
const SIZES = { md: "min-h-14 px-6 text-xl", lg: "min-h-[72px] px-8 text-2xl", icon: "size-14 text-2xl p-0" };

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZES;
  children: ReactNode;
}

/** Chunky tactile button. No hover states — pressed state only. */
export function BigButton({ variant = "red", size = "md", className = "", onClick, children, ...rest }: BigButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => { audio.unlock(); audio.sfx("tap"); onClick?.(e); }}
      className={`font-display inline-flex items-center whitespace-nowrap justify-center gap-2 rounded-full border-b-[6px] font-semibold tracking-wide shadow-soft transition-transform active:translate-y-1 active:border-b-2 disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={`rounded-card border-b-[6px] border-cream bg-snow p-5 shadow-soft ${className}`}>
      {children}
    </div>
  );
}
