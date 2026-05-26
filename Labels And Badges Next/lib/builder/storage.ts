import { isRestrictedKind } from "./catalog";
import {
  CARD_LIMITS,
  DEFAULT_CARD_RADIUS,
  DEFAULT_CAROUSEL,
  DEFAULT_SAFE_PADDING,
  defaultStrip,
} from "./factory";
import { ALL_ZONE_IDS, ZONE_IDS } from "./zones";
import type { BuilderConfig, CardSize, CornerRadius, OverlayElement, StripConfig, ZoneId } from "./types";

const STORAGE_KEY = "overlay-builder.config.v1";

export function clampCard(card: Partial<CardSize> | undefined): CardSize {
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Math.round(v)));
  return {
    width: clamp(card?.width ?? CARD_LIMITS.defaultWidth, CARD_LIMITS.minWidth, CARD_LIMITS.maxWidth),
    height: clamp(card?.height ?? CARD_LIMITS.defaultHeight, CARD_LIMITS.minHeight, CARD_LIMITS.maxHeight),
  };
}

const mergeRadius = (r: Partial<CornerRadius> | undefined): CornerRadius => ({
  ...DEFAULT_CARD_RADIUS,
  ...r,
});

const mergeStrip = (s: Partial<StripConfig> | undefined): StripConfig => {
  const base = defaultStrip();
  return { ...base, ...s, radius: { ...base.radius, ...s?.radius } };
};

function normalize(config: BuilderConfig): BuilderConfig {
  const src = (config.zones ?? {}) as Partial<Record<ZoneId, BuilderConfig["zones"][ZoneId]>>;
  const zones = {} as Record<ZoneId, BuilderConfig["zones"][ZoneId]>;
  for (const id of ALL_ZONE_IDS) {
    zones[id] = Array.isArray(src[id]) ? (src[id] as BuilderConfig["zones"][ZoneId]) : [];
  }

  let seenRestricted = false;
  const dedupe = (arr: OverlayElement[]) =>
    arr.filter((el) => {
      if (!isRestrictedKind(el.kind)) return true;
      if (seenRestricted) return false;
      seenRestricted = true;
      return true;
    });
  for (const id of ZONE_IDS) zones[id] = dedupe(zones[id]);
  const detached = dedupe(Array.isArray(config.detached) ? config.detached : []);
  const { strips: _legacyStrips, ...rest } = config as BuilderConfig & { strips?: unknown };
  void _legacyStrips;
  return {
    ...rest,
    productType: config.productType === "slider" ? "slider" : "single",
    card: clampCard(config.card),
    cardRadius: mergeRadius(config.cardRadius),
    safePadding: { ...DEFAULT_SAFE_PADDING, ...config.safePadding },
    carousel: {
      ...DEFAULT_CAROUSEL,
      ...config.carousel,
      images: Array.isArray(config.carousel?.images) ? config.carousel.images : [],
    },
    strips: {
      top: mergeStrip(config.strips?.top),
      bottom: mergeStrip(config.strips?.bottom),
    },
    detached,
    zones,
  };
}

export function loadConfig(): BuilderConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw) as BuilderConfig);
  } catch {
    return null;
  }
}

export function saveConfig(config: BuilderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function parseConfig(raw: string): BuilderConfig {
  return normalize(JSON.parse(raw) as BuilderConfig);
}

export function serializeConfig(config: BuilderConfig): string {
  return JSON.stringify(config, null, 2);
}
