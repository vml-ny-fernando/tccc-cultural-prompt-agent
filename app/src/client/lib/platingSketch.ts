// A small pencil drawing of one serving option for the Plating step (Fernando, 2026-11-11:
// "a simple pencil sketch, light in detail but consistent"). It uses the same 3D shapes and line
// renderer as Review the Sketch: the vessel at its real size with the food's rough mound on it,
// on a corner of table, seen from the side at 35 degrees. Drawn in the browser; no image model.

import { makeCameraParams } from '../../shared/camera.ts';
import { MASS_HEIGHT, VESSELS } from '../../shared/registry.ts';
import { selectLighting } from '../../shared/rules.ts';
import type { Blueprint, MassClass, Vessel } from '../../shared/types.ts';
import { renderSketch } from './renderProxy.ts';

const PITCH_DEG = 35;
const FOCAL_MM = 50;
const cache = new Map<string, string>();

/** A PNG data URL (16:9) of the vessel with its food, or null if it can't be drawn here. */
export function platingSketch(vessel: Vessel, massClass: MassClass | undefined): string | null {
  const key = `${vessel}|${massClass ?? ''}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const def = VESSELS[vessel];
  if (!def) return null;
  const w = def.radius !== undefined ? def.radius * 2 : (def.width ?? 0.3);
  const d = def.radius !== undefined ? def.radius * 2 : (def.depth ?? 0.3);
  const food = massClass ? MASS_HEIGHT[massClass] : 0.03;
  const size = Math.max(w, d);
  const tableW = size + 0.5;
  const tableD = d + 0.3;
  const at = tableD / 2;
  // Frame the vessel at about half the picture's width: half the horizontal field of view covers `size` from `dist`.
  const vfov = (2 * Math.atan(24 / 2 / FOCAL_MM) * 180) / Math.PI;
  const hHalf = Math.atan(Math.tan((vfov * Math.PI) / 360) * (16 / 9));
  const dist = size / Math.tan(hHalf);
  const camera = makeCameraParams(FOCAL_MM, PITCH_DEG, 0, at, dist);
  const bp: Blueprint = {
    canvas_metadata: { aspect_ratio: '16:9', shopper_zone: 'Impulse' },
    camera_spec: { pitch_angle_degrees: PITCH_DEG, focal_length_mm: FOCAL_MM, aperture: '' },
    horizon_clamp: { max_table_rear_y_normalized: 0.5 },
    visual_mass_distribution: { primary_co_heroes_pct: 100, secondary_sides_pct: 0, tertiary_accents_pct: 0 },
    primitives: [
      {
        id: 'MAIN',
        component_name: 'main',
        layer: 'Layer_1_Primary_CoHero',
        shape_type: def.radius !== undefined ? 'flattened_cylinder' : 'bounding_box',
        center_coordinates: { x: 0, y: 0.5, z: 0.25 },
        dimensions: { width: w, height: def.height + food, depth: d },
        rotation_euler_deg: { pitch: 0, yaw: 0, roll: 0 },
        role: 'main',
        proxy: vessel,
        world: { x: 0, d: at, yawDeg: 0, elevation: 0 },
      },
    ],
    table: { surface: 'table-2top', width: tableW, depth: tableD },
    camera,
    frame: { units: { x_span_m: size * 2, z_span_m: tableD } },
    layout_meta: { archetype: 'preview', rationale: '', score: 0, scoreTerms: {}, rule_results: [], signature: key, seed: 0 },
  };
  try {
    const lighting = selectLighting({ setting: 'indoor', venue: 'home', party: '1', time: 'midday', surface: 'table-2top' });
    const url = renderSketch(bp, lighting, { width: 480 }).url;
    cache.set(key, url);
    return url;
  } catch {
    return null;
  }
}
