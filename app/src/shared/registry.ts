// Real-scale proxy registry. All sizes in meters. Every proxy has a
// bottom-center pivot, so it sits on the tabletop at elevation 0.

import plateSpec from "../../rules/tableware-photo-spec.json";
import type { MassClass, NapkinSize, SkuInfo, Surface, Vessel } from "./types";

/** Plate diameters from the photography plate spec (rules/tableware-photo-spec.json). */
const plateRadius = (id: keyof typeof plateSpec.plates) => plateSpec.plates[id].use_cm / 200;
/** Lip height 1.5-2 cm (flat profile). */
const PLATE_HEIGHT = 0.02;

export type ShapeKind = "cylinder" | "box" | "lathe-bottle" | "lathe-can" | "lathe-bell-glass" | "lathe-condiment" | "napkin" | "seated-person";

export interface ProxyDef {
  kind: ShapeKind;
  /** Footprint: radius for round things, width/depth for boxes. */
  radius?: number;
  width?: number;
  depth?: number;
  height: number;
  /** Tall items may rise into the upper half of the frame. */
  tall?: boolean;
}

export const VESSELS: Record<Vessel, ProxyDef> = {
  plate: { kind: "cylinder", radius: plateRadius("plate"), height: PLATE_HEIGHT }, // entree 27-29 cm (photo spec)
  "lunch-plate": { kind: "cylinder", radius: plateRadius("lunch-plate"), height: PLATE_HEIGHT }, // smaller mains 22-24 cm
  "side-plate": { kind: "cylinder", radius: plateRadius("side-plate"), height: PLATE_HEIGHT }, // sides, desserts, bread 18-20 cm
  bowl: { kind: "cylinder", radius: 0.08, height: 0.06 }, // side bowl, medium 15-18 cm
  "small-bowl": { kind: "cylinder", radius: 0.0675, height: 0.05 }, // side bowl, small 12-15 cm
  "large-bowl": { kind: "cylinder", radius: 0.16, height: 0.09 }, // communal bowl 30-35 cm
  ramekin: { kind: "cylinder", radius: 0.035, height: 0.035 }, // 6-8 cm
  board: { kind: "box", width: 0.2, depth: 0.32, height: 0.02 }, // cutting board 30-35 x 20 cm
  basket: { kind: "cylinder", radius: 0.118, height: 0.07 }, // bread basket 22-25 cm
  "foil-wrap": { kind: "box", width: 0.2, depth: 0.12, height: 0.05 },
  tray: { kind: "box", width: 0.34, depth: 0.24, height: 0.02 },
  leaf: { kind: "box", width: 0.3, depth: 0.2, height: 0.005 },
  // Communal vessels run long-axis front-to-back (width = across the frame).
  casserole: { kind: "box", width: 0.27, depth: 0.37, height: 0.07 },
  platter: { kind: "box", width: 0.26, depth: 0.37, height: 0.03 },
  "sauce-boat": { kind: "box", width: 0.15, depth: 0.07, height: 0.06 },
  // Table condiments in their own containers, shaped like them so the proxy never reads as a dish.
  "condiment-bottle": { kind: "lathe-condiment", radius: 0.028, height: 0.18, tall: true }, // malt vinegar, hot sauce, ketchup: 5-6 cm across, 16-20 cm tall
  shaker: { kind: "lathe-condiment", radius: 0.02, height: 0.09 }, // salt, pepper, spice shaker
  jar: { kind: "cylinder", radius: 0.04, height: 0.09 }, // mustard, chutney or pickle jar
  paellera: { kind: "cylinder", radius: 0.19, height: 0.05 }, // paella pan for ~4, 36-40 cm at the mouth, 4-6 cm rim (spain.md)
};

