"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { OverlayElement, ZoneDefinition } from "@/lib/builder/types";
import CanvasElement from "./CanvasElement";

interface Props {
  zone: ZoneDefinition;
  elements: OverlayElement[];
  selectedId: string | null;
  activeZone: boolean;
  fill?: boolean;
  preview?: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onDetach: (id: string) => void;
}

export default function CanvasZone({ zone, elements, selectedId, activeZone, fill = false, preview = false, onSelect, onToggle, onRemove, onDetach }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: zone.id });
  const highlight = isOver || activeZone;
  const ALIGN_ITEMS: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end" };
  const JUSTIFY: Record<string, string> = { start: "justify-start", center: "justify-center", end: "justify-end" };
  const horizontal = ALIGN_ITEMS[zone.halign];
  const vertical = JUSTIFY[zone.valign];

  return (
    <div
      ref={setNodeRef}
      style={zone.area ? { gridArea: zone.area } : undefined}
      className={`relative flex ${fill ? "h-full" : ""} flex-col gap-1.5 rounded-md transition ${vertical} ${horizontal} ${highlight ? "bg-indigo-500/10 ring-1 ring-inset ring-indigo-400/60" : ""}`}
    >
      {highlight && !fill && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-indigo-500/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
          {zone.label}
        </span>
      )}
      <SortableContext items={elements.map((e) => e.id)} strategy={rectSortingStrategy}>
        <div className={fill ? "flex h-full w-full" : `flex flex-wrap gap-1.5 ${JUSTIFY[zone.halign]}`}>
          {elements.map((el) => (
            <CanvasElement key={el.id} element={el} selected={selectedId === el.id} fill={fill} preview={preview} onSelect={onSelect} onToggle={onToggle} onRemove={onRemove} onDetach={onDetach} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
