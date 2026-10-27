// The sketch editor's rules: the art director drags items on Review the Sketch and
// each one lands on a hidden grid of points on the real table, seen through the
// layout's own locked camera. A point is closed for an item when the item would
// hang off the table, crowd another item closer than the spacing rules allow,
// fall out of frame, or hide more of the Coca-Cola product than 5%. Saving turns
// the moves and deletions into a new blueprint, so the sketch and the photo are
// drawn from the edited layout. Seated people and the drink in a person's hand stay
// where the pose puts them; the rest moves around them, clear of their hands.

import { overlapArea, polyArea, Projector, screenBox, silhouette, type Poly } from "./camera";
import { BELL_GLASS, bottleClearance, footprintRadius, napkinDef, VESSELS, type ProxyDef } from "./registry";
import { poseOf, sideToward, toWorld } from "./poses";
import { isLargeSku } from "./rules";
import { kindGap } from "./solver";
import type { Blueprint, Primitive, SceneSpec } from "./types";

/** Hidden snap grid spacing on the tabletop, in metres. */
export const GRID_STEP = 0.05;
/** No footprint comes closer than this to the table's edge. */
const EDGE_INSET = 0.02;
/** The diner's entree stays at the front: its near rim within this distance of the table's front edge. */
const MAIN_FRONT_MAX = 0.15;
/** Most of the Coca-Cola product (or its glass) that items in front of it may hide. */
const SKU_HIDDEN_MAX = 0.05;
/** Share of an item's on-screen box that must stay inside the frame. */
const IN_FRAME_MIN = 0.8;
/** Room kept clear around a seated person's hand or elbow resting on the table, in metres. */
const HAND_CLEAR = 0.03;
/** Height above the seat of a hand or elbow resting on the tabletop (the pose's table height, T in poses.ts). */
const ON_TABLE = 0.5;

/** Items the scene is built around: they move, but are never removed. */
const LOCKED = new Set(["main", "shared-hero", "sku", "glass", "partner-main", "partner-sku", "partner-glass"]);
const DRINKS = new Set(["sku", "glass", "partner-sku", "partner-glass"]);

export function removable(p: Primitive): boolean {
  return !LOCKED.has(p.role) && movable(p);
}

/** Seated people and the drink in a person's hand hold the pose: they never move. */
export function movable(p: Primitive): boolean {
  return p.role !== "person" && !p.held_by;
}

/** Where each seated person's hands and elbows rest on the table, as table points. A raised hand (holding a fork or a drink, mid-gesture) is above the items, so it keeps nothing clear. */
export function handSpots(bp: Blueprint): Array<{ person: Primitive; at: Spot }> {
  const people = bp.primitives.filter((p) => p.role === "person");
  return people.flatMap((p) => {
    const other = people.find((q) => q.id !== p.id);
    const self = { x: p.world.x, d: p.world.d, yawDeg: p.world.yawDeg };
    const toward = other ? sideToward(self, other.world) : 1;
    const pose = poseOf(bp, p);
    return [
      [pose.near, toward],
      [pose.far, -toward as 1 | -1],
    ].flatMap(([arm, sx]) => {
      const a = arm as (typeof pose)["near"];
      return [a.hand, a.elbow]
        .filter((v) => v[1] <= ON_TABLE)
        .map((v) => {
          const w = toWorld(self, v, sx as 1 | -1);
          return { person: p, at: { x: w.x, d: w.d } };
        });
    });
  });
}

/** The proxy shape of a blueprint item: its footprint and vessel height (the food sits on top). */
export function primitiveDef(p: Primitive): ProxyDef {
  if (p.role === "glass" || p.role === "partner-glass") return BELL_GLASS;
  if (p.role === "napkin-set" || p.role === "partner-napkin") return napkinDef(p.footprint ?? "rect", p.proxy.includes("-dinner") ? "dinner" : "luncheon");
  if (p.role === "sku" || p.role === "partner-sku") {
    // Rebuild from the blueprint's dimensions (the SKU proxy key is catalog-specific).
    const kind = p.proxy.includes("can") ? "lathe-can" : "lathe-bottle";
    return { kind, radius: p.dimensions.width / 2, height: p.dimensions.height, tall: true };
  }
  return VESSELS[p.proxy as keyof typeof VESSELS] ?? { kind: "cylinder", radius: p.dimensions.width / 2, height: p.dimensions.height };
}