/** How each vessel is named in the image prompt. The size is added from VESSELS so text and proxy agree. */
export const VESSEL_NOUN: Record<Vessel, string> = {
  plate: `a ${plateSpec.plates.plate.noun}`,
  "lunch-plate": `a ${plateSpec.plates["lunch-plate"].noun}`,
  "side-plate": `a ${plateSpec.plates["side-plate"].noun}`,
  bowl: "a round side bowl",
  "small-bowl": "a small round bowl",
  "large-bowl": "a large communal serving bowl",
  ramekin: "a small ramekin",
  board: "a wooden serving board",
  basket: "a small bread basket",
  "foil-wrap": "a foil wrap",
  tray: "a serving tray",
  leaf: "a banana leaf",
  casserole: "a rectangular casserole dish",
  platter: "an oval serving platter",
  "sauce-boat": "a sauce boat",
  "condiment-bottle": "a tall cylindrical condiment bottle",
  shaker: "a small shaker",
  jar: "a small lidded jar",
  paellera: "a shallow carbon-steel paella pan with two looped handles",
};

/** Short name for the vessel in running text ("the shared paella pan"). */
export const VESSEL_SHORT: Record<Vessel, string> = {
  plate: "plate",
  "lunch-plate": "plate",
  "side-plate": "side plate",
  bowl: "bowl",
  "small-bowl": "bowl",
  "large-bowl": "serving bowl",
  ramekin: "ramekin",
  board: "board",
  basket: "basket",
  "foil-wrap": "foil wrap",
  tray: "tray",
  leaf: "leaf",
  casserole: "casserole dish",
  platter: "platter",
  "sauce-boat": "sauce boat",
  "condiment-bottle": "bottle",
  shaker: "shaker",
  jar: "jar",
  paellera: "paella pan",
};

/** "a round entree plate about 27 cm across, in sage-green matte ceramic" */
export function vesselPhrase(v: Vessel, style?: string): string {
  const d = VESSELS[v];
  const cm = (m: number) => Math.round(m * 200) / 2; // nearest half centimeter
  const size = d.tall ? `about ${cm(d.height)} cm tall` : d.radius !== undefined ? `about ${cm(2 * d.radius)} cm across` : `about ${cm(Math.max(d.width!, d.depth!))} by ${cm(Math.min(d.width!, d.depth!))} cm`;
  const look = style?.trim() ? `, in ${style.trim()}` : "";
  const plate = v === "plate" || v === "lunch-plate" || v === "side-plate";
  return plate ? `${VESSEL_NOUN[v]} ${size}${look}, ${plateSpec.prompt}` : `${VESSEL_NOUN[v]} ${size}${look}`;
}

/** Extra height the food adds on top of the vessel. */
export const MASS_HEIGHT: Record<MassClass, number> = {
  flat: 0.02,
  heaped: 0.06,
  stacked: 0.1,
  wrapped: 0.05,
};

