"use client";

import type { CSSProperties, ReactNode } from "react";
import { textStyleFromProps } from "@/lib/builder/text";
import type { ElementDefinition, ElementProps, OverlayElement } from "@/lib/builder/types";

interface Props {
  element: OverlayElement;
  def: ElementDefinition;
}

const str = (v: unknown, fallback = ""): string =>
  v === undefined || v === null ? fallback : String(v);

const n = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const x = Number(v);
  return Number.isNaN(x) ? undefined : x;
};

export function iconRadius(p: ElementProps): string {
  const shape = str(p.shape, "circle");
  if (shape === "square") return "0px";
  if (shape === "rounded") return "10px";
  if (shape === "custom")
    return `${n(p.radiusTL) ?? 8}px ${n(p.radiusTR) ?? 8}px ${n(p.radiusBR) ?? 8}px ${n(p.radiusBL) ?? 8}px`;
  return "9999px";
}

function iconNode(img: unknown, glyph: unknown, on: unknown): ReactNode {
  if (!on) return null;
  const src = typeof img === "string" && img ? img : "";
  if (src)
    return <img src={src} alt="" draggable={false} className="inline-block h-[1.15em] w-[1.15em] object-contain" />;
  const g = glyph !== undefined && glyph !== null && glyph !== "" ? String(glyph) : "";
  return g ? <span>{g}</span> : null;
}

