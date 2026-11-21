import { PALETTE as P } from "@/assets/objects/art";

export const Pine = ({ x, y, s = 1, c = "#28664D" }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-5" y="0" width="10" height="16" fill="#6B4630" />
    <path d="M0-62L-26-22h12L-34 10h68L14-22h12z" fill={c} />
    <path d="M0-62L-13-36h26zM-22-8L0-22l22 14z" fill={P.snow} opacity=".9" />
  </g>
);

export function Lights({ y = 60, count = 14, w = 1200 }: { y?: number; count?: number; w?: number }) {
  const cols = [P.red, P.gold, P.ice, P.candy, "#7BD389"];
  return (
    <g>
      <path d={`M0 ${y}Q${w / 4} ${y + 50} ${w / 2} ${y}T${w} ${y}`} fill="none" stroke={P.pine} strokeWidth="3" />
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count; const x = t * w;
        const yy = y + 14 + 24 * Math.abs(Math.sin(t * Math.PI * 2));
        return <circle key={i} cx={x} cy={yy} r="9" fill={cols[i % cols.length]} className="anim-twinkle" style={{ animationDelay: `${(i % 5) * 0.4}s`, transformBox: "fill-box", transformOrigin: "center" }} />;
      })}
    </g>
  );
}

/** Layered snowy landscape used behind the loading and home screens. */
export function WinterScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7FB8D2" /><stop offset=".65" stopColor="#D9EEF5" /><stop offset="1" stopColor="#FFFDF7" /></linearGradient>
        <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFF3C4" /><stop offset="1" stopColor="#FFF3C4" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#sky)" />
      <circle cx="930" cy="190" r="190" fill="url(#sun)" />
      <path d="M0 520L170 330 300 470 470 280 640 500 800 360 980 520 1200 380V800H0z" fill="#9FC3D6" />
      <path d="M470 280l50 54-30-12-20 22-20-22-30 12zM170 330l40 46-24-8-16 18-16-18-24 8zM800 360l40 44-22-8-18 18-18-18-22 8z" fill={P.snow} opacity=".9" />
      <path d="M0 600Q300 500 600 580T1200 540V800H0z" fill="#E7F3F7" />
      {[60, 130, 1070, 1140, 210, 1000].map((x, i) => <Pine key={x} x={x} y={600 + (i % 3) * 14} s={1 + (i % 3) * 0.25} c={i % 2 ? "#28664D" : "#174B3C"} />)}
      <path d="M0 690Q320 620 640 680T1200 650V800H0z" fill={P.snow} />
      <path d="M0 760Q400 710 800 750T1200 730V800H0z" fill="#EAF4F7" />
      <Lights y={40} />
    </svg>
  );
}