// The products on offer: TCCC North America product data (uploads/…Coca_Cola_Product_Data_2026_10_06.xlsx),
// one entry per GTIN-14, with the sheet's measured height / width (inches → metres). Their reference photos live in
// references/sku/<gtin>/ (front, side, top) and the carousel picture in public/sku/<gtin>.jpg.
// `appearance` describes the real package for the prompts; `retired` entries are kept only so older drafts still open.
/** shortName: the carousel label on the brief. */
export const SKU_CATALOG: Array<SkuInfo & { shortName: string; markets?: string[]; retired?: true }> = [
  {
    id: "coke-mexico-355ml-glass", gtin: "00049000004632", shortName: "Mexican Coke 355 mL glass bottle",
    displayName: "Coca-Cola de Mexico 355 mL glass bottle", package: "contour-glass-bottle", volumeMl: 355, heightM: 0.246, radiusM: 0.0314,
    appearance: "tall clear glass bottle in the classic contour shape with a red crown cap, filled to the neck with cola, a rectangular red paper label with a thin white border around the middle carrying the white Coca-Cola script logo",
  },
  {
    id: "coke-original-591ml-pet", gtin: "00049000000443", shortName: "20 fl oz plastic bottle",
    displayName: "Coca-Cola Original Taste 20 fl oz (591 mL) plastic bottle", package: "pet-bottle", volumeMl: 591, heightM: 0.225, radiusM: 0.0364,
    appearance: "clear plastic bottle with a red screw cap, a ribbed contoured body and a five-lobed base, filled to the shoulder with cola, a red wrap label around the middle carrying the white Coca-Cola script logo with ORIGINAL TASTE beneath it",
  },
  {
    id: "coke-original-355ml-can", gtin: "00049000006346", shortName: "12 fl oz can",
    displayName: "Coca-Cola Original Taste 12 fl oz (355 mL) can", package: "can", volumeMl: 355, heightM: 0.123, radiusM: 0.033,
    appearance: "standard red aluminium can with a brushed silver top and base, the large white Coca-Cola script logo running around the can with ORIGINAL TASTE in white capitals beneath it",
  },
  {
    id: "coke-original-473ml-can", gtin: "00049000053418", shortName: "16 fl oz tall can",
    displayName: "Coca-Cola Original Taste 16 fl oz (473 mL) tall can", package: "can", volumeMl: 473, heightM: 0.158, radiusM: 0.0331,
    appearance: "tall red aluminium can with a brushed silver top and base, the large white Coca-Cola script logo running around the can with ORIGINAL TASTE in white capitals beneath it",
  },
  {
    id: "coke-original-237ml-glass", gtin: "00049000001822", shortName: "8 fl oz glass bottle",
    displayName: "Coca-Cola Original Taste 8 fl oz (237 mL) contour glass bottle", package: "contour-glass-bottle", volumeMl: 237, heightM: 0.186, radiusM: 0.0279,
    appearance: "small clear glass bottle in the classic contour shape with a red crown cap and a faint green tint at the base, filled to the neck with cola, a red label band around the middle carrying the white Coca-Cola script logo with ORIGINAL TASTE beneath it",
  },
  // Iraq only. No GTIN yet: keyed by the artwork code on Fernando's front-of-pack render (REN-2605-00424_FOP.png,
  // 2026-10-12), so its photos live in references/sku/REN-2605-00424/ (front only). Size from retail listings:
  // 31.1-32.2 cm tall, 9.7-9.8 cm across the base.
  {
    id: "coke-iraq-1750ml-pet", gtin: "REN-2605-00424", shortName: "1.75 L plastic bottle (Iraq)",
    displayName: "Coca-Cola Original Taste 1.75 L plastic bottle", package: "pet-bottle", volumeMl: 1750, heightM: 0.316, radiusM: 0.0488, markets: ["iraq"],
    appearance: "large clear plastic bottle with a red screw cap, a long body with tall vertical grooves above and below the label and a five-lobed base, filled to the shoulder with cola, a red wrap label around the middle carrying the white Coca-Cola script logo with ORIGINAL TASTE beneath it and a white wave with a red and pink stepped geometric pattern below",
  },
  // Iraq only, also keyed by its front-of-pack artwork code (REN-2607-00852_FOP.png, 2026-10-12) until a GTIN arrives.
  // 450 mL single-serve contour PET (Fernando, 2026-10-19: was listed as 400 mL). 209-212 mm tall, 65-66 mm across at
  // the widest; set at 21 cm x 6.55 cm. The id keeps "400ml" so saved briefs still open.
  {
    id: "coke-iraq-400ml-pet", gtin: "REN-2607-00852", shortName: "450 mL plastic bottle (Iraq)",
    displayName: "Coca-Cola Original Taste 450 mL plastic bottle", package: "pet-bottle", volumeMl: 450, heightM: 0.21, radiusM: 0.03275, markets: ["iraq"],
    appearance: "single-serve 450 mL contour bottle in clear PET, about three times as tall as it is wide. Top to bottom: a red ribbed screw cap with a smooth band at its top edge; a short clear neck with a thin support ring; a clear sloping shoulder; cola filling the bottle up to the shoulder with a thin line of foam at the top. A red wrap label sits high on the upper body, between two faint horizontal rings moulded into the plastic, and carries the white Coca-Cola script logo with ORIGINAL TASTE in white capitals beneath it and a narrow vertical white recycling note along its left edge. Below the label the body pinches in at a gentle contour waist and then widens again toward the base. The moulded lower body starts at a slanted edge that rises from one side to the other. On one side it has three staggered columns of round raised dimples running down the bottle; beside them sits a recessed panel shaped like the contour-bottle silhouette, its surface covered in a fine pebbled stipple, with a large embossed Coca-Cola script running diagonally upward across it, the same colour as the cola, read only by its highlights. The bottle ends in a five-lobed base with rounded feet",
  },
  // UAE, from Grip's OpenUSD digital twins (USD.zip, 2026-10-26). Sizes are measured from the twin geometry and the
  // reference photos are renders of the twins (tablescape/sku-renders/). No markets filter yet, so they show for every
  // country until the UAE knowledge base lands. GTIN-14 padded from Grip's GTIN-13 / GTIN-8.
  {
    id: "coke-zero-uae-330ml-sleek-can", gtin: "05449000131805", shortName: "330 mL sleek can, Zero Sugar (UAE)",
    displayName: "Coca-Cola Zero Sugar 330 mL sleek can", package: "can", volumeMl: 330, heightM: 0.149, radiusM: 0.02865,
    appearance: "slim, tall red aluminium sleek can, about two and a half times as tall as it is wide (14.9 cm tall, 5.7 cm across), with a straight body, a short tapered silver neck and a brushed silver lid with a closed ring-pull tab; the large black Coca-Cola script logo wraps around the red body with ZERO SUGAR in black capitals beneath it",
  },
  {
    id: "coke-zero-uae-290ml-glass", gtin: "00000054007659", shortName: "290 mL glass bottle, Zero Sugar (UAE)",
    displayName: "Coca-Cola Zero Sugar 290 mL contour glass bottle", package: "contour-glass-bottle", volumeMl: 290, heightM: 0.204, radiusM: 0.0294,
    appearance: "clear glass bottle in the classic contour shape, 20.4 cm tall and 5.9 cm across at its widest, with a pinched waist low on the body and a black crown cap; filled to the neck with dark cola that glows red-amber where light passes through, a thin ring of light foam at the surface and fine bubbles clinging to the glass, clear empty glass in the neck above it; a red label band around the upper body carries the black Coca-Cola script logo with ZERO SUGAR in black capitals beneath it",
  },
  // Retired provisional sizes (coca-cola-guidelines.md §4.3), hidden from the brief.
  { id: "coke-original-330ml-glass", shortName: "330 mL contour glass bottle", displayName: "Coca-Cola Original Taste 330 mL contour glass bottle", package: "contour-glass-bottle", volumeMl: 330, retired: true },
  { id: "coke-original-350ml-glass-es", shortName: "350 mL returnable glass (Spain)", displayName: "Coca-Cola Original Taste 350 mL returnable glass bottle (Spain on-premise)", package: "contour-glass-bottle", volumeMl: 350, markets: ["spain"], retired: true },
  { id: "coke-original-330ml-can", shortName: "330 mL can", displayName: "Coca-Cola Original Taste 330 mL can", package: "can", volumeMl: 330, retired: true },
  { id: "coke-original-500ml-pet", shortName: "500 mL PET bottle", displayName: "Coca-Cola Original Taste 500 mL PET bottle", package: "pet-bottle", volumeMl: 500, retired: true },
  { id: "coke-original-1500ml-pet", shortName: "1.5 L PET bottle", displayName: "Coca-Cola Original Taste 1.5 L PET bottle", package: "pet-bottle", volumeMl: 1500, retired: true },
  { id: "coke-original-2l-pet", shortName: "2 L PET bottle", displayName: "Coca-Cola Original Taste 2 L PET bottle", package: "pet-bottle", volumeMl: 2000, retired: true },
];

