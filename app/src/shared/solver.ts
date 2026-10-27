// Layout solver: places the items for one place setting, fits the camera,
// checks the hard rules and returns up to 3 distinct compliant options.
//
// Placement follows knowledge-base/00-methods/tableware-composition-reference.md
// §3-§7 and coca-cola-guidelines.md §4; composition rules follow
// docs/tablescape/PLAN.md §5.

import { heldLabel, holdingHand, poseById, poseRole, sideToward, toWorld, type PersonId } from "./poses";
import { ASPECT, clipConvex, fovFromFocal, makeCameraParams, overlapArea, polyArea, Projector, rectPoly, screenBox, silhouette, type Poly, type ScreenBox } from "./camera";
import { bottleClearance, footprintRadius, SURFACES, type ProxyDef } from "./registry";
import { angleById, depthById, lookById } from "./rules";
import layoutPreferences from "../../rules/layout-preferences.json";
import { isMultiServe, sceneItems, type ItemSpec } from "./scene";
import type { Blueprint, CameraParams, Primitive, RuleResult, SceneSpec } from "./types";

export interface Placed {
  item: ItemSpec;
  x: number;
  d: number;
  yaw: number;
  /** Height of its base above the table top (a drink held in a hand); 0 on the table. */
  elev?: number;
  /** The seated person holding it. */
  heldBy?: string;
}

export type Archetype =
  | "triangle-loop"
  | "crescent-arc"
  | "diagonal-stagger"
  | "counterweight"
  | "feast-spread"
  | "hero-lockup"
  | "across-the-table"
  | "across-offset"
  | "corner"
  | "seated-corner"
  | "seated-across"
  | "seated-solo";

export const ARCHETYPE_INFO: Record<Archetype, { name: string; idea: string }> = {
  "triangle-loop": { name: "Triangle Loop", idea: "a depth triangle from the entree to the drink and back to a far-left accent" },
  "crescent-arc": { name: "Crescent Arc", idea: "supporting dishes wrap in an arc behind the entree" },
  "diagonal-stagger": { name: "Diagonal Stagger", idea: "supporting dishes step back on a diagonal that leads the eye to the drink" },
  counterweight: { name: "Counterweight", idea: "supporting dishes grouped on the left to balance the drink on the right" },
  "feast-spread": { name: "Feast Spread", idea: "the shared centerpiece sits back-left, with shared sides around it and one plated setting in front" },
  "hero-lockup": { name: "Hero Lockup", idea: "the dish front and center with the drink tucked in tight at its right" },
  "across-the-table": { name: "Across the Table", idea: "a second place setting directly opposite the hero, at the far side of the table" },
  "across-offset": { name: "Across, Offset", idea: "a second place setting opposite the hero but shifted aside, so the hero's drink doesn't hide it" },
  corner: { name: "Corner Seating", idea: "two place settings at a right angle around a far corner of the table, seen from the opposite corner" },
  "seated-corner": { name: "Seated Corner", idea: "two people sit at a right angle around a far corner of the table, seen from the opposite corner" },
  "seated-across": { name: "Over the Shoulder", idea: "two people face each other across the table, seen over the near person's shoulder" },
  "seated-solo": { name: "One at the Table", idea: "one person at the table, mid-meal: across from the camera, seen from behind, or only their hands" },
};

export interface LayoutOption {
  archetype: Archetype;
  blueprint: Blueprint;
  /** Set on an arrangement the art director made in the sketch editor. */
  edit?: {
    /** The solver's arrangement it was edited from (its index in the options). */
    from: number;
    /** Drafts saved before 2026-10-17 carry the sketch it was edited on; it's no longer sent to the redraw. */
    styleUrl?: string;
  };
}

