"use client";

import { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getDefinition, isMockKind } from "@/lib/builder/catalog";
import type { OverlayElement } from "@/lib/builder/types";
import OverlayContent from "./OverlayContent";
import ElementControls from "./ElementControls";

interface Props {
  element: OverlayElement;
  selected: boolean;
  fill?: boolean;
  preview?: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onDetach: (id: string) => void;
}

const FILL_CLASSES =
  "h-full w-full [&>*]:h-full [&>*]:w-full [&>*]:!rounded-none [&>*]:!shadow-none [&>*]:!ring-0 [&>*]:flex [&>*]:!items-center [&>*]:justify-center";

export default function CanvasElement({ element, selected, fill = false, preview = false, onSelect, onToggle, onRemove, onDetach }: Props) {
  const def = getDefinition(element.kind);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
    data: { source: "element", kind: element.kind, elementId: element.id },
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const hideTimer = useRef<number>();
  const show = () => { window.clearTimeout(hideTimer.current); setHovered(true); };
  const hide = () => { hideTimer.current = window.setTimeout(() => setHovered(false), 120); };

  if (!def) return null;

  const mock = isMockKind(element.kind) && !preview;
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : mock ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    filter: selected ? "drop-shadow(0 0 2px #6366f1) drop-shadow(0 0 1px #6366f1)" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} onClick={(e) => { e.stopPropagation(); onSelect(element.id); }} onMouseEnter={show} onMouseLeave={hide} className={`group relative ${fill ? "flex h-full w-full" : "inline-flex"}`}>
      <div ref={setAnchorEl} {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing ${fill ? FILL_CLASSES : ""} ${element.enabled ? "" : "opacity-40 grayscale"}`}>
        <OverlayContent element={element} def={def} />
      </div>
      <ElementControls anchor={anchorEl} visible={hovered && !isDragging} onEnter={show} onLeave={hide}>
        <CtrlBtn title="Toggle" onClick={() => onToggle(element.id)}>{element.enabled ? "👁" : "🚫"}</CtrlBtn>
        <CtrlBtn title="Detach (free move)" onClick={() => onDetach(element.id)}>⤢</CtrlBtn>
        <CtrlBtn title="Remove" danger onClick={() => onRemove(element.id)}>✕</CtrlBtn>
      </ElementControls>
    </div>
  );
}

function CtrlBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button title={title} onClick={(e) => { e.stopPropagation(); onClick(); }} className={`flex h-6 w-6 items-center justify-center rounded-full text-[16px] leading-none shadow ring-1 ${danger ? "bg-red-500 text-white ring-red-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100"}`}>
      {children}
    </button>
  );
}
