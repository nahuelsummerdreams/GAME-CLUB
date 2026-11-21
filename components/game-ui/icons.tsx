import type { ReactNode } from "react";

const base = { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, focusable: false };
const mk = (d: ReactNode) => function Icon({ className }: { className?: string }) { return <svg {...base} className={className}>{d}</svg>; };

export const IconMusic = mk(<><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></>);
export const IconMusicOff = mk(<><path d="M9 18V6l10-2v10" /><circle cx="6.5" cy="18" r="2.5" /><path d="M3 3l18 18" /></>);
export const IconGear = mk(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>);
export const IconPause = mk(<><path d="M8 5v14M16 5v14" /></>);
export const IconPlay = mk(<path d="M7 4l13 8-13 8z" fill="currentColor" />);
export const IconBack = mk(<path d="M15 5l-7 7 7 7" />);
export const IconReplay = mk(<><path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v5h5" /></>);
export const IconMap = mk(<><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></>);
export const IconStar = mk(<path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17l-5.6 3 1.3-6.2L3 9.5l6.3-.7z" fill="currentColor" />);
export const IconHome = mk(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>);
export const IconTrash = mk(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>);
export const IconLock = mk(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
export const IconCheck = mk(<path d="M5 12l5 5 9-10" />);
