"use client";

import { useRef } from "react";
import { getDefinition, isRestrictedKind } from "@/lib/builder/catalog";
import { readFileAsDataUrl } from "@/lib/builder/assets";
import { TEXT_PRESENTATIONS, WEIGHT_OPTIONS } from "@/lib/builder/text";
import { ALL_ZONES } from "@/lib/builder/zones";
import type { BuilderApi } from "@/lib/builder/useBuilder";
import type { AssetsApi } from "@/lib/builder/useAssets";
import type { ElementProps as Bag, OverlayElement, ZoneId } from "@/lib/builder/types";
import { C, PANEL_FONT, SectionBar, Divider, Row, ColorField, SliderField, SelectField, ToggleGroup, Quad } from "./properties/Controls";

const SIDE_FIELDS = [{ key: "top", label: "T" }, { key: "right", label: "R" }, { key: "bottom", label: "B" }, { key: "left", label: "L" }];
const CORNER_FIELDS = [{ key: "tl", label: "TL" }, { key: "tr", label: "TR" }, { key: "br", label: "BR" }, { key: "bl", label: "BL" }];

const radiusPatch = (patch: Record<string, number>) =>
  Object.fromEntries(Object.entries(patch).map(([k, v]) => ["radius" + k.toUpperCase(), v]));
const PAD_SIDE: Record<string, string> = { top: "padT", right: "padR", bottom: "padB", left: "padL" };
const padPatch = (patch: Record<string, number>) =>
  Object.fromEntries(Object.entries(patch).map(([k, v]) => [PAD_SIDE[k], v]));

interface Props { api: BuilderApi; assets: AssetsApi; selectedId: string | null }

const STYLEABLE = ["badge", "round", "tag", "pill", "logo", "timer", "counter", "stars", "icon"];
const ICON_SLOT = ["badge", "round", "tag", "pill", "logo", "timer", "counter"];
const numOf = (p: Bag, k: string, d: number) => { const v = Number(p[k]); return p[k] === undefined || p[k] === "" || Number.isNaN(v) ? d : v; };
const strOf = (p: Bag, k: string, d = "") => (typeof p[k] === "string" && p[k] ? (p[k] as string) : d);

