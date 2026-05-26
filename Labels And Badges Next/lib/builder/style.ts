import type { CornerRadius } from "./types";

export function radiusStyle(r: CornerRadius): string {
  return `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;
}
