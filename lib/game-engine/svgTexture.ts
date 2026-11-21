import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Turns a React SVG element into a data URL Phaser can load — lets Phaser games reuse the shared SVG art. */
export function svgUrl(el: ReactElement): string {
  const markup = renderToStaticMarkup(el);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(markup)))}`;
}