export default function PropertiesPanel({ api, assets, selectedId }: Props) {
  const el = selectedId ? api.findElement(selectedId) : null;
  const def = el ? getDefinition(el.kind) : null;
  const loc = selectedId ? api.findLocation(selectedId) : null;
  const editable = !!el && isRestrictedKind(el.kind);
  const title = el && def ? def.name : "Product Image";

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-l bg-white" style={{ fontFamily: PANEL_FONT, borderColor: C.g300 }}>
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-3" style={{ borderColor: C.g200 }}>
        <span className="text-sm font-bold" style={{ color: C.g900 }}>{title}</span>
        {el && (
          <div className="flex items-center gap-1.5">
            <TopIcon title="Remove" onClick={() => api.removeElement(el.id)}><TrashIcon /></TopIcon>
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        {el && def && loc ? (
          editable
            ? <ElementView api={api} assets={assets} el={el} def={def} detached={loc.kind === "detached"} zone={loc.kind === "zone" ? loc.zone : undefined} />
            : <PlaceholderView api={api} el={el} def={def} detached={loc.kind === "detached"} zone={loc.kind === "zone" ? loc.zone : undefined} />
        ) : (
          <CardView api={api} />
        )}
      </div>
    </aside>
  );
}

function ElementView({ api, assets, el, def, detached, zone }: { api: BuilderApi; assets: AssetsApi; el: OverlayElement; def: NonNullable<ReturnType<typeof getDefinition>>; detached: boolean; zone?: ZoneId }) {
  const p = el.props;
  const set = (patch: Bag) => api.updateProps(el.id, patch);
  const pres = def.presentation;
  const isText = TEXT_PRESENTATIONS.includes(pres);
  const isIcon = pres === "icon";
  const isStyleable = STYLEABLE.includes(pres);
  const hasSideIcons = ICON_SLOT.includes(pres);
  const shadowOn = !!strOf(p, "shadowColor");

  return (
    <>
      {("text" in p || "glyph" in p || "rating" in p) && (
        <>
          <SectionBar title="Content" />
          {"text" in p && (
            <div className="space-y-1.5 px-4 py-2">
              <span className="text-sm" style={{ color: C.g700 }}>Text</span>
              <textarea value={strOf(p, "text")} onChange={(e) => set({ text: e.target.value })} rows={2} className="w-full resize-none rounded-md border px-2 py-1.5 text-sm outline-none" style={{ borderColor: C.g300, color: C.g700 }} />
              <p className="text-[10px] leading-tight" style={{ color: C.g500 }}>Text flows past the grid; press Enter for a new line.</p>
            </div>
          )}
          {"glyph" in p && !isIcon && <Row label="Symbol"><TextInput value={strOf(p, "glyph")} onChange={(v) => set({ glyph: v })} width={88} /></Row>}
          {"rating" in p && <Row label="Rating"><NumInput value={numOf(p, "rating", 4.5)} step={0.1} onChange={(v) => set({ rating: v })} /></Row>}
          {"count" in p && <Row label="Reviews"><NumInput value={numOf(p, "count", 0)} onChange={(v) => set({ count: v })} /></Row>}
        </>
      )}

      {isText && (
        <>
          <SectionBar title="Typography" />
          <Row label="Text Color"><ColorField value={strOf(p, "textColor", "#FFFFFF")} onChange={(v) => set({ textColor: v })} /></Row>
          <Divider />
          <SliderField label="Font Size" value={numOf(p, "fontSize", 12)} min={8} max={48} unit="PX" presets={[10, 12, 14, 16, 18, 20, 22, 24]} onChange={(v) => set({ fontSize: v })} />
          <Divider />
          <Row label="Font Weight">
            <SelectField value={numOf(p, "fontWeight", 700)} options={WEIGHT_OPTIONS.map((w) => ({ value: w.value, label: `${w.label} - ${w.value}` }))} onChange={(v) => set({ fontWeight: Number(v) })} width={150} />
          </Row>
          <div className="flex items-center justify-between px-4 py-2">
            <ToggleGroup items={[
              { key: "b", node: <span className="text-sm font-bold">B</span>, active: numOf(p, "fontWeight", 700) >= 700, onClick: () => set({ fontWeight: numOf(p, "fontWeight", 700) >= 700 ? 500 : 700 }) },
              { key: "i", node: <span className="text-sm italic">I</span>, active: !!p.italic, onClick: () => set({ italic: !p.italic }) },
              { key: "u", node: <span className="text-sm underline">U</span>, active: !!p.underline, onClick: () => set({ underline: !p.underline }) },
            ]} />
            <ToggleGroup items={(["left", "center", "right", "justify"] as const).map((a) => ({ key: a, node: <AlignIcon dir={a} />, active: strOf(p, "textAlign", "left") === a, onClick: () => set({ textAlign: a }) }))} />
          </div>
          <Divider />
          <SliderField label="Character Spacing" value={numOf(p, "letterSpacing", 0)} min={-2} max={12} step={0.5} unit="PX" presets={[0, 0.5, 1, 2, 4, 6, 8, 10]} onChange={(v) => set({ letterSpacing: v })} />
          <Divider />
          <SliderField label="Line Height" value={numOf(p, "lineHeight", 1.2)} min={0.8} max={3} step={0.05} unit="x" presets={[1, 1.25, 1.5, 2]} onChange={(v) => set({ lineHeight: v })} />
        </>
      )}

      {isIcon && (
        <>
          <SectionBar title="Icon" />
          <Row label="Symbol"><TextInput value={strOf(p, "glyph")} onChange={(v) => set({ glyph: v })} width={88} /></Row>
          <ImageUpload assets={assets} value={strOf(p, "image")} onChange={(v) => api.updateProps(el.id, { image: v })} />
          <Divider />
          <Row label="Shape">
            <ToggleGroup items={(["square", "rounded", "circle"] as const).map((s) => ({ key: s, node: <span className="px-1 text-[11px] capitalize">{s}</span>, active: strOf(p, "shape", "circle") === s, onClick: () => set({ shape: s }) }))} />
          </Row>
          <SliderField label="Icon Size" value={numOf(p, "w", 40)} min={16} max={120} unit="PX" presets={[24, 32, 40, 48, 64, 96]} onChange={(v) => set({ w: v, h: v })} />
          <Divider />
          <Row label="Icon Fill"><ColorField value={strOf(p, "color", "#FFFFFF")} onChange={(v) => set({ color: v })} /></Row>
          <SliderField label="Icon Border Width" value={numOf(p, "strokeWidth", 0)} min={0} max={10} step={0.5} unit="PX" presets={[0, 1, 2, 3, 8]} onChange={(v) => set({ strokeWidth: v })} headerRight={<ColorField value={strOf(p, "stroke", "#000000")} onChange={(v) => set({ stroke: v })} width={120} />} />
        </>
      )}

      {isStyleable && !isIcon && (
        <>
          <SectionBar title="Badge Properties" />
          <Row label="Background Fill"><ColorField value={strOf(p, "color", "#2563EB")} onChange={(v) => set({ color: v })} /></Row>
          <Divider />
          <SliderField label="Border Width" value={numOf(p, "strokeWidth", 0)} min={0} max={10} step={0.5} unit="PX" presets={[0, 1, 2, 3, 4, 8, 10]} onChange={(v) => set({ strokeWidth: v })} />
          <Row label="Border Fill"><ColorField value={strOf(p, "stroke", "#000000")} onChange={(v) => set({ stroke: v })} /></Row>
          <Divider />
          <Quad title="Corner radius" fields={CORNER_FIELDS} values={{ tl: numOf(p, "radiusTL", numOf(p, "radius", 6)), tr: numOf(p, "radiusTR", numOf(p, "radius", 6)), br: numOf(p, "radiusBR", numOf(p, "radius", 6)), bl: numOf(p, "radiusBL", numOf(p, "radius", 6)) }} min={0} max={48} unit="PX" onChange={(patch) => set(radiusPatch(patch))} />
          {"padding" in p && (
            <Quad title="Padding" fields={SIDE_FIELDS} values={{ top: numOf(p, "padT", numOf(p, "padding", 6)), right: numOf(p, "padR", numOf(p, "padding", 6)), bottom: numOf(p, "padB", numOf(p, "padding", 6)), left: numOf(p, "padL", numOf(p, "padding", 6)) }} min={0} max={24} unit="PX" onChange={(patch) => set(padPatch(patch))} />
          )}
        </>
      )}

      <SectionBar title="Shadow" />
      <Row label="Drop shadow"><Switch checked={shadowOn} onChange={(on) => set({ shadowColor: on ? "#10182833" : "" })} /></Row>
      {shadowOn && (
        <>
          <Row label="Shadow Color"><ColorField value={strOf(p, "shadowColor", "#101828")} onChange={(v) => set({ shadowColor: v })} /></Row>
          <SliderField label="Blur" value={numOf(p, "shadowBlur", 6)} min={0} max={60} unit="PX" presets={[0, 4, 8, 16, 24, 40]} onChange={(v) => set({ shadowBlur: v })} />
          <SliderField label="Spread" value={numOf(p, "shadowSpread", 0)} min={-10} max={30} unit="PX" presets={[0, 2, 4, 8, 16]} onChange={(v) => set({ shadowSpread: v })} />
          <SliderField label="Offset X" value={numOf(p, "shadowX", 0)} min={-30} max={30} unit="PX" presets={[-8, -4, 0, 4, 8]} onChange={(v) => set({ shadowX: v })} />
          <SliderField label="Offset Y" value={numOf(p, "shadowY", 4)} min={-30} max={30} unit="PX" presets={[-8, -4, 0, 4, 8]} onChange={(v) => set({ shadowY: v })} />
        </>
      )}

      {hasSideIcons && (
        <>
          <SectionBar title="Side Icons" />
          <SideIconRow api={api} assets={assets} el={el} side="left" />
          <SideIconRow api={api} assets={assets} el={el} side="right" />
        </>
      )}

      <SectionBar title="Placement" />
      {detached ? <DetachedPlacement api={api} el={el} /> : <AttachedPlacement api={api} el={el} zone={zone!} />}

      <div className="px-4 pt-3">
        <button onClick={() => api.removeElement(el.id)} className="w-full rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "#FDA4AF", color: "#E11D48" }}>Remove</button>
      </div>
    </>
  );
}

function AttachedPlacement({ api, el, zone }: { api: BuilderApi; el: OverlayElement; zone: ZoneId }) {
  const items = api.config.zones[zone];
  const index = items.findIndex((e) => e.id === el.id);
  return (
    <>
      <Row label="Zone">
        <SelectField value={zone} options={ALL_ZONES.map((z) => ({ value: z.id, label: z.label }))} onChange={(v) => api.moveElement(el.id, v as ZoneId, 999)} width={150} />
      </Row>
      <Row label="Order">
        <div className="flex items-center gap-2 text-sm" style={{ color: C.g700 }}>
          <button disabled={index <= 0} onClick={() => api.reorderWithinZone(zone, index, index - 1)} className="flex h-7 w-7 items-center justify-center rounded border disabled:opacity-40" style={{ borderColor: C.g300 }}>↑</button>
          <span>{index + 1}/{items.length}</span>
          <button disabled={index >= items.length - 1} onClick={() => api.reorderWithinZone(zone, index, index + 1)} className="flex h-7 w-7 items-center justify-center rounded border disabled:opacity-40" style={{ borderColor: C.g300 }}>↓</button>
        </div>
      </Row>
      <div className="px-4 pt-1">
        <button onClick={() => api.detachElement(el.id)} className="w-full rounded-lg border py-2 text-sm font-semibold" style={{ borderColor: C.g300, color: C.g700 }}>Detach (free move)</button>
      </div>
    </>
  );
}

function DetachedPlacement({ api, el }: { api: BuilderApi; el: OverlayElement }) {
  const pos = el.position ?? { xPct: 0, yPct: 0 };
  return (
    <>
      <Row label="X %"><NumInput value={Math.round(pos.xPct)} onChange={(v) => api.moveDetached(el.id, v, pos.yPct)} /></Row>
      <Row label="Y %"><NumInput value={Math.round(pos.yPct)} onChange={(v) => api.moveDetached(el.id, pos.xPct, v)} /></Row>
      <div className="px-4 pt-1">
        <button onClick={() => api.attachElement(el.id)} className="w-full rounded-lg border py-2 text-sm font-semibold" style={{ borderColor: C.g300, color: C.g700 }}>Reattach to layout</button>
      </div>
    </>
  );
}

function SideIconRow({ api, assets, el, side }: { api: BuilderApi; assets: AssetsApi; el: OverlayElement; side: "left" | "right" }) {
  const p = el.props;
  const onKey = side === "left" ? "leftIconOn" : "rightIconOn";
  const glyphKey = side === "left" ? "leftIcon" : "rightIcon";
  const imgKey = side === "left" ? "leftIconImage" : "rightIconImage";
  const on = !!p[onKey];
  return (
    <div className="space-y-2 px-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm capitalize" style={{ color: C.g700 }}>{side} icon</span>
        <Switch checked={on} onChange={(v) => api.updateProps(el.id, { [onKey]: v } as Bag)} />
      </div>
      {on && (
        <div className="space-y-2">
          <TextInput value={strOf(p, glyphKey)} placeholder="🔥 ★ %" onChange={(v) => api.updateProps(el.id, { [glyphKey]: v } as Bag)} />
          <ImageUpload assets={assets} value={strOf(p, imgKey)} onChange={(v) => api.updateProps(el.id, { [imgKey]: v } as Bag)} compact />
        </div>
      )}
    </div>
  );
}

function PlaceholderView({ api, el, def, detached, zone }: { api: BuilderApi; el: OverlayElement; def: NonNullable<ReturnType<typeof getDefinition>>; detached: boolean; zone?: ZoneId }) {
  return (
    <>
      <div className="px-4 py-3">
        <div className="flex flex-col items-center rounded-lg border border-dashed px-3 py-4 text-center" style={{ borderColor: C.g300 }}>
          <span className="text-2xl leading-none">{def.icon}</span>
          <p className="mt-2 text-sm font-semibold" style={{ color: C.g700 }}>{def.name}</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.g500 }}>Placeholder element — not editable. Only badges, labels and timers can be styled.</p>
        </div>
      </div>
      <SectionBar title="Placement" />
      {detached ? <DetachedPlacement api={api} el={el} /> : <AttachedPlacement api={api} el={el} zone={zone!} />}
      <div className="px-4 pt-3">
        <button onClick={() => api.removeElement(el.id)} className="w-full rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "#FDA4AF", color: "#E11D48" }}>Remove</button>
      </div>
    </>
  );
}

