export type ZoneId =
  | "top-left"
  | "top-right"
  | "middle"
  | "bottom-left"
  | "bottom-right"
  | "top-strip"
  | "bottom-strip";

export type Align = "start" | "center" | "end";

export type Presentation =
  | "badge"
  | "round"
  | "tag"
  | "pill"
  | "icon"
  | "stars"
  | "timer"
  | "arrows"
  | "carousel"
  | "counter"
  | "logo"
  | "image";

export type ElementTab = "badges" | "elements" | "labels" | "timers" | "assets";

export interface Asset {
  id: string;
  name: string;
  dataUrl: string;
}

export type ElementCategory = "labels" | "actions" | "info" | "media";

export type ElementProps = Record<string, string | number | boolean>;

export interface ElementDefinition {
  kind: string;
  name: string;
  tab: ElementTab;
  category: ElementCategory;
  icon: string;
  presentation: Presentation;
  layout?: "chip" | "fullCard";
  defaultProps: ElementProps;
}

export interface FreePosition {
  xPct: number;
  yPct: number;
}

export interface OverlayElement {
  id: string;
  kind: string;
  enabled: boolean;
  props: ElementProps;
  position?: FreePosition;
  homeZone?: ZoneId;
}

export interface ZoneDefinition {
  id: ZoneId;
  label: string;
  area: string;
  halign: Align;
  valign: Align;
}

export interface CardSize {
  width: number;
  height: number;
}

export interface SafePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CornerRadius {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

export interface StripConfig {
  attached: boolean;
  gap: number;
  padding: number;
  radius: CornerRadius;
}

export interface CarouselConfig {
  slides: number;
  activeSlide: number;
  images: string[];
  arrowW: number;
  arrowH: number;
  dotW: number;
  dotH: number;
}

export interface BuilderConfig {
  version: number;
  productImage: string;
  productType: "single" | "slider";
  card: CardSize;
  cardRadius: CornerRadius;
  safePadding: SafePadding;
  carousel: CarouselConfig;
  strips: { top: StripConfig; bottom: StripConfig };
  zones: Record<ZoneId, OverlayElement[]>;
  detached: OverlayElement[];
}
