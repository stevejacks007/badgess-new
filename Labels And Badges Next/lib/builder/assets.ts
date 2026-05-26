import type { Asset } from "./types";

const ASSETS_KEY = "overlay-builder.assets.v1";

export function loadAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(ASSETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Asset[]) : [];
  } catch {
    return [];
  }
}

export function persistAssets(assets: Asset[]): void {
  try {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
