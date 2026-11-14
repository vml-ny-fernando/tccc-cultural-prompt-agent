// Camera math shared by the solver (Node) and the renderer (browser), so the
// layout checks and the rendered proxy use exactly the same projection.
//
// World axes: x = lateral (+x is screen-right and the hero diner's right),
// y = up (tabletop at y = 0), z = -d where d is depth from the table's front
// edge. The camera sits in front of the table (+z) looking toward -z.

import * as THREE from "three";
import type { CameraParams } from "./types";
import { CUP_BASE_RATIO, type ProxyDef } from "./registry";

export const ASPECT = 16 / 9;

export function fovFromFocal(focalMm: number): number {
  return (2 * Math.atan(24 / (2 * focalMm)) * 180) / Math.PI;
}

export function makeCameraParams(
  focalLengthMm: number,
  pitchDeg: number,
  targetX: number,
  targetD: number,
  distance: number,
): CameraParams {
  const p = (pitchDeg * Math.PI) / 180;
  const target: [number, number, number] = [targetX, 0, -targetD];
  const position: [number, number, number] = [targetX, distance * Math.sin(p), -targetD + distance * Math.cos(p)];
  return { focalLengthMm, fovDeg: fovFromFocal(focalLengthMm), pitchDeg, aspect: ASPECT, position, target };
}

export function toThreeCamera(c: CameraParams): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(c.fovDeg, c.aspect, 0.01, 100);
  cam.position.set(...c.position);
  cam.lookAt(new THREE.Vector3(...c.target));
  // A lens shift slides the frame across the picture (see CameraParams.shiftX).
  if (c.shiftX || c.shiftY) cam.setViewOffset(1, 1, c.shiftX ?? 0, -(c.shiftY ?? 0), 1, 1);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
}

export interface ScreenPoint {
  x: number; // 0 = left, 1 = right
  y: number; // 0 = bottom, 1 = top
  depth: number; // distance from the camera, for occlusion order
}

export class Projector {
  readonly cam: THREE.PerspectiveCamera;
  private v = new THREE.Vector3();
  constructor(readonly params: CameraParams) {
    this.cam = toThreeCamera(params);
  }
  /** Project a world point (x, y, d) with d = depth from the table front edge. */
  project(x: number, y: number, d: number): ScreenPoint {
    this.v.set(x, y, -d);
    const depth = this.v.distanceTo(this.cam.position);
    this.v.project(this.cam);
    return { x: (this.v.x + 1) / 2, y: (this.v.y + 1) / 2, depth };
  }
  /** Where the ray through a screen point (0..1, y bottom-up) meets the plane at height y, as (x, d); null above the horizon. */
  ground(sx: number, sy: number, y = 0): { x: number; d: number } | null {
    this.v.set(2 * sx - 1, 2 * sy - 1, 0.5).unproject(this.cam).sub(this.cam.position);
    const p = this.cam.position;
    if (this.v.y >= -1e-9) return null;
    const t = (y - p.y) / this.v.y;
    return { x: p.x + t * this.v.x, d: -(p.z + t * this.v.z) };
  }
}

export interface ScreenBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  depth: number; // camera distance to the footprint center
}

/** Screen-space bounding box of a proxy's silhouette. */
export function screenBox(
  proj: Projector,
  def: ProxyDef,
  x: number,
  d: number,
  yawDeg: number,
  elevation = 0,
  extraHeight = 0,
): ScreenBox {
  const h = def.height + extraHeight;
  const pts: Array<[number, number]> = [];
  if (def.radius !== undefined) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push([x + def.radius * Math.cos(a), d + def.radius * Math.sin(a)]);
    }
  } else {
    const w = (def.width ?? 0) / 2;
    const dd = (def.depth ?? 0) / 2;
    const yaw = (yawDeg * Math.PI) / 180;
    for (const [px, pz] of [
      [-w, -dd],
      [w, -dd],
      [w, dd],
      [-w, dd],
    ]) {
      pts.push([x + px * Math.cos(yaw) - pz * Math.sin(yaw), d + px * Math.sin(yaw) + pz * Math.cos(yaw)]);
    }
  }
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const [px, pd] of pts) {
    for (const py of [elevation, elevation + h]) {
      const s = proj.project(px, py, pd);
      x0 = Math.min(x0, s.x);
      x1 = Math.max(x1, s.x);
      y0 = Math.min(y0, s.y);
      y1 = Math.max(y1, s.y);
    }
  }
  return { x0, y0, x1, y1, depth: proj.project(x, elevation, d).depth };
}