export function skuProxy(sku: SkuInfo): ProxyDef {
  if (sku.heightM && sku.radiusM) return { kind: sku.package === "can" ? "lathe-can" : "lathe-bottle", radius: sku.radiusM, height: sku.heightM, tall: true };
  if (sku.package === "can") {
    return sku.volumeMl >= 355
      ? { kind: "lathe-can", radius: 0.033, height: 0.123, tall: true }
      : { kind: "lathe-can", radius: 0.033, height: 0.115, tall: true };
  }
  if (sku.package === "contour-glass-bottle") {
    if (sku.volumeMl === 350) return { kind: "lathe-bottle", radius: 0.038, height: 0.147, tall: true }; // Spain returnable
    if (sku.volumeMl <= 250) return { kind: "lathe-bottle", radius: 0.028, height: 0.19, tall: true };
    return { kind: "lathe-bottle", radius: 0.031, height: 0.205, tall: true };
  }
  if (sku.volumeMl >= 3000) return { kind: "lathe-bottle", radius: 0.059, height: 0.365, tall: true };
  if (sku.volumeMl >= 2500) return { kind: "lathe-bottle", radius: 0.056, height: 0.345, tall: true };
  if (sku.volumeMl >= 2000) return { kind: "lathe-bottle", radius: 0.054, height: 0.33, tall: true };
  if (sku.volumeMl >= 1500) return { kind: "lathe-bottle", radius: 0.049, height: 0.315, tall: true };
  if (sku.volumeMl >= 1000) return { kind: "lathe-bottle", radius: 0.042, height: 0.28, tall: true };
  if (sku.volumeMl >= 500) return { kind: "lathe-bottle", radius: 0.0325, height: 0.203, tall: true };
  return { kind: "lathe-bottle", radius: 0.03, height: 0.21, tall: true };
}

