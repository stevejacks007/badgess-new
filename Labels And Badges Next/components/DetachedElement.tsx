"use client";

import { useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { getDefinition, isMockKind } from "@/lib/builder/catalog";
import type { OverlayElement } from "@/lib/builder/types";
import OverlayContent from "./OverlayContent";
import ElementControls from "./ElementControls";

interface Props {
  element: OverlayElement;
  selected: boolean;
  preview?: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onReattach: (id: string) => void;
}

export default function DetachedElement({ element, selected, preview = false, onSelect, onToggle, onRemove, onReattach }: Props) {
  const def = getDefinition(element.kind);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
    data: { source: "detached", kind: element.kind, elementId: element.id },
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const setRefs = (node: HTMLElement | null) => { setNodeRef(node); setAnchorEl(node); };
  const [hovered, setHovered] = useState(false);
  const hideTimer = useRef<number>();
  const show = () => { window.clearTimeout(hideTimer.current); setHovered(true); };
  const hide = () => { hideTimer.current = window.setTimeout(() => setHovered(false), 120); };

  if (!def || !element.position) return null;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{
        position: "absolute",
        left: `${element.position.xPct}%`,
        top: `${element.position.yPct}%`,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 30,
        opacity: isMockKind(element.kind) && !preview ? 0.5 : 1,
        filter: selected ? "drop-shadow(0 0 2px #10b981) drop-shadow(0 0 1px #10b981)" : undefined,
      }}
      className="group pointer-events-auto inline-flex"
    >
      <div ref={setRefs} {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing ${element.enabled ? "" : "opacity-40 grayscale"}`}>
        <OverlayContent element={element} def={def} />
      </div>
      <span className="pointer-events-none absolute -bottom-4 left-0 rounded bg-emerald-500/80 px-1 text-[8px] font-medium uppercase text-white opacity-0 group-hover:opacity-100">free</span>
      <ElementControls anchor={anchorEl} visible={hovered && !isDragging} onEnter={show} onLeave={hide}>
        <CtrlBtn title="Toggle" onClick={() => onToggle(element.id)}>{element.enabled ? "👁" : "🚫"}</CtrlBtn>
        <CtrlBtn title="Reattach to layout" onClick={() => onReattach(element.id)}>⊡</CtrlBtn>
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