function CardView({ api }: { api: BuilderApi }) {
  const s = api.config.safePadding;
  const card = api.config.cardRadius;
  const cz = api.config.carousel;
  const setSlideImage = (i: number, url: string) => {
    const imgs = [...cz.images];
    while (imgs.length < cz.slides) imgs.push("");
    imgs[i] = url;
    api.setCarousel({ images: imgs });
  };
  return (
    <>
      <SectionBar title="Product Image" />
      <div className="space-y-1 px-4 py-2">
        <span className="text-sm" style={{ color: C.g700 }}>Image URL</span>
        <input value={api.config.productImage} onChange={(e) => api.setProductImage(e.target.value)} className="h-9 w-full rounded-md border px-2 text-sm outline-none" style={{ borderColor: C.g300, color: C.g700 }} />
      </div>
      <Row label="Image type">
        <div className="flex gap-1 rounded-md p-0.5" style={{ background: C.g100 }}>
          {(["single", "slider"] as const).map((t) => (
            <button key={t} onClick={() => api.setProductType(t)} className="rounded px-2.5 py-1 text-xs font-medium capitalize transition" style={api.config.productType === t ? { background: C.white, color: C.g900, boxShadow: "0 1px 2px rgba(16,24,40,.1)" } : { color: C.g500 }}>{t}</button>
          ))}
        </div>
      </Row>
      {api.config.productType === "slider" && (
        <>
          <Row label="Slides"><NumInput value={cz.slides} min={1} max={10} onChange={(v) => api.setCarousel({ slides: v, activeSlide: Math.min(cz.activeSlide, v) })} /></Row>
          {Array.from({ length: cz.slides }).map((_, i) => (
            <div key={i} className="space-y-1 px-4 py-1">
              <span className="text-sm" style={{ color: C.g700 }}>Slide {i + 1} image</span>
              <input value={cz.images[i] ?? ""} placeholder="Image URL…" onChange={(e) => setSlideImage(i, e.target.value)} className="h-9 w-full rounded-md border px-2 text-sm outline-none" style={{ borderColor: C.g300, color: C.g700 }} />
            </div>
          ))}
          <SliderField label="Arrow size" value={api.config.carousel.arrowW} min={20} max={64} unit="PX" onChange={(v) => api.setCarousel({ arrowW: v, arrowH: v })} />
          <SliderField label="Dot size" value={api.config.carousel.dotW} min={4} max={24} unit="PX" onChange={(v) => api.setCarousel({ dotW: v, dotH: v })} />
          <p className="px-4 pb-1 text-[10px] leading-tight" style={{ color: C.g500 }}>The ◀ ▶ arrows on the card switch slides.</p>
        </>
      )}
      <Quad title="Safe padding" fields={SIDE_FIELDS} values={s as unknown as Record<string, number>} min={0} max={80} unit="PX" onChange={(patch) => api.setSafePadding(patch)} />
      <SectionBar title="Card Corners" />
      <Quad title="Corner radius" fields={CORNER_FIELDS} values={card as unknown as Record<string, number>} min={0} max={48} unit="PX" onChange={(patch) => api.setCardRadius(patch)} />
      <StripBlock api={api} which="top" label="Top Badge" />
      <StripBlock api={api} which="bottom" label="Bottom Badge" />
      <p className="px-4 pt-4 text-xs leading-relaxed" style={{ color: C.g500 }}>Select an element on the card to edit its full properties here.</p>
    </>
  );
}

