const COLORS = ["#D94A4A", "#F4C95D", "#B9DDEC", "#F2A5B5", "#28664D", "#FFFDF7"];

/** Pure-CSS confetti burst (hidden for reduced motion by the global rule). */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: pieces }, (_, i) => (
        <span key={i} className="absolute top-0 block h-3 w-2 rounded-sm" style={{
          left: `${(i * 97) % 100}%`, background: COLORS[i % COLORS.length],
          animation: `confetti ${2.2 + (i % 5) * 0.4}s linear ${(i % 7) * 0.12}s both`,
        }} />
      ))}
    </div>
  );
}
