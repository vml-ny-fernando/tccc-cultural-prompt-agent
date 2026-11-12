// The table first, then the camera (Fernando, 2026-11-12): once the tablescape is laid
// out, the Camera Angle step shows that same table from every angle. The items stay where
// they are on the table and only the camera moves. An angle that can't frame the dish and
// the drink is unavailable; one that frames them but cuts off another item, or puts
// something in front of the Coca-Cola product, is offered with what to fix.

import { Projector, screenBox, silhouette, type ScreenBox } from "./camera";
import { extraHeight, IN_FRAME_MIN, primitiveDef } from "./layoutEdit";
import { angleById, lookById } from "./rules";
import { blocking, checkRules, fitCamera, radiusOf, REAR_MARGIN, type Placed } from "./solver";
import layoutPreferences from "../../rules/layout-preferences.json";
import type { ItemSpec } from "./scene";
import type { Blueprint, CameraParams, Primitive, SceneSpec } from "./types";

export interface FrameProblem {
  /** The item to move, when moving one item fixes it. */
  id?: string;
  text: string;
}

export type Reframe =
  | { ok: true; blueprint: Blueprint; problems: FrameProblem[] }
  | { ok: false; reason: string };

/** Rules that depend on the camera and that moving an item can fix. */
const FIXABLE = new Set(["H5", "H7"]);

function placedOf(bp: Blueprint): Placed[] {
  return bp.primitives.map((p) => {
    const item: ItemSpec = {
      label: p.id,
      kind: p.role as ItemSpec["kind"],
      layer: p.layer as ItemSpec["layer"],
      name: p.component_name,
      proxyKey: p.proxy,
      def: primitiveDef(p),
      extraHeight: extraHeight(p),
      ...(p.pairs_with ? { pairsWith: p.pairs_with } : {}),
      ...(p.injected ? { injected: true } : {}),
      ...(p.footprint ? { footprint: p.footprint } : {}),
      ...(p.same_as ? { sameAs: p.same_as } : {}),
    };
    return {
      item,
      x: p.world.x,
      d: p.world.d,
      yaw: p.world.yawDeg,
      ...(p.world.elevation ? { elev: p.world.elevation } : {}),
      ...(p.held_by ? { heldBy: p.held_by } : {}),
    };
  });
}

/** Every item's screen box through `cam`. */
function boxesOf(bp: Blueprint, cam: CameraParams): Map<string, ScreenBox> {
  const proj = new Projector(cam);
  return new Map(
    bp.primitives.map((p) => [p.id, screenBox(proj, primitiveDef(p), p.world.x, p.world.d, p.world.yawDeg, p.world.elevation ?? 0, extraHeight(p))]),
  );
}

/** What each item would lose to the frame edge, as problems; null when the dish or the Coca-Cola product itself is cut. */
function cropProblems(bp: Blueprint, boxes: Map<string, ScreenBox>): FrameProblem[] | null {
  const out: FrameProblem[] = [];
  for (const p of bp.primitives) {
    if (p.role === "person") continue;
    const share = inFrame(boxes.get(p.id)!);
    const need = p.role === "main" || p.role === "sku" || p.role === "glass" ? 0.999 : p.role === "partner-main" ? 0.6 : IN_FRAME_MIN;
    if (share >= need) continue;
    if (p.role === "main" || p.role === "sku" || p.role === "glass") return null;
    out.push({ id: p.id, text: `${cap(p.component_name)}: ${Math.round((1 - share) * 100)}% outside the frame.` });
  }
  return out;
}

/**
 * A corner or seated layout from another pitch: the camera keeps its aim point and its turn toward
 * the corner, swings up or down to the new pitch, and moves in or out until the table setting fills
 * the frame about as much as it did.
 */