/** The spacing kind of a role: the second setting follows the same rules as the first. */
function spacingKind(role: string): string {
  if (role === "partner-main") return "main";
  if (role === "partner-napkin") return "napkin-set";
  if (role === "partner-sku") return "sku";
  if (role === "partner-glass") return "glass";
  return role;
}

export interface Spot {
  x: number;
  d: number;
}

/** Where each item stands after the edit, by id; removed items are left out. */
export type Placement = Record<string, Spot>;

export function placementOf(bp: Blueprint): Placement {
  return Object.fromEntries(bp.primitives.map((p) => [p.id, { x: p.world.x, d: p.world.d }]));
}

/** The grid points on the tabletop, front row first. */
export function gridPoints(bp: Blueprint): Spot[] {
  const { width: W, depth: D } = bp.table;
  const out: Spot[] = [];
  const x0 = Math.ceil((-W / 2 + EDGE_INSET) / GRID_STEP) * GRID_STEP;
  for (let d = GRID_STEP; d < D - EDGE_INSET + 1e-9; d += GRID_STEP) {
    for (let x = x0; x < W / 2 - EDGE_INSET + 1e-9; x += GRID_STEP) out.push({ x: +x.toFixed(3), d: +d.toFixed(3) });
  }
  return out;
}

// --- The rules for one layout ------------------------------------------------

export interface Block {
  reason: "edge" | "item" | "frame" | "front" | "coke";
  /** One sentence for the art director. */
  text: string;
}

/**
 * The placement rules for one layout, matching the solver's: footprints are circles of the
 * item's footprint radius, spaced by the tableware gaps (a large shared bottle keeps its
 * clearance ring), inset 2 cm from the table edge. `home` is where the solver put each item:
 * that spot is always open, so an item can always go back.
 */
export class EditRules {
  readonly proj: Projector;
  readonly home: Placement;
  readonly grid: Spot[];
  private multi: { clearance: number } | null;
  private hands: Array<{ person: Primitive; at: Spot }>;

  constructor(
    readonly bp: Blueprint,
    spec: Pick<SceneSpec, "sku">,
  ) {
    this.proj = new Projector(bp.camera);
    this.home = placementOf(bp);
    this.grid = gridPoints(bp);
    this.multi = isLargeSku(spec.sku) ? { clearance: bottleClearance(spec.sku) } : null;
    this.hands = handSpots(bp);
  }

  item(id: string): Primitive {
    return this.bp.primitives.find((p) => p.id === id)!;
  }

  radius(p: Primitive): number {
    return footprintRadius(primitiveDef(p));
  }

  /** Minimum edge-to-edge gap between two items. */
  gap(a: Primitive, b: Primitive): number {
    if (this.multi && (a.role === "sku" || b.role === "sku")) {
      // The shared bottle's clearance ring is measured from its center.
      return Math.max(0.015, this.multi.clearance - this.radius(a.role === "sku" ? a : b));
    }
    return kindGap(spacingKind(a.role), spacingKind(b.role));
  }

  private isHome(id: string, at: Spot): boolean {
    const h = this.home[id];
    return !!h && Math.abs(h.x - at.x) < 1e-6 && Math.abs(h.d - at.d) < 1e-6;
  }

