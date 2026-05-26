import type { ElementDefinition, ElementTab } from "./types";

const NIKE_LOGO =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.444-1.155-.382-1.95.064-.795.444-1.66 1.144-2.596.317-.443.92-1.07 1.81-1.886-.444 1.184-.444 2.07-.064 2.677.317.527.95.79 1.9.79.444 0 .94-.058 1.49-.174L24 7.8z"/></svg>'
  );

export const ELEMENT_CATALOG: ElementDefinition[] = [
  {
    kind: "badge",
    name: "Square Badge",
    tab: "badges",
    category: "labels",
    icon: "🏷️",
    presentation: "badge",
    defaultProps: { text: "NEW", color: "#2563eb", padding: 6 },
  },
  {
    kind: "round-badge",
    name: "Round Badge",
    tab: "badges",
    category: "labels",
    icon: "⬤",
    presentation: "round",
    defaultProps: { text: "%", color: "#dc2626", padding: 10 },
  },
  {
    kind: "tag-badge",
    name: "Tag Badge",
    tab: "badges",
    category: "labels",
    icon: "🎫",
    presentation: "tag",
    defaultProps: { text: "SALE", color: "#7c3aed", padding: 6 },
  },
  {
    kind: "badge-hot",
    name: "Hot",
    tab: "badges",
    category: "labels",
    icon: "🔥",
    presentation: "pill",
    defaultProps: { text: "HOT", color: "#ef4444", padding: 6, leftIconOn: true, leftIcon: "🔥" },
  },
  {
    kind: "badge-bestseller",
    name: "Bestseller",
    tab: "badges",
    category: "labels",
    icon: "🏆",
    presentation: "badge",
    defaultProps: { text: "BESTSELLER", color: "#f59e0b", padding: 6 },
  },
  {
    kind: "badge-trending",
    name: "Trending",
    tab: "badges",
    category: "labels",
    icon: "📈",
    presentation: "pill",
    defaultProps: { text: "TRENDING", color: "#7c3aed", padding: 6, leftIconOn: true, leftIcon: "📈" },
  },
  {
    kind: "badge-top-rated",
    name: "Top Rated",
    tab: "badges",
    category: "labels",
    icon: "★",
    presentation: "pill",
    defaultProps: { text: "TOP RATED", color: "#16a34a", padding: 6, leftIconOn: true, leftIcon: "★" },
  },
  {
    kind: "badge-limited",
    name: "Limited",
    tab: "badges",
    category: "labels",
    icon: "⏳",
    presentation: "tag",
    defaultProps: { text: "LIMITED", color: "#0f172a", padding: 6 },
  },
  {
    kind: "badge-exclusive",
    name: "Exclusive",
    tab: "badges",
    category: "labels",
    icon: "💎",
    presentation: "badge",
    defaultProps: { text: "EXCLUSIVE", color: "#1e293b", padding: 6, leftIconOn: true, leftIcon: "💎" },
  },
  {
    kind: "badge-new-arrival",
    name: "New Arrival",
    tab: "badges",
    category: "labels",
    icon: "✨",
    presentation: "badge",
    defaultProps: { text: "NEW ARRIVAL", color: "#0d9488", padding: 6 },
  },
  {
    kind: "badge-sold-out",
    name: "Sold Out",
    tab: "badges",
    category: "labels",
    icon: "🚫",
    presentation: "badge",
    defaultProps: { text: "SOLD OUT", color: "#6b7280", padding: 6 },
  },
  {
    kind: "badge-premium",
    name: "Premium",
    tab: "badges",
    category: "labels",
    icon: "👑",
    presentation: "pill",
    defaultProps: { text: "PREMIUM", color: "#b45309", padding: 6, leftIconOn: true, leftIcon: "👑" },
  },
  {
    kind: "brand-logo",
    name: "Brand Logo",
    tab: "elements",
    category: "media",
    icon: "🅱️",
    presentation: "icon",
    defaultProps: { image: NIKE_LOGO, color: "#000000", shape: "circle", w: 40, h: 40, padding: 9 },
  },
  {
    kind: "reviews",
    name: "Reviews",
    tab: "elements",
    category: "info",
    icon: "⭐",
    presentation: "stars",
    defaultProps: { rating: 4.5, count: 128, padding: 5, radius: 4 },
  },
  {
    kind: "wishlist-icon",
    name: "Wishlist",
    tab: "elements",
    category: "actions",
    icon: "♡",
    presentation: "icon",
    defaultProps: { glyph: "♡", padding: 8, w: 40, h: 40 },
  },
  {
    kind: "save-icon",
    name: "Save",
    tab: "elements",
    category: "actions",
    icon: "🔖",
    presentation: "icon",
    defaultProps: { glyph: "🔖", padding: 8, w: 40, h: 40 },
  },
  {
    kind: "compare-icon",
    name: "Compare",
    tab: "elements",
    category: "actions",
    icon: "⇄",
    presentation: "icon",
    defaultProps: { glyph: "⇄", padding: 8, w: 40, h: 40 },
  },
  {
    kind: "share-icon",
    name: "Share",
    tab: "elements",
    category: "actions",
    icon: "↗",
    presentation: "icon",
    defaultProps: { glyph: "↗", padding: 8, w: 40, h: 40 },
  },
  {
    kind: "template-icon",
    name: "Template",
    tab: "elements",
    category: "actions",
    icon: "▦",
    presentation: "icon",
    defaultProps: { glyph: "▦", padding: 8, w: 40, h: 40 },
  },
  {
    kind: "discount-label",
    name: "Discount Label",
    tab: "badges",
    category: "labels",
    icon: "％",
    presentation: "pill",
    defaultProps: { text: "-30%", color: "#dc2626", padding: 6 },
  },
  {
    kind: "cashback-label",
    name: "Cashback Label",
    tab: "badges",
    category: "labels",
    icon: "💸",
    presentation: "pill",
    defaultProps: { text: "5% Cashback", color: "#16a34a", padding: 6 },
  },
  {
    kind: "label-flat-off",
    name: "Flat Off",
    tab: "badges",
    category: "labels",
    icon: "🏷️",
    presentation: "pill",
    defaultProps: { text: "$10 OFF", color: "#dc2626", padding: 6 },
  },
  {
    kind: "label-bogo",
    name: "Buy 1 Get 1",
    tab: "badges",
    category: "labels",
    icon: "🎁",
    presentation: "tag",
    defaultProps: { text: "BUY 1 GET 1", color: "#4f46e5", padding: 6 },
  },
  {
    kind: "label-free-shipping",
    name: "Free Shipping",
    tab: "badges",
    category: "labels",
    icon: "🚚",
    presentation: "pill",
    defaultProps: { text: "FREE SHIPPING", color: "#0d9488", padding: 6, leftIconOn: true, leftIcon: "🚚" },
  },
  {
    kind: "label-clearance",
    name: "Clearance",
    tab: "badges",
    category: "labels",
    icon: "🔖",
    presentation: "badge",
    defaultProps: { text: "CLEARANCE", color: "#ea580c", padding: 6 },
  },
  {
    kind: "label-lowest-price",
    name: "Lowest Price",
    tab: "badges",
    category: "labels",
    icon: "📉",
    presentation: "pill",
    defaultProps: { text: "LOWEST PRICE", color: "#2563eb", padding: 6 },
  },
  {
    kind: "label-save-percent",
    name: "Save %",
    tab: "badges",
    category: "labels",
    icon: "％",
    presentation: "tag",
    defaultProps: { text: "SAVE 50%", color: "#e11d48", padding: 6 },
  },
  {
    kind: "countdown-timer",
    name: "Countdown Timer",
    tab: "badges",
    category: "info",
    icon: "⏱️",
    presentation: "timer",
    defaultProps: { text: "02:45:10", padding: 6 },
  },
  {
    kind: "stock-counter",
    name: "Stock Counter",
    tab: "badges",
    category: "info",
    icon: "📦",
    presentation: "counter",
    defaultProps: { text: "Only 3 left", count: 3, padding: 6 },
  },
  {
    kind: "flash-sale-timer",
    name: "Flash Sale",
    tab: "badges",
    category: "info",
    icon: "⚡",
    presentation: "timer",
    defaultProps: { text: "01:59:59", color: "#db2777", padding: 6, leftIconOn: true, leftIcon: "⚡" },
  },
  {
    kind: "deal-ends-timer",
    name: "Deal Ends In",
    tab: "badges",
    category: "info",
    icon: "⏰",
    presentation: "timer",
    defaultProps: { text: "Ends in 02:00:00", color: "#b91c1c", padding: 6, leftIconOn: true, leftIcon: "⏰" },
  },
  {
    kind: "only-left-counter",
    name: "Only X Left",
    tab: "badges",
    category: "info",
    icon: "🔥",
    presentation: "counter",
    defaultProps: { text: "Only 2 left!", count: 2, padding: 6, leftIconOn: true, leftIcon: "🔥" },
  },
  {
    kind: "ends-today-label",
    name: "Ends Today",
    tab: "badges",
    category: "info",
    icon: "📅",
    presentation: "pill",
    defaultProps: { text: "ENDS TODAY", color: "#9333ea", padding: 6 },
  },
  {
    kind: "image",
    name: "Image",
    tab: "assets",
    category: "media",
    icon: "🖼️",
    presentation: "image",
    defaultProps: { src: "", h: 48 },
  },
];

const CATALOG_BY_KIND: Record<string, ElementDefinition> = Object.fromEntries(
  ELEMENT_CATALOG.map((def) => [def.kind, def])
);

export function getDefinition(kind: string): ElementDefinition | undefined {
  return CATALOG_BY_KIND[kind];
}

export const TABS: { id: ElementTab; label: string }[] = [
  { id: "badges", label: "Badges" },
  { id: "assets", label: "My Badges" },
  { id: "elements", label: "Mock Elements" },
];

export const RESTRICTED_TABS: ElementTab[] = ["badges", "labels", "timers"];

export function isRestrictedKind(kind: string): boolean {
  const def = getDefinition(kind);
  return def ? RESTRICTED_TABS.includes(def.tab) : false;
}

export function isMockKind(kind: string): boolean {
  return getDefinition(kind)?.tab === "elements";
}

export function elementsForTab(tab: ElementTab): ElementDefinition[] {
  return ELEMENT_CATALOG.filter((d) => d.tab === tab);
}
