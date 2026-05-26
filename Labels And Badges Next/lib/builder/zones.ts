import type { ZoneDefinition, ZoneId } from "./types";

export const GRID_TEMPLATE_AREAS = [
  '"tl tl tl tr tr tr"',
  '"mid mid mid mid mid mid"',
  '"bl bl bl br br br"',
].join(" ");

export const ZONES: ZoneDefinition[] = [
  { id: "top-left", label: "Top Left", area: "tl", halign: "start", valign: "start" },
  { id: "top-right", label: "Top Right", area: "tr", halign: "end", valign: "start" },
  { id: "middle", label: "Middle", area: "mid", halign: "center", valign: "center" },
  { id: "bottom-left", label: "Bottom Left", area: "bl", halign: "start", valign: "end" },
  { id: "bottom-right", label: "Bottom Right", area: "br", halign: "end", valign: "end" },
];

export const ZONE_IDS: ZoneId[] = ZONES.map((z) => z.id);

export const STRIPS: ZoneDefinition[] = [
  { id: "top-strip", label: "Top Badge", area: "", halign: "center", valign: "center" },
  { id: "bottom-strip", label: "Bottom Badge", area: "", halign: "center", valign: "center" },
];

export const STRIP_IDS: ZoneId[] = STRIPS.map((s) => s.id);
export const ALL_ZONES: ZoneDefinition[] = [...ZONES, ...STRIPS];
export const ALL_ZONE_IDS: ZoneId[] = ALL_ZONES.map((z) => z.id);

export const isStripId = (id: string): boolean => id === "top-strip" || id === "bottom-strip";

const ZONE_BY_ID: Record<ZoneId, ZoneDefinition> = Object.fromEntries(
  ALL_ZONES.map((z) => [z.id, z])
) as Record<ZoneId, ZoneDefinition>;

export function getZone(id: ZoneId): ZoneDefinition {
  return ZONE_BY_ID[id];
}

export function emptyZones(): Record<ZoneId, []> {
  return ALL_ZONE_IDS.reduce(
    (acc, id) => {
      acc[id] = [];
      return acc;
    },
    {} as Record<ZoneId, []>
  );
}