function orbit(bp: Blueprint, pitchDeg: number, sameAngle: boolean): Reframe {
  const cam0 = bp.camera;
  if (sameAngle) {
    const problems = cropProblems(bp, boxesOf(bp, cam0));
    return problems ? { ok: true, blueprint: bp, problems } : { ok: false, reason: "This angle can't frame the dish and the drink on this table." };
  }
  const [px, py, pz] = cam0.position;
  const [tx, ty, tz] = cam0.target;
  const dist0 = Math.hypot(px - tx, py - ty, pz - tz);
  const yaw = Math.atan2(px - tx, pz - tz);
  const at = (dist: number): CameraParams => {
    const p = (pitchDeg * Math.PI) / 180;
    const { shiftX: _sx, shiftY: _sy, ...centred } = cam0;
    void _sx;
    void _sy;
    return { ...centred, pitchDeg, position: [tx + dist * Math.cos(p) * Math.sin(yaw), ty + dist * Math.sin(p), tz + dist * Math.cos(p) * Math.cos(yaw)], target: [tx, ty, tz] };
  };
  const spanOf = (boxes: Map<string, ScreenBox>) => {
    const all = [...boxes.values()];
    return Math.max(...all.map((b) => b.x1)) - Math.min(...all.map((b) => b.x0));
  };
  const want = spanOf(boxesOf(bp, cam0));
  let best: { cam: CameraParams; problems: FrameProblem[]; cost: number } | null = null;
  for (let k = 0.6; k <= 1.8; k += 0.02) {
    const cam = at(dist0 * k);
    const boxes = boxesOf(bp, cam);
    const problems = cropProblems(bp, boxes);
    if (!problems) continue;
    const cost = problems.length * 10 + Math.abs(spanOf(boxes) - want);
    if (!best || cost < best.cost) best = { cam, problems, cost };
  }
  if (!best) return { ok: false, reason: "This angle can't frame the dish and the drink on this table." };
  const boxes = boxesOf(bp, best.cam);
  const proj = new Projector(best.cam);
  return {
    ok: true,
    problems: best.problems,
    blueprint: {
      ...bp,
      camera: best.cam,
      camera_spec: { ...bp.camera_spec, pitch_angle_degrees: pitchDeg },
      primitives: bp.primitives.map((p) => {
        const c = proj.project(p.world.x, (p.world.elevation ?? 0) + p.dimensions.height / 2, p.world.d);
        const b = boxes.get(p.id)!;
        return {
          ...p,
          center_coordinates: { ...p.center_coordinates, x: +(2 * c.x - 1).toFixed(4), y: +c.y.toFixed(4) },
          screen_bbox: { x0: +b.x0.toFixed(4), y0: +b.y0.toFixed(4), x1: +b.x1.toFixed(4), y1: +b.y1.toFixed(4) },
        };
      }),
    },
  };
}

/** Share of a screen box inside the frame. */
function inFrame(b: { x0: number; y0: number; x1: number; y1: number }): number {
  const w = Math.max(0, Math.min(1, b.x1) - Math.max(0, b.x0));
  const h = Math.max(0, Math.min(1, b.y1) - Math.max(0, b.y0));
  const all = Math.max(1e-9, (b.x1 - b.x0) * (b.y1 - b.y0));
  return (w * h) / all;
}

