"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ElementDefinition, ElementProps, OverlayElement } from "@/lib/builder/types";
import OverlayContent from "../OverlayContent";

interface Props {
  def: ElementDefinition;
  padding: number;
  overrides?: ElementProps;
  onAdd: (kind: string, padding: number) => void;
}

export default function PaletteItem({ def, padding, overrides, onAdd }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${def.kind}`,
    data: { source: "palette", kind: def.kind, padding, overrides },
  });

  const preview: OverlayElement = {
    id: `preview-${def.kind}`,
    kind: def.kind,
    enabled: true,
    props: { ...def.defaultProps, padding, ...overrides },
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 ${isDragging ? "opacity-40" : ""}`}>
      <div ref={setNodeRef} {...attributes} {...listeners} title={`Drag ${def.name} onto the product`} className="flex min-h-[40px] cursor-grab items-center justify-center active:cursor-grabbing">
        <OverlayContent element={preview} def={def} />
      </div>
      <button onClick={() => onAdd(def.kind, padding)} className="w-full truncate rounded text-[11px] text-slate-500 hover:text-indigo-600">
        {def.name}
      </button>
    </div>
  );
}