function StripBlock({ api, which, label }: { api: BuilderApi; which: "top" | "bottom"; label: string }) {
  const strip = api.config.strips[which];
  return (
    <>
      <SectionBar title={label} />
      <Row label="Attached"><Switch checked={strip.attached} onChange={(v) => api.setStrip(which, { attached: v })} /></Row>
      <Row label="Gap"><NumInput value={strip.gap} min={0} max={40} onChange={(v) => api.setStrip(which, { gap: v })} /></Row>
      <Row label="Padding"><NumInput value={strip.padding} min={0} max={20} onChange={(v) => api.setStrip(which, { padding: v })} /></Row>
      <Quad title="Corner radius" fields={CORNER_FIELDS} values={strip.radius as unknown as Record<string, number>} min={0} max={48} unit="PX" onChange={(patch) => api.setStrip(which, { radius: { ...strip.radius, ...patch } })} />
    </>
  );
}

function TextInput({ value, onChange, width, placeholder }: { value: string; onChange: (v: string) => void; width?: number; placeholder?: string }) {
  return <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-md border px-2 text-sm outline-none" style={{ borderColor: C.g300, color: C.g700, width: width ?? "60%" }} />;
}

function NumInput({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="h-9 w-[88px] rounded-md border px-2 text-sm outline-none" style={{ borderColor: C.g300, color: C.g700 }} />;
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="relative h-5 w-9 rounded-full transition" style={{ background: checked ? C.primary : C.g300 }}>
      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" style={{ left: checked ? 18 : 2 }} />
    </button>
  );
}