export function boxWidth(b: { x0: number; x1: number }): number {
  return b.x1 - b.x0;
}

// ---------------------------------------------------------------------------
// Silhouettes: convex outlines of the projected vessel and its food mound.
// Used for occlusion and logo-clearance checks (bounding boxes overstate them).
// ---------------------------------------------------------------------------

export type Pt = [number, number];
export type Poly = Pt[];

export function convexHull(points: Pt[]): Poly {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

export function polyArea(p: Poly): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i];
    const [x2, y2] = p[(i + 1) % p.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/** Intersection of two convex polygons (Sutherland-Hodgman). */
export function clipConvex(subject: Poly, clip: Poly): Poly {
  let out = subject;
  const orient = polySigned(clip) >= 0 ? 1 : -1;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i];
    const b = clip[(i + 1) % clip.length];
    const inside = (p: Pt) => orient * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) >= 0;
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const cur = input[j];
      const prev = input[(j + input.length - 1) % input.length];
      const ci = inside(cur);
      const pi = inside(prev);
      if (ci) {
        if (!pi) out.push(intersect(prev, cur, a, b));
        out.push(cur);
      } else if (pi) out.push(intersect(prev, cur, a, b));
    }
  }
  return out;
}

function polySigned(p: Poly): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) a += p[i][0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * p[i][1];
  return a;
}

function intersect(p1: Pt, p2: Pt, a: Pt, b: Pt): Pt {
  const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
  const x3 = a[0], y3 = a[1], x4 = b[0], y4 = b[1];
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 1e-12) return p2;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

export function overlapArea(a: Poly[], b: Poly[]): number {
  let s = 0;
  for (const pa of a) for (const pb of b) {
    const c = clipConvex(pa, pb);
    if (c.length >= 3) s += polyArea(c);
  }
  return s;
}

export function rectPoly(b: { x0: number; y0: number; x1: number; y1: number }): Poly {
  return [
    [b.x0, b.y0],
    [b.x1, b.y0],
    [b.x1, b.y1],
    [b.x0, b.y1],
  ];
}

/** Projected silhouette: the vessel hull, plus a narrower food-mound hull when the vessel holds food. */
export function silhouette(
  proj: Projector,
  def: ProxyDef,
  x: number,
  d: number,
  yawDeg: number,
  extraHeight = 0,
): Poly[] {
  const ring = (r: number, y: number): Pt[] => {
    const out: Pt[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const s = proj.project(x + r * Math.cos(a), y, d + r * Math.sin(a));
      out.push([s.x, s.y]);
    }
    return out;
  };
  const rect = (w: number, dd: number, y: number): Pt[] => {
    const yaw = (yawDeg * Math.PI) / 180;
    return [
      [-w, -dd],
      [w, -dd],
      [w, dd],
      [-w, dd],
    ].map(([px, pz]) => {
      const s = proj.project(x + px * Math.cos(yaw) - pz * Math.sin(yaw), y, d + px * Math.sin(yaw) + pz * Math.cos(yaw));
      return [s.x, s.y] as Pt;
    });
  };
  const polys: Poly[] = [];
  if (def.radius !== undefined) {
    const topR = def.kind === "lathe-bottle" || def.kind === "lathe-condiment" ? def.radius * 0.45 : def.radius;
    const baseR = def.kind === "lathe-cup" ? def.radius * CUP_BASE_RATIO : def.radius;
    const pts = [...ring(baseR, 0), ...ring(def.radius, def.tall ? def.height * 0.6 : def.height), ...ring(topR, def.height)];
    polys.push(convexHull(pts));
    if (extraHeight > 0.006) polys.push(convexHull([...ring(def.radius * 0.7, def.height), ...ring(def.radius * 0.35, def.height + extraHeight)]));
  } else {
    const w = (def.width ?? 0) / 2;
    const dd = (def.depth ?? 0) / 2;
    polys.push(convexHull([...rect(w, dd, 0), ...rect(w, dd, def.height)]));
    if (extraHeight > 0.006) polys.push(convexHull([...rect(w * 0.7, dd * 0.7, def.height), ...rect(w * 0.35, dd * 0.35, def.height + extraHeight)]));
  }
  return polys;
}
