"use client";

import { useEffect, useRef } from "react";
import { getDefinition } from "@/lib/builder/catalog";
import { CARD_LIMITS } from "@/lib/builder/factory";
import { ZONES, GRID_TEMPLATE_AREAS, STRIPS } from "@/lib/builder/zones";
import type { BuilderApi } from "@/lib/builder/useBuilder";
import type { OverlayElement, ZoneId } from "@/lib/builder/types";
import CanvasZone from "./CanvasZone";
import CarouselOverlay from "./CarouselOverlay";
import DetachedElement from "./DetachedElement";
import SafeAreaGuides from "./SafeAreaGuides";
import StripZone from "./StripZone";
import { radiusStyle } from "@/lib/builder/style";

const [TOP_STRIP, BOTTOM_STRIP] = STRIPS;
const isFullCard = (el: OverlayElement) => getDefinition(el.kind)?.layout === "fullCard";

interface Props {
  api: BuilderApi;
  selectedId: string | null;
  activeZoneId: ZoneId | null;
  dragging: boolean;
  preview?: boolean;
  onSelect: (id: string) => void;
  onSelectCard: () => void;
}

export default function BuilderCanvas({ api, selectedId, activeZoneId, dragging, preview = false, onSelect, onSelectCard }: Props) {
  const { config } = api;
  const s = config.safePadding;
  const cardRef = useRef<HTMLDivElement>(null);

  const cycleSlide = (dir: 1 | -1) => {
    const slides = Math.max(1, config.carousel.slides);
    const a = Math.min(slides, Math.max(1, config.carousel.activeSlide));
    const next = dir === 1 ? (a % slides) + 1 : ((a - 2 + slides) % slides) + 1;
    api.setCarousel({ activeSlide: next });
  };

  const activeImage =
    config.productType === "slider"
      ? config.carousel.images[Math.min(config.carousel.slides, Math.max(1, config.carousel.activeSlide)) - 1] || config.productImage
      : config.productImage;
  const setCardSize = api.setCardSize;

  const stripHandlers = { width: config.card.width, preview, selectedId, activeZoneId, onSelect, onToggle: api.toggleElement, onRemove: api.removeElement, onDetach: api.detachElement };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.width = `${config.card.width}px`;
    el.style.height = `${config.card.height}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardSize(el.offsetWidth, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [setCardSize]);

  return (
    <div className="mx-auto flex flex-col items-center" onClick={(e) => { e.stopPropagation(); onSelectCard(); }}>
      <StripZone zone={TOP_STRIP} side="top" strip={config.strips.top} elements={config.zones["top-strip"]} {...stripHandlers} />

      <div
        ref={cardRef}
        style={{ width: CARD_LIMITS.defaultWidth, height: CARD_LIMITS.defaultHeight, minWidth: CARD_LIMITS.minWidth, maxWidth: CARD_LIMITS.maxWidth, minHeight: CARD_LIMITS.minHeight, maxHeight: CARD_LIMITS.maxHeight, resize: "both", borderRadius: radiusStyle(config.cardRadius) }}
        className="relative overflow-hidden bg-white shadow-lg ring-1 ring-slate-200"
      >
        {!preview && (
          <span className="pointer-events-none absolute bottom-1 right-1 z-40 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
            {config.card.width}×{config.card.height}
          </span>
        )}

        <img src={activeImage} alt="Product" className="absolute inset-0 h-full w-full object-cover" draggable={false} />

        {!preview && <SafeAreaGuides safePadding={s} active={dragging} />}

        <div className="absolute inset-0 z-10 grid gap-2" style={{ gridTemplateColumns: "repeat(6, 1fr)", gridTemplateRows: "repeat(3, 1fr)", gridTemplateAreas: GRID_TEMPLATE_AREAS, paddingTop: s.top, paddingRight: s.right, paddingBottom: s.bottom, paddingLeft: s.left }}>
          {ZONES.map((zone) => (
            <CanvasZone key={zone.id} zone={zone} elements={config.zones[zone.id].filter((el) => !isFullCard(el))} selectedId={selectedId} activeZone={activeZoneId === zone.id} preview={preview} onSelect={onSelect} onToggle={api.toggleElement} onRemove={api.removeElement} onDetach={api.detachElement} />
          ))}
        </div>

        {config.productType === "slider" && (
          <CarouselOverlay carousel={config.carousel} safePadding={s} onPrev={() => cycleSlide(-1)} onNext={() => cycleSlide(1)} />
        )}

        <div className="pointer-events-none absolute inset-0 z-30">
          {config.detached.map((el) => (
            <DetachedElement key={el.id} element={el} selected={selectedId === el.id} preview={preview} onSelect={onSelect} onToggle={api.toggleElement} onRemove={api.removeElement} onReattach={api.attachElement} />
          ))}
        </div>
      </div>

      <StripZone zone={BOTTOM_STRIP} side="bottom" strip={config.strips.bottom} elements={config.zones["bottom-strip"]} {...stripHandlers} />
    </div>
  );
}
