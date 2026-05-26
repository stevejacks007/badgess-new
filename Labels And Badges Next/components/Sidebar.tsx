"use client";

import type { BuilderApi } from "@/lib/builder/useBuilder";
import type { AssetsApi } from "@/lib/builder/useAssets";
import Section from "./Section";
import Palette from "./palette/Palette";
import LayersPanel from "./panels/LayersPanel";

interface Props {
  api: BuilderApi;
  assets: AssetsApi;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Sidebar({ api, assets, selectedId, onSelect }: Props) {
  return (
    <aside className="flex h-full w-80 flex-col overflow-y-auto border-r border-slate-200 bg-white">
      <Section title="Library">
        <Palette api={api} assets={assets} />
      </Section>
      <Section title="Layers">
        <LayersPanel api={api} selectedId={selectedId} onSelect={onSelect} />
      </Section>
    </aside>
  );
}
