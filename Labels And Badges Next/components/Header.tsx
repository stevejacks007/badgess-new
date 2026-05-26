"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  dirty: boolean;
  zoom: number;
  preview: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomSet: (scale: number) => void;
  onZoomReset: () => void;
  onTogglePreview: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

const FONT = "Lato, ui-sans-serif, system-ui, -apple-system, sans-serif";

const C = {
  gray900: "#101828",
  gray700: "#344054",
  gray500: "#667085",
  gray300: "#D0D5DD",
  primary400: "#243DC6",
  primary50: "#E2E5FA",
  primary700: "#111C5B",
};

export default function Header({
  title, dirty, zoom, preview,
  onZoomIn, onZoomOut, onZoomSet, onZoomReset,
  onTogglePreview, onDiscard, onSave,
}: Props) {
  return (
    <header
      className="flex h-[52px] shrink-0 items-center justify-between border-b bg-white pl-4 pr-2"
      style={{ fontFamily: FONT, borderColor: C.gray300 }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px]"
          style={{ background: C.primary400 }}
        >
          <span className="h-1.5 w-1.5 rounded-[1px] bg-white" />
        </span>
        <span className="text-sm font-semibold leading-5" style={{ color: C.gray900 }}>
          {title}
        </span>
      </div>

      <div className="flex items-center">
        <div className="flex items-center gap-1">
          <IconBtn title="Undo"><Undo /></IconBtn>
          <IconBtn title="Redo"><Redo /></IconBtn>
        </div>
        <Divider />
        <ZoomControl zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onZoomSet={onZoomSet} onZoomReset={onZoomReset} />
        <Divider />
        <IconToggle active={preview} onClick={onTogglePreview} title="Preview">
          <Play />
        </IconToggle>
        <button
          onClick={onDiscard}
          disabled={!dirty}
          className="ml-4 h-9 rounded-lg border bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
          style={{ borderColor: C.gray300, color: C.gray700 }}
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={!dirty}
          className="ml-3 h-9 rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-40"
          style={{ background: C.primary700 }}
        >
          Save Badge
        </button>
      </div>
    </header>
  );
}

function Divider() {
  return <span className="mx-3 h-[22px] w-px" style={{ background: C.gray300 }} />;
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-50"
      style={{ color: C.gray500 }}
    >
      {children}
    </button>
  );
}

function IconToggle({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${active ? "" : "hover:bg-slate-50"}`}
      style={active ? { background: C.primary50, color: C.primary400 } : { color: C.gray500 }}
    >
      {children}
    </button>
  );
}

const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function ZoomControl({ zoom, onZoomIn, onZoomOut, onZoomSet, onZoomReset }: { zoom: number; onZoomIn: () => void; onZoomOut: () => void; onZoomSet: (scale: number) => void; onZoomReset: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-[92px] items-center justify-center gap-1 rounded-lg border bg-white text-sm font-medium shadow-sm hover:bg-slate-50"
        style={{ borderColor: C.gray300, color: C.gray700 }}
      >
        {Math.round(zoom * 100)}%
        <Chevron />
      </button>
      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-36 overflow-hidden rounded-lg border bg-white py-1 shadow-lg"
          style={{ borderColor: C.gray300, fontFamily: FONT }}
        >
          <div className="flex items-center justify-between px-2 pb-1">
            <button onClick={onZoomOut} className="flex h-6 w-6 items-center justify-center rounded text-base hover:bg-slate-50" style={{ color: C.gray700 }}>−</button>
            <span className="text-xs font-medium" style={{ color: C.gray500 }}>{Math.round(zoom * 100)}%</span>
            <button onClick={onZoomIn} className="flex h-6 w-6 items-center justify-center rounded text-base hover:bg-slate-50" style={{ color: C.gray700 }}>+</button>
          </div>
          <div className="my-1 h-px" style={{ background: C.gray300 }} />
          {ZOOM_PRESETS.map((z) => (
            <button
              key={z}
              onClick={() => { onZoomSet(z); setOpen(false); }}
              className="flex w-full items-center justify-between px-3 py-1.5 text-sm hover:bg-slate-50"
              style={{ color: C.gray700 }}
            >
              {z * 100}%
              {Math.round(zoom * 100) === z * 100 && <Check />}
            </button>
          ))}
          <div className="my-1 h-px" style={{ background: C.gray300 }} />
          <button
            onClick={() => { onZoomReset(); setOpen(false); }}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50"
            style={{ color: C.gray700 }}
          >
            Reset (100%)
          </button>
        </div>
      )}
    </div>
  );
}

const sw = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Undo() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...sw}><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-1" /></svg>;
}
function Redo() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...sw}><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h1" /></svg>;
}
function Chevron() {
  return <svg width="14" height="14" viewBox="0 0 24 24" {...sw}><path d="m6 9 6 6 6-6" /></svg>;
}
function Check() {
  return <svg width="14" height="14" viewBox="0 0 24 24" {...sw} stroke={C.primary400}><path d="m5 12 5 5L20 7" /></svg>;
}
function Play() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
}
