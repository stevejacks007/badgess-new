"use client";

import type { CarouselConfig, SafePadding } from "@/lib/builder/types";

interface Props {
  carousel: CarouselConfig;
  safePadding: SafePadding;
  onPrev: () => void;
  onNext: () => void;
}

export default function CarouselOverlay({ carousel, safePadding: s, onPrev, onNext }: Props) {
  const arrowW = carousel.arrowW || 34;
  const arrowH = carousel.arrowH || 34;
  const dotW = carousel.dotW || 8;
  const dotH = carousel.dotH || 8;
  const slides = Math.max(1, carousel.slides);
  const active = Math.min(slides, Math.max(1, carousel.activeSlide));
  const arrow: React.CSSProperties = { width: arrowW, height: arrowH, top: "50%", pointerEvents: "auto" };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ ...arrow, left: s.left, transform: "translateY(-50%)" }} className="absolute flex items-center justify-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white">◀</button>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ ...arrow, right: s.right, transform: "translateY(-50%)" }} className="absolute flex items-center justify-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white">▶</button>
      <div style={{ bottom: s.bottom, left: "50%", transform: "translateX(-50%)" }} className="absolute flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1">
        {Array.from({ length: slides }, (_, i) => (
          <span key={i} style={{ width: dotW, height: dotH }} className={`rounded-full ${i + 1 === active ? "bg-white" : "bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}
