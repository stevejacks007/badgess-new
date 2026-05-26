"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  anchor: HTMLElement | null;
  visible: boolean;
  onEnter: () => void;
  onLeave: () => void;
  children: ReactNode;
}

export default function ElementControls({ anchor, visible, onEnter, onLeave, children }: Props) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!visible || !anchor) { setRect(null); return; }
    const update = () => setRect(anchor.getBoundingClientRect());
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [visible, anchor]);

  if (!visible || !rect) return null;

  return createPortal(
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ position: "fixed", left: rect.right, top: rect.top, zIndex: 1000 }}
      className="-translate-x-full -translate-y-full pb-1"
    >
      <div className="flex gap-0.5">{children}</div>
    </div>,
    document.body
  );
}