  /** Why `id` can't stand at `at` given where everything else is (`place`), or null when it can. */
  block(place: Placement, id: string, at: Spot): Block | null {
    const p = this.item(id);
    if (!p || !movable(p)) return { reason: "item", text: `${p?.component_name ?? "That"} stays where the pose puts it.` };
    if (this.isHome(id, at)) return null;
    const { width: W, depth: D } = this.bp.table;
    const r = this.radius(p);
    if (at.x - r < -W / 2 + EDGE_INSET - 1e-9 || at.x + r > W / 2 - EDGE_INSET + 1e-9 || at.d - r < EDGE_INSET - 1e-9 || at.d + r > D - EDGE_INSET + 1e-9) {
      return { reason: "edge", text: `${p.component_name} would hang off the table there.` };
    }
    if (p.role === "main" && at.d - r > Math.max(MAIN_FRONT_MAX, this.home[id]!.d - r + GRID_STEP) + 1e-9) {
      return { reason: "front", text: `${p.component_name} stays at the front of the table, in front of the diner.` };
    }
    for (const h of this.hands) {
      // Fingertips may touch a rim, as at a real table; the hand never lands in the middle of an item.
      if (Math.hypot(at.x - h.at.x, at.d - h.at.d) - r / 2 < HAND_CLEAR - 1e-6) {
        return { reason: "item", text: `${p.component_name} would sit under the hands of ${h.person.component_name}.` };
      }
    }
    for (const o of this.bp.primitives) {
      const there = place[o.id];
      if (o.id === id || !there || o.role === "person") continue;
      const need = this.gap(p, o);
      if (Math.hypot(at.x - there.x, at.d - there.d) - r - this.radius(o) < need - 1e-6) {
        return { reason: "item", text: `${p.component_name} would crowd ${o.component_name} (they need ${Math.round(need * 100)} cm between them).` };
      }
    }
    const b = screenBox(this.proj, primitiveDef(p), at.x, at.d, p.world.yawDeg, 0, extraHeight(p));
    const area = (b.x1 - b.x0) * (b.y1 - b.y0);
    const shown = Math.max(0, Math.min(1, b.x1) - Math.max(0, b.x0)) * Math.max(0, Math.min(1, b.y1) - Math.max(0, b.y0));
    const need = DRINKS.has(p.role) || p.role === "main" ? 0.999 : IN_FRAME_MIN;
    if (area > 0 && shown / area < need) return { reason: "frame", text: `${p.component_name} would fall out of the frame there.` };
    const before = this.drinkHidden(place);
    const after = this.drinkHidden({ ...place, [id]: at });
    for (const [drink, frac] of Object.entries(after)) {
      if (frac > Math.max(SKU_HIDDEN_MAX, (before[drink] ?? 0) + 1e-3)) {
        return { reason: "coke", text: `That would hide ${Math.round(frac * 100)}% of the ${this.item(drink).component_name}; 5% at most.` };
      }
    }
    return null;
  }

  /** How much of each drink the items in front of it hide (0..1), by drink id. */
  private drinkHidden(place: Placement): Record<string, number> {
    const out: Record<string, number> = {};
    const live = this.bp.primitives.filter((p) => place[p.id] && p.role !== "person");
    const depth = (p: Primitive) => this.proj.project(place[p.id]!.x, 0, place[p.id]!.d).depth;
    for (const back of live) {
      if (!DRINKS.has(back.role)) continue;
      const bs = this.silhouette(back, place[back.id]!);
      const area = bs.reduce((s, q) => s + polyArea(q), 0);
      const bd = depth(back);
      let hidden = 0;
      for (const front of live) {
        if (front === back || depth(front) >= bd) continue;
        hidden += overlapArea(this.silhouette(front, place[front.id]!), bs);
      }
      out[back.id] = area > 0 ? Math.min(1, hidden / area) : 0;
    }
    return out;
  }

  silhouette(p: Primitive, at: Spot): Poly[] {
    return silhouette(this.proj, primitiveDef(p), at.x, at.d, p.world.yawDeg, extraHeight(p));
  }

  /** The open point nearest `want` within `reach` metres, or why the nearest one is closed. */
  snap(place: Placement, id: string, want: Spot, reach = 0.1): { spot: Spot; block: null } | { spot: null; block: Block } {
    const points = [this.home[id]!, ...this.grid]
      .map((s) => ({ s, dist: Math.hypot(s.x - want.x, s.d - want.d) }))
      .filter((c) => c.dist <= reach)
      .sort((a, b) => a.dist - b.dist);
    let first: Block | null = null;
    for (const { s } of points) {
      const block = this.block(place, id, s);
      if (!block) return { spot: s, block: null };
      first ??= block;
    }
    return { spot: null, block: first ?? { reason: "edge", text: "That spot is off the table." } };
  }

  /** Every point open to `id` right now, for the drag guide. */
  openPoints(place: Placement, id: string): Spot[] {
    return [this.home[id]!, ...this.grid].filter((s) => !this.block(place, id, s));
  }

