import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Turns a React SVG element into a data URL Phaser can load — lets Phaser games reuse the shared SVG art. */
export function svgUrl(el: ReactElement): string {
  const markup = renderToStaticMarkup(el);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(markup)))}`;
}

/** Decodes SVG data URLs into images so Phaser can register them synchronously. */
export async function loadImages(textures: Record<string, { url: string }>): Promise<Record<string, HTMLImageElement>> {
  const out: Record<string, HTMLImageElement> = {};
  await Promise.all(Object.entries(textures).map(([k, t]) => new Promise<void>((res, rej) => { const i = new Image(); i.onload = () => { out[k] = i; res(); }; i.onerror = () => rej(new Error(`texture ${k}`)); i.src = t.url; })));
  return out;
}

