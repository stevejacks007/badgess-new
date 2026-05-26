"use client";

import { useState, type ReactNode } from "react";

export const C = {
  white: "#FFFFFF",
  g900: "#101828",
  g700: "#344054",
  g600: "#475467",
  g500: "#667085",
  g300: "#D0D5DD",
  g200: "#EAECF0",
  g100: "#F2F4F7",
  primary: "#243DC6",
  primary50: "#E2E5FA",
};

export const PANEL_FONT = "Lato, ui-sans-serif, system-ui, -apple-system, sans-serif";

export function SectionBar({ title }: { title: string }) {
  return (
    <div className="flex h-9 items-center px-3 text-xs font-semibold" style={{ background: C.g100, color: C.g600 }}>
      {title}
    </div>
  );
}

export function Divider() {
  return <div className="mx-4 h-px" style={{ background: C.g200 }} />;
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[36px] items-center justify-between gap-2 px-4 py-1.5">
      <span className="text-sm" style={{ color: C.g700 }}>{label}</span>
      {children}
    </div>
  );
}

export function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g500} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ColorField({ value, onChange, width = 146 }: { value: string; onChange: (hex: string) => void; width?: number }) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
  return (
    <div className="flex h-9 items-center gap-1 rounded-md border px-2" style={{ borderColor: C.g300, width }}>
      <span className="text-sm" style={{ color: C.g500 }}>#</span>
      <input value={value.replace("#", "").toUpperCase()} maxLength={6} onChange={(e) => onChange("#" + e.target.value.replace(/[^0-9a-fA-F]/g, ""))} className="w-full bg-transparent text-sm uppercase outline-none" style={{ color: C.g700 }} />
      <label className="relative h-5 w-5 shrink-0 cursor-pointer rounded-full" style={{ background: safe, boxShadow: `0 0 0 1px ${C.g300}` }}>
        <input type="color" value={safe} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
      <Chevron />
    </div>
  );
}

function ValueBox({ value, unit, min, max, step, onChange }: { value: number; unit: string; min?: number; max?: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex h-9 w-[88px] items-center rounded-md border px-2" style={{ borderColor: C.g300 }}>
      <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-transparent text-sm outline-none" style={{ color: C.g700 }} />
      <span className="ml-1 shrink-0 text-xs" style={{ color: C.g500 }}>{unit}</span>
    </div>
  );
}

export function Presets({ values, value, onChange, format }: { values: number[]; value: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => {
        const active = Math.abs(value - v) < 1e-6;
        return (
          <button key={v} onClick={() => onChange(v)} className="flex h-6 min-w-[24px] items-center justify-center rounded px-1.5 text-xs font-medium transition" style={active ? { background: C.primary, color: C.white } : { color: C.g500 }}>
            {format ? format(v) : v}
          </button>
        );
      })}
    </div>
  );
}

export function SliderField({ label, value, min, max, step = 1, unit, presets, format, onChange, headerRight }: { label: string; value: number; min: number; max: number; step?: number; unit: string; presets?: number[]; format?: (v: number) => string; onChange: (v: number) => void; headerRight?: ReactNode }) {
  return (
    <div className="space-y-2.5 px-4 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: C.g700 }}>{label}</span>
        {headerRight}
      </div>
      <div className="flex items-center gap-3">
        <input type="range" className="sc-range flex-1" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ accentColor: C.primary }} />
        <ValueBox value={value} unit={unit} min={min} max={max} step={step} onChange={onChange} />
      </div>
      {presets && <Presets values={presets} value={value} onChange={onChange} format={format} />}
    </div>
  );
}

export function SelectField({ value, options, onChange, width }: { value: string | number; options: { value: string | number; label: string }[]; onChange: (v: string) => void; width?: number }) {
  return (
    <div className="relative" style={{ width }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full appearance-none rounded-md border bg-white pl-3 pr-7 text-sm outline-none" style={{ borderColor: C.g300, color: C.g700 }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"><Chevron /></span>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

export function Quad({ title, fields, values, min, max, unit, onChange }: { title: string; fields: { key: string; label: string }[]; values: Record<string, number>; min: number; max: number; unit: string; onChange: (patch: Record<string, number>) => void }) {
  const [linked, setLinked] = useState(true);
  const common = values[fields[0].key] ?? 0;
  const setAll = (v: number) => onChange(Object.fromEntries(fields.map((f) => [f.key, v])));

  return (
    <div className="space-y-2.5 px-4 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: C.g700 }}>{title}</span>
        <button onClick={() => setLinked((l) => !l)} title={linked ? "Set each side individually" : "Link all sides"} className="flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-medium transition" style={linked ? { background: C.primary50, color: C.primary } : { color: C.g500 }}>
          <LinkIcon />{linked ? "Linked" : "Per-side"}
        </button>
      </div>
      {linked ? (
        <div className="flex items-center gap-3">
          <input type="range" className="sc-range flex-1" min={min} max={max} value={common} onChange={(e) => setAll(Number(e.target.value))} style={{ accentColor: C.primary }} />
          <ValueBox value={common} unit={unit} min={min} max={max} onChange={setAll} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-1.5">
              <span className="w-5 shrink-0 text-[10px]" style={{ color: C.g500 }}>{f.label}</span>
              <input type="range" className="sc-range min-w-0 flex-1" min={min} max={max} value={values[f.key] ?? 0} onChange={(e) => onChange({ [f.key]: Number(e.target.value) })} style={{ accentColor: C.primary }} />
              <span className="w-6 shrink-0 text-right text-xs" style={{ color: C.g700 }}>{values[f.key] ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ToggleGroup({ items }: { items: { key: string; node: ReactNode; active: boolean; onClick: () => void; title?: string }[] }) {
  return (
    <div className="flex gap-1.5">
      {items.map((it) => (
        <button key={it.key} title={it.title} onClick={it.onClick} className="flex h-6 w-6 items-center justify-center rounded transition" style={it.active ? { background: C.primary, color: C.white } : { color: C.g500 }}>
          {it.node}
        </button>
      ))}
    </div>
  );
}