function ImageUpload({ assets, value, onChange, compact }: { assets: AssetsApi; value: string; onChange: (v: string) => void; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={compact ? "" : "px-4 py-2"}>
      <div className="flex items-center gap-2">
        {value && <img src={value} alt="" className="h-8 w-8 rounded object-contain ring-1 ring-slate-200" />}
        <button onClick={() => inputRef.current?.click()} className="flex-1 rounded-md border border-dashed px-2 py-1.5 text-xs font-medium" style={{ borderColor: C.primary, color: C.primary }}>
          {value ? "Replace image" : "Upload image"}
        </button>
        {value && <button onClick={() => onChange("")} className="text-[11px] text-red-500 hover:underline">remove</button>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) onChange(await readFileAsDataUrl(f)); e.target.value = ""; }} />
      {assets.assets.length > 0 && (
        <div className="mt-2 grid grid-cols-6 gap-1">
          {assets.assets.map((a) => (
            <button key={a.id} onClick={() => onChange(a.dataUrl)} title={a.name} className="flex h-7 items-center justify-center overflow-hidden rounded border" style={{ borderColor: C.g300 }}>
              <img src={a.dataUrl} alt={a.name} className="max-h-full max-w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TopIcon({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return <button onClick={onClick} title={title} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-50" style={{ color: C.g500 }}>{children}</button>;
}

const isw = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function AlignIcon({ dir }: { dir: "left" | "center" | "right" | "justify" }) {
  const lines: Record<string, [number, number][]> = {
    left: [[3, 4], [3, 14], [3, 4], [3, 10]],
    center: [[6, 4], [4, 14], [6, 4], [5, 10]],
    right: [[9, 4], [11, 14], [9, 4], [13, 10]],
    justify: [[3, 18], [3, 18], [3, 18], [3, 18]],
  };
  const rows = [6, 10, 14, 18];
  const map = lines[dir];
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...isw}>
      {rows.map((y, i) => <line key={y} x1={map[i][0]} y1={y} x2={map[i][0] + map[i][1]} y2={y} />)}
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...isw}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13" />
    </svg>
  );
}