export default function OverlayContent({ element, def }: Props) {
  const p: ElementProps = element.props;
  const pad = p.padding !== undefined ? Number(p.padding) : undefined;
  const padX = p.padX !== undefined && p.padX !== "" ? Number(p.padX) : undefined;
  const pT = n(p.padT), pR = n(p.padR), pB = n(p.padB), pL = n(p.padL);
  const hasSidePad = pT !== undefined || pR !== undefined || pB !== undefined || pL !== undefined;
  const padStyle: CSSProperties = hasSidePad
    ? { paddingTop: pT ?? pad ?? 0, paddingRight: pR ?? pad ?? 0, paddingBottom: pB ?? pad ?? 0, paddingLeft: pL ?? pad ?? 0 }
    : { ...(pad !== undefined ? { padding: pad } : {}), ...(padX !== undefined ? { paddingLeft: padX, paddingRight: padX } : {}) };
  const tStyle = textStyleFromProps(p);

  const stroke = typeof p.stroke === "string" && p.stroke ? p.stroke : "";
  const strokeWidth = p.strokeWidth !== undefined && p.strokeWidth !== "" ? Number(p.strokeWidth) : stroke ? 1 : 0;
  const strokeStyle: CSSProperties = stroke && strokeWidth > 0 ? { border: `${strokeWidth}px solid ${stroke}` } : {};

  const rTL = n(p.radiusTL), rTR = n(p.radiusTR), rBR = n(p.radiusBR), rBL = n(p.radiusBL);
  const hasCornerRadius = rTL !== undefined || rTR !== undefined || rBR !== undefined || rBL !== undefined;
  const radius: string | number | undefined = hasCornerRadius
    ? `${rTL ?? 0}px ${rTR ?? 0}px ${rBR ?? 0}px ${rBL ?? 0}px`
    : n(p.radius);
  const shadowColor = typeof p.shadowColor === "string" && p.shadowColor ? p.shadowColor : "";
  const extraStyle: CSSProperties = {
    ...(radius !== undefined ? { borderRadius: radius } : {}),
    ...(shadowColor ? { boxShadow: `${n(p.shadowX) ?? 0}px ${n(p.shadowY) ?? 2}px ${n(p.shadowBlur) ?? 6}px ${n(p.shadowSpread) ?? 0}px ${shadowColor}` } : {}),
  };

  const fill = (fallback: string): CSSProperties => ({ backgroundColor: str(p.color, fallback) });
  const image = typeof p.image === "string" && p.image ? p.image : "";
  const left = iconNode(p.leftIconImage, p.leftIcon, p.leftIconOn);
  const right = iconNode(p.rightIconImage, p.rightIcon, p.rightIconOn);

  switch (def.presentation) {
    case "image": {
      const src = str(p.src);
      const h = Number(p.h ?? 48);
      if (!src)
        return <span className="rounded border border-dashed border-slate-300 bg-white/80 px-2 py-1 text-[10px] text-slate-400">No image</span>;
      return <img src={src} alt="" draggable={false} style={{ height: h, ...padStyle }} className="w-auto rounded object-contain drop-shadow" />;
    }
    case "badge":
      return (
        <span className="inline-flex items-center gap-1 whitespace-pre rounded-md text-xs font-bold text-white shadow" style={{ ...fill("#2563eb"), ...padStyle, ...tStyle, ...strokeStyle, ...extraStyle }}>
          {left}{str(p.text, def.name)}{right}
        </span>
      );
    case "round":
      return (
        <span className="flex items-center justify-center gap-1 rounded-full text-center text-xs font-bold leading-none text-white shadow" style={{ ...fill("#dc2626"), padding: pad ?? 10, minWidth: (pad ?? 10) * 2 + 12, minHeight: (pad ?? 10) * 2 + 12, ...tStyle, ...strokeStyle, ...extraStyle }}>
          {left}{str(p.text, "%")}{right}
        </span>
      );
    case "tag":
      return (
        <span className="inline-flex items-center gap-1 whitespace-pre text-xs font-bold text-white shadow" style={{ ...fill("#7c3aed"), ...padStyle, ...tStyle, ...strokeStyle, ...extraStyle, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)", paddingLeft: (pad ?? 6) + 10 }}>
          {left}{str(p.text, def.name)}{right}
        </span>
      );
    case "pill":
      return (
        <span className="inline-flex items-center gap-1 whitespace-pre rounded-full text-xs font-semibold text-white shadow" style={{ ...fill("#dc2626"), ...padStyle, ...tStyle, ...strokeStyle, ...extraStyle }}>
          {left}{str(p.text, def.name)}{right}
        </span>
      );
    case "logo":
      return (
        <span className="inline-flex items-center gap-1 whitespace-pre rounded bg-white/90 text-xs font-black tracking-wide text-slate-800 shadow ring-1 ring-slate-200" style={{ ...(p.color ? fill("") : {}), ...padStyle, ...tStyle, ...strokeStyle, ...extraStyle }}>
          {image ? <img src={image} alt="" className="h-5 w-auto object-contain" draggable={false} /> : <>{left}{str(p.text, "BRAND")}{right}</>}
        </span>
      );
    case "icon": {
      const w = n(p.w);
      const h = n(p.h);
      return (
        <span className="flex items-center justify-center overflow-hidden bg-white/90 text-base text-slate-700 shadow ring-1 ring-slate-200" style={{ ...(p.color ? fill("") : {}), ...padStyle, ...strokeStyle, borderRadius: iconRadius(p), width: w, height: h, fontSize: n(p.fontSize) }}>
          {image ? <img src={image} alt="" className="h-full w-full object-contain" draggable={false} /> : str(p.glyph, def.icon)}
        </span>
      );
    }
    case "stars": {
      const rating = Number(p.rating ?? 0);
      return (
        <span className="flex items-center gap-1 rounded-full bg-white/90 text-xs font-medium text-slate-700 shadow ring-1 ring-slate-200" style={{ ...(p.color ? fill("") : {}), ...padStyle, ...tStyle, ...strokeStyle, ...extraStyle }}>
          <span className="text-amber-500">★</span>
          <span>{rating.toFixed(1)}/5{p.count !== undefined && ` (${str(p.count)})`}</span>
        </span>
      );
    }
    case "timer":
      return (
        <span className="inline-flex items-center gap-1 whitespace-pre rounded-md bg-slate-900/85 text-xs font-mono font-semibold text-white shadow" style={{ ...(p.color ? fill("") : {}), ...padStyle, ...tStyle, ...strokeStyle, ...extraStyle }}>
          {left ?? <span>⏱</span>}{str(p.text, "00:00:00")}{right}
        </span>
      );
    case "counter":
      return (
        <span className="inline-flex items-center gap-1 whitespace-pre rounded-md bg-orange-100 text-xs font-semibold text-orange-700 shadow ring-1 ring-orange-200" style={{ ...(p.color ? fill("") : {}), ...padStyle, ...tStyle, ...strokeStyle, ...extraStyle }}>
          {left}{str(p.text, "In stock")}{right}
        </span>
      );
    case "arrows":
      return (
        <span className="flex items-center gap-2 rounded-full bg-white/90 text-sm text-slate-700 shadow ring-1 ring-slate-200" style={padStyle}>
          <span>◀</span><span>▶</span>
        </span>
      );
    case "carousel":
      return (
        <span className="flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-xs text-slate-700 shadow ring-1 ring-slate-200">
          <span>◀</span>
          <span className="flex gap-0.5">
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            <span className="h-1 w-1 rounded-full bg-slate-400" />
          </span>
          <span>▶</span>
        </span>
      );
    default:
      return <span className="rounded bg-slate-200 px-2 py-1 text-xs">{def.name}</span>;
  }
}
