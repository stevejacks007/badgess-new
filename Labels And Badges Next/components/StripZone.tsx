"use client";

import { radiusStyle } from "@/lib/builder/style";
import type { OverlayElement, StripConfig, ZoneDefinition, ZoneId } from "@/lib/builder/types";
import CanvasZone from "./CanvasZone";

interface Props {
  zone: ZoneDefinition;
  side: "top" | "bottom";
  strip: StripConfig;
  elements: OverlayElement[];
  width: number;
  preview?: boolean;
  selectedId: string | null;
  activeZoneId: ZoneId | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onDetach: (id: string) => void;
}

const STRIP_HEIGHT = 40;

export default function StripZone({ zone, side, strip, elements, width, preview = false, selectedId, activeZoneId, onSelect, onToggle, onRemove, onDetach }: Props) {
  const empty = elements.length === 0;
  const showOutline = empty && !preview;
  const gap = strip.attached ? 0 : strip.gap;

  return (
    <div
      style={{ width, height: STRIP_HEIGHT, padding: strip.padding, borderRadius: radiusStyle(strip.radius), marginTop: side === "bottom" ? gap : undefined, marginBottom: side === "top" ? gap : undefined }}
      className={`relative overflow-hidden ${showOutline ? "border border-dashed border-slate-300" : ""}`}
    >
      {showOutline && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-wide text-slate-400">
          {zone.label}
        </span>
      )}
      <CanvasZone zone={zone} elements={elements} selectedId={selectedId} activeZone={activeZoneId === zone.id} fill preview={preview} onSelect={onSelect} onToggle={onToggle} onRemove={onRemove} onDetach={onDetach} />
    </div>
  );
}