function cap(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function lower(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/**
 * The layout `bp` seen from `angleId`: the same items at the same table spots, with the camera
 * fitted to that angle. When the layout already uses that angle, its camera is kept as it is,
 * so an edit made through it stays exactly as the person left it.
 */
/** The layout's signature (see solver signature()) with the camera angle swapped, so sketches and proxies made at another angle aren't reused. */
function withAngle(bp: Blueprint, angleId: string): Blueprint {
  const parts = bp.layout_meta.signature.split(" | ");
  if (parts.length > 1) parts[1] = angleId;
  return { ...bp, layout_meta: { ...bp.layout_meta, signature: parts.join(" | ") } };
}

export function reframe(spec: SceneSpec, bp: Blueprint, angleId: string): Reframe {
  const r = reframeRaw(spec, bp, angleId);
  return r.ok ? { ...r, blueprint: withAngle(r.blueprint, angleId) } : r;
}

function reframeRaw(spec: SceneSpec, bp: Blueprint, angleId: string): Reframe {
  const angle = angleById(angleId);
  const look = lookById(spec.camera.look);
  const D = bp.table.depth;
  const sameAngle = Math.abs(bp.camera.pitchDeg - angle.hidden.pitch_deg) < 1e-6 && Math.abs(bp.camera.focalLengthMm - look.hidden.focal_length_mm) < 1e-6;
  // Two place settings around a corner (and seated people) are seen down the corner's diagonal, which
  // the one-diner framing rules don't cover: the camera orbits its own aim point to the new pitch instead.
  const yawed = Math.abs(bp.camera.position[0] - bp.camera.target[0]) > 1e-3 || bp.primitives.some((p) => p.role.startsWith("partner-") || p.role === "person");
  if (yawed) return orbit(bp, angle.hidden.pitch_deg, sameAngle);
  const names = new Map(bp.primitives.map((p) => [p.id, p.component_name]));
  const named = (ids: string[] | undefined) => (ids ?? []).map((id) => names.get(id) ?? id);

  const evaluate = (placed: Placed[]) => {
    const hasL2 = placed.some((p) => p.item.layer === "Layer_2_Secondary_Side");
    const spans = layoutPreferences.hero_span_target;
    const fit = sameAngle
      ? (() => {
          const proj = new Projector(bp.camera);
          const boxes = new Map(placed.map((p) => [p.item.label, screenBox(proj, p.item.def, p.x, p.d, p.yaw, p.elev ?? 0, p.item.extraHeight)]));
          const sils = new Map(placed.map((p) => [p.item.label, silhouette(proj, p.item.def, p.x, p.d, p.yaw, p.item.extraHeight)]));
          return { cam: bp.camera, boxes, sils, rearY: bp.horizon_clamp.max_table_rear_y_normalized };
        })()
      : fitCamera(placed, D, look.hidden.focal_length_mm, angle.hidden.pitch_deg, hasL2 ? spans.with_sides : spans.meal_and_drink_only, angle.hidden);
    if (!fit) return null;
    const rules = checkRules(placed, fit, { ...spec, camera: { ...spec.camera, angle: angleId } });
    const problems: FrameProblem[] = [];
    for (const p of placed) {
      if ((p.item.kind as string) === "person") continue;
      const share = inFrame(fit.boxes.get(p.item.label)!);
      if (share < IN_FRAME_MIN) problems.push({ id: p.item.label, text: `${cap(p.item.name)}: ${Math.round((1 - share) * 100)}% outside the frame.` });
    }
    let fatal: string | null = null;
    for (const r of blocking(rules)) {
      if (FIXABLE.has(r.id)) {
        const who = named(r.offenders);
        problems.push({
          ...(r.offenders?.[0] ? { id: r.offenders[0] } : {}),
          text:
            r.id === "H5"
              ? `From here, the Coca-Cola logo is partly covered by the ${who.map(lower).join(" and ") || "items in front of it"}.`
              : `From here, the ${who.map(lower).join(" and ") || "items"} overlap other items in the shot.`,
        });
      } else if (!sameAngle && ["H1", "H2", "H12", "H14", "H15"].includes(r.id)) {
        // At its own angle the layout keeps the framing the person set (a slid frame may break these on purpose).
        fatal ??= "From this angle the back of the table rises too high, or the dish and the drink can't both sit in the middle of the frame.";
      }
    }
    if (fatal) return null;
    return { fit, rules, problems, placed };
  };

  // The items exactly where they are first; then, if that can't be framed or has problems, the whole
  // setting slid toward the back (or, for an angle that shows the front edge, toward the diner),
  // which is how the solver sits a setting on the table for each angle. Nothing moves relative to anything else.
  const base = placedOf(bp);
  const tries: number[] = [0];
  if (!sameAngle) {
    const rear = Math.max(...base.map((p) => p.d + radiusOf(p)));
    const front = Math.min(...base.map((p) => p.d - radiusOf(p)));
    const toBack = D - REAR_MARGIN - rear;
    const toFront = 0.04 - front;
    const shift = angle.hidden.front_edge_min_y !== undefined ? toFront : toBack;
    if (Math.abs(shift) > 0.01) tries.push(shift);
  }
  let best: NonNullable<ReturnType<typeof evaluate>> | null = null;
  for (const shift of tries) {
    const placed = base.map((p) => ({ ...p, d: p.d + shift }));
    const r = evaluate(placed);
    if (r && (!best || r.problems.length < best.problems.length)) best = r;
    if (best && !best.problems.length) break;
  }
  if (!best) return { ok: false, reason: "This angle can't frame the dish and the drink on this table." };

  const { fit, rules, problems, placed } = best;
  const proj = new Projector(fit.cam);
  const at = new Map(placed.map((p) => [p.item.label, p]));
  const primitives: Primitive[] = bp.primitives.map((p) => {
    const q = at.get(p.id)!;
    const c = proj.project(q.x, (q.elev ?? 0) + p.dimensions.height / 2, q.d);
    const b = fit.boxes.get(p.id)!;
    return {
      ...p,
      center_coordinates: { x: +(2 * c.x - 1).toFixed(4), y: +c.y.toFixed(4), z: +((q.d / D) * 0.5).toFixed(4) },
      world: { ...p.world, d: +q.d.toFixed(4) },
      screen_bbox: { x0: +b.x0.toFixed(4), y0: +b.y0.toFixed(4), x1: +b.x1.toFixed(4), y1: +b.y1.toFixed(4) },
    };
  });
  return {
    ok: true,
    problems,
    blueprint: {
      ...bp,
      primitives,
      camera: fit.cam,
      camera_spec: { ...bp.camera_spec, pitch_angle_degrees: fit.cam.pitchDeg, focal_length_mm: fit.cam.focalLengthMm },
      horizon_clamp: { max_table_rear_y_normalized: +fit.rearY.toFixed(4) },
      layout_meta: { ...bp.layout_meta, rule_results: rules },
    },
  };
}