/** Clearance radius around a multi-serve bottle (coca-cola-guidelines.md §4.5). */
export function bottleClearance(sku: SkuInfo): number {
  if (sku.volumeMl >= 3000) return 0.15;
  if (sku.volumeMl >= 2500) return 0.135;
  if (sku.volumeMl >= 2000) return 0.11;
  if (sku.volumeMl >= 1000) return 0.1;
  return 0;
}

// Branded bell-shaped contour glass, 640 mL: 171-173 mm tall, 95 mm across the top (§4.3).
export const BELL_GLASS: ProxyDef = { kind: "lathe-bell-glass", radius: 0.0475, height: 0.172, tall: true };


/**
 * Standard flat cloth napkin squares (sold unfolded): luncheon 14-16 in, everyday dinner
 * 18-20 in. Every napkin is folded only twice, in thirds and then in half, into six
 * layers a few millimetres thick, so a bigger napkin gives a bigger rectangle, never more
 * folds. Long side toward the camera, utensils on top (tableware reference §2-3).
 */
export const NAPKIN_SIZES: Record<NapkinSize, { inches: number; cm: number }> = {
  luncheon: { inches: 15, cm: 38 },
  dinner: { inches: 19, cm: 48 },
};

export function napkinDef(shape: "rect" | "triangle", size: NapkinSize = "luncheon"): ProxyDef {
  const side = NAPKIN_SIZES[size].cm / 100;
  if (shape === "triangle") {
    // Folded in half corner to corner, then in half again.
    return { kind: "napkin", width: side * 0.7, depth: side * 0.35, height: 0.004 };
  }
  return { kind: "napkin", width: side / 3, depth: side / 2, height: 0.004 };
}

/** Folded size in whole centimetres, short side first, for the prompt. */
export function napkinFoldedCm(size: NapkinSize): [number, number] {
  const d = napkinDef("rect", size);
  return [Math.round(d.width! * 100), Math.round(d.depth! * 100)];
}

export interface SurfaceDef {
  width: number;
  depth: number;
  /** Narrow surfaces fit fewer items and push the layout sideways. */
  narrow: boolean;
  promptText: string;
}

