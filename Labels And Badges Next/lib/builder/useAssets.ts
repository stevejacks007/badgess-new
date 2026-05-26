"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadAssets, persistAssets, readFileAsDataUrl } from "./assets";
import { makeId } from "./factory";
import type { Asset } from "./types";

export interface AssetsApi {
  assets: Asset[];
  addFiles: (files: FileList | File[]) => Promise<Asset[]>;
  addDataUrl: (name: string, dataUrl: string) => Asset;
  removeAsset: (id: string) => void;
}

export function useAssets(): AssetsApi {
  const [assets, setAssets] = useState<Asset[]>(() => loadAssets());

  useEffect(() => {
    persistAssets(assets);
  }, [assets]);

  const addDataUrl = useCallback((name: string, dataUrl: string): Asset => {
    const asset: Asset = { id: makeId("asset"), name, dataUrl };
    setAssets((prev) => [asset, ...prev]);
    return asset;
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]): Promise<Asset[]> => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const created: Asset[] = [];
    for (const file of list) {
      const dataUrl = await readFileAsDataUrl(file);
      created.push({ id: makeId("asset"), name: file.name, dataUrl });
    }
    if (created.length) setAssets((prev) => [...created, ...prev]);
    return created;
  }, []);

  const removeAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return useMemo(
    () => ({ assets, addFiles, addDataUrl, removeAsset }),
    [assets, addFiles, addDataUrl, removeAsset]
  );
}