  /** The ring each other item keeps clear around itself for `id`: its footprint grown by the gap, as table points. */
  keepOut(place: Placement, id: string): Array<Array<[number, number]>> {
    const p = this.item(id);
    const ring = (c: Spot, r: number) =>
      Array.from({ length: 40 }, (_, i): [number, number] => {
        const a = (i / 40) * Math.PI * 2;
        return [c.x + r * Math.cos(a), c.d + r * Math.sin(a)];
      });
    return [
      ...this.bp.primitives.filter((o) => o.id !== id && place[o.id] && o.role !== "person").map((o) => ring(place[o.id]!, this.radius(o) + this.gap(p, o))),
      ...this.hands.map((h) => ring(h.at, this.radius(p) / 2 + HAND_CLEAR)),
    ];
  }
}

function extraHeight(p: Primitive): number {
  return Math.max(0, p.dimensions.height - primitiveDef(p).height);
}

// --- The edited layout ------------------------------------------------------

/** True when the placement moves or removes anything. */
export function isEdited(bp: Blueprint, place: Placement): boolean {
  return bp.primitives.some((p) => !place[p.id] || Math.abs(place[p.id]!.x - p.world.x) > 1e-6 || Math.abs(place[p.id]!.d - p.world.d) > 1e-6);
}

/** The blueprint with every item where the art director put it, and the removed ones gone. Same camera. */
export function editedBlueprint(bp: Blueprint, place: Placement, sourceName: string): Blueprint {
  const proj = new Projector(bp.camera);
  const D = bp.table.depth;
  const moved: string[] = [];
  const movedIds = new Set(bp.layout_meta.moved ?? []);
  const removed: string[] = [];
  const primitives = bp.primitives.flatMap((p): Primitive[] => {
    const at = place[p.id];
    if (!at) {
      removed.push(p.component_name);
      return [];
    }
    if (Math.abs(at.x - p.world.x) < 1e-6 && Math.abs(at.d - p.world.d) < 1e-6) return [p];
    moved.push(p.component_name);
    movedIds.add(p.id);
    const def = primitiveDef(p);
    const c = proj.project(at.x, p.dimensions.height / 2, at.d);
    const b = screenBox(proj, def, at.x, at.d, p.world.yawDeg, 0, extraHeight(p));
    return [
      {
        ...p,
        center_coordinates: { x: +(2 * c.x - 1).toFixed(4), y: +c.y.toFixed(4), z: +((at.d / D) * 0.5).toFixed(4) },
        world: { ...p.world, x: +at.x.toFixed(4), d: +at.d.toFixed(4) },
        screen_bbox: { x0: +b.x0.toFixed(4), y0: +b.y0.toFixed(4), x1: +b.x1.toFixed(4), y1: +b.y1.toFixed(4) },
      },
    ];
  });
  const what = [moved.length ? `moved ${list(moved)}` : "", removed.length ? `removed ${list(removed)}` : ""].filter(Boolean).join(" and ");
  return {
    ...bp,
    primitives,
    layout_meta: {
      ...bp.layout_meta,
      archetype: `Your edit of ${sourceName}`,
      rationale: `Your edit of ${sourceName}: ${what || "no changes"}. Same table, camera and framing.`,
      rule_results: [],
      moved: [...movedIds].filter((id) => primitives.some((p) => p.id === id)),
    },
  };
}

function list(names: string[]): string {
  const lower = names.map((n) => n.charAt(0).toLowerCase() + n.slice(1));
  return lower.length < 2 ? lower.join("") : `${lower.slice(0, -1).join(", ")} and ${lower[lower.length - 1]}`;
}

/**
 * The spec as the edited layout shows it: dishes and the accent that were removed are left out,
 * so the story and the photo prompt never bring them back, and a removed napkin takes its
 * cutlery with it. Returns the same object when nothing was removed.
 */
export function specForLayout(spec: SceneSpec, bp: Blueprint): SceneSpec {
  const names = new Set(bp.primitives.map((p) => p.component_name));
  const accompaniments = spec.accompaniments.filter((a) => names.has(a.name));
  const accentGone = !!spec.accent && !bp.primitives.some((p) => p.role === "accent");
  const napkinGone = !!spec.napkinSet && spec.napkinSet.cutlery.length > 0 && !bp.primitives.some((p) => p.role === "napkin-set" || p.role === "partner-napkin");
  if (accompaniments.length === spec.accompaniments.length && !accentGone && !napkinGone) return spec;
  return {
    ...spec,
    accompaniments,
    accent: accentGone ? null : spec.accent,
    napkinSet: napkinGone && spec.napkinSet ? { ...spec.napkinSet, cutlery: [] } : spec.napkinSet,
  };
}
