"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";

interface Props {
  onScaleChange?: (scale: number) => void;
  children: ReactNode;
}

export interface ViewportHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (scale: number) => void;
  reset: () => void;
}

interface View { scale: number; tx: number; ty: number }

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

const CanvasViewport = forwardRef<ViewportHandle, Props>(({ onScaleChange, children }, handleRef) => {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ scale: 1, tx: 0, ty: 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const viewRef = useRef(view);
  const panning = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  viewRef.current = view;

  useEffect(() => { onScaleChange?.(view.scale); }, [view.scale, onScaleChange]);

  const zoomTo = (target: number) => {
    const el = ref.current;
    const rect = el?.getBoundingClientRect();
    const px = rect ? rect.width / 2 : 0;
    const py = rect ? rect.height / 2 : 0;
    setView((prev) => {
      const next = clamp(target, MIN_SCALE, MAX_SCALE);
      return { scale: next, tx: px - ((px - prev.tx) / prev.scale) * next, ty: py - ((py - prev.ty) / prev.scale) * next };
    });
  };

  useImperativeHandle(handleRef, () => ({
    zoomIn: () => zoomTo(viewRef.current.scale * 1.2),
    zoomOut: () => zoomTo(viewRef.current.scale / 1.2),
    setZoom: (scale: number) => zoomTo(scale),
    reset: () => setView({ scale: 1, tx: 0, ty: 0 }),
  }));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTypingTarget(e.target)) { e.preventDefault(); setSpaceDown(true); }
    };
    const up = (e: KeyboardEvent) => { if (e.code === "Space") setSpaceDown(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setView((prev) => {
        const next = clamp(prev.scale * Math.exp(-e.deltaY * 0.0015), MIN_SCALE, MAX_SCALE);
        return { scale: next, tx: px - ((px - prev.tx) / prev.scale) * next, ty: py - ((py - prev.ty) / prev.scale) * next };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDownCapture = (e: React.PointerEvent) => {
    if (!spaceDown) return;
    e.preventDefault();
    e.stopPropagation();
    const v = viewRef.current;
    panning.current = { x: e.clientX, y: e.clientY, tx: v.tx, ty: v.ty };
    const move = (ev: PointerEvent) => {
      const p = panning.current;
      if (!p) return;
      setView((prev) => ({ ...prev, tx: p.tx + (ev.clientX - p.x), ty: p.ty + (ev.clientY - p.y) }));
    };
    const upHandler = () => {
      panning.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", upHandler);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", upHandler);
  };

  const cursor = spaceDown ? (panning.current ? "grabbing" : "grab") : "default";

  return (
    <div ref={ref} onPointerDownCapture={onPointerDownCapture} style={{ cursor, touchAction: "none" }} className="relative h-full w-full overflow-hidden bg-slate-100">
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`, transformOrigin: "0 0", userSelect: spaceDown ? "none" : undefined }}>
        {children}
      </div>
    </div>
  );
});

CanvasViewport.displayName = "CanvasViewport";
export default CanvasViewport;
