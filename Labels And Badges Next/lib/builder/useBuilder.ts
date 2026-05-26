"use client";

import { useCallback, useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { getDefinition, isRestrictedKind } from "./catalog";
import { createElement, defaultConfig, makeId } from "./factory";
import { clampCard, loadConfig, saveConfig } from "./storage";
import { getZone, isStripId, ZONE_IDS } from "./zones";
import type {
  BuilderConfig,
  CornerRadius,
  ElementProps,
  FreePosition,
  OverlayElement,
  SafePadding,
  StripConfig,
  ZoneId,
} from "./types";

export type ElementLocation = { kind: "zone"; zone: ZoneId } | { kind: "detached" };

export interface PendingDrop {
  kind: string;
  zone: ZoneId;
  overrides?: ElementProps;
}

export interface BuilderApi {
  config: BuilderConfig;
  dirty: boolean;
  save: () => void;
  discard: () => void;
  setConfig: (config: BuilderConfig) => void;
  addElement: (kind: string, zone: ZoneId, overrides?: ElementProps) => void;
  tryAddElement: (kind: string, zone: ZoneId, overrides?: ElementProps) => void;
  pendingDrop: PendingDrop | null;
  confirmPendingDrop: () => void;
  cancelPendingDrop: () => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  toggleElement: (id: string) => void;
  updateProps: (id: string, props: OverlayElement["props"]) => void;
  setProductImage: (url: string) => void;
  setProductType: (type: "single" | "slider") => void;
  setCarousel: (patch: Partial<BuilderConfig["carousel"]>) => void;
  setCardSize: (width: number, height: number) => void;
  setSafePadding: (patch: Partial<SafePadding>) => void;
  setCardRadius: (patch: Partial<CornerRadius>) => void;
  setStrip: (which: "top" | "bottom", patch: Partial<StripConfig>) => void;
  moveElement: (id: string, toZone: ZoneId, toIndex: number) => void;
  reorderWithinZone: (zone: ZoneId, fromIndex: number, toIndex: number) => void;
  detachElement: (id: string) => void;
  attachElement: (id: string, zone?: ZoneId) => void;
  moveDetached: (id: string, xPct: number, yPct: number) => void;
  findZoneOf: (id: string) => ZoneId | null;
  findLocation: (id: string) => ElementLocation | null;
  findElement: (id: string) => OverlayElement | null;
  reset: () => void;
}

const clampPct = (v: number) => Math.max(0, Math.min(100, v));

function anchorPosition(zone: ZoneId, config: BuilderConfig): FreePosition {
  const { card, safePadding: s } = config;
  const leftPct = (s.left / card.width) * 100;
  const rightPct = 100 - (s.right / card.width) * 100;
  const topPct = (s.top / card.height) * 100;
  const bottomPct = 100 - (s.bottom / card.height) * 100;
  const { halign, valign } = getZone(zone);
  const x = halign === "end" ? clampPct(rightPct - 18) : halign === "center" ? 42 : leftPct;
  const y = valign === "start" ? topPct : valign === "end" ? clampPct(bottomPct - 10) : 44;
  return { xPct: clampPct(x), yPct: clampPct(y) };
}

export function useBuilder(): BuilderApi {
  const initial = useMemo(() => loadConfig() ?? defaultConfig(), []);
  const [config, setConfig] = useState<BuilderConfig>(initial);
  const [saved, setSaved] = useState<BuilderConfig>(initial);

  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(saved),
    [config, saved]
  );

  const save = useCallback(() => {
    saveConfig(config);
    setSaved(config);
  }, [config]);

  const discard = useCallback(() => setConfig(saved), [saved]);

  const findZoneOf = useCallback(
    (id: string): ZoneId | null => {
      for (const zone of Object.keys(config.zones) as ZoneId[]) {
        if (config.zones[zone].some((el) => el.id === id)) return zone;
      }
      return null;
    },
    [config]
  );

  const findLocation = useCallback(
    (id: string): ElementLocation | null => {
      const zone = findZoneOf(id);
      if (zone) return { kind: "zone", zone };
      if (config.detached.some((el) => el.id === id)) return { kind: "detached" };
      return null;
    },
    [config, findZoneOf]
  );

  const findElement = useCallback(
    (id: string): OverlayElement | null => {
      for (const z of Object.keys(config.zones) as ZoneId[]) {
        const el = config.zones[z].find((e) => e.id === id);
        if (el) return el;
      }
      return config.detached.find((e) => e.id === id) ?? null;
    },
    [config]
  );

  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);

  const addElement = useCallback((kind: string, zone: ZoneId, overrides?: ElementProps) => {
    const def = getDefinition(kind);
    const el = createElement(kind, overrides);
    if (!def || !el) return;
    setConfig((prev) => {
      if (def.layout === "fullCard") {
        const exists = [...Object.values(prev.zones).flat(), ...prev.detached].some(
          (e) => getDefinition(e.kind)?.layout === "fullCard"
        );
        if (exists) return prev;
      }
      return { ...prev, zones: { ...prev.zones, [zone]: [...prev.zones[zone], el] } };
    });
  }, []);

  const tryAddElement = useCallback(
    (kind: string, zone: ZoneId, overrides?: ElementProps) => {
      if (isStripId(zone)) {
        const el = createElement(kind, overrides);
        if (el) setConfig((prev) => ({ ...prev, zones: { ...prev.zones, [zone]: [el] } }));
        return;
      }
      if (isRestrictedKind(kind)) {
        const existsAnywhere = [
          ...ZONE_IDS.flatMap((z) => config.zones[z]),
          ...config.detached,
        ].some((e) => isRestrictedKind(e.kind));
        if (existsAnywhere) {
          setPendingDrop({ kind, zone, overrides });
          return;
        }
      }
      addElement(kind, zone, overrides);
    },
    [config, addElement]
  );

  const confirmPendingDrop = useCallback(() => {
    if (!pendingDrop) return;
    const { kind, zone, overrides } = pendingDrop;
    const el = createElement(kind, overrides);
    setConfig((prev) => {
      const zones = { ...prev.zones };
      for (const z of Object.keys(zones) as ZoneId[]) {
        zones[z] = zones[z].filter((e) => !isRestrictedKind(e.kind));
      }
      if (el) zones[zone] = [...zones[zone], el];
      const detached = prev.detached.filter((e) => !isRestrictedKind(e.kind));
      return { ...prev, zones, detached };
    });
    setPendingDrop(null);
  }, [pendingDrop]);

  const cancelPendingDrop = useCallback(() => setPendingDrop(null), []);

  const mapElement = useCallback(
    (id: string, fn: (el: OverlayElement) => OverlayElement) => {
      setConfig((prev) => {
        const zones = { ...prev.zones };
        for (const z of Object.keys(zones) as ZoneId[]) {
          zones[z] = zones[z].map((el) => (el.id === id ? fn(el) : el));
        }
        const detached = prev.detached.map((el) => (el.id === id ? fn(el) : el));
        return { ...prev, zones, detached };
      });
    },
    []
  );

  const removeElement = useCallback((id: string) => {
    setConfig((prev) => {
      const zones = { ...prev.zones };
      for (const z of Object.keys(zones) as ZoneId[]) {
        zones[z] = zones[z].filter((el) => el.id !== id);
      }
      return { ...prev, zones, detached: prev.detached.filter((el) => el.id !== id) };
    });
  }, []);

  const duplicateElement = useCallback((id: string) => {
    setConfig((prev) => {
      const zones = { ...prev.zones };
      for (const z of Object.keys(zones) as ZoneId[]) {
        const idx = zones[z].findIndex((el) => el.id === id);
        if (idx !== -1) {
          const source = zones[z][idx];
          const copy: OverlayElement = { ...source, id: makeId(source.kind), props: { ...source.props } };
          zones[z] = [...zones[z].slice(0, idx + 1), copy, ...zones[z].slice(idx + 1)];
          return { ...prev, zones };
        }
      }
      const dIdx = prev.detached.findIndex((el) => el.id === id);
      if (dIdx !== -1) {
        const source = prev.detached[dIdx];
        const copy: OverlayElement = {
          ...source,
          id: makeId(source.kind),
          props: { ...source.props },
          position: source.position
            ? { xPct: clampPct(source.position.xPct + 4), yPct: clampPct(source.position.yPct + 4) }
            : undefined,
        };
        return { ...prev, detached: [...prev.detached, copy] };
      }
      return prev;
    });
  }, []);

  const toggleElement = useCallback(
    (id: string) => mapElement(id, (el) => ({ ...el, enabled: !el.enabled })),
    [mapElement]
  );

  const updateProps = useCallback(
    (id: string, props: ElementProps) =>
      mapElement(id, (el) => ({ ...el, props: { ...el.props, ...props } })),
    [mapElement]
  );

  const setProductImage = useCallback((url: string) => {
    setConfig((prev) => ({ ...prev, productImage: url }));
  }, []);

  const setProductType = useCallback((type: "single" | "slider") => {
    setConfig((prev) => ({ ...prev, productType: type }));
  }, []);

  const setCarousel = useCallback((patch: Partial<BuilderConfig["carousel"]>) => {
    setConfig((prev) => ({ ...prev, carousel: { ...prev.carousel, ...patch } }));
  }, []);

  const setCardSize = useCallback((width: number, height: number) => {
    setConfig((prev) => {
      const card = clampCard({ width, height });
      if (card.width === prev.card.width && card.height === prev.card.height) return prev;
      return { ...prev, card };
    });
  }, []);

  const setSafePadding = useCallback((patch: Partial<SafePadding>) => {
    setConfig((prev) => ({ ...prev, safePadding: { ...prev.safePadding, ...patch } }));
  }, []);

  const setCardRadius = useCallback((patch: Partial<CornerRadius>) => {
    setConfig((prev) => ({ ...prev, cardRadius: { ...prev.cardRadius, ...patch } }));
  }, []);

  const setStrip = useCallback((which: "top" | "bottom", patch: Partial<StripConfig>) => {
    setConfig((prev) => ({
      ...prev,
      strips: {
        ...prev.strips,
        [which]: {
          ...prev.strips[which],
          ...patch,
          radius: { ...prev.strips[which].radius, ...patch.radius },
        },
      },
    }));
  }, []);

  const reorderWithinZone = useCallback((zone: ZoneId, fromIndex: number, toIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      zones: { ...prev.zones, [zone]: arrayMove(prev.zones[zone], fromIndex, toIndex) },
    }));
  }, []);

  const moveElement = useCallback((id: string, toZone: ZoneId, toIndex: number) => {
    setConfig((prev) => {
      const zones = { ...prev.zones };
      let moved: OverlayElement | null = null;
      for (const z of Object.keys(zones) as ZoneId[]) {
        const idx = zones[z].findIndex((el) => el.id === id);
        if (idx !== -1) {
          moved = zones[z][idx];
          zones[z] = [...zones[z].slice(0, idx), ...zones[z].slice(idx + 1)];
          break;
        }
      }
      if (!moved) return prev;
      const target = [...zones[toZone]];
      const clamped = Math.max(0, Math.min(toIndex, target.length));
      target.splice(clamped, 0, moved);
      zones[toZone] = target;
      return { ...prev, zones };
    });
  }, []);

  const detachElement = useCallback((id: string) => {
    setConfig((prev) => {
      const zones = { ...prev.zones };
      for (const z of Object.keys(zones) as ZoneId[]) {
        const idx = zones[z].findIndex((el) => el.id === id);
        if (idx !== -1) {
          const el = zones[z][idx];
          zones[z] = [...zones[z].slice(0, idx), ...zones[z].slice(idx + 1)];
          const detachedEl: OverlayElement = { ...el, homeZone: z, position: anchorPosition(z, prev) };
          return { ...prev, zones, detached: [...prev.detached, detachedEl] };
        }
      }
      return prev;
    });
  }, []);

  const attachElement = useCallback((id: string, zone?: ZoneId) => {
    setConfig((prev) => {
      const idx = prev.detached.findIndex((el) => el.id === id);
      if (idx === -1) return prev;
      const el = prev.detached[idx];
      const target = zone ?? el.homeZone ?? "top-left";
      const { position: _pos, homeZone: _home, ...rest } = el;
      void _pos;
      void _home;
      return {
        ...prev,
        detached: [...prev.detached.slice(0, idx), ...prev.detached.slice(idx + 1)],
        zones: { ...prev.zones, [target]: [...prev.zones[target], rest] },
      };
    });
  }, []);

  const moveDetached = useCallback((id: string, xPct: number, yPct: number) => {
    setConfig((prev) => ({
      ...prev,
      detached: prev.detached.map((el) =>
        el.id === id ? { ...el, position: { xPct: clampPct(xPct), yPct: clampPct(yPct) } } : el
      ),
    }));
  }, []);

  const reset = useCallback(() => setConfig(defaultConfig()), []);

  return useMemo(
    () => ({
      config,
      dirty,
      save,
      discard,
      setConfig,
      addElement,
      tryAddElement,
      pendingDrop,
      confirmPendingDrop,
      cancelPendingDrop,
      removeElement,
      duplicateElement,
      toggleElement,
      updateProps,
      setProductImage,
      setProductType,
      setCarousel,
      setCardSize,
      setSafePadding,
      setCardRadius,
      setStrip,
      moveElement,
      reorderWithinZone,
      detachElement,
      attachElement,
      moveDetached,
      findZoneOf,
      findLocation,
      findElement,
      reset,
    }),
    [
      config, dirty, save, discard, addElement, tryAddElement, pendingDrop,
      confirmPendingDrop, cancelPendingDrop, removeElement, duplicateElement,
      toggleElement, updateProps, setProductImage, setProductType, setCarousel,
      setCardSize, setSafePadding, setCardRadius, setStrip, moveElement,
      reorderWithinZone, detachElement, attachElement, moveDetached,
      findZoneOf, findLocation, findElement, reset,
    ]
  );
}
