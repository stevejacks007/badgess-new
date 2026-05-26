"use client";

import { getDefinition } from "@/lib/builder/catalog";
import { ALL_ZONES } from "@/lib/builder/zones";
import type { BuilderApi } from "@/lib/builder/useBuilder";
import type { OverlayElement } from "@/lib/builder/types";

interface Props { api: BuilderApi; selectedId: string | null; onSelect: (id: string) => void }

export default function LayersPanel({ api, selectedId, onSelect }: Props) {
  const { config } = api;
  const attached = Object.values(config.zones).reduce((n, z) => n + z.length, 0);
  const total = attached + config.detached.length;

  if (total === 0) {
    return <p className="text-xs text-slate-400">No elements yet. Add some from the library.</p>;
  }

  const row = (el: OverlayElement, detached: boolean) => {
    const def = getDefinition(el.kind);
    const fullCard = def?.layout === "fullCard";
    return (
      <li key={el.id} onClick={() => onSelect(el.id)} className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${selectedId === el.id ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white"} ${el.enabled ? "" : "opacity-50"} cursor-pointer`}>
        <span>{def?.icon}</span>
        <span className="flex-1 truncate">{def?.name ?? el.kind}</span>
        <IconBtn title="Toggle" onClick={() => api.toggleElement(el.id)}>{el.enabled ? "👁" : "🚫"}</IconBtn>
        {!fullCard && (detached
          ? <IconBtn title="Reattach" onClick={() => api.attachElement(el.id)}>⊡</IconBtn>
          : <IconBtn title="Detach" onClick={() => api.detachElement(el.id)}>⤢</IconBtn>
        )}
        <IconBtn title="Remove" onClick={() => api.removeElement(el.id)}>✕</IconBtn>
      </li>
    );
  };

  return (
    <div className="space-y-3">
      {ALL_ZONES.map((zone) => {
        const items = config.zones[zone.id];
        if (items.length === 0) return null;
        return (
          <div key={zone.id}>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{zone.label}</p>
            <ul className="space-y-1">{items.map((el) => row(el, false))}</ul>
          </div>
        );
      })}
      {config.detached.length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">Detached (free)</p>
          <ul className="space-y-1">{config.detached.map((el) => row(el, true))}</ul>
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button title={title} onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-slate-500 hover:bg-slate-100">
      {children}
    </button>
  );
}
