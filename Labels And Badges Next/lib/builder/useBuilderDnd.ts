"use client";

import { useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ALL_ZONE_IDS } from "./zones";
import type { BuilderApi } from "./useBuilder";
import type { ElementProps, ZoneId } from "./types";

export interface ActiveDrag {
  source: "palette" | "element" | "detached";
  kind: string;
  padding?: number;
  overrides?: ElementProps;
  elementId?: string;
}

const PALETTE_PREFIX = "palette:";
const FALLBACK_ZONE: ZoneId = "top-left";

export function useBuilderDnd(api: BuilderApi, getScale: () => number = () => 1) {
  const { config } = api;
  const [active, setActive] = useState<ActiveDrag | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const containerOf = (id: string): ZoneId | null => {
    if (id.startsWith(PALETTE_PREFIX)) return null;
    if (ALL_ZONE_IDS.includes(id as ZoneId)) return id as ZoneId;
    return api.findZoneOf(id);
  };

  const indexInZone = (zone: ZoneId, id: string) =>
    config.zones[zone].findIndex((el) => el.id === id);

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as ActiveDrag | undefined;
    if (data) setActive(data);
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active: a, over } = e;
    if (!over) return;
    const data = a.data.current as ActiveDrag | undefined;
    if (data?.source !== "element") return;
    const from = containerOf(String(a.id));
    const to = containerOf(String(over.id));
    if (!from || !to || from === to) return;
    const overIsZone = ALL_ZONE_IDS.includes(String(over.id) as ZoneId);
    const idx = overIsZone ? config.zones[to].length : indexInZone(to, String(over.id));
    api.moveElement(String(a.id), to, idx < 0 ? config.zones[to].length : idx);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active: a, over, delta } = e;
    const data = a.data.current as ActiveDrag | undefined;
    setActive(null);

    if (data?.source === "detached" && data.elementId) {
      const el = config.detached.find((d) => d.id === data.elementId);
      if (el?.position) {
        const scale = getScale() || 1;
        const dxPct = (delta.x / scale / config.card.width) * 100;
        const dyPct = (delta.y / scale / config.card.height) * 100;
        api.moveDetached(el.id, el.position.xPct + dxPct, el.position.yPct + dyPct);
      }
      return;
    }

    if (!over) return;

    if (data?.source === "palette") {
      const overZone = containerOf(String(over.id)) ?? FALLBACK_ZONE;
      api.tryAddElement(data.kind, overZone, {
        ...(data.padding !== undefined ? { padding: data.padding } : {}),
        ...(data.overrides ?? {}),
      });
      return;
    }

    const zone = containerOf(String(a.id));
    const overZone = containerOf(String(over.id));
    if (!zone || !overZone || zone !== overZone) return;
    const from = indexInZone(zone, String(a.id));
    const to = ALL_ZONE_IDS.includes(String(over.id) as ZoneId)
      ? config.zones[zone].length - 1
      : indexInZone(zone, String(over.id));
    if (from !== to && to >= 0) api.reorderWithinZone(zone, from, to);
  };

  const activeZoneId = active?.elementId ? containerOf(active.elementId) : null;

  return { sensors, active, activeZoneId, onDragStart, onDragOver, onDragEnd };
}