export interface SolveResult {
  options: LayoutOption[];
  infeasible: Array<{ archetype: Archetype; reason: string }>;
  /** The spec the options were built from: the accent is dropped when no layout had room for it. */
  spec: SceneSpec;
  /** Plain-language notes about what the solver had to change. */
  notes: string[];
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function radiusOf(p: Placed): number {
  return footprintRadius(p.item.def);
}

function edgeGap(a: Placed, b: Placed): number {
  return Math.hypot(a.x - b.x, a.d - b.d) - radiusOf(a) - radiusOf(b);
}

/**
 * Edge-to-edge gap using each item's real outline: round items as circles, napkins, trays and
 * boards as turned rectangles, so a napkin can sit as close to its plate as the spacing rule says
 * rather than a bounding circle's width away.
 */
function shapeGap(a: Placed, b: Placed): number {
  const rect = (p: Placed) => {
    if (p.item.def.radius !== undefined || p.item.def.width === undefined || p.item.def.depth === undefined) return null;
    const t = (p.yaw * Math.PI) / 180;
    return { hw: p.item.def.width / 2, hd: p.item.def.depth / 2, u: [Math.cos(t), Math.sin(t)] as const, v: [-Math.sin(t), Math.cos(t)] as const };
  };
  const ra = rect(a),
    rb = rect(b);
  const dx = b.x - a.x,
    dd = b.d - a.d;
  if (!ra && !rb) return Math.hypot(dx, dd) - radiusOf(a) - radiusOf(b);
  if (ra && rb) {
    // Separating axes: the largest gap along any of the four box axes.
    const proj = (r: NonNullable<typeof ra>, n: readonly [number, number]) => r.hw * Math.abs(r.u[0] * n[0] + r.u[1] * n[1]) + r.hd * Math.abs(r.v[0] * n[0] + r.v[1] * n[1]);
    return Math.max(...[ra.u, ra.v, rb.u, rb.v].map((n) => Math.abs(dx * n[0] + dd * n[1]) - proj(ra, n) - proj(rb, n)));
  }
  // A circle against a box: the distance from the circle's centre to the box, less its radius.
  const [r, c, sgn] = ra ? [ra, b, 1] : [rb!, a, -1];
  const lx = Math.abs(sgn * (dx * r.u[0] + dd * r.u[1])) - r.hw;
  const ld = Math.abs(sgn * (dx * r.v[0] + dd * r.v[1])) - r.hd;
  const out = Math.hypot(Math.max(lx, 0), Math.max(ld, 0));
  return (out > 0 ? out : Math.max(lx, ld)) - radiusOf(c);
}

/** Minimum edge-to-edge spacing between two items (tableware reference §7). */
function minGap(a: Placed, b: Placed, multi: { sku: string; clearance: number } | null): number {
  if (multi && (a.item.label === multi.sku || b.item.label === multi.sku)) {
    // Clearance radius is measured from the bottle's center.
    return Math.max(0.015, multi.clearance - footprintRadius((a.item.label === multi.sku ? a : b).item.def));
  }
  return kindGap(a.item.kind, b.item.kind);
}

/** Minimum edge-to-edge spacing between two kinds of item (tableware reference §7); the sketch editor uses it too. */
export function kindGap(ka: string, kb: string): number {
  const k = [ka, kb].sort().join("+");
  if (k === "side+side" || k === "shared-side+shared-side" || k === "shared-side+side") return 0.05;
  if (ka === "bread" || kb === "bread") return 0.05;
  if (k === "condiment+condiment" || k === "accent+condiment") return 0.01;
  if (k === "main+napkin-set") return 0.03;
  return 0.015;
}

/** Minimum gap between the entree's front edge and the bottom of the frame. */
const MAIN_BOTTOM_MARGIN = 0.02;

/** Table left visible behind the rearmost item. */
const REAR_MARGIN = 0.08;

function onTable(p: Placed, W: number, D: number): boolean {
  const r = radiusOf(p);
  return p.x - r >= -W / 2 + 0.02 && p.x + r <= W / 2 - 0.02 && p.d - r >= 0.02 && p.d + r <= D - 0.02;
}

// ---------------------------------------------------------------------------
// Placement per archetype
// ---------------------------------------------------------------------------

interface Anchor {
  x: number;
  d: number;
}

function polar(c: Anchor, angleDeg: number, dist: number): Anchor {
  const a = (angleDeg * Math.PI) / 180;
  return { x: c.x + dist * Math.cos(a), d: c.d + dist * Math.sin(a) };
}

interface Variant {
  condAngle: number; // where the condiment cluster sits around the plate
  accentAngle: number; // where the injected accent sits, always within 1-3 in of the plate
  sideAngle?: number; // triangle-loop: where the first side dish sits
  lockAngle?: number; // hero-lockup: where the drink sits around the plate (0 = level with its center, right)
  /** Second place setting (party "2"): across archetypes shift the partner's plate laterally by
   * this much; the corner archetype reads it as extra clearance between the two settings. */
  partnerOffsetX?: number;
}

const VARIANTS: Record<Archetype, Variant[]> = {
  // Team reference: side back-left, condiment level with the plate on its left, drink back-right.
  // Nothing sits in front of the hero dish (H3), so condiments and accents stay at 180° or behind.
  "triangle-loop": [
    { condAngle: 178, accentAngle: 155, sideAngle: 125 },
    { condAngle: 175, accentAngle: 150, sideAngle: 118 },
    { condAngle: 180, accentAngle: 160, sideAngle: 132 },
    // Crowded left (two or more sides): the accent tucks in straight behind the plate instead.
    { condAngle: 180, accentAngle: 98, sideAngle: 145 },
  ],
  "crescent-arc": [
    { condAngle: 92, accentAngle: 150 },
    { condAngle: 120, accentAngle: 165 },
    { condAngle: 140, accentAngle: 175 },
  ],
  "diagonal-stagger": [
    { condAngle: 125, accentAngle: 160 },
    { condAngle: 145, accentAngle: 175 },
    { condAngle: 100, accentAngle: 150 },
  ],
  counterweight: [
    { condAngle: 135, accentAngle: 170 },
    { condAngle: 155, accentAngle: 180 },
    { condAngle: 115, accentAngle: 160 },
  ],
  "feast-spread": [
    { condAngle: 100, accentAngle: 175 },
    { condAngle: 130, accentAngle: 178 },
    { condAngle: 85, accentAngle: 165 },
  ],
  // Dish and drink only: the drink just off the plate's right edge, a touch behind its center.
  "hero-lockup": [
    { condAngle: 150, accentAngle: 170, lockAngle: 28 },
    { condAngle: 150, accentAngle: 170, lockAngle: 20 },
    { condAngle: 150, accentAngle: 170, lockAngle: 38 },
  ],
  // Second place setting, directly opposite the hero at the table's far side.
  "across-the-table": [
    { condAngle: 165, accentAngle: 150, partnerOffsetX: 0 },
    { condAngle: 165, accentAngle: 150, partnerOffsetX: -0.06 },
    { condAngle: 165, accentAngle: 150, partnerOffsetX: 0.06 },
  ],
  // Second place setting, opposite the hero but shifted aside a plate-width so the hero's own drink can't hide it.
  "across-offset": [
    { condAngle: 165, accentAngle: 150, partnerOffsetX: -0.24 },
    { condAngle: 165, accentAngle: 150, partnerOffsetX: -0.28 },
    { condAngle: 165, accentAngle: 150, partnerOffsetX: -0.32 },
  ],
  // Second place setting at a right angle, meeting the hero at the table's front-left corner.
  corner: [
    { condAngle: 165, accentAngle: 150, partnerOffsetX: 0.02 },
    { condAngle: 165, accentAngle: 150, partnerOffsetX: 0.04 },
    { condAngle: 165, accentAngle: 150, partnerOffsetX: 0.06 },
  ],
  // Placed by solveSeatedCorner, not by variants.
  "seated-corner": [{ condAngle: 180, accentAngle: 150 }],
  // Placed by solveSeatedAcross, not by variants.
  "seated-across": [{ condAngle: 180, accentAngle: 150 }],
  "seated-solo": [{ condAngle: 180, accentAngle: 150 }],
};

function preferredPositions(items: ItemSpec[], spec: SceneSpec, archetype: Archetype, v: Variant): Map<string, Anchor> {
  const pos = new Map<string, Anchor>();
  const D = SURFACES[spec.scene.surface].depth;
  const main = items.find((i) => i.kind === "main")!;
  const R = footprintRadius(main.def);
  const P: Anchor = { x: 0, d: R + 0.05 };
  pos.set("MAIN", P);

  const sku = items.find((i) => i.kind === "sku")!;
  const rs = footprintRadius(sku.def);
  const glass = items.find((i) => i.kind === "glass");
  const multi = isMultiServe(spec);

  const bottleFirst = layoutPreferences.drink_order.value === "bottle-then-glass";
  if (glass && bottleFirst) {
    // House rule (layout-preferences.json drink_order): bottle at the top right of the plate,
    // glass to its right and slightly forward, nearer the diner.
    const rg = footprintRadius(glass.def);
    const clear = multi ? Math.max(bottleClearance(spec.sku), rs + 0.02) : rs;
    const s = polar(P, 32, R + 0.03 + clear);
    pos.set("SKU", s);
    pos.set("GLASS", { x: s.x + rs + 0.025 + rg, d: s.d - 0.03 });
  } else if (glass) {
    const rg = footprintRadius(glass.def);
    // Glass at the top right of the plate.
    const g = polar(P, 52, R + 0.03 + rg);
    pos.set("GLASS", g);
    if (multi) {
      // Multi-serve bottle in the midground, beside the hero zone, outside its clearance radius.
      const c = bottleClearance(spec.sku);
      pos.set("SKU", { x: g.x + rg + Math.max(c, rs + 0.02) + 0.005, d: g.d + 0.07 });
    } else {
      pos.set("SKU", { x: g.x + rg + 0.025 + rs, d: g.d + 0.035 });
    }
  } else {
    // Single-serve drink at the top right of the plate.
    pos.set("SKU", polar(P, 50, R + 0.03 + rs));
  }

  const napkin = items.find((i) => i.kind === "napkin-set");
  if (napkin) {
    // Napkin + utensils to the right of the plate, 3-5 cm from it (tableware reference §3, §7).
    const w = (napkin.def.width ?? 0.1) / 2;
    const nx = P.x + R + 0.04 + w;
    pos.set(napkin.label, { x: nx, d: Math.max(0.12, P.d - 0.02) });
    if (!glass) {
      // Team reference: a single-serve drink sits in the gap between the plate's right
      // edge and the napkin set, evenly spaced from both, set back behind the plate's center.
      pos.set("SKU", { x: (P.x + R + (nx - w)) / 2 + 0.01, d: P.d + Math.max(0.1, rs + 0.07) });
    }
  }

  const sides = items.filter((i) => i.kind === "side" || i.kind === "shared-side");
  const conds = items.filter((i) => i.kind === "condiment");
  const accent = items.find((i) => i.kind === "accent");
  const breads = items.filter((i) => i.kind === "bread");
  const sharedHero = items.find((i) => i.kind === "shared-hero");
  const r = (i: ItemSpec) => footprintRadius(i.def);

  // Bread: right third, midground/background (tableware reference §4), beyond the rightmost drink.
  const skuPos = pos.get("SKU")!;
  const glassPos = pos.get("GLASS");
  const drinkRight = glass && glassPos && glassPos.x > skuPos.x ? glassPos.x + footprintRadius(glass.def) : skuPos.x + rs;
  breads.forEach((b, k) => pos.set(b.label, { x: drinkRight + 0.07 + r(b) + k * 0.05, d: skuPos.d + 0.1 + k * 0.08 }));

  // Condiments: a tight arc around the dish each one goes with, all ~1.5 in off its rim (H8 wants
  // 1-3 in), centered on `angle` and fanning out both ways. A straight row ran away from the rim, so
  // from the second or third condiment on everything sat too far from its dish.
  const condCluster = (angle: number) => {
    const groups = new Map<string, ItemSpec[]>();
    for (const c of conds) {
      const key = c.pairsWith && c.pairsWith !== "MAIN" && pos.has(c.pairsWith) ? c.pairsWith : "MAIN";
      groups.set(key, [...(groups.get(key) ?? []), c]);
    }
    for (const [partner, list] of groups) {
      const partnerItem = partner === "MAIN" ? main : items.find((i) => i.label === partner);
      const anchor = partner === "MAIN" ? P : pos.get(partner)!;
      const rim = partner === "MAIN" || !partnerItem ? R : r(partnerItem);
      list.forEach((c, k) => {
        const dist = rim + 0.04 + r(c);
        const step = (2 * Math.asin(Math.min(1, (2 * r(c) + 0.02) / (2 * dist))) * 180) / Math.PI;
        const offsets = list.map((_, k) => (k === 0 ? 0 : Math.ceil(k / 2) * step * (k % 2 ? -1 : 1)));
        // Around the entree the fan never swings past 180° into the space in front of it (H3):
        // the whole cluster turns back instead.
        const back = partner === "MAIN" ? Math.max(0, angle + Math.max(...offsets) - 180) : 0;
        pos.set(c.label, polar(anchor, angle + offsets[k]! - back, dist));
      });
    }
  };

  switch (archetype) {
    case "triangle-loop": {
      // The team's preferred reference: a depth triangle around the plate with the
      // side dish back-left, the condiment level on its left and the drink back-right.
      const angles = [v.sideAngle ?? 125, v.sideAngle && v.sideAngle > 140 ? 65 : 95, 150, 75];
      sides.forEach((s, k) => pos.set(s.label, polar(P, angles[k % 4], R + 0.035 + r(s) + Math.floor(k / 4) * 0.12)));
      condCluster(v.condAngle);
      break;
    }
    case "crescent-arc": {
      const arc = sides;
      const n = arc.length;
      arc.forEach((s, k) => {
        const a = n === 1 ? 108 : 165 - (k * 70) / (n - 1);
        pos.set(s.label, polar(P, a, R + 0.07 + r(s)));
      });
      condCluster(v.condAngle);
      break;
    }
    case "diagonal-stagger": {
      // Steps back along a diagonal from behind the plate's left shoulder.
      let cur: Anchor = { x: P.x - R * 0.4, d: P.d + R + 0.06 };
      sides.forEach((s) => {
        const p = { x: cur.x - r(s) - 0.03, d: cur.d + r(s) + 0.02 };
        pos.set(s.label, p);
        cur = { x: p.x + r(s) + 0.06, d: p.d + r(s) + 0.03 };
      });
      condCluster(v.condAngle);
      break;
    }
    case "counterweight": {
      const left = P.x - R - 0.05;
      sides.forEach((s, k) => {
        const col = Math.floor(k / 2);
        const row = k % 2;
        pos.set(s.label, { x: left - r(s) - col * 0.2, d: P.d + 0.03 + row * 0.2 });
      });
      condCluster(v.condAngle);
      break;
    }
    case "hero-lockup": {
      // The house tight lockup: the drink sits 1.5 cm off the plate's right edge, slightly
      // behind its center, and the napkin set (when there is one) moves to the left.
      const a = v.lockAngle ?? 28;
      if (glass) {
        const rg = footprintRadius(glass.def);
        const clear = multi ? Math.max(bottleClearance(spec.sku), rs + 0.02) : rs;
        const s = polar(P, a, R + 0.015 + clear);
        pos.set("SKU", s);
        pos.set("GLASS", { x: s.x + rs + 0.02 + rg, d: s.d - 0.03 });
      } else {
        pos.set("SKU", polar(P, a, R + 0.015 + rs));
      }
      if (napkin) pos.set(napkin.label, { x: P.x - R - 0.04 - (napkin.def.width ?? 0.1) / 2, d: Math.max(0.12, P.d - 0.02) });
      condCluster(v.condAngle);
      break;
    }
    case "feast-spread": {
      if (sharedHero) {
        const h = sharedHero.def.depth !== undefined ? sharedHero.def.depth / 2 : r(sharedHero);
        pos.set(sharedHero.label, { x: P.x - 0.12 - r(sharedHero) * 0.4, d: P.d + R + 0.06 + h });
      }
      const angles = [165, 140, 60, 25];
      sides.forEach((s, k) => pos.set(s.label, polar(P, angles[k % 4], R + 0.2 + r(s) + Math.floor(k / 4) * 0.15)));
      condCluster(v.condAngle);
      break;
    }
    case "across-the-table":
    case "across-offset":
    case "corner": {
      // Two place settings: shared dishes fill the open zone beside/between the settings, never in front of MAIN (H3).
      const angles = [160, 180, 140, 120];
      sides.forEach((s, k) => pos.set(s.label, polar(P, angles[k % 4], R + 0.12 + r(s) + Math.floor(k / 4) * 0.12)));
      condCluster(v.condAngle);
      break;
    }
  }
  // The injected accent stays within 1-3 in of the entree (Part B condiment proximity).
  if (accent) pos.set(accent.label, polar(P, v.accentAngle, R + 0.045 + r(accent)));

  // Second place setting (party "2"): across the table, offset so the hero's drink can't hide it,
  // or around the corner. All second-setting items read the request's "no hands or people" exclusion
  // the same way the hero's own setting does — this only ever places tableware.
  const main2 = items.find((i) => i.kind === "partner-main");
  if (main2) {
    const r2 = footprintRadius(main2.def);
    const napkin2 = items.find((i) => i.kind === "partner-napkin");
    const sku2 = items.find((i) => i.kind === "partner-sku");
    const glass2 = items.find((i) => i.kind === "partner-glass");
    const offset = v.partnerOffsetX ?? 0;
    const isCorner = archetype === "corner";
    const P2: Anchor = isCorner ? { x: P.x - R - 0.03 - offset - r2, d: P.d - 0.02 } : { x: P.x + offset, d: D - R - r2 - 0.05 };
    pos.set(main2.label, P2);

    if (napkin2) {
      // The partner's napkin set sits to their own right, which reads as camera-left of MAIN_2
      // across the table, or just behind MAIN_2 (their "right") at the corner.
      const w2 = (napkin2.def.width ?? 0.1) / 2;
      pos.set(napkin2.label, isCorner ? { x: P2.x, d: P2.d + r2 + 0.04 + w2 } : { x: P2.x - r2 - 0.04 - w2, d: P2.d });
    }

    if (sku2 && glass2) {
      const rd2 = footprintRadius(sku2.def);
      const rg2 = footprintRadius(glass2.def);
      if (isCorner) {
        pos.set(sku2.label, { x: P2.x, d: P2.d - r2 - 0.03 - rd2 });
        pos.set(glass2.label, { x: P2.x, d: P2.d - r2 - 0.03 - 2 * rd2 - 0.02 - rg2 });
      } else {
        pos.set(sku2.label, { x: P2.x - r2 - 0.03 - rd2, d: P2.d - 0.04 });
        pos.set(glass2.label, { x: P2.x - r2 - 0.03 - 2 * rd2 - 0.025 - rg2, d: P2.d - 0.04 });
      }
    } else if (sku2) {
      const rd2 = footprintRadius(sku2.def);
      pos.set(sku2.label, isCorner ? { x: P2.x, d: P2.d - r2 - 0.03 - rd2 } : { x: P2.x - r2 - 0.03 - rd2, d: P2.d - 0.04 });
    } else if (glass2) {
      const rg2 = footprintRadius(glass2.def);
      pos.set(glass2.label, isCorner ? { x: P2.x, d: P2.d - r2 - 0.03 - rg2 } : { x: P2.x - r2 - 0.03 - rg2, d: P2.d - 0.04 });
    }

    // Family-style: the shared centerpiece sits in the open zone between the two settings
    // (the middle band across the table, or the far-left zone past the corner seat).
    if (sharedHero) {
      pos.set(
        sharedHero.label,
        isCorner ? { x: P2.x - r2 - 0.1 - r(sharedHero), d: (P.d + D - R) / 2 } : { x: (P.x + P2.x) / 2, d: (P.d + P2.d) / 2 },
      );
    }
  }
  return pos;
}

/** Whether `q` fits on the table without crowding any of `others`. */
function fitsAt(q: Placed, others: Placed[], W: number, D: number, multi: { sku: string; clearance: number } | null): boolean {
  return onTable(q, W, D) && others.every((o) => o === q || o.item.label === q.item.label || edgeGap(q, o) >= minGap(q, o, multi) - 1e-9);
}

/**
 * Where an item may go instead of its preferred spot, as rings of positions
 * around the entree, limited to the places its role allows: the drink stays
 * back-right, supporting dishes beside or behind the entree, condiments and
 * accents within 1-3 in of it.
 */
function candidateSpots(p: Placed, main: Placed, placed: Placed[] = []): Anchor[] {
  const k = p.item.kind;
  if (k === "partner-main" || k === "partner-napkin" || k === "partner-sku" || k === "partner-glass") {
    // The second setting lives far from the hero: search small moves around its own current
    // spot (its "row") rather than rings around MAIN, which would pull it toward the hero.
    const r = radiusOf(p);
    const out: Anchor[] = [];
    for (const g of [0.02, 0.04, 0.06, 0.08]) for (const a of range(0, 345, 30)) out.push(polar({ x: p.x, d: p.d }, a, r + g));
    return out;
  }
  // A condiment that goes with a side dish searches around that dish, not the entree.
  const partner = (k === "condiment" || k === "accent") && p.item.pairsWith ? placed.find((q) => q.item.label === p.item.pairsWith) : undefined;
  const around = partner ?? main;
  const P = { x: around.x, d: around.d };
  const R = radiusOf(around);
  const r = radiusOf(p);
  let angles: number[];
  let gaps: number[];
  if (k === "sku" || k === "glass") {
    angles = range(0, 85, 7.5);
    gaps = range(0.02, 0.26, 0.03);
  } else if (k === "condiment" || k === "accent") {
    // Around the entree: beside or behind it, never in front (H3). Around a side dish: anywhere.
    angles = partner ? range(0, 345, 15) : range(-15, 195, 15);
    gaps = [0.03, 0.045, 0.06, 0.075];
  } else if (k === "napkin-set" || k === "main") {
    return [];
  } else {
    angles = range(-15, 195, 15);
    gaps = range(0.035, 0.32, 0.035);
  }
  const out: Anchor[] = [];
  for (const g of gaps) for (const a of angles) out.push(polar(P, a, R + g + r));
  return out;
}

function range(a: number, b: number, step: number): number[] {
  const out: number[] = [];
  for (let v = a; v <= b + 1e-9; v += step) out.push(+v.toFixed(4));
  return out;
}

/**
 * Moves the items named by failing rules (a condiment hidden behind the
 * entree, a drink behind a heaped platter) to the nearest spot that clears
 * the most failures, keeping the camera. A few rounds, one item at a time.
 */
function repair(placed: Placed[], fit: Fit, spec: SceneSpec, W: number, D: number, multi: { sku: string; clearance: number } | null): void {
  const main = placed.find((p) => p.item.kind === "main")!;
  const proj = new Projector(fit.cam);
  const reproject = (p: Placed) => {
    fit.boxes.set(p.item.label, screenBox(proj, p.item.def, p.x, p.d, p.yaw, 0, p.item.extraHeight));
    fit.sils.set(p.item.label, silhouette(proj, p.item.def, p.x, p.d, p.yaw, p.item.extraHeight));
  };
  // Failing rules first, then how many items each names: moving one of three stray condiments
  // closer still fails H8, but it is progress and must count as an improvement.
  const cost = () => {
    const b = blocking(checkRules(placed, fit, spec));
    return { n: b.length * 100 + b.reduce((s, r) => s + (r.offenders?.length ?? 1), 0), rules: b };
  };
  let current = cost();
  const tried = new Set<string>();
  for (let round = 0; round < 6 && current.n > 0; round++) {
    const targets = [...new Set(current.rules.flatMap((r) => r.offenders ?? []))].filter((l) => !tried.has(l));
    if (!targets.length) return;
    let improved = false;
    for (const label of targets) {
      const p = placed.find((q) => q.item.label === label);
      if (!p) continue;
      const home = { x: p.x, d: p.d };
      let best: { at: Anchor; n: number; moved: number } | null = null;
      for (const at of candidateSpots(p, main, placed)) {
        p.x = at.x;
        p.d = at.d;
        if (!fitsAt(p, placed, W, D, multi)) continue;
        reproject(p);
        const n = cost().n;
        const moved = Math.hypot(at.x - home.x, at.d - home.d);
        if (n < current.n && (!best || n < best.n || (n === best.n && moved < best.moved))) best = { at, n, moved };
      }
      if (best) {
        p.x = best.at.x;
        p.d = best.at.d;
        reproject(p);
        current = cost();
        improved = true;
        break;
      }
      p.x = home.x;
      p.d = home.d;
      reproject(p);
      tried.add(label);
    }
    if (!improved) return;
  }
}

/**
 * A shared dish or bottle's spot: the free spot on the table that is closest to the farther of
 * the two diners' plates, so it sits within reach of both (Fernando, 2026-10-16). Spots between
 * the plates and the corner, where the diners' arms rest, cost extra.
 */
function settleShared(p: Placed, plates: [Anchor, Anchor], corner: Anchor, placed: Placed[], W: number, D: number, multi: { sku: string; clearance: number } | null, bottle?: Placed, gap = edgeGap): boolean {
  const [a, b] = plates;
  const mx = (a.x + b.x) / 2,
    md = (a.d + b.d) / 2;
  // The diagonal from the corner out through the plates' midpoint.
  const ux = mx - corner.x,
    ud = md - corner.d;
  const len = Math.hypot(ux, ud) || 1;
  let best: { x: number; d: number; cost: number } | null = null;
  for (let x = -W / 2; x <= W / 2 + 1e-9; x += 0.02) {
    for (let d = 0; d <= D + 1e-9; d += 0.02) {
      const q = { ...p, x, d };
      if (!onTable(q, W, D) || !placed.every((o) => gap(q, o) >= minGap(q, o, multi) - 1e-9)) continue;
      const along = ((x - corner.x) * ux + (d - corner.d) * ud) / len;
      // Nothing taller than the bottle's base stands in the camera's line to it (the camera looks
      // down the diagonal), so its label shows; a low dish may sit in front, as in a hero shot.
      const tall = !!bottle && p.item.def.height + p.item.extraHeight > LOW_IN_FRONT * (bottle.item.def.height + bottle.item.extraHeight);
      const inLine = tall && Math.abs(((x - bottle!.x) * ud - (d - bottle!.d) * ux) / len) < footprintRadius(p.item.def) + footprintRadius(bottle!.item.def) + 0.02;
      const cost = Math.max(Math.hypot(x - a.x, d - a.d), Math.hypot(x - b.x, d - b.d)) + 2 * Math.max(0, CORNER_KEEP + footprintRadius(p.item.def) - along) + (inLine ? 0.35 : 0) + 2 * Math.max(0, FRONT_STRIP - (d - footprintRadius(p.item.def)));
      if (!best || cost < best.cost) best = { x, d, cost };
    }
  }
  if (!best) return false;
  p.x = best.x;
  p.d = best.d;
  return true;
}

/** A dish lower than this share of a shared bottle's height may stand in front of it. */
const LOW_IN_FRONT = 0.3;
/** Shared dishes keep this far out from the table corner, where the two diners' elbows meet. */
const CORNER_KEEP = 0.3;
/** Shared dishes keep this far back from the table's near edge, so the table can run off the frame. */
const FRONT_STRIP = 0.12;

/** Nearest valid position to `want` for item `p`, spiralling outward. */
function settle(p: Placed, want: Anchor, placed: Placed[], W: number, D: number, multi: { sku: string; clearance: number } | null, gap = edgeGap): boolean {
  const ok = (x: number, d: number) => {
    const q = { ...p, x, d };
    if (!onTable(q, W, D)) return false;
    return placed.every((o) => gap(q, o) >= minGap(q, o, multi) - 1e-9);
  };
  if (ok(want.x, want.d)) {
    p.x = want.x;
    p.d = want.d;
    return true;
  }
  for (let rad = 0.01; rad <= 0.35; rad += 0.01) {
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const x = want.x + rad * Math.cos(a);
      const d = want.d + rad * Math.sin(a);
      if (ok(x, d)) {
        p.x = x;
        p.d = d;
        return true;
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Camera fit
// ---------------------------------------------------------------------------

interface Fit {
  cam: CameraParams;
  boxes: Map<string, ScreenBox>;
  sils: Map<string, Poly[]>;
  rearY: number;
}

function heroLabels(placed: Placed[]): string[] {
  return placed.filter((p) => p.item.kind === "main" || p.item.kind === "sku" || p.item.kind === "glass").map((p) => p.item.label);
}

function project(placed: Placed[], cam: CameraParams): { proj: Projector; boxes: Map<string, ScreenBox> } {
  const proj = new Projector(cam);
  const boxes = new Map<string, ScreenBox>();
  for (const p of placed) boxes.set(p.item.label, screenBox(proj, p.item.def, p.x, p.d, p.yaw, p.elev ?? 0, p.item.extraHeight));
  return { proj, boxes };
}

function unionBox(boxes: ScreenBox[]): { x0: number; x1: number; y0: number; y1: number } {
  return {
    x0: Math.min(...boxes.map((b) => b.x0)),
    x1: Math.max(...boxes.map((b) => b.x1)),
    y0: Math.min(...boxes.map((b) => b.y0)),
    y1: Math.max(...boxes.map((b) => b.y1)),
  };
}

/** The SKU may dip this share of its own width out of the vertical center third (user, 2026-10-06). */
const SKU_THIRD_DIP = 0.1;

/** How far past the center third's edges a hero drink may reach. */
function thirdSlack(label: string, b: ScreenBox): number {
  return label === "SKU" ? SKU_THIRD_DIP * (b.x1 - b.x0) : 0;
}

/** A drink inside the vertical center third (the SKU allowed its small dip). */
function inThird(label: string, b: ScreenBox): boolean {
  const slack = thirdSlack(label, b);
  return b.x0 >= 1 / 3 - slack - 1e-6 && b.x1 <= 2 / 3 + slack + 1e-6;
}

/** H14: the drinks sit inside the vertical center third and the entree's center does too. */
function inHeroZone(boxes: Map<string, ScreenBox>, heroes: string[]): boolean {
  const mb = boxes.get("MAIN")!;
  const mcx = (mb.x0 + mb.x1) / 2;
  if (mcx < 1 / 3 || mcx > 2 / 3) return false;
  return heroes.every((l) => l === "MAIN" || inThird(l, boxes.get(l)!));
}

/** Per-angle framing on top of the pitch (camera-options.json angle.hidden). */
interface Framing {
  /** Moves the camera this share of its fitted distance from the table's front edge (Low: 0.5). */
  setback_scale?: number;
  /** Lowest the table's front edge may sit in the frame (0 = bottom edge). Unset: the front edge may fall below the frame. */
  front_edge_min_y?: number;
  /** Highest the table's rear edge, and every item's base, may sit in the frame. Unset: 0.5, the horizon clamp (H1, H2). */
  rear_edge_max_y?: number;
}

const rearLimit = (f: Framing) => f.rear_edge_max_y ?? 0.5;

function fitCamera(placed: Placed[], D: number, focal: number, pitch: number, targetSpan: number, framing: Framing = {}): Fit | null {
  const heroes = heroLabels(placed);
  const heroPlaced = placed.filter((p) => heroes.includes(p.item.label));
  const xs = heroPlaced.flatMap((p) => [p.x - radiusOf(p), p.x + radiusOf(p)]);
  const tx0 = (Math.min(...xs) + Math.max(...xs)) / 2;
  const rearMax = rearLimit(framing);
  const frontMin = framing.front_edge_min_y;
  const cosP = Math.cos((pitch * Math.PI) / 180);
  // The camera aims at or behind the table's rear edge; when the front edge has to show, it may aim into the table.
  const tdMin = frontMin === undefined ? D : 0.3 * D;

  /**
   * The camera aimed at depth td from `dist` away, or null when a framing rule fails. Without `fixedX`
   * the hero group is re-centred; with it (the distance refinement) the aim stays put and the heroes
   * must already sit in the center third.
   */
  const frame = (td: number, dist: number, fixedX?: number): { fit: Fit; score: number } | null => {
    const strict = fixedX !== undefined;
    let tx = fixedX ?? tx0;
    let cam = makeCameraParams(focal, pitch, tx, td, dist);
    let { boxes, proj } = project(placed, cam);
    const main = placed.find((p) => p.item.kind === "main")!;
    const perMeter = () => (proj.project(main.x + 1, 0, main.d).x - proj.project(main.x - 1, 0, main.d).x) / 2;
    if (!strict) {
      // Re-center the hero group horizontally (two passes are enough).
      for (let it = 0; it < 2; it++) {
        const u = unionBox(heroes.map((l) => boxes.get(l)!));
        const cx = (u.x0 + u.x1) / 2;
        tx += (cx - 0.5) / perMeter();
        cam = makeCameraParams(focal, pitch, tx, td, dist);
        ({ boxes, proj } = project(placed, cam));
      }
      // A hero group wider than the center third (dish and drink only, framed tight) would push the
      // drink out on the right (H14): slide the group left so the drink stays in and the dish leads.
      const over = Math.max(...heroes.filter((l) => l !== "MAIN").map((l) => boxes.get(l)!.x1 - thirdSlack(l, boxes.get(l)!))) - (2 / 3 - 0.004);
      if (over > 0) {
        tx += over / perMeter();
        cam = makeCameraParams(focal, pitch, tx, td, dist);
        ({ boxes, proj } = project(placed, cam));
      }
    }
    const u = unionBox(heroes.map((l) => boxes.get(l)!));
    const rearY = proj.project(tx, 0, D).y;
    if (rearY > rearMax + 1e-6) return null;
    if (boxes.get("MAIN")!.y0 < MAIN_BOTTOM_MARGIN) return null;
    if (frontMin !== undefined && proj.project(tx, 0, 0).y < frontMin) return null;
    // Every base, and every low item in full, stays below the rear-edge limit (H2).
    if (placed.some((p) => (p.item.def.tall ? boxes.get(p.item.label)!.y0 : boxes.get(p.item.label)!.y1) > rearMax)) return null;
    if (u.y1 > 0.97) return null;
    if (strict && !inHeroZone(boxes, heroes)) return null;
    // Prefer framings that keep the heroes in the center third; widen a little rather than fail H14.
    const score = -Math.abs(u.x1 - u.x0 - targetSpan) - 0.3 * (rearMax - rearY) - (inHeroZone(boxes, heroes) ? 0 : 1);
    return { fit: { cam, boxes, sils: new Map(), rearY }, score };
  };

  let best: { fit: Fit; score: number } | null = null;
  const keep = (c: { fit: Fit; score: number } | null) => {
    if (c && (!best || c.score > best.score)) best = c;
  };
  for (let td = tdMin; td <= D + 0.6; td += 0.05) for (let dist = 0.3; dist <= 8; dist *= 1.04) keep(frame(td, dist));
  if (!best) return null;
  // Refine the distance in 0.5% steps around the coarse optimum.
  const c0 = (best as { fit: Fit }).fit.cam;
  const tdBest = -c0.target[2];
  const d0 = Math.hypot(c0.position[0] - c0.target[0], c0.position[1] - c0.target[1], c0.position[2] - c0.target[2]);
  for (let f = 0.94; f <= 1.06; f += 0.005) keep(frame(tdBest, d0 * f, c0.target[0]));
  if (framing.setback_scale !== undefined) {
    // Bring the camera this much closer to the table's front edge (z = 0), then re-aim, deeper or
    // shallower, to frame the heroes again. When the meal and drink no longer fit the center third
    // (H14) that close, step back in 5% steps until they do.
    const fitted = best as { fit: Fit; score: number };
    const setback0 = fitted.fit.cam.position[2];
    for (let k = framing.setback_scale; k < 1 + 1e-9; k += 0.05) {
      best = null;
      for (let td = tdMin; td <= D + 1.2; td += 0.01) keep(frame(td, (setback0 * k + td) / cosP));
      if (best && inHeroZone((best as { fit: Fit }).fit.boxes, heroes)) break;
    }
    best ??= fitted;
  }
  const fit = (best as { fit: Fit }).fit;
  const proj = new Projector(fit.cam);
  for (const p of placed) fit.sils.set(p.item.label, silhouette(proj, p.item.def, p.x, p.d, p.yaw, p.item.extraHeight));
  return fit;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

/** Share of `back`'s silhouette covered by `front`'s silhouette. */
function occludedFraction(front: Poly[], back: Poly[]): number {
  const a = back.reduce((s, p) => s + polyArea(p), 0);
  return a <= 0 ? 0 : Math.min(1, overlapArea(front, back) / a);
}

/** Most of a drink's silhouette a dish edge may cover when the overlap stays below the logo. */
const DRINK_BASE_OVERLAP_MAX = 0.25;
/** The bottom band of a drink that may be overlapped: the logo box starts at 35% of its height. */
const DRINK_BASE_BAND = 0.3;

/** Share of `back` covered by `front` above the drink's bottom band. */
function aboveBaseFraction(front: Poly[], back: Poly[], b: ScreenBox): number {
  const a = back.reduce((s, p) => s + polyArea(p), 0);
  if (a <= 0) return 0;
  const band = rectPoly({ x0: b.x0 - 1, x1: b.x1 + 1, y0: b.y0 + DRINK_BASE_BAND * (b.y1 - b.y0), y1: b.y1 + 1 });
  const upper = back.map((p) => clipConvex(p, band)).filter((p) => p.length >= 3);
  return Math.min(1, overlapArea(front, upper) / a);
}

export function logoBox(b: ScreenBox): ScreenBox {
  const h = b.y1 - b.y0;
  return { ...b, y0: b.y0 + 0.35 * h, y1: b.y0 + 0.75 * h };
}

/** Which item gives way when two collide: higher moves first. The entree never moves. */
const MOVE_PRIORITY: Record<string, number> = {
  main: -1,
  "shared-hero": 0,
  sku: 1,
  glass: 2,
  "napkin-set": 2,
  side: 3,
  "shared-side": 3,
  bread: 3,
  condiment: 4,
  accent: 5,
  "partner-main": 0.5,
  "partner-napkin": 2.5,
  "partner-sku": 1.5,
  "partner-glass": 2.5,
};

/** Rule failures that reject a layout (preferences don't). */
function blocking(rules: RuleResult[]): RuleResult[] {
  return rules.filter((r) => !r.pass && !r.soft);
}

function checkRules(placed: Placed[], fit: Fit, spec: SceneSpec): RuleResult[] {
  const out: RuleResult[] = [];
  const kindOf = new Map(placed.map((p) => [p.item.label, p.item.kind]));
  const movable = (labels: string[]) =>
    [...new Set(labels)].filter((l) => kindOf.get(l) !== "main").sort((a, b) => MOVE_PRIORITY[kindOf.get(b)!] - MOVE_PRIORITY[kindOf.get(a)!]);
  const B = fit.boxes;
  const get = (l: string) => placed.find((p) => p.item.label === l)!;
  const main = get("MAIN");
  const sku = get("SKU");
  const heroes = heroLabels(placed);

  const rearMax = rearLimit(angleById(spec.camera.angle).hidden);
  out.push({ id: "H1", name: "Horizon clamp", pass: fit.rearY <= rearMax + 1e-6, detail: `table rear edge at y = ${fit.rearY.toFixed(3)} (≤ ${rearMax.toFixed(2)})` });

  const low = placed.filter((p) => !p.item.def.tall);
  const lowOver = low.filter((p) => B.get(p.item.label)!.y1 > rearMax);
  const baseOver = placed.filter((p) => B.get(p.item.label)!.y0 > rearMax);
  out.push({
    id: "H2",
    name: "Table zone",
    pass: lowOver.length === 0 && baseOver.length === 0,
    detail: lowOver.length || baseOver.length ? `above the midline: ${[...lowOver, ...baseOver].map((p) => p.item.label).join(", ")}` : "every base and low item sits in the lower half; tall drinks may rise",
  });

  const skuRight = sku.x > main.x && (B.get("SKU")!.x0 + B.get("SKU")!.x1) / 2 > 0.5;
  out.push({ id: "H4", name: "SKU on the diner's right", pass: skuRight, detail: skuRight ? "SKU is right of MAIN, in the right half" : "SKU is not right of MAIN" });

  // H5: nothing covers the logo boxes; H7: no stacking along the line of sight.
  const logoHolders = placed.filter((p) => p.item.kind === "sku" || p.item.kind === "glass");
  const logoHits: string[] = [];
  const logoMove: string[] = [];
  for (const h of logoHolders) {
    const lb = logoBox(B.get(h.item.label)!);
    const lp = [rectPoly(lb)];
    const la = polyArea(lp[0]);
    for (const o of placed) {
      if (o === h) continue;
      if (B.get(o.item.label)!.depth >= lb.depth) continue;
      if (overlapArea(fit.sils.get(o.item.label)!, lp) > 0.02 * la) {
        logoHits.push(`${o.item.label} over ${h.item.label}`);
        logoMove.push(o.item.kind === "main" ? h.item.label : o.item.label);
      }
    }
  }
  out.push({ id: "H5", name: "Trademark clear zone", pass: logoHits.length === 0, detail: logoHits.length ? logoHits.join("; ") : "logo boxes unobstructed", offenders: movable(logoMove) });
  out.push({ id: "H6", name: "SKU head-on", pass: true, detail: "bottle and glass face the camera, upright" });

  const stack: string[] = [];
  const stackMove: string[] = [];
  for (const back of placed) {
    for (const front of placed) {
      if (front === back) continue;
      if (B.get(front.item.label)!.depth >= B.get(back.item.label)!.depth) continue;
      const frac = occludedFraction(fit.sils.get(front.item.label)!, fit.sils.get(back.item.label)!);
      // A dish edge may cover the bottom of the SKU or glass, below its logo (H5 keeps the logo itself clear).
      if ((back.item.kind === "sku" || back.item.kind === "glass") && frac <= DRINK_BASE_OVERLAP_MAX) {
        if (aboveBaseFraction(fit.sils.get(front.item.label)!, fit.sils.get(back.item.label)!, B.get(back.item.label)!) <= 0.01) continue;
      }
      const limit =
        back.item.kind === "sku" || back.item.kind === "glass"
          ? 0.08
          : back.item.kind === "main"
            ? 0.15
            : back.item.kind === "partner-main"
              ? 0.35
              : back.item.kind === "partner-sku" || back.item.kind === "partner-glass"
                ? 0.5
                : 0.3;
      if (frac > limit) {
        stack.push(`${front.item.label} hides ${Math.round(frac * 100)}% of ${back.item.label}`);
        // Move whichever of the two matters less; the entree never moves.
        stackMove.push(MOVE_PRIORITY[front.item.kind] >= MOVE_PRIORITY[back.item.kind] ? front.item.label : back.item.label);
      }
    }
  }
  out.push({ id: "H7", name: "No line-of-sight stacking", pass: stack.length === 0, detail: stack.length ? stack.join("; ") : "no item hidden behind another", offenders: movable(stackMove) });

  const cond = placed.filter((p) => p.item.kind === "condiment" || p.item.kind === "accent");
  const far = cond.filter((c) => {
    const partner = get(c.item.pairsWith ?? "MAIN") ?? main;
    const g = edgeGap(c, partner);
    return g < 0.02 || g > 0.08;
  });
  out.push({
    id: "H8",
    name: "Condiment proximity",
    pass: far.length === 0,
    detail: far.length ? `outside 1-3 in of their dish: ${far.map((c) => c.item.label).join(", ")}` : cond.length ? "condiments within 1-3 in of their dish" : "no condiments",
    offenders: movable(far.map((c) => c.item.label)),
  });
  // Depth hierarchy (coca-cola-guidelines.md §4.2, tableware reference §1): nothing stands in
  // front of the hero dish — supporting dishes, condiments and accents sit beside or behind it.
  // Only the flat napkin set and a second diner's own setting may come forward.
  const forward = placed.filter((p) => ["side", "shared-side", "bread", "shared-hero", "condiment", "accent"].includes(p.item.kind) && p.d < main.d - 0.02);
  out.push({
    id: "H3",
    name: "Depth hierarchy",
    pass: forward.length === 0,
    detail: forward.length ? `in front of the hero dish: ${forward.map((p) => p.item.label).join(", ")}` : "nothing sits in front of the hero dish",
    offenders: movable(forward.map((p) => p.item.label)),
  });
  const n = placed.length;
  // A preference, not a rule: an odd count composes better, but an even table is still a valid layout.
  out.push({ id: "H10", name: "Odd item count (preferred)", pass: n % 2 === 1, soft: true, detail: n % 2 === 1 ? `${n} items` : `${n} items — even; odd is preferred, not required` });

  const phys: string[] = [];
  const multi = isMultiServe(spec) ? { sku: "SKU", clearance: bottleClearance(spec.sku) } : null;
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      if (edgeGap(placed[i], placed[j]) < minGap(placed[i], placed[j], multi) - 1e-6) phys.push(`${placed[i].item.label}/${placed[j].item.label}`);
    }
  }
  out.push({ id: "H11", name: "Physical spacing", pass: phys.length === 0, detail: phys.length ? `too close: ${phys.join(", ")}` : "no overlaps, spacing rules met, everything on the surface" });

  const mb = B.get("MAIN")!;
  const mainOk = mb.x0 >= 0 && mb.x1 <= 1 && mb.y0 >= 0;
  out.push({ id: "H12", name: "Co-heroes visible", pass: mainOk, detail: mainOk ? "MAIN fully in frame" : "MAIN is cropped" });

  const drinks = heroes.filter((l) => l !== "MAIN");
  const mcx = (mb.x0 + mb.x1) / 2;
  const h14fails = drinks.filter((l) => !inThird(l, B.get(l)!));
  const mainIn = mcx >= 1 / 3 && mcx <= 2 / 3;
  out.push({
    id: "H14",
    name: "Hero zone: vertical center third",
    pass: h14fails.length === 0 && mainIn,
    detail: h14fails.length || !mainIn ? `outside the center third: ${[...h14fails, ...(mainIn ? [] : ["MAIN center"])].join(", ")}` : "MAIN and the drink(s) sit in the vertical center third",
  });

  // Second place setting (party "2"): MAIN_2 may crop at the frame edges (H7's partner-main
  // limit covers how much of it may be hidden), but most of it must still read on screen.
  const main2 = placed.find((p) => p.item.kind === "partner-main");
  if (main2) {
    const b2 = B.get(main2.item.label)!;
    const visX = Math.max(0, Math.min(1, b2.x1) - Math.max(0, b2.x0));
    const visY = Math.max(0, Math.min(1, b2.y1) - Math.max(0, b2.y0));
    const fullArea = Math.max(1e-6, (b2.x1 - b2.x0) * (b2.y1 - b2.y0));
    const frac = (visX * visY) / fullArea;
    out.push({
      id: "H15",
      name: "Second setting visible",
      pass: frac >= 0.6,
      detail: frac >= 0.6 ? `MAIN_2 is ${Math.round(frac * 100)}% inside the frame` : `MAIN_2 is only ${Math.round(frac * 100)}% inside the frame (need ≥60%)`,
      offenders: movable([main2.item.label]),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function area(b: ScreenBox): number {
  return Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);
}

function score(placed: Placed[], fit: Fit, archetype: Archetype, targetSpan: number): { total: number; terms: Record<string, number> } {
  const B = fit.boxes;
  const heroes = heroLabels(placed);
  const u = unionBox(heroes.map((l) => B.get(l)!));
  const span = u.x1 - u.x0;
  const mb = B.get("MAIN")!;
  const sb = B.get("SKU")!;
  const terms: Record<string, number> = {};
  terms.heroSpan = Math.max(0, 1 - Math.abs(span - targetSpan) / targetSpan);
  terms.phiAnchors = Math.max(0, 1 - (Math.abs((mb.x0 + mb.x1) / 2 - 0.4) + Math.abs((sb.x0 + sb.x1) / 2 - 0.6)) * 2);
  terms.horizonUse = Math.max(0, Math.min(1, 1 - (0.5 - fit.rearY) * 4));
  let cx = 0,
    tot = 0;
  for (const p of placed) {
    const b = B.get(p.item.label)!;
    const a = area(b);
    cx += ((b.x0 + b.x1) / 2) * a;
    tot += a;
  }
  terms.balance = Math.max(0, 1 - 2 * Math.abs(cx / tot - 0.5));
  const others = placed.filter((p) => !heroes.includes(p.item.label));
  const staggered = others.filter((p) => {
    return placed.every((o) => o === p || B.get(o.item.label)!.depth >= B.get(p.item.label)!.depth || occludedFraction(fit.sils.get(o.item.label)!, fit.sils.get(p.item.label)!) < 0.15);
  });
  terms.stagger = others.length ? staggered.length / others.length : 1;
  let minG = 0.05;
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) minG = Math.min(minG, edgeGap(placed[i], placed[j]));
  terms.breathingRoom = Math.max(0, Math.min(1, minG / 0.05));
  const layers = { L1: 0, L2: 0, L3: 0 };
  for (const p of placed) {
    const a = area(B.get(p.item.label)!);
    if (p.item.layer === "Layer_1_Primary_CoHero") layers.L1 += a;
    else if (p.item.layer === "Layer_2_Secondary_Side") layers.L2 += a;
    else layers.L3 += a;
  }
  const all3 = layers.L2 > 0 && layers.L3 > 0;
  const sum = layers.L1 + layers.L2 + layers.L3;
  terms.visualMass = all3 ? Math.max(0, 1 - (Math.abs(layers.L1 / sum - 0.5) + Math.abs(layers.L2 / sum - 0.3) + Math.abs(layers.L3 / sum - 0.2))) : 1;

  const w: Record<string, number> = { heroSpan: 0.2, phiAnchors: 0.15, horizonUse: 0.1, balance: 0.15, stagger: 0.15, breathingRoom: 0.1, visualMass: archetype === "feast-spread" ? 0.02 : 0.15 };
  let total = 0,
    wsum = 0;
  for (const k of Object.keys(w)) {
    total += w[k] * terms[k];
    wsum += w[k];
  }
  return { total: total / wsum, terms };
}

// ---------------------------------------------------------------------------
// Solve
// ---------------------------------------------------------------------------

export function signature(spec: SceneSpec): string {
  const items = sceneItems(spec);
  const l2 = items.filter((i) => i.layer === "Layer_2_Secondary_Side").map((i) => `${i.kind}:${i.proxyKey}`).sort();
  const l3 = items.filter((i) => i.layer === "Layer_3_Tertiary_Accent").map((i) => `${i.kind}:${i.proxyKey}`).sort();
  return [
    spec.camera.look,
    spec.camera.angle,
    `surface:${spec.scene.surface}`,
    `settings:${spec.scene.party === "2" ? 2 : 1}${spec.scene.seated ? `+seated:${spec.scene.pose ?? ""}` : ""}`,
    `sku:${spec.sku.id}`,
    `glass:${spec.sku.glass ? "Y" : "N"}`,
    `main:${spec.entree.plating.vessel}(${spec.entree.prep.massClass})${spec.entree.plating.service === "shared" ? "+shared" : ""}`,
    `L2:${l2.join(",") || "-"}`,
    `L3:${l3.join(",") || "-"}`,
  ].join(" | ");
}

function applicableArchetypes(items: ItemSpec[]): Archetype[] {
  // Two place settings: only the layouts built for a second diner apply, shared-hero or not.
  if (items.some((i) => i.kind.startsWith("partner-"))) return ["across-the-table", "across-offset", "corner"];
  // Dish and drink (with at most a napkin set): nothing to arrange around them, so the tight lockup is the layout.
  if (items.every((i) => i.kind === "main" || i.kind === "sku" || i.kind === "glass" || i.kind === "napkin-set")) return ["hero-lockup"];
  if (items.some((i) => i.kind === "shared-hero")) return ["feast-spread", "crescent-arc", "counterweight"];
  return ["triangle-loop", "crescent-arc", "diagonal-stagger", "counterweight"];
}

function solveArchetype(spec: SceneSpec, items: ItemSpec[], archetype: Archetype): LayoutOption | string {
  let best: LayoutOption | null = null;
  let firstError = "";
  for (const v of VARIANTS[archetype]) {
    const r = solveVariant(spec, items, archetype, v);
    if (typeof r === "string") firstError ||= r;
    else if (!best || r.blueprint.layout_meta.score > best.blueprint.layout_meta.score) best = r;
  }
  return best ?? firstError;
}

function solveVariant(spec: SceneSpec, items: ItemSpec[], archetype: Archetype, v: Variant): LayoutOption | string {
  const surf = SURFACES[spec.scene.surface];
  const W = surf.width,
    D = surf.depth;
  const want = preferredPositions(items, spec, archetype, v);
  const multi = isMultiServe(spec) ? { sku: "SKU", clearance: bottleClearance(spec.sku) } : null;

  // Heroes first, then Layer 2, then Layer 3, so the important items get their preferred spots.
  const order = [...items].sort((a, b) => a.layer.localeCompare(b.layer));
  const placed: Placed[] = [];
  for (const it of order) {
    const p: Placed = { item: it, x: 0, d: 0, yaw: 0 };
    const w = want.get(it.label) ?? { x: 0, d: D / 2 };
    if (!settle(p, w, placed, W, D, multi)) return `no room for ${it.label} on ${spec.scene.surface}`;
    placed.push(p);
  }
  // Second place setting: turn the partner's plate and napkin to face the hero's seat —
  // 180 degrees opposite, 90 degrees at the corner.
  if (items.some((i) => i.kind === "partner-main")) {
    const partnerYaw = archetype === "corner" ? 90 : 180;
    for (const p of placed) if (p.item.kind.startsWith("partner-")) p.yaw = partnerYaw;
  }
  // Push the whole setting toward the back of the table, like a photographer
  // would: the empty front of the table then falls below the frame, and the
  // table's rear edge (the horizon) sits just behind the rearmost item.
  // An angle that shows the table's front edge keeps the setting at the diner's edge instead.
  const rear = Math.max(...placed.map((p) => p.d + radiusOf(p)));
  const showsFront = angleById(spec.camera.angle).hidden.front_edge_min_y !== undefined;
  const shift = showsFront ? 0 : Math.max(0, D - REAR_MARGIN - rear);
  for (const p of placed) p.d += shift;
  const main = placed.find((p) => p.item.kind === "main")!;

  const look = lookById(spec.camera.look);
  const angle = angleById(spec.camera.angle);
  const hasL2 = items.some((i) => i.layer === "Layer_2_Secondary_Side");
  const spans = layoutPreferences.hero_span_target;
  const targetSpan = hasL2 ? spans.with_sides : spans.meal_and_drink_only;
  const fit = fitCamera(placed, D, look.hidden.focal_length_mm, angle.hidden.pitch_deg, targetSpan, angle.hidden);
  if (!fit) return "no camera position keeps the table in the lower half with the entree in frame";

  let rules = checkRules(placed, fit, spec);
  if (blocking(rules).length) {
    // Find the crowded items another home before giving up on this arrangement.
    repair(placed, fit, spec, W, D, multi);
    rules = checkRules(placed, fit, spec);
  }
  const failed = blocking(rules);
  if (failed.length) return failed.map((r) => `${r.id} ${r.name}: ${r.detail}`).join(" · ");

  const { total, terms } = score(placed, fit, archetype, targetSpan);
  const blueprint = toBlueprint(spec, placed, fit, archetype, total, terms, rules, D, W, main);
  return { archetype, blueprint };
}

function toBlueprint(
  spec: SceneSpec,
  placed: Placed[],
  fit: Fit,
  archetype: Archetype,
  total: number,
  terms: Record<string, number>,
  rules: RuleResult[],
  D: number,
  W: number,
  main: Placed,
): Blueprint {
  const proj = new Projector(fit.cam);
  const prims: Primitive[] = placed.map((p) => {
    const b = fit.boxes.get(p.item.label)!;
    const c = proj.project(p.x, (p.elev ?? 0) + (p.item.def.height + p.item.extraHeight) / 2, p.d);
    const def = p.item.def;
    const round = def.radius !== undefined;
    const shape: Primitive["shape_type"] = def.tall ? "cylinder" : round ? "flattened_cylinder" : "bounding_box";
    return {
      id: p.item.label,
      component_name: p.item.name,
      layer: p.item.layer,
      shape_type: shape,
      center_coordinates: { x: +(2 * c.x - 1).toFixed(4), y: +c.y.toFixed(4), z: +((p.d / D) * 0.5).toFixed(4) },
      dimensions: {
        width: +(round ? 2 * def.radius! : def.width!).toFixed(3),
        height: +(def.height + p.item.extraHeight).toFixed(3),
        depth: +(round ? 2 * def.radius! : def.depth!).toFixed(3),
      },
      rotation_euler_deg: { pitch: 0, yaw: p.yaw, roll: 0 },
      ...(p.item.kind === "napkin-set" ? { directional_vector_target_id: "MAIN" } : {}),
      ...(p.item.kind === "partner-napkin" ? { directional_vector_target_id: "MAIN_2" } : {}),
      role: p.item.kind,
      proxy: p.item.proxyKey,
      ...(p.item.pairsWith ? { pairs_with: p.item.pairsWith } : {}),
      ...(p.item.injected ? { injected: true } : {}),
      ...(p.item.footprint ? { footprint: p.item.footprint } : {}),
      ...(p.item.sameAs ? { same_as: p.item.sameAs } : {}),
      ...(p.heldBy ? { held_by: p.heldBy } : {}),
      world: { x: +p.x.toFixed(4), d: +p.d.toFixed(4), yawDeg: p.yaw, elevation: +(p.elev ?? 0).toFixed(4) },
      screen_bbox: { x0: +b.x0.toFixed(4), y0: +b.y0.toFixed(4), x1: +b.x1.toFixed(4), y1: +b.y1.toFixed(4) },
    };
  });
  const info = ARCHETYPE_INFO[archetype];
  const span = (() => {
    const hs = heroLabels(placed).map((l) => fit.boxes.get(l)!);
    return unionBox(hs).x1 - unionBox(hs).x0;
  })();
  const skuB = fit.boxes.get("SKU")!;
  const idea = describe(archetype, placed);
  const rationale = `${info.name}: ${idea}. Hero group spans ${Math.round(span * 100)}% of the frame width; the ${spec.sku.package === "can" ? "can" : "bottle"} stands ${Math.round((skuB.y1 - skuB.y0) * 100)}% of frame height; table edge at ${Math.round(fit.rearY * 100)}% height.`;
  void main;
  return {
    canvas_metadata: { aspect_ratio: "16:9", shopper_zone: "Impulse" },
    camera_spec: { pitch_angle_degrees: fit.cam.pitchDeg, focal_length_mm: fit.cam.focalLengthMm, aperture: depthById(spec.camera.depth).aperture },
    horizon_clamp: { max_table_rear_y_normalized: +fit.rearY.toFixed(4) },
    visual_mass_distribution: { primary_co_heroes_pct: 50, secondary_sides_pct: 30, tertiary_accents_pct: 20 },
    primitives: prims,
    table: { surface: spec.scene.surface, width: W, depth: D },
    camera: fit.cam,
    frame: { units: { x_span_m: W, z_span_m: D } },
    layout_meta: {
      archetype: info.name,
      rationale,
      score: +total.toFixed(4),
      scoreTerms: Object.fromEntries(Object.entries(terms).map(([k, v]) => [k, +v.toFixed(3)])),
      rule_results: rules,
      signature: signature(spec),
      seed: 0,
    },
  };
}

export function describe(archetype: Archetype, placed: Placed[]): string {
  const sides = placed.filter((p) => p.item.kind === "side" || p.item.kind === "shared-side");
  const accent = placed.find((p) => p.item.kind === "accent");
  const cond = placed.filter((p) => p.item.kind === "condiment");
  const one = sides.length === 1 || (!sides.length && !!accent && !cond.length);
  const what = sides.length ? (sides.length === 1 ? "the side dish" : "the side dishes") : accent ? "the accent" : cond.length ? "the condiments" : "the supporting items";
  const v = (singular: string, plural: string) => (one ? singular : plural);
  switch (archetype) {
    case "triangle-loop":
      return `the entree, the drink and ${sides.length ? "a far-left side dish" : accent ? "a far-left accent" : "a small far-left item"} form a depth triangle`;
    case "crescent-arc":
      return `${what} ${v("wraps", "wrap")} in an arc behind the entree`;
    case "diagonal-stagger":
      return `${what} ${v("steps", "step")} back on a diagonal that leads the eye to the drink`;
    case "counterweight":
      return `${what} ${v("sits", "sit")} on the left, balancing the drink on the right`;
    case "feast-spread":
      return "the shared centerpiece sits back-left with shared sides around it, and one plated setting in front";
    case "hero-lockup":
      return placed.some((p) => p.item.kind === "napkin-set")
        ? "the dish front and center with the drink tucked in tight at its right, and the napkin set on the left"
        : "the dish front and center with the drink tucked in tight at its right";
    case "across-the-table":
      return "a second place setting sits directly opposite the hero, across the table";
    case "across-offset":
      return "a second place setting sits across the table, shifted aside so the hero's drink doesn't hide it";
    case "seated-solo":
      return "one person at the table mid-meal, their plate in front of them, the Coca-Cola beside it";
    case "seated-across":
      return "two people face each other across the table, the near one seen from behind over their shoulder at the left, the other across the table at the right";
    case "corner":
    case "seated-corner": {
      const who = archetype === "corner" ? "the two place settings meet" : "two people sit";
      const drinks = placed.some((p) => p.item.kind === "partner-sku")
        ? "each diner's own Coca-Cola and glass at 3 o'clock from their plate, on their right"
        : `the Coca-Cola product in front between ${archetype === "corner" ? "the plates" : "their plates"}`;
      return `${who} at a right angle around the table's far corner, one on the long side and one at the end, with ${drinks}`;
    }
  }
}

export function layoutDistance(a: Blueprint, b: Blueprint): number {
  // Heroes and the napkin set are placed by fixed rules, so they don't count toward "different".
  const fixed = new Set(["MAIN", "SKU", "GLASS", "NAPKIN_SET_1"]);
  const pa = a.primitives.filter((p) => !fixed.has(p.id));
  if (!pa.length) return 0;
  let sum = 0;
  for (const p of pa) {
    const q = b.primitives.find((x) => x.id === p.id);
    if (!q || !p.screen_bbox || !q.screen_bbox) continue;
    const ca = [(p.screen_bbox.x0 + p.screen_bbox.x1) / 2, (p.screen_bbox.y0 + p.screen_bbox.y1) / 2];
    const cb = [(q.screen_bbox.x0 + q.screen_bbox.x1) / 2, (q.screen_bbox.y0 + q.screen_bbox.y1) / 2];
    sum += Math.hypot(ca[0] - cb[0], ca[1] - cb[1]);
  }
  return sum / pa.length;
}

/** Mean screen displacement (fraction of frame) the movable items need between two options. */
export const MIN_OPTION_DISTANCE = 0.08;

export function solve(spec: SceneSpec, maxOptions = 3): SolveResult {
  const first = solveSpec(spec, maxOptions);
  if (first.options.length || !spec.accent) return { ...first, spec, notes: [] };
  // The accent only exists to make the count odd, which is a preference: when
  // no layout has room for it, leave it out rather than offer nothing.
  const without = { ...spec, accent: null };
  const second = solveSpec(without, maxOptions);
  if (!second.options.length) return { ...first, spec, notes: [] };
  return {
    ...second,
    spec: without,
    notes: [`No layout had room for the accent (${spec.accent.name}), so it was left out. The table has an even number of items, which is fine.`],
  };
}

function solveSpec(spec: SceneSpec, maxOptions: number): Pick<SolveResult, "options" | "infeasible"> {
  const items = sceneItems(spec);
  const infeasible: SolveResult["infeasible"] = [];
  if (spec.scene.party === "1" && spec.scene.solo) {
    // One person at the table (Fernando, 2026-10-27).
    const r = solveSolo(spec, items, spec.scene.solo);
    return typeof r === "string" ? { options: [], infeasible: [{ archetype: "seated-solo", reason: r }] } : { options: [r], infeasible };
  }
  if (spec.scene.party === "2" && spec.scene.seated && spec.scene.seating === "across") {
    // The one exception to the corner rule (Fernando, 2026-10-27): two people face each other,
    // seen over the near person's shoulder.
    const r = solveSeatedAcross(spec, items);
    return typeof r === "string" ? { options: [], infeasible: [{ archetype: "seated-across", reason: r }] } : { options: [r], infeasible };
  }
  if (spec.scene.party === "2") {
    // Two diners always sit at a right angle around a corner, never opposite each other
    // (Fernando, 2026-10-16): the far-left or the far-right corner, with or without people shown.
    const options: LayoutOption[] = [];
    for (const side of [-1, 1] as const) {
      // A shared large bottle tries each foreground spot until one leaves it and the plates in view.
      // Strictest framing first (FRAMING_LEVELS), then each bottle spot at that level.
      let r: LayoutOption | string = "";
      levels: for (let level = 0; level < FRAMING_LEVELS.length; level++) {
        // Without people the bottle first goes where both diners reach it (null), then the list.
        for (const spot of isMultiServe(spec) ? [...(spec.scene.seated ? [] : [null]), ...SHARED_BOTTLE_SPOTS] : [null]) {
          r = solveSeatedCorner(spec, items, side, spot, level);
          if (typeof r !== "string") break levels;
        }
      }
      if (typeof r === "string") infeasible.push({ archetype: spec.scene.seated ? "seated-corner" : "corner", reason: r });
      else options.push(r);
    }
    return { options: options.slice(0, maxOptions), infeasible };
  }
  const candidates: LayoutOption[] = [];
  for (const a of applicableArchetypes(items)) {
    const r = solveArchetype(spec, items, a);
    if (typeof r === "string") infeasible.push({ archetype: a, reason: r });
    else candidates.push(r);
  }
  // House-style preference (rules/layout-preferences.json) only affects ordering.
  const bonus = (o: LayoutOption) => (layoutPreferences.archetype_bonus as Record<string, number>)[o.archetype] ?? 0;
  candidates.sort((a, b) => b.blueprint.layout_meta.score + bonus(b) - (a.blueprint.layout_meta.score + bonus(a)));
  if (process.env.SOLVER_DEBUG) {
    for (const a of candidates) console.log("cand", a.archetype, a.blueprint.layout_meta.score, candidates.map((b) => layoutDistance(a.blueprint, b.blueprint).toFixed(3)).join(" "));
  }
  const options: LayoutOption[] = [];
  for (const c of candidates) {
    if (options.length >= maxOptions) break;
    // Never pad: an option must differ visibly from every option already picked.
    if (options.every((o) => layoutDistance(o.blueprint, c.blueprint) >= MIN_OPTION_DISTANCE)) options.push(c);
  }
  return { options, infeasible };
}

// ---------------------------------------------------------------------------
// Seated corner: two people at the table (staging, 2026-10-15)
// ---------------------------------------------------------------------------

/**
 * A seated person for framing: shoulders, chair and forearms on the table, from the seat
 * (SEAT_DROP below the tabletop) to the top of the head. The renderer draws the figure itself.
 */
export const SEATED_PERSON: ProxyDef = { kind: "seated-person", width: 0.5, depth: 0.55, height: 1.0 };
/** The chair seat sits this far below the tabletop (45 cm seat, 75 cm table, a cushion's give). */
export const SEAT_DROP = 0.45;
/** How far a seated person's center sits back from the table edge. */
const SEAT_BACK = 0.3;
/** A seated person's nose and shoulder line, in their own frame (above the seat; forward is -z). */
const NOSE: readonly [number, number, number] = [0, 0.8, -0.2];
const SHOULDER: readonly [number, number, number] = [0, 0.6, -0.1];
/**
 * A seated diner's eye, above the tabletop. At Low and Diner's eye the corner camera without
 * people stays at or below it (Fernando, 2026-10-17): pulled back and raised to fit both places, it stood at about
 * 1.5 m and shrank the table setting against the room.
 */
const SEATED_EYE = 0.5;
/** The camera's yaw off the table's axis, toward the corner it faces. */
const CORNER_YAW = 45;

interface Seat {
  id: string;
  name: string;
  x: number;
  d: number;
  yaw: number;
}

/** A camera aimed at (tx, ty, -td) from `dist` away, turned `yawDeg` off the table's axis. */
function yawedCamera(focal: number, pitchDeg: number, yawDeg: number, tx: number, ty: number, td: number, dist: number): CameraParams {
  const p = (pitchDeg * Math.PI) / 180;
  const y = (yawDeg * Math.PI) / 180;
  const target: [number, number, number] = [tx, ty, -td];
  const position: [number, number, number] = [tx + dist * Math.cos(p) * Math.sin(y), ty + dist * Math.sin(p), -td + dist * Math.cos(p) * Math.cos(y)];
  return { focalLengthMm: focal, fovDeg: fovFromFocal(focal), pitchDeg, aspect: ASPECT, position, target };
}

/**
 * Two people around a far corner of the table (side -1: far-left, +1: far-right): PERSON_1 on the
 * far long side facing the camera, PERSON_2 at the table's end facing across, each with their own
 * plate, napkin and drink, and the hero Coca-Cola product in front between the plates. The camera
 * looks at that corner from the opposite side, turned 45 degrees, so the corner sits near the
 * middle of the frame and both people show in three-quarter view. The one-diner rules (H1-H14)
 * assume a straight-on camera and an empty chair, so they aren't checked here yet.
 */
/**
 * Foreground spots for a shared large bottle, as (along, across) from the corner: beside the
 * plates first, so it covers neither; the camera check rejects any spot that hides a plate.
 */
const SHARED_BOTTLE_SPOTS: Array<[number, number]> = [
  // On the diagonal first: the middle of the frame, within reach of both (Fernando, 2026-10-16).
  [0.95, 0],
  [0.85, 0],
  [1.05, 0],
  [0.95, 0.1],
  [0.95, -0.1],
  [0.85, 0.5],
  [0.85, -0.5],
  [0.75, 0.6],
  [0.75, -0.6],
  [1.0, 0.3],
  [1.0, -0.3],
  [1.0, 0.05],
];

/**
 * Framing wishes for the corner layouts, strictest first (Fernando, 2026-10-16): `mid` keeps a
 * shared bottle in the middle third of the frame, `cover` runs the table off the frame's bottom
 * corner on the near side so no floor shows there. A layout drops them, in this order, only
 * when no camera can manage them.
 */
const FRAMING_LEVELS = [
  { mid: true, cover: true },
  { mid: true, cover: false },
  { mid: false, cover: true },
  { mid: false, cover: false },
];

function solveSeatedCorner(spec: SceneSpec, items: ItemSpec[], side: -1 | 1, bottleSpot: [number, number] | null = null, level = 0): LayoutOption | string {
  // Without people the same corner holds the two place settings; only the figures, the pose and
  // the face crop drop out.
  const withPeople = !!spec.scene.seated;
  const archetype: Archetype = withPeople ? "seated-corner" : "corner";
  const surf = SURFACES[spec.scene.surface];
  const W = surf.width,
    D = surf.depth;
  const cx = (side * W) / 2; // the corner's x
  const inward = -side; // toward the table's middle, in x
  const main = items.find((i) => i.kind === "main");
  if (!main) return "no entree to seat around";
  const r1 = footprintRadius(main.def);
  // Without people, the first diner slides along the long side, opening the corner for what the
  // two share (Fernando, 2026-10-17); furthest when they share a large bottle.
  const spread = withPeople ? 0 : isMultiServe(spec) ? 0.5 : 0.3;
  const m1 = { x: cx + inward * (r1 + 0.3 + spread), d: D - r1 - 0.07 };
  const m2 = { x: cx + inward * (r1 + 0.07), d: D - r1 - 0.36 };
  const want = new Map<string, Anchor>();
  /** A second spot to try when an item's first one has no room. */
  const fallback = new Map<string, Anchor>();
  want.set("MAIN", m1);
  want.set("MAIN_2", m2);
  const drinkZone = { x: cx + inward * (r1 + 0.42), d: D - r1 - 0.42 };
  // A spot on the table measured from the corner: `along` the diagonal into the table (toward the
  // camera), `across` it (positive toward PERSON_1's plate).
  const fromCorner = (along: number, across: number) => ({ x: cx + inward * ((along + across) / Math.SQRT2), d: D + (across - along) / Math.SQRT2 });
  const sharedBottle = isMultiServe(spec);
  const sharedDish = items.some((i) => i.kind === "shared-hero");
  // A diner's own drink and glass stand at 3 o'clock from their plate, on the diner's right
  // (Fernando, 2026-10-17): 12 o'clock points away from the diner across the plate. The bottle takes
  // the side nearer the camera (half past 2 or half past 3) so the glass never stands in front of it.
  const facing1 = [0, -1] as const; // PERSON_1, on the far long side, faces the camera side
  const facing2 = [inward, 0] as const; // PERSON_2, at the end, faces along the table
  const towardCamera = [inward / Math.SQRT2, -1 / Math.SQRT2] as const;
  const clock = (plate: Anchor, f: readonly [number, number], hours: number, dist: number): Anchor => {
    const t = (hours * Math.PI) / 6;
    const right = [f[1], -f[0]]; // the diner's right, a quarter turn clockwise from facing
    return { x: plate.x + dist * (Math.cos(t) * f[0] + Math.sin(t) * right[0]!), d: plate.d + dist * (Math.cos(t) * f[1] + Math.sin(t) * right[1]!) };
  };
  const ownDrinks = (plate: Anchor, f: readonly [number, number], bottle: ItemSpec | undefined, glass: ItemSpec | undefined) => {
    const near = (a: Anchor) => a.x * towardCamera[0] + a.d * towardCamera[1];
    const reach = (it: ItemSpec) => r1 + 0.03 + footprintRadius(it.def);
    const at = (it: ItemSpec, h: number) => clock(plate, f, h, reach(it));
    const [hb, hg] = !glass || !bottle ? [3, 3] : near(clock(plate, f, 2.5, 1)) >= near(clock(plate, f, 3.5, 1)) ? [2.5, 3.5] : [3.5, 2.5];
    if (bottle) want.set(bottle.label, at(bottle, hb));
    if (glass) want.set(glass.label, at(glass, hg));
  };
  if (!sharedBottle) {
    ownDrinks(m1, facing1, items.find((i) => i.kind === "sku"), items.find((i) => i.kind === "glass"));
    ownDrinks(m2, facing2, items.find((i) => i.kind === "partner-sku"), items.find((i) => i.kind === "partner-glass"));
  }
  let extra = 0,
    shared = 0;
  for (const it of items) {
    if (want.has(it.label)) continue;
    const half = (it.def.width ?? 2 * (it.def.radius ?? 0.05)) / 2;
    switch (it.kind) {
      case "napkin-set": // PERSON_1's place, on the side away from the corner, tucked in close
        want.set(it.label, { x: m1.x + inward * (r1 + 0.03 + half), d: m1.d });
        break;
      case "partner-napkin": // PERSON_2's place
        // On their left (9 o'clock), the way the first diner's sits, leaving their right for the
        // drink; turned 90°, so its width runs along d.
        want.set(it.label, clock(m2, facing2, 9, r1 + 0.03 + half));
        break;
      case "shared-hero": {
        // A family-style dish sits in the open table past both plates, diagonally out from the
        // corner, so it reads as the centre of the meal between the two people.
        // With a shared bottle on the diagonal, the dish sits beside it on the second diner's side.
        const rh = footprintRadius(it.def);
        want.set(it.label, sharedBottle ? fromCorner(0.8 + 0.5 * rh, -(0.1 + rh)) : fromCorner(0.72 + rh, 0));
        fallback.set(it.label, { x: cx + inward * (2 * r1 + 0.28 + rh), d: Math.max(rh + 0.04, D - 2 * r1 - 0.3 - rh * 0.5) });
        break;
      }
      case "sku":
        if (!sharedBottle) break; // at 3 o'clock, above
        // A shared large bottle stands in the foreground between the two plates, where nothing
        // stands in front of it (Fernando, 2026-10-16); beside a shared dish when there is one.
        want.set(it.label, sharedBottle ? fromCorner(...(bottleSpot ?? (sharedDish ? [0.8, 0.3] : [1.0, 0.05]))) : drinkZone);
        break;
      case "glass":
        if (!sharedBottle) break;
        // With a shared bottle up front, each glass stands beside its own plate, behind the bottle;
        // without people, on the corner side of the first diner's plate, which has moved along.
        if (sharedBottle) fallback.set(it.label, { x: drinkZone.x + inward * 0.1, d: drinkZone.d + 0.02 });
        want.set(it.label, sharedBottle ? (withPeople ? fromCorner(0.62, 0.4) : { x: m1.x - inward * (r1 + 0.07), d: m1.d }) : { x: drinkZone.x + inward * 0.1, d: drinkZone.d + 0.02 });
        break;
      case "partner-sku": // at 3 o'clock, above
        break;
      case "partner-glass":
        if (sharedBottle) {
          // Beside the second diner's plate, toward the corner, clear of the dishes in front.
          want.set(it.label, { x: m2.x + inward * 0.04, d: m2.d + r1 + 0.08 });
          fallback.set(it.label, { x: m2.x + inward * 0.13, d: m2.d - r1 - 0.2 });
        }
        break;
      case "shared-side":
      case "bread": {
        // Shared dishes sit within reach of both diners (Fernando, 2026-10-16): on the diagonal out
        // from the corner, between the two plates, alternating to either side of it.
        // Around the centre of the meal in front of the corner: the first on the first diner's side
        // of the diagonal, the next on the second diner's, then a step further out.
        const k = shared++;
        const rk = footprintRadius(it.def);
        const hasCentre = sharedBottle || sharedDish;
        const across = hasCentre ? 0.1 + rk + (k % 2 && sharedDish ? 0.25 : 0) : k === 0 ? 0 : 0.1 + rk;
        want.set(it.label, fromCorner(0.7 + 0.5 * rk + 0.2 * Math.floor(k / 2), k % 2 ? -across : across));
        fallback.set(it.label, { x: m1.x + inward * (0.3 + 0.08 * Math.cos((extra * 55 * Math.PI) / 180)), d: D - 0.25 - 0.12 * Math.sin((extra++ * 55 * Math.PI) / 180) });
        break;
      }
      default: {
        // Condiments and the accent fan out in the open table past the drinks.
        const a = (extra++ * 55 * Math.PI) / 180;
        want.set(it.label, { x: m1.x + inward * (0.3 + 0.08 * Math.cos(a)), d: D - 0.25 - 0.12 * Math.sin(a) });
      }
    }
  }

  const multi = isMultiServe(spec) ? { sku: "SKU", clearance: bottleClearance(spec.sku) } : null;
  // Without people, everything the two diners share goes where both can reach it: the shared
  // dish, the shared sides, bread and sauces (Fernando, 2026-10-17), and a shared bottle (unless a
  // fallback spot is being tried).
  const byReach = (it: ItemSpec) =>
    !withPeople && (["shared-hero", "shared-side", "bread", "condiment"].includes(it.kind) || (it.kind === "sku" && sharedBottle && !bottleSpot));
  // A shared bottle placed by reach takes the middle first; the shared dish then sits beside it.
  const firsts = byReach({ kind: "sku" } as ItemSpec) ? ["sku", "shared-hero"] : ["shared-hero", "sku"];
  // Napkins and cutlery come last (Fernando, 2026-10-17): on a full table, a bread basket or a
  // shared dish gets the room and a napkin set that no longer fits is left out.
  const napkin = (i: ItemSpec) => i.kind === "napkin-set" || i.kind === "partner-napkin";
  const rank = (i: ItemSpec) => (napkin(i) ? 100 : ["main", "partner-main", ...firsts, "glass", "partner-sku", "partner-glass", "bread", "shared-side"].indexOf(i.kind));
  const order = [...items].sort((a, b) => (rank(a) < 0 ? 99 : rank(a)) - (rank(b) < 0 ? 99 : rank(b)));
  const placed: Placed[] = [];
  const dropped: string[] = [];
  for (const it of order) {
    // PERSON_1's things face the camera side of the table; PERSON_2's face across from the end.
    // Turned before settling, so a partner napkin's long side runs along the table end.
    // Without people the shared tray turns too, its long side across the corner's diagonal
    // (Fernando, 2026-10-17).
    const turned = it.kind.startsWith("partner-") || (!withPeople && it.kind === "shared-hero");
    const p: Placed = { item: it, x: 0, d: 0, yaw: turned ? (side < 0 ? 90 : -90) : 180 };
    const spot = want.get(it.label) ?? drinkZone;
    const alt = fallback.get(it.label);
    if (byReach(it)) {
      const a = placed.find((q) => q.item.label === "MAIN"),
        b = placed.find((q) => q.item.label === "MAIN_2");
      const bottle = it.kind === "sku" ? undefined : placed.find((q) => q.item.label === multi?.sku);
      if (a && b && settleShared(p, [a, b], { x: cx, d: D }, placed, W, D, multi, bottle, shapeGap)) {
        placed.push(p);
        continue;
      }
    }
    if (!settle(p, spot, placed, W, D, multi, shapeGap) && !(alt && settle(p, alt, placed, W, D, multi, shapeGap))) {
      if (napkin(it)) {
        dropped.push(it.label);
        continue;
      }
      return `no room for ${it.label} at the ${side < 0 ? "left" : "right"} corner of ${spec.scene.surface}`;
    }
    placed.push(p);
  }
  const P1 = placed.find((p) => p.item.label === "MAIN")!;
  const P2 = placed.find((p) => p.item.label === "MAIN_2");
  if (!P2) return "a seated corner needs the second diner's plate";
  const seats: Seat[] = [
    { id: "PERSON_1", name: "the first diner, seated on the table's far side", x: P1.x, d: D + SEAT_BACK, yaw: 180 },
    { id: "PERSON_2", name: "the second diner, seated at the table's end", x: cx - inward * SEAT_BACK, d: P2.d, yaw: side < 0 ? 90 : -90 },
  ];

  // The pose: each person who holds their drink takes it off the table into the hand nearer the
  // other person (a glass for a large SKU, the bottle or can for a small one).
  const pose = poseById(spec.scene.pose);
  for (const s of withPeople ? seats : []) {
    const pp = pose.people[s.id as PersonId];
    const label = pp?.holds ? heldLabel(spec, placed.map((p) => p.item.label), s.id as PersonId) : null;
    const drink = placed.find((p) => p.item.label === label);
    if (!pp || !drink) continue;
    const self = { x: s.x, d: s.d, yawDeg: s.yaw };
    const sx = sideToward(self, seats.find((o) => o.id !== s.id)!);
    // A little in front of the palm, so the fingers wrap around it.
    const grip = holdingHand(pp);
    const hand = toWorld(self, [grip.hand[0], grip.hand[1], grip.hand[2] - 0.03], (sx * grip.side) as 1 | -1);
    const h = drink.item.def.height + drink.item.extraHeight;
    const base = hand.y - SEAT_DROP - 0.4 * h; // the hand grips it a little below the middle
    drink.x = hand.x;
    drink.d = hand.d;
    drink.elev = base < 0.05 ? 0 : base; // low enough, it stands on the table with a hand around it
    drink.heldBy = s.id;
  }
  // Two drinks held toward each other (cheers) touch at the rims side by side as the camera sees
  // them, never one hidden behind the other.
  const held = placed.filter((p) => p.heldBy);
  if (held.length === 2) {
    const [a, b] = held as [Placed, Placed];
    const yr = (-side * CORNER_YAW * Math.PI) / 180;
    const right = [Math.cos(yr), Math.sin(yr)] as const; // the camera's right, as (dx, dd)
    const mx = (a.x + b.x) / 2,
      md = (a.d + b.d) / 2;
    const half = (radiusOf(a) + radiusOf(b) + 0.005) / 2;
    // Each drink stays on its holder's side, so the arms don't cross.
    const along = (p: Placed) => {
      const seat = seats.find((q) => q.id === p.heldBy)!;
      return seat.x * right[0] + seat.d * right[1];
    };
    const [l, r] = along(a) <= along(b) ? [a, b] : [b, a];
    l.x = mx - right[0] * half;
    l.d = md - right[1] * half;
    r.x = mx + right[0] * half;
    r.d = md + right[1] * half;
  }

  // Frame like the brand's meal photography (Fernando's references, 2026-10-16): the food and the
  // Coca-Cola sharp in front, the two people behind them seen from the shoulders to the hands, the
  // top edge cropping each face between the chin and the nose so nobody is recognizable.
  const look = lookById(spec.camera.look);
  const pitch = angleById(spec.camera.angle).hidden.pitch_deg;
  const focal = look.hidden.focal_length_mm;
  // Without people the camera may also turn less than 45 degrees, looking more across the long
  // side, so the table's near edge runs off the bottom of the frame.
  const yaws = (withPeople ? [CORNER_YAW] : [CORNER_YAW, 35, 25]).map((a) => -side * a);
  const boxesFor = (cam: CameraParams) => {
    const proj = new Projector(cam);
    const people = seats.map((s) => screenBox(proj, SEATED_PERSON, s.x, s.d, s.yaw, -SEAT_DROP));
    const at = (s: Seat, v: readonly [number, number, number]) => {
      const w = toWorld({ x: s.x, d: s.d, yawDeg: s.yaw }, v, 1);
      return proj.project(w.x, w.y - SEAT_DROP, w.d);
    };
    // Nose and shoulders as the proxy draws them (torso leaning in toward the table).
    const heads = seats.map((s) => ({ nose: at(s, NOSE), shoulder: at(s, SHOULDER) }));
    const table = placed.map((p) => screenBox(proj, p.item.def, p.x, p.d, p.yaw, p.elev ?? 0, p.item.extraHeight));
    return { proj, people, heads, table };
  };
  // The plates, the shared dish and the drinks must show whole; shared sides and bread may run off
  // the frame's edges but keep their middle in it; napkins, a diner's own sides and condiments may leave it.
  const heroIdx = placed.flatMap((p, i) => (["main", "partner-main", "sku", "glass", "partner-sku", "partner-glass", "shared-hero"].includes(p.item.kind) ? [i] : []));
  const sideIdx = placed.flatMap((p, i) => (["shared-side", "bread"].includes(p.item.kind) ? [i] : []));
  // A shared dish in the middle needs more of the table around it (Fernando, 2026-10-16).
  // Strictest first: a wide margin for a shared meal, then the standard one, then a fuller foreground.
  // The shared bottle shows whole: nothing nearer the camera may cover more than a sliver of it.
  const bottleIdx = multi ? placed.findIndex((p) => p.item.label === multi.sku) : -1;
  const plateIdx = placed.flatMap((p, i) => (p.item.kind === "main" || p.item.kind === "partner-main" || p.item.kind === "shared-hero" ? [i] : []));
  // `low`: only the part above a low dish's height counts, so a tray in front of the bottle's
  // base doesn't count against it.
  const blocked = (boxes: ScreenBox[], i: number, by?: number, low = 0) => {
    const b0 = boxes[i]!;
    const t = { ...b0, y0: b0.y0 + low * (b0.y1 - b0.y0) };
    const area = (t.x1 - t.x0) * (t.y1 - t.y0);
    let covered = 0;
    boxes.forEach((o, j) => {
      if (j === i || (by !== undefined && j !== by) || o.depth >= t.depth) return;
      const w = Math.min(o.x1, t.x1) - Math.max(o.x0, t.x0);
      const h = Math.min(o.y1, t.y1) - Math.max(o.y0, t.y0);
      if (w > 0 && h > 0) covered = Math.max(covered, (w * h) / area);
    });
    return covered;
  };
  const sharedMeal = placed.some((p) => p.item.kind === "shared-hero" || p.item.kind === "shared-side");
  const { mid, cover } = FRAMING_LEVELS[level]!;
  const tries = [...(sharedMeal ? [{ margin: 0.08, low: 0.3 }] : []), { margin: 0.03, low: 0.3 }, { margin: 0.03, low: 0.45 }];
  // On the table top, or within its front edge's thickness.
  const onTop = (q: { x: number; d: number } | null) => !!q && Math.abs(q.x) <= W / 2 && q.d >= -0.03 && q.d <= D;
  const all = [...placed.map((p) => ({ x: p.x, d: p.d })), ...(withPeople ? seats : [])];
  const tx0 = all.reduce((a, q) => a + q.x, 0) / all.length;
  const td0 = all.reduce((a, q) => a + q.d, 0) / all.length;
  let best: { cam: CameraParams; score: number } | null = null;
  for (const { margin, low } of tries) {
    if (best) break;
    for (const yaw of yaws) {
    if (best) break;
    for (let ty = -0.4; ty <= 0.4 + 1e-9; ty += 0.05) {
      for (let dist = 1; dist <= 7; dist *= 1.03) {
        let tx = tx0,
          td = td0;
        if (!withPeople && pitch <= 20 && ty + dist * Math.sin((pitch * Math.PI) / 180) > SEATED_EYE) break;
        let cam = yawedCamera(focal, pitch, yaw, tx, ty, td, dist);
        // Re-centre horizontally along the camera's right vector (two passes).
        for (let k = 0; k < 2; k++) {
          const b = boxesFor(cam);
          const u = unionBox(heroIdx.map((i) => b.table[i]!));
          const right = [Math.cos((yaw * Math.PI) / 180), Math.sin((yaw * Math.PI) / 180)]; // the camera's right, as (dx, dd)
          const s0 = b.proj.project(tx, ty, td).x;
          const s1 = b.proj.project(tx + right[0]! * 0.1, ty, td + right[1]! * 0.1).x;
          const perM = (s1 - s0) / 0.1;
          if (Math.abs(perM) < 1e-6) break;
          const shift = ((u.x0 + u.x1) / 2 - 0.5) / perM;
          tx += right[0]! * shift;
          td += right[1]! * shift;
          cam = yawedCamera(focal, pitch, yaw, tx, ty, td, dist);
        }
        const b = boxesFor(cam);
        const heroes = heroIdx.map((i) => b.table[i]!);
        const u = unionBox(heroes);
        const heroLow = Math.min(...heroes.map((q) => q.y0));
        const tableLow = Math.min(...b.table.map((q) => q.y0));
        const nose = Math.min(...b.heads.map((h) => h.nose.y));
        const shoulder = Math.max(...b.heads.map((h) => h.shoulder.y));
        const bodies = b.heads.map((h) => h.shoulder.x);
        // With people, a tall shared bottle may run off the top, as in the references; without them
        // it is the hero and shows whole, cap included. Everything else always shows whole.
        const top = Math.max(...heroIdx.filter((i) => !withPeople || placed[i]!.item.label !== multi?.sku).map((i) => b.table[i]!.y1));
        if (u.x0 < margin || u.x1 > 1 - margin || heroLow < margin || top > 0.99) continue;
        if (sideIdx.some((i) => (b.table[i]!.x0 + b.table[i]!.x1) / 2 > 0.95 || (b.table[i]!.x0 + b.table[i]!.x1) / 2 < 0.05 || (b.table[i]!.y0 + b.table[i]!.y1) / 2 < 0.05)) continue;
        if (bottleIdx >= 0 && (blocked(b.table, bottleIdx, undefined, LOW_IN_FRONT) > 0.08 || plateIdx.some((i) => blocked(b.table, i, bottleIdx) > 0.25))) continue;
        // The shared bottle is the hero both diners share: it stands in the middle third of the frame.
        if (mid && bottleIdx >= 0) {
          const c = (b.table[bottleIdx]!.x0 + b.table[bottleIdx]!.x1) / 2;
          if (c < 1 / 3 || c > 2 / 3) continue;
        }
        // The table runs off the frame's bottom corner on the near side (Fernando, 2026-10-16), so
        // no floor shows there and the far side, where the diners eat, gets the room.
        if (cover && !onTop(b.proj.ground(side < 0 ? 0.01 : 0.99, 0.01))) continue;
        // The table fills the bottom of the frame (no empty foreground), the faces are cropped at
        // the top, and like the references the people may run off the sides.
        if (tableLow > low) continue;
        if (withPeople && (nose < 1.01 || shoulder > 1 || Math.min(...bodies) < -0.1 || Math.max(...bodies) > 1.1)) continue;
        // Tightest framing wins; among equals, the crop line just under the noses.
        const score = -dist - (withPeople ? 0.5 * Math.abs(nose - 1.05) : 0);
        if (!best || score > best.score) best = { cam, score };
        break;
      }
    }
  }
  }
  if (!best) return withPeople ? "no camera frames the table with both faces cropped at the top" : "no camera frames both place settings at the corner";
  const cam = best.cam;
  const { boxes, proj } = project(placed, cam);
  const sils = new Map<string, Poly[]>();
  for (const p of placed) sils.set(p.item.label, silhouette(proj, p.item.def, p.x, p.d, p.yaw, p.item.extraHeight));
  const fit: Fit = { cam, boxes, sils, rearY: proj.project(cx, 0, D).y };
  const rules: RuleResult[] = [
    {
      id: "S1",
      name: withPeople ? "Seated corner" : "Corner seating",
      pass: true,
      soft: true,
      detail: `Two ${withPeople ? "people seated" : "place settings"} at the corner; the one-diner framing rules (H1-H14) aren't checked on this layout yet.`,
    },
  ];
  const bp = toBlueprint(spec, placed, fit, archetype, 0, {}, rules, D, W, P1);
  if (withPeople) bp.layout_meta.pose = pose.id;
  for (const s of withPeople ? seats : []) {
    const b = screenBox(proj, SEATED_PERSON, s.x, s.d, s.yaw, -SEAT_DROP);
    const c = proj.project(s.x, 0.2, s.d);
    bp.primitives.push({
      id: s.id,
      component_name: s.name,
      layer: "Layer_2_Secondary_Side",
      shape_type: "bounding_box",
      center_coordinates: { x: +(2 * c.x - 1).toFixed(4), y: +c.y.toFixed(4), z: +((s.d / D) * 0.5).toFixed(4) },
      dimensions: { width: SEATED_PERSON.width!, height: SEATED_PERSON.height, depth: SEATED_PERSON.depth! },
      rotation_euler_deg: { pitch: 0, yaw: s.yaw, roll: 0 },
      role: "person",
      proxy: "seated-person",
      world: { x: +s.x.toFixed(4), d: +s.d.toFixed(4), yawDeg: s.yaw, elevation: -SEAT_DROP },
      screen_bbox: { x0: +b.x0.toFixed(4), y0: +b.y0.toFixed(4), x1: +b.x1.toFixed(4), y1: +b.y1.toFixed(4) },
    });
  }
  bp.layout_meta.rationale = withPeople
    ? `Seated Corner (${side < 0 ? "far-left" : "far-right"} corner): ${describe("seated-corner", placed)}. The camera faces that corner from across the table, so both people show in three-quarter view.`
    : `Corner Seating (${side < 0 ? "far-left" : "far-right"} corner): ${describe("corner", placed)}. The camera faces that corner from across the table.`;
  if (dropped.length) bp.layout_meta.rationale += ` The table was full, so the napkin and cutlery (${dropped.join(", ")}) were left out.`;
  return { archetype, blueprint: bp };
}

// ---------------------------------------------------------------------------
// Over the shoulder: two people facing each other (Fernando, 2026-10-27)
// ---------------------------------------------------------------------------

/** The near person's seat: left of centre, so the camera looks past their right shoulder. */
const ACROSS_P1_X = -0.45;
/** The far person's seat: right of centre, across the table. */
const ACROSS_P2_X = 0.15;

/**
 * Two people face each other across the table, after Fernando's reference (2026-10-27): PERSON_1
 * sits on the near side at the left of the frame, seen three-quarters from behind, soft in the
 * foreground; PERSON_2 sits across the table at the right, facing the camera, the top edge
 * cropping their face between the chin and the nose. Each has their own plate, napkin and drink
 * at 3 o'clock; shared dishes sit between them. The camera stands behind PERSON_1's right
 * shoulder and looks across the table.
 */
function solveSeatedAcross(spec: SceneSpec, items: ItemSpec[]): LayoutOption | string {
  const archetype: Archetype = "seated-across";
  const surf = SURFACES[spec.scene.surface];
  const W = surf.width,
    D = surf.depth;
  const main = items.find((i) => i.kind === "main");
  if (!main) return "no entree to seat around";
  const r1 = footprintRadius(main.def);
  // PERSON_1's plate sits a little inside their seat, toward the middle of the frame.
  const m1 = { x: ACROSS_P1_X + 0.12, d: r1 + 0.07 };
  const m2 = { x: ACROSS_P2_X, d: D - r1 - 0.07 };
  const facing1 = [0, 1] as const; // PERSON_1 faces away from the camera
  const facing2 = [0, -1] as const; // PERSON_2 faces the camera
  const clock = (plate: Anchor, f: readonly [number, number], hours: number, dist: number): Anchor => {
    const t = (hours * Math.PI) / 6;
    const right = [f[1], -f[0]];
    return { x: plate.x + dist * (Math.cos(t) * f[0] + Math.sin(t) * right[0]!), d: plate.d + dist * (Math.cos(t) * f[1] + Math.sin(t) * right[1]!) };
  };
  const want = new Map<string, Anchor>();
  want.set("MAIN", m1);
  want.set("MAIN_2", m2);
  const sharedBottle = isMultiServe(spec);
  const mid = { x: (m1.x + m2.x) / 2 + 0.12, d: D / 2 };
  let shared = 0,
    extra = 0;
  for (const it of items) {
    if (want.has(it.label)) continue;
    const half = (it.def.width ?? 2 * (it.def.radius ?? 0.05)) / 2;
    const reach = r1 + 0.03 + footprintRadius(it.def);
    switch (it.kind) {
      case "napkin-set":
        want.set(it.label, clock(m1, facing1, 9, r1 + 0.03 + half));
        break;
      case "partner-napkin":
        want.set(it.label, clock(m2, facing2, 9, r1 + 0.03 + half));
        break;
      case "sku":
        // A shared large bottle stands between the two, in front of the far plate. A single serve
        // stands at 4 o'clock from PERSON_1's plate, toward the camera and clear of their arm
        // (Fernando, 2026-10-27).
        want.set(it.label, sharedBottle ? { x: mid.x + 0.1, d: mid.d - 0.05 } : clock(m1, facing1, 4, reach + 0.08));
        break;
      case "glass":
        want.set(it.label, sharedBottle ? clock(m1, facing1, 2.5, reach) : clock(m1, facing1, 3.5, reach));
        break;
      case "partner-sku":
        want.set(it.label, clock(m2, facing2, 3.5, reach));
        break;
      case "partner-glass":
        want.set(it.label, sharedBottle ? clock(m2, facing2, 3.5, reach) : clock(m2, facing2, 2.5, reach));
        break;
      case "shared-hero":
        want.set(it.label, mid);
        break;
      case "shared-side":
      case "bread": {
        const k = shared++;
        want.set(it.label, { x: mid.x + (k % 2 ? -1 : 1) * (0.2 + 0.1 * Math.floor(k / 2)), d: mid.d });
        break;
      }
      default: {
        const a = (extra++ * 55 * Math.PI) / 180;
        want.set(it.label, { x: m1.x + 0.32 * Math.cos(a), d: mid.d + 0.1 * Math.sin(a) });
      }
    }
  }

  const multi = sharedBottle ? { sku: "SKU", clearance: bottleClearance(spec.sku) } : null;
  const napkin = (i: ItemSpec) => i.kind === "napkin-set" || i.kind === "partner-napkin";
  const rank = (i: ItemSpec) => (napkin(i) ? 100 : ["main", "partner-main", "shared-hero", "sku", "glass", "partner-sku", "partner-glass", "bread", "shared-side"].indexOf(i.kind));
  const order = [...items].sort((a, b) => (rank(a) < 0 ? 99 : rank(a)) - (rank(b) < 0 ? 99 : rank(b)));
  const placed: Placed[] = [];
  const dropped: string[] = [];
  for (const it of order) {
    // PERSON_2's things face the camera; PERSON_1's face away from it.
    const p: Placed = { item: it, x: 0, d: 0, yaw: it.kind.startsWith("partner-") ? 180 : 0 };
    if (!settle(p, want.get(it.label) ?? mid, placed, W, D, multi)) {
      if (napkin(it)) {
        dropped.push(it.label);
        continue;
      }
      return `no room for ${it.label} on ${spec.scene.surface}`;
    }
    placed.push(p);
  }
  const P1 = placed.find((p) => p.item.label === "MAIN")!;
  const seats: Seat[] = [
    { id: "PERSON_1", name: "the first diner, seated on the near side with their back to the camera", x: ACROSS_P1_X, d: -SEAT_BACK, yaw: 0 },
    { id: "PERSON_2", name: "the second diner, seated across the table facing the camera", x: ACROSS_P2_X, d: D + SEAT_BACK, yaw: 180 },
  ];

  // The pose, as at the corner: whoever holds their drink takes it into the hand nearer the other.
  const pose = poseById(spec.scene.pose);
  for (const s of seats) {
    const pp = pose.people[poseRole(s.id, "across", pose)];
    const label = pp?.holds ? heldLabel(spec, placed.map((p) => p.item.label), s.id as PersonId) : null;
    const drink = placed.find((p) => p.item.label === label);
    if (!pp || !drink) continue;
    const self = { x: s.x, d: s.d, yawDeg: s.yaw };
    const sx = sideToward(self, seats.find((o) => o.id !== s.id)!);
    const grip = holdingHand(pp);
    const hand = toWorld(self, [grip.hand[0], grip.hand[1], grip.hand[2] - 0.03], (sx * grip.side) as 1 | -1);
    const h = drink.item.def.height + drink.item.extraHeight;
    const base = hand.y - SEAT_DROP - 0.4 * h;
    drink.x = hand.x;
    drink.d = hand.d;
    drink.elev = base < 0.05 ? 0 : base;
    drink.heldBy = s.id;
  }
  // Cheers: the two drinks meet over the table at the rims, side by side across the frame, each
  // on its holder's side (PERSON_1 at the left), never one hidden behind the other.
  const held = placed.filter((p) => p.heldBy);
  if (held.length === 2) {
    const [a, b] = held as [Placed, Placed];
    const mx = (a.x + b.x) / 2,
      md = (a.d + b.d) / 2;
    const half = (radiusOf(a) + radiusOf(b) + 0.005) / 2;
    const [l, r] = a.heldBy === "PERSON_1" ? [a, b] : [b, a];
    l.x = mx - half;
    r.x = mx + half;
    l.d = r.d = md;
  }

  // The camera stands behind PERSON_1's right shoulder, turned a little toward PERSON_2.
  const look = lookById(spec.camera.look);
  const pitch = angleById(spec.camera.angle).hidden.pitch_deg;
  const focal = look.hidden.focal_length_mm;
  const heroIdx = placed.flatMap((p, i) => (["main", "partner-main", "sku", "glass", "partner-sku", "partner-glass", "shared-hero"].includes(p.item.kind) ? [i] : []));
  const at = (proj: Projector, s: Seat, v: readonly [number, number, number]) => {
    const w = toWorld({ x: s.x, d: s.d, yawDeg: s.yaw }, v, 1);
    return proj.project(w.x, w.y - SEAT_DROP, w.d);
  };
  const [s1, s2] = seats as [Seat, Seat];
  let best: { cam: CameraParams; score: number } | null = null;
  // The table at an angle (Fernando, 2026-10-27): the most turned camera that frames the shot wins.
  for (const yaw of [30, -30, 25, -25, 20, -20, 15, -15, 10, -10, 0]) {
    if (best) break;
    for (let tx = -0.4; tx <= 0.4 + 1e-9; tx += 0.05) {
      for (let ty = -0.2; ty <= 0.4 + 1e-9; ty += 0.05) {
        for (let dist = 0.8; dist <= 4; dist *= 1.03) {
          const cam = yawedCamera(focal, pitch, yaw, tx, ty, D / 2, dist);
          const [cx, , cz] = cam.position;
          // Behind PERSON_1 and past their right shoulder, so their head never blocks the view.
          if (-cz > s1.d - 0.1 || cx < s1.x + 0.3) continue;
          const proj = new Projector(cam);
          const boxes = placed.map((p) => screenBox(proj, p.item.def, p.x, p.d, p.yaw, p.elev ?? 0, p.item.extraHeight));
          const heroes = heroIdx.map((i) => boxes[i]!);
          const u = unionBox(heroes);
          if (u.x0 < 0.03 || u.x1 > 0.97 || u.y0 < 0.03 || u.y1 > 0.97) continue;
          // PERSON_2: face cropped by the top edge between the chin and the nose, shoulders in frame, right of centre.
          const nose2 = at(proj, s2, NOSE),
            shoulder2 = at(proj, s2, SHOULDER);
          if (nose2.y < 1.01 || shoulder2.y > 0.99 || shoulder2.x < 0.5 || shoulder2.x > 0.85) continue;
          // PERSON_1: a shoulder and the back of the head in the left foreground, nearer than
          // PERSON_2, clear of the food and the drinks.
          const shoulder1 = at(proj, s1, SHOULDER),
            head1 = at(proj, s1, NOSE);
          if (shoulder1.x < 0.0 || shoulder1.x > 0.22 || shoulder1.depth >= shoulder2.depth) continue;
          if (head1.x + 0.08 > Math.min(...heroIdx.filter((i) => !placed[i]!.heldBy).map((i) => boxes[i]!.x0))) continue;
          // The table fills the bottom of the frame and the food sits low in it, no empty foreground.
          if (Math.min(...boxes.map((b) => b.y0)) > 0.35 || u.y0 > 0.2) continue;
          const score = -dist - 0.5 * Math.abs(nose2.y - 1.05) - 0.3 * Math.abs(shoulder1.x - 0.12);
          if (!best || score > best.score) best = { cam, score };
          break;
        }
      }
    }
  }
  // From Low 10 degrees the food sits mid-frame above the table's legs, so no camera passes.
  if (!best) return "no camera sees across the table over the near person's shoulder with the far face cropped at the top; try Diner's eye or Looking down";
  const cam = best.cam;
  const { boxes, proj } = project(placed, cam);
  const sils = new Map<string, Poly[]>();
  for (const p of placed) sils.set(p.item.label, silhouette(proj, p.item.def, p.x, p.d, p.yaw, p.item.extraHeight));
  const fit: Fit = { cam, boxes, sils, rearY: proj.project(0, 0, D).y };
  const rules: RuleResult[] = [
    { id: "S2", name: "Over the shoulder", pass: true, soft: true, detail: "Two people facing each other across the table; the one-diner framing rules (H1-H14) aren't checked on this layout yet." },
  ];
  const bp = toBlueprint(spec, placed, fit, archetype, 0, {}, rules, D, W, P1);
  bp.layout_meta.pose = pose.id;
  bp.layout_meta.seating = "across";
  for (const s of seats) {
    const b = screenBox(proj, SEATED_PERSON, s.x, s.d, s.yaw, -SEAT_DROP);
    const c = proj.project(s.x, 0.2, s.d);
    bp.primitives.push({
      id: s.id,
      component_name: s.name,
      layer: "Layer_2_Secondary_Side",
      shape_type: "bounding_box",
      center_coordinates: { x: +(2 * c.x - 1).toFixed(4), y: +c.y.toFixed(4), z: +((s.d / D) * 0.5).toFixed(4) },
      dimensions: { width: SEATED_PERSON.width!, height: SEATED_PERSON.height, depth: SEATED_PERSON.depth! },
      rotation_euler_deg: { pitch: 0, yaw: s.yaw, roll: 0 },
      role: "person",
      proxy: "seated-person",
      world: { x: +s.x.toFixed(4), d: +s.d.toFixed(4), yawDeg: s.yaw, elevation: -SEAT_DROP },
      screen_bbox: { x0: +b.x0.toFixed(4), y0: +b.y0.toFixed(4), x1: +b.x1.toFixed(4), y1: +b.y1.toFixed(4) },
    });
  }
  bp.layout_meta.rationale = `Over the shoulder: ${describe(archetype, placed)}. The camera stands behind the near person's right shoulder and looks across the table.`;
  if (dropped.length) bp.layout_meta.rationale += ` The table was full, so the napkin and cutlery (${dropped.join(", ")}) were left out.`;
  return { archetype, blueprint: bp };
}

// ---------------------------------------------------------------------------
// One person at the table (Fernando, 2026-10-27)
// ---------------------------------------------------------------------------

/**
 * One person at the table, mid-meal, in three versions:
 * - "facing": across the table facing the camera, the top edge cropping the face between the chin
 *   and the nose; their plate in front of them, the Coca-Cola at their left (the camera's right) in hand.
 * - "shoulder": in the near-left foreground seen three-quarters from behind, as in Over the
 *   shoulder; their plate and drink beyond their shoulder.
 * - "hands": across the table like "facing", framed tighter so only their forearms and hands
 *   come into the frame from the top.
 */
function solveSolo(spec: SceneSpec, items: ItemSpec[], mode: "facing" | "shoulder" | "hands"): LayoutOption | string {
  const archetype: Archetype = "seated-solo";
  const surf = SURFACES[spec.scene.surface];
  const W = surf.width,
    D = surf.depth;
  const main = items.find((i) => i.kind === "main");
  if (!main) return "no entree to seat around";
  const r1 = footprintRadius(main.def);
  // Behind: seen from behind at the near-left. Hands: seated at the near-right, beside the camera,
  // so only their arm reaches into the frame.
  const behind = mode === "shoulder" || mode === "hands";
  const seat: Seat =
    mode === "shoulder"
      ? { id: "PERSON_1", name: "the diner, seated on the near side with their back to the camera", x: -0.45, d: -SEAT_BACK, yaw: 0 }
      : mode === "hands"
        ? { id: "PERSON_1", name: "the diner, seated on the near side just out of frame, only their hand and forearm in the picture", x: 0.5, d: -SEAT_BACK, yaw: 0 }
        : { id: "PERSON_1", name: "the diner, seated across the table facing the camera", x: 0, d: D + SEAT_BACK, yaw: 180 };
  const facing = (behind ? [0, 1] : [0, -1]) as readonly [number, number];
  const m = mode === "shoulder" ? { x: seat.x + 0.12, d: r1 + 0.07 } : mode === "hands" ? { x: -0.1, d: r1 + 0.1 } : { x: 0, d: D - r1 - 0.07 };
  const clock = (plate: Anchor, hours: number, dist: number): Anchor => {
    const t = (hours * Math.PI) / 6;
    const right = [facing[1], -facing[0]];
    return { x: plate.x + dist * (Math.cos(t) * facing[0] + Math.sin(t) * right[0]!), d: plate.d + dist * (Math.cos(t) * facing[1] + Math.sin(t) * right[1]!) };
  };
  const want = new Map<string, Anchor>();
  want.set("MAIN", m);
  // Shared dishes and sides fan out between the plate and the camera (facing) or past the plate (behind).
  const fanD = behind ? m.d + r1 + 0.15 : m.d - r1 - 0.15;
  let k = 0;
  for (const it of items) {
    if (want.has(it.label)) continue;
    const reach = r1 + 0.03 + footprintRadius(it.def);
    const half = (it.def.width ?? 2 * (it.def.radius ?? 0.05)) / 2;
    switch (it.kind) {
      case "sku":
        // Facing: at their left, the camera's right, in their hand. Behind: toward the camera at 4 o'clock.
        want.set(it.label, behind ? clock(m, 4, reach + 0.08) : clock(m, 9, reach));
        break;
      case "glass":
        want.set(it.label, behind ? clock(m, 3, reach + 0.02) : clock(m, 10, reach + 0.04));
        break;
      case "napkin-set":
        want.set(it.label, clock(m, behind ? 9 : 3, r1 + 0.03 + half));
        break;
      default: {
        const i = k++;
        want.set(it.label, { x: m.x + (i % 2 ? -1 : 1) * (0.18 + 0.12 * Math.floor(i / 2)) + (behind ? 0.2 : 0), d: fanD });
      }
    }
  }
  const multi = isMultiServe(spec) ? { sku: "SKU", clearance: bottleClearance(spec.sku) } : null;
  const napkin = (i: ItemSpec) => i.kind === "napkin-set";
  const rank = (i: ItemSpec) => (napkin(i) ? 100 : ["main", "sku", "glass", "side", "bread", "shared-side"].indexOf(i.kind));
  const order = [...items].sort((a, b) => (rank(a) < 0 ? 99 : rank(a)) - (rank(b) < 0 ? 99 : rank(b)));
  const placed: Placed[] = [];
  const dropped: string[] = [];
  for (const it of order) {
    const p: Placed = { item: it, x: 0, d: 0, yaw: behind ? 0 : 180 };
    if (!settle(p, want.get(it.label) ?? { x: m.x, d: fanD }, placed, W, D, multi)) {
      if (napkin(it)) {
        dropped.push(it.label);
        continue;
      }
      return `no room for ${it.label} on ${spec.scene.surface}`;
    }
    placed.push(p);
  }
  const P1 = placed.find((p) => p.item.label === "MAIN")!;

  const pose = poseById(mode === "shoulder" ? "solo-from-behind" : mode === "hands" ? "solo-hands" : "solo-enjoying");
  const pp = pose.people.PERSON_1;
  if (pp.holds) {
    const label = heldLabel(spec, placed.map((p) => p.item.label), "PERSON_1");
    const drink = placed.find((p) => p.item.label === label);
    if (drink) {
      const grip = holdingHand(pp);
      const hand = toWorld({ x: seat.x, d: seat.d, yawDeg: seat.yaw }, [grip.hand[0], grip.hand[1], grip.hand[2] - 0.03], grip.side);
      const h = drink.item.def.height + drink.item.extraHeight;
      const base = hand.y - SEAT_DROP - 0.4 * h;
      drink.x = hand.x;
      drink.d = hand.d;
      drink.elev = base < 0.05 ? 0 : base;
      drink.heldBy = "PERSON_1";
    }
  }

  const look = lookById(spec.camera.look);
  const pitch = angleById(spec.camera.angle).hidden.pitch_deg;
  const focal = look.hidden.focal_length_mm;
  const heroIdx = placed.flatMap((p, i) => (["main", "sku", "glass"].includes(p.item.kind) ? [i] : []));
  const at = (proj: Projector, v: readonly [number, number, number]) => {
    const w = toWorld({ x: seat.x, d: seat.d, yawDeg: seat.yaw }, v, 1);
    return proj.project(w.x, w.y - SEAT_DROP, w.d);
  };
  const handAt = (proj: Projector, v: readonly [number, number, number], sx: 1 | -1) => {
    const w = toWorld({ x: seat.x, d: seat.d, yawDeg: seat.yaw }, v, sx);
    return proj.project(w.x, w.y - SEAT_DROP, w.d);
  };
  let best: { cam: CameraParams; score: number } | null = null;
  const yaws = behind ? [30, -30, 25, -25, 20, -20, 15, -15, 10, -10, 0] : [20, -20, 15, -15, 10, -10, 0];
  for (const yaw of yaws) {
    if (best) break;
    for (let tx = -0.4; tx <= 0.4 + 1e-9; tx += 0.05) {
      for (let ty = -0.2; ty <= 0.4 + 1e-9; ty += 0.05) {
        for (let dist = 0.6; dist <= 4; dist *= 1.03) {
          const cam = yawedCamera(focal, pitch, yaw, tx, ty, D / 2, dist);
          const [cx, , cz] = cam.position;
          if (mode === "shoulder" && (-cz > seat.d - 0.1 || cx < seat.x + 0.3)) continue;
          if (mode === "hands" && (-cz > -0.05 || cx > seat.x - 0.25)) continue;
          if (!behind && -cz > -0.05) continue; // in front of the table
          const proj = new Projector(cam);
          const boxes = placed.map((p) => screenBox(proj, p.item.def, p.x, p.d, p.yaw, p.elev ?? 0, p.item.extraHeight));
          const u = unionBox(heroIdx.map((i) => boxes[i]!));
          if (u.x0 < 0.05 || u.x1 > 0.95 || u.y0 < 0.03 || u.y1 > 0.97) continue;
          const nose = at(proj, NOSE),
            shoulder = at(proj, SHOULDER);
          if (mode === "facing") {
            // Face cropped between the chin and the nose, shoulders in frame, near the middle.
            if (nose.y < 1.01 || shoulder.y > 0.99 || shoulder.x < 0.3 || shoulder.x > 0.7) continue;
          } else if (mode === "hands") {
            // The body off the frame's right edge (or behind the camera); the reaching hand well inside it.
            const reach = handAt(proj, pp.far.hand, -1);
            // A body point is out of the picture when it is behind the camera or off the right edge.
            const fwd = [cam.target[0] - cx, cam.target[1] - cam.position[1], cam.target[2] - cz];
            const out = (v: readonly [number, number, number]) => {
              const w = toWorld({ x: seat.x, d: seat.d, yawDeg: seat.yaw }, v, 1);
              const ahead = (w.x - cx) * fwd[0]! + (w.y - SEAT_DROP - cam.position[1]) * fwd[1]! + (-w.d - cz) * fwd[2]! > 0;
              return !ahead || proj.project(w.x, w.y - SEAT_DROP, w.d).x > 1.05;
            };
            if (!out(SHOULDER) || !out(NOSE) || reach.x > 0.85 || reach.x < 0.3 || reach.y < 0.1 || reach.y > 0.9) continue;
          } else {
            const head = at(proj, NOSE);
            if (shoulder.x < 0 || shoulder.x > 0.22) continue;
            if (head.x + 0.08 > Math.min(...heroIdx.filter((i) => !placed[i]!.heldBy).map((i) => boxes[i]!.x0))) continue;
          }
          if (Math.min(...boxes.map((b) => b.y0)) > 0.35 || u.y0 > 0.25) continue;
          const score = -dist - (mode === "facing" ? 0.5 * Math.abs(nose.y - 1.05) : 0);
          if (!best || score > best.score) best = { cam, score };
          break;
        }
      }
    }
  }
  if (!best) return `no camera frames one person ${mode === "shoulder" ? "over their shoulder" : mode === "hands" ? "with only their hands in the frame" : "across the table with the face cropped at the top"}`;
  const cam = best.cam;
  const { boxes, proj } = project(placed, cam);
  const sils = new Map<string, Poly[]>();
  for (const p of placed) sils.set(p.item.label, silhouette(proj, p.item.def, p.x, p.d, p.yaw, p.item.extraHeight));
  const fit: Fit = { cam, boxes, sils, rearY: proj.project(0, 0, D).y };
  const rules: RuleResult[] = [{ id: "S3", name: "One at the table", pass: true, soft: true, detail: "One person at the table; the empty-chair framing rules (H1-H14) aren't checked on this layout yet." }];
  const bp = toBlueprint(spec, placed, fit, archetype, 0, {}, rules, D, W, P1);
  bp.layout_meta.pose = pose.id;
  bp.layout_meta.solo = mode;
  const b = screenBox(proj, SEATED_PERSON, seat.x, seat.d, seat.yaw, -SEAT_DROP);
  const c = proj.project(seat.x, 0.2, seat.d);
  bp.primitives.push({
    id: seat.id,
    component_name: seat.name,
    layer: "Layer_2_Secondary_Side",
    shape_type: "bounding_box",
    center_coordinates: { x: +(2 * c.x - 1).toFixed(4), y: +c.y.toFixed(4), z: +((seat.d / D) * 0.5).toFixed(4) },
    dimensions: { width: SEATED_PERSON.width!, height: SEATED_PERSON.height, depth: SEATED_PERSON.depth! },
    rotation_euler_deg: { pitch: 0, yaw: seat.yaw, roll: 0 },
    role: "person",
    proxy: "seated-person",
    world: { x: +seat.x.toFixed(4), d: +seat.d.toFixed(4), yawDeg: seat.yaw, elevation: -SEAT_DROP },
    screen_bbox: { x0: +b.x0.toFixed(4), y0: +b.y0.toFixed(4), x1: +b.x1.toFixed(4), y1: +b.y1.toFixed(4) },
  });
  bp.layout_meta.rationale = `One at the table (${mode}): ${describe(archetype, placed)}.`;
  if (dropped.length) bp.layout_meta.rationale += ` The table was full, so the napkin and cutlery (${dropped.join(", ")}) were left out.`;
  return { archetype, blueprint: bp };
}
