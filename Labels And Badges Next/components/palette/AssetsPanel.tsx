"use client";

import { useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { AssetsApi } from "@/lib/builder/useAssets";
import type { Asset } from "@/lib/builder/types";

interface Props { assets: AssetsApi; onAddImage: (src: string) => void }

export default function AssetsPanel({ assets, onAddImage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <button onClick={() => inputRef.current?.click()} className="w-full rounded-md border border-dashed border-indigo-300 bg-indigo-50/50 px-2 py-3 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
        + Upload image
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) assets.addFiles(e.target.files); e.target.value = ""; }} />

      {assets.assets.length === 0 ? (
        <p className="text-[11px] leading-tight text-slate-400">No assets yet. Upload images to reuse them as logos, icons, or overlays.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {assets.assets.map((asset) => (
            <AssetItem key={asset.id} asset={asset} onAdd={() => onAddImage(asset.dataUrl)} onRemove={() => assets.removeAsset(asset.id)} />
          ))}
        </div>
      )}

      <p className="text-[10px] leading-tight text-slate-400">Drag a thumbnail onto the product, or click to add it.</p>
    </div>
  );
}

function AssetItem({ asset, onAdd, onRemove }: { asset: Asset; onAdd: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:image:${asset.id}`,
    data: { source: "palette", kind: "image", overrides: { src: asset.dataUrl } },
  });

  return (
    <div className={`group relative rounded-md border border-slate-200 bg-white p-1 ${isDragging ? "opacity-40" : ""}`}>
      <div ref={setNodeRef} {...attributes} {...listeners} onClick={onAdd} title={asset.name} className="flex h-14 cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing">
        <img src={asset.dataUrl} alt={asset.name} className="max-h-full max-w-full object-contain" draggable={false} />
      </div>
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove asset" className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white opacity-0 shadow group-hover:opacity-100">✕</button>
    </div>
  );
}