// Rendered surfaces are generous in width so the table fills a 16:9 frame;
// depth drives the horizon rule (the rear edge must sit at or below 50%).
export const SURFACES: Record<Surface, SurfaceDef> = {
  "table-2top": { width: 1.4, depth: 0.75, narrow: false, promptText: "a small dining table" },
  "table-4top": { width: 1.8, depth: 0.85, narrow: false, promptText: "a dining table" },
  "long-table": { width: 2.4, depth: 0.95, narrow: false, promptText: "a long family dining table" },
  "picnic-table": { width: 2.0, depth: 0.75, narrow: false, promptText: "a wooden park picnic table" },
  "park-table": { width: 1.4, depth: 0.7, narrow: false, promptText: "a small outdoor park table" },
  "counter-top": { width: 1.8, depth: 0.55, narrow: true, promptText: "an outdoor counter top" },
  bench: { width: 1.6, depth: 0.42, narrow: true, promptText: "a park bench" },
  "food-truck-counter": { width: 1.8, depth: 0.4, narrow: true, promptText: "a food-truck counter" },
  "street-ledge": { width: 1.6, depth: 0.45, narrow: true, promptText: "a wide street-side ledge" },
};

// No round tables (user, 2026-10-06): the layout guide draws a rectangular top and the image model copies it,
// so a "round" table in the text never comes through and the sketch and photo disagree.
export const RECTANGULAR_TABLE_RULE =
  "The tabletop is rectangular with straight edges, as in image 1, never round or oval.";

/** Drops "round", "circular" or "oval" from a table description ("a small round café table" -> "a small café table"). */
export function withoutRoundTable(text: string): string {
  return text
    .replace(/\b(?:round|circular|oval)(?:[- ]topped)?\s+(?=(?:(?!(?:on|in|at|of|by|with|beside|near|next|and)\b)[^\s,.;]+\s+){0,3}(?:table|tabletop|top)s?\b)/gi, "")
    .replace(/\b([Aa])n (?=[b-df-hj-np-tv-z])/g, "$1 ")
    .replace(/ {2,}/g, " ");
}

// On the go, the food sits on a table-like surface (user, 2026-10-06): picnic tables, small park tables, counter
// tops and wide ledges. A bench is fine where it's culturally normal, but only as one option beside a table, never
// the only one. Nothing else people sit on, and never a lap or the ground.
export const ON_THE_GO_SURFACE_RULE =
  "The food sits on a table-like surface: a picnic table, a small park table, a counter top or a wide ledge. Never on a seat, stool, chair, step, stairs, a lap or the ground.";
const ON_A_BENCH_RULE = "The food sits flat on the bench seat itself, never on a lap or the ground.";

/** The surface line for an on-the-go prompt, or "" for other venues. */
export function onTheGoSurfaceRule(scene: { venue: string; surface: Surface }): string {
  if (scene.venue !== "on-the-go") return "";
  return scene.surface === "bench" ? ON_A_BENCH_RULE : ON_THE_GO_SURFACE_RULE;
}

const SEAT_WORDS = /\b(seats?|seating|stools?|chairs?|steps|stairs|stoop|bleachers?|laps?|ground|grass|sand)\b/i;
const BENCH_WORDS = /\b(benches|bench)\b/i;
const TABLE_WORDS = /\b(tables?|counters?|countertops?|ledges?|bar tops?|shelf|shelves)\b/i;

/** True when a surface description puts the food on a seat (not a bench), a lap or the ground. */
export function seatLikeSurface(text: string | undefined): boolean {
  if (!text) return false;
  return SEAT_WORDS.test(text) && !TABLE_WORDS.test(text) && !BENCH_WORDS.test(text);
}

/** True when a surface description is a bench rather than a table with benches. */
export function benchSurface(text: string | undefined): boolean {
  return !!text && BENCH_WORDS.test(text) && !TABLE_WORDS.test(text);
}

/** Footprint radius used for spacing checks (boxes use their half-diagonal on the short side). */
export function footprintRadius(p: ProxyDef): number {
  if (p.radius !== undefined) return p.radius;
  return Math.max(p.width ?? 0, p.depth ?? 0) / 2;
}

