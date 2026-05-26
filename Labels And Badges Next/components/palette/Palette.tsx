"use client";

import { useState } from "react";
import { TABS, elementsForTab } from "@/lib/builder/catalog";
import type { BuilderApi } from "@/lib/builder/useBuilder";
import type { AssetsApi } from "@/lib/builder/useAssets";
import type { ElementTab } from "@/lib/builder/types";
import PaletteItem from "./PaletteItem";
import AssetsPanel from "./AssetsPanel";

interface Props { api: BuilderApi; assets: AssetsApi }

const DEFAULT_PADDING: Record<ElementTab, number> = { badges: 8, elements: 8, labels: 6, timers: 6, assets: 0 };

export default function Palette({ api, assets }: Props) {
  const [tab, setTab] = useState<ElementTab>("badges");
  const [paddingByTab, setPaddingByTab] = useState(DEFAULT_PADDING);
  const padding = paddingByTab[tab];
  const items = elementsForTab(tab);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 rounded-md px-1 py-1 text-center text-[10px] font-medium leading-tight transition ${tab === t.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "assets" ? (
        <AssetsPanel assets={assets} onAddImage={(src) => api.addElement("image", "top-left", { src })} />
      ) : (
        <>
          <label className="block text-xs text-slate-500">
            <span className="flex items-center justify-between">
              Padding <span className="font-mono text-slate-700">{padding}px</span>
            </span>
            <input type="range" min={0} max={20} value={padding} onChange={(e) => setPaddingByTab((prev) => ({ ...prev, [tab]: Number(e.target.value) }))} className="mt-1 w-full accent-indigo-500" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            {items.map((def) => (
              <PaletteItem key={def.kind} def={def} padding={padding} onAdd={(kind, pad) => api.tryAddElement(kind, "top-left", { padding: pad })} />
            ))}
          </div>
          <p className="text-[10px] leading-tight text-slate-400">
            Drag an example onto the product to auto-place it in the nearest block, or click to add it.
          </p>
        </>
      )}
    </div>
  );
}
