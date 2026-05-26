import { getDefinition } from "./catalog";
import { emptyZones } from "./zones";
import type { BuilderConfig, ElementProps, OverlayElement, StripConfig } from "./types";

export const CONFIG_VERSION = 1;

export const CARD_LIMITS = {
  minWidth: 294,
  maxWidth: 400,
  minHeight: 294,
  maxHeight: 448,
  defaultWidth: 294,
  defaultHeight: 400,
} as const;

export const DEFAULT_SAFE_PADDING = { top: 16, right: 16, bottom: 16, left: 16 };
export const MAX_SAFE_PADDING = 80;
export const MAX_RADIUS = 40;

const corner = (v: number) => ({ tl: v, tr: v, br: v, bl: v });

export const DEFAULT_CARD_RADIUS = corner(16);

export function defaultStrip(): StripConfig {
  return { attached: true, gap: 8, padding: 0, radius: corner(8) };
}

export const DEFAULT_CAROUSEL = {
  slides: 3,
  activeSlide: 1,
  images: [] as string[],
  arrowW: 34,
  arrowH: 34,
  dotW: 8,
  dotH: 8,
};

let counter = 0;
export function makeId(prefix = "el"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export function createElement(kind: string, overrides?: ElementProps): OverlayElement | null {
  const def = getDefinition(kind);
  if (!def) return null;
  return {
    id: makeId(kind),
    kind,
    enabled: true,
    props: { ...def.defaultProps, ...overrides },
  };
}

export function defaultConfig(): BuilderConfig {
  const zones = emptyZones() as BuilderConfig["zones"];
  const seed = (kind: string) => {
    const el = createElement(kind);
    return el ? [el] : [];
  };
  return {
    version: CONFIG_VERSION,
    productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    productType: "single",
    card: { width: CARD_LIMITS.defaultWidth, height: CARD_LIMITS.defaultHeight },
    cardRadius: { ...DEFAULT_CARD_RADIUS },
    safePadding: { ...DEFAULT_SAFE_PADDING },
    carousel: { ...DEFAULT_CAROUSEL },
    strips: { top: defaultStrip(), bottom: defaultStrip() },
    zones: {
      ...zones,
      "top-left": seed("badge"),
      "top-right": seed("brand-logo"),
      "bottom-left": seed("reviews"),
      "bottom-right": seed("wishlist-icon"),
    },
    detached: [],
  };
}
