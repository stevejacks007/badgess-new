import type { CSSProperties } from "react";
import type { ElementProps, Presentation } from "./types";

export const FONT_OPTIONS = [
  { id: "system", label: "System", stack: "ui-sans-serif, system-ui, -apple-system, sans-serif" },
  { id: "serif", label: "Serif", stack: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Mono", stack: "ui-monospace, 'SFMono-Regular', monospace" },
  { id: "rounded", label: "Rounded", stack: "'Trebuchet MS', 'Segoe UI', sans-serif" },
  { id: "condensed", label: "Condensed", stack: "'Arial Narrow', 'Helvetica Neue', sans-serif" },
];

const FONT_MAP: Record<string, string> = Object.fromEntries(
  FONT_OPTIONS.map((f) => [f.id, f.stack])
);

export const WEIGHT_OPTIONS = [
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semibold" },
  { value: 700, label: "Bold" },
  { value: 800, label: "Extrabold" },
];

export const TEXT_PRESENTATIONS: Presentation[] = [
  "badge",
  "round",
  "tag",
  "pill",
  "logo",
  "timer",
  "counter",
];

const has = (v: unknown) => v !== undefined && v !== null && v !== "";

export function textStyleFromProps(p: ElementProps): CSSProperties {
  const st: CSSProperties = {};
  if (has(p.fontSize)) st.fontSize = Number(p.fontSize);
  if (has(p.fontWeight)) st.fontWeight = Number(p.fontWeight);
  if (typeof p.fontFamily === "string" && p.fontFamily)
    st.fontFamily = FONT_MAP[p.fontFamily] ?? p.fontFamily;
  if (has(p.lineHeight)) st.lineHeight = Number(p.lineHeight);
  if (has(p.letterSpacing)) st.letterSpacing = Number(p.letterSpacing);
  if (typeof p.textAlign === "string" && p.textAlign)
    st.textAlign = p.textAlign as CSSProperties["textAlign"];
  if (typeof p.textColor === "string" && p.textColor) st.color = p.textColor;
  if (p.italic) st.fontStyle = "italic";
  if (p.underline) st.textDecoration = "underline";
  return st;
}
