// Rule data files live in /rules so they can change without code changes.
import cameraOptions from "../../rules/camera-options.json";
import lightingPresets from "../../rules/lighting-presets.json";
import glassRules from "../../rules/glass-rules.json";
import foodStyling from "../../rules/food-styling.json";
import type { Occasion, SceneSpec, SkuInfo, Surface } from "./types";

export { cameraOptions, lightingPresets, glassRules };

export interface LookOption {
  id: string;
  label: string;
  help: string;
  prompt: string;
  /** Food texture sentence, closing the look's prompt line. */
  texture?: string;
  hidden: { focal_length_mm: number; aperture: string; focus: string; focus_distance_m: number | string };
  constraints?: { sku_min_distance_from_frame_edge_pct?: number };
  status?: string;
}
/** How much of the picture is sharp; one preset for now (camera-options.json depth_of_field). */
export interface DepthOption {
  id: string;
  label: string;
  help: string;
  aperture: string;
  /** Where focus sits and what stays sharp; "{drinks}" is replaced with the product phrase. */
  focus: string;
  /** Foreground, hero and background planes, in words. */
  layers: string;
  status?: string;
}
export interface AngleOption {
  id: string;
  label: string;
  prompt: string;
  /** Framing on top of the pitch; see solver.ts Framing. */
  hidden: {
    pitch_deg: number;
    setback_scale?: number;
    front_edge_min_y?: number;
    rear_edge_max_y?: number;
    /** Test angles: raise camera and aim this far above the tabletop (a level camera would sit on it). */
    lift_m?: number;
    /** Test angles: after framing, move the camera to this share of its distance (0.75 = about 25% tighter). */
    distance_scale?: number;
    /** Test angles: bring a level camera in over the table so its front edge drops out of frame (solver.ts Framing). */
    over_table?: boolean;
    /** Test angles: the hero group's target width as a share of the usual one (above 1 = tighter). */
    span_scale?: number;
    /** Where the camera stands, for the prompt (after "from"); default "a seated diner's eye height". */
    viewpoint?: string;
    /** An extra sentence the angle adds to the prompt. */
    note?: string;
    /** What this camera sees of the room behind the table, overriding the default by pitch. */
    background?: string;
  };
  /** A test angle (Fernando, 2026-11-14): its own row, never recommended or used as a fallback. */
  test?: boolean;
  status?: string;
}

interface AngleRecommendationRule {
  angle: string;
  reason: string;
  match: string[];
  massClass?: string[];
  vessels?: string[];
}

const ANGLE_RECOMMENDATIONS: AngleRecommendationRule[] = cameraOptions.angle.recommendations.rules;

/** Lowercase, accents stripped, punctuation to spaces: "Phở bò" → "pho bo". */
function plainWords(text: string): string {
  return ` ${text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
}

/** Whole word or phrase, plurals included ("burgers", "sandwiches"). */
function hasWord(haystack: string, word: string): boolean {
  const w = plainWords(word).trim();
  return new RegExp(` ${w}(s|es)? `).test(haystack);
}

/**
 * The angle the entree reads best from (rules/camera-options.json angle.recommendations):
 * dish words first, then the food's silhouette and its vessel. Null when nothing matches.
 */
export function recommendAngle(entree: {
  dish: string;
  prep?: { label: string; massClass?: string } | undefined;
  plating?: { label: string; vessel?: string } | undefined;
}): { angle: string; reason: string } | null {
  const text = plainWords([entree.dish, entree.prep?.label, entree.plating?.label].filter(Boolean).join(" "));
  const byWord = ANGLE_RECOMMENDATIONS.find((r) => r.match.some((m) => hasWord(text, m)));
  const byShape = ANGLE_RECOMMENDATIONS.find(
    (r) =>
      (entree.prep?.massClass && r.massClass?.includes(entree.prep.massClass)) ||
      (entree.plating?.vessel && r.vessels?.includes(entree.plating.vessel)),
  );
  const rule = byWord ?? byShape;
  return rule && ANGLES.some((a) => a.id === rule.angle) ? { angle: rule.angle, reason: rule.reason } : null;
}

export const LOOKS: LookOption[] = cameraOptions.look.options as LookOption[];
export const ANGLES: AngleOption[] = cameraOptions.angle.options as AngleOption[];
/** The three standard angles, without the test row. */
export const STANDARD_ANGLES: AngleOption[] = ANGLES.filter((a) => !a.test);
export const DEPTHS: DepthOption[] = cameraOptions.depth_of_field.options as DepthOption[];
export const DEFAULT_LOOK = cameraOptions.look.default;
export const DEFAULT_DEPTH = cameraOptions.depth_of_field.default;
export const DEFAULT_ANGLE = cameraOptions.angle.default;
/** Field-of-view factor for the proxy sent to the image model (see camera-options.json). */
export const MODEL_FRAMING_WIDEN: number = cameraOptions.model_framing.widen;

/**
 * Spec, for now: no hands or people anywhere in any picture (sketch, turnarounds, photograph).
 * One wording for every prompt, so the rule can't drift between them.
 */
export const NO_HANDS_RULE =
  "No hands, fingers, arms or people anywhere in the image: nobody at the table, no figures or passers-by in the background, and nothing held, lifted, picked up or bitten. Every item rests on its vessel or on the surface.";

/**
 * The final photograph only (Fernando, 2026-10-10): people may appear far behind the table as
 * soft, unrecognizable shapes, which the depth-of-field blur supports. Hands and anyone at the
 * table stay out. The sketch and turnarounds keep NO_HANDS_RULE.
 */
export const BACKGROUND_PEOPLE_RULE =
  "No hands, fingers or arms anywhere in the image and nobody at the table: nothing held, lifted, picked up or bitten, and every item rests on its vessel or on the surface. " +
  "The background may hold one or two people far behind the table, only as soft, out-of-focus shapes: no visible face, features or detail that could make anyone recognizable, nobody looking toward the camera, and no children.";

/**
 * Agent-written food text sometimes calls a dish "handheld" or "eaten by hand" (empanadas, tacos,
 * sandwiches); those words alone pull a hand into the picture, so image prompts drop them.
 */
export function withoutHands(text: string): string {
  return text
    .replace(/\bhand[- ]?held\b/gi, "finger-food")
    .replace(/,?\s*\b(?:held|eaten|picked up|served)\s+(?:in|by|with)\s+(?:the\s+|one\s+|a\s+)?hands?\b/gi, "")
    .replace(/\s+([,.;])/g, "$1")
    .replace(/,([.;])/g, "$1")
    .replace(/ {2,}/g, " ");
}

export function lookById(id: string): LookOption {
  return LOOKS.find((l) => l.id === id) ?? LOOKS[0];
}
export function depthById(id: string | undefined): DepthOption {
  return DEPTHS.find((d) => d.id === (id ?? DEFAULT_DEPTH)) ?? DEPTHS[0];
}
export function angleById(id: string): AngleOption {
  return ANGLES.find((a) => a.id === id) ?? ANGLES[0];
}

/**
 * Placeholder prompt text ("[CLOSE_HERO_PROMPT]") is replaced by the depth-of-field preset's
 * focus and layer sentences, then the look's food texture sentence.
 */
export function lookSentence(look: LookOption, drinks: string, depth: DepthOption = depthById(undefined), angle?: AngleOption, venue?: Venue): string {
  if (!look.prompt.startsWith("[")) return look.prompt;
  // The lens itself is named by the film sentence (story.ts filmSentence).
  return [depth.focus.replaceAll("{drinks}", drinks), angle ? steepLayers(angle, venue) ?? depth.layers : depth.layers, look.texture].filter(Boolean).join(" ");
}

type Venue = SceneSpec["scene"]["venue"];

/**
 * Steep views (Fernando, 2026-11-16): an overhead render came out at eye level with the market behind,
 * because about ten lines written for an eye-level view (three depth planes, people far behind, walls and
 * windows, a full-logo can) outweighed the one 75-degree line. Looking down and Overhead get their own
 * wording; Low and Diner's eye keep theirs unchanged.
 */
export function viewKind(angle: AngleOption): "level" | "steep" | "overhead" {
  if (angle.hidden.pitch_deg >= 60) return "overhead";
  return horizonPlace(angle.hidden.pitch_deg) === "well-above" ? "steep" : "level";
}

/** What lies beyond the table: ground outdoors on the go, floor indoors. */
export function groundWord(venue?: Venue): "ground" | "floor" {
  return venue === "on-the-go" ? "ground" : "floor";
}

/** Real height of each surface's top, in cm (counters and ledges stand higher than a dining table). */
const SURFACE_HEIGHT_CM: Partial<Record<Surface, number>> = {
  "counter-top": 100,
  "food-truck-counter": 105,
  "street-ledge": 100,
  "kitchen-island": 90,
  bench: 45,
};

export function surfaceHeightCm(surface?: Surface): number {
  return (surface && SURFACE_HEIGHT_CM[surface]) ?? 75;
}

/** The depth planes for a steep view, replacing the eye-level "three planes" line; undefined for Low and Diner's eye. */
function steepLayers(angle: AngleOption, venue?: Venue): string | undefined {
  const kind = viewKind(angle);
  const g = groundWord(venue);
  if (kind === "overhead")
    return `The table setting is the picture, sharp from edge to edge; beyond the table's far edge only a thin, soft strip of the ${g} far below shows, never a view of the place behind.`;
  if (kind === "steep")
    return `The picture reads in two planes: the table setting sharp, filling most of the frame, and beyond its far edge a soft strip of the ${g} and the bases of what stands on it, seen from above.`;
  return undefined;
}

/** One sentence that opens the prompt for a steep view, so the angle is the first thing the model reads. */
export function viewLeadSentence(angle: AngleOption, venue?: Venue): string {
  const kind = viewKind(angle);
  const g = groundWord(venue);
  if (kind === "overhead")
    return `View: almost straight down from high above the table, about ${angle.hidden.pitch_deg} degrees: the tabletop fills the frame, with only a narrow strip of the ${g} at the top edge. Keep this view throughout; never lower the camera to show the place.`;
  if (kind === "steep")
    return `View: about ${angle.hidden.pitch_deg} degrees down from above the table: the table setting fills most of the frame and the ${g} beyond it fills the top; no horizon and nothing seen at eye level. Keep this view throughout.`;
  return "";
}

/** How far down the frame the horizon (the camera's eye level) falls, for the locked lens on a 24 mm-tall frame; negative is above it. */
function horizonFromTop(pitch: number): number {
  const halfFov = Math.atan(12 / (LOOKS[0]?.hidden.focal_length_mm ?? 50));
  return 0.5 - Math.tan((pitch * Math.PI) / 180) / (2 * Math.tan(halfFov));
}

function horizonPlace(pitch: number): "inside" | "just-above" | "well-above" {
  const fromTop = horizonFromTop(pitch);
  return fromTop >= 0.05 ? "inside" : fromTop >= -0.4 ? "just-above" : "well-above";
}

export function angleSentence(angle: AngleOption, ctx: { venue?: Venue; surface?: Surface; surfaceText?: string } = {}): string {
  if (!angle.prompt.startsWith("[")) return angle.prompt;
  const kind = viewKind(angle);
  const pitch = angle.hidden.pitch_deg;
  const place = horizonPlace(pitch);
  const eyeLine =
    place === "inside"
      ? `the horizon (the camera's eye level) sits about ${Math.round(horizonFromTop(pitch) * 100)}% down from the top of the frame`
      : place === "just-above"
        ? "the horizon (the camera's eye level) sits just above the top edge of the frame"
        : "the horizon (the camera's eye level) is well above the frame, so the room behind is seen from above";
  const from = angle.hidden.viewpoint ?? "a seated diner's eye height";
  const tilt = pitch === 0 ? "held level, not tilted at all" : `tilted about ${pitch} degrees down toward the table`;
  if (kind !== "level") {
    const g = groundWord(ctx.venue);
    // Outdoors there is no room: what lies beyond the table is seen from above.
    const steepEyeLine = eyeLine.replace("so the room behind is seen from above", `so everything beyond the table is seen from above`);
    return (
      `One camera, from ${from}, ${tilt}; ${steepEyeLine}. ` +
      (angle.hidden.note ? `${angle.hidden.note} ` : "") +
      (kind === "overhead"
        ? `Draw what shows beyond the table (only the ${g} far below its far edge) from this same camera height and tilt; never draw it from a different, standing viewpoint, and never lower the camera to show more of the place. `
        : `Draw the ${g} and the lower part of the place from this same camera height and tilt, so their lines recede to the same vanishing points as the table's; never draw them from a different, standing viewpoint, and never lower the camera to show walls, sky or the horizon. `) +
      `Foreground and background share one perspective: everything in the picture, from the nearest dish to the ${g} beyond the table, is seen from this one ${pitch}-degree view, with no part drawn flatter, steeper or from another direction. ` +
      `The table is ${ctx.surfaceText?.trim() || "an ordinary dining table"} at its real size and height, not enlarged or tipped up toward the camera. ` +
      realHeights(ctx.venue, ctx.surface)
    );
  }
  return (
    `One camera, from ${from}, ${tilt}; ${eyeLine}. ` +
    (angle.hidden.note ? `${angle.hidden.note} ` : "") +
    "Draw the room, walls, furniture and background from this same camera height and tilt, so their lines meet the same eye level as the table's; never draw the room from a different, standing viewpoint. " +
    `Foreground and background share one perspective: everything in the picture, from the nearest dish to the far wall, is seen from this one ${pitch === 0 ? "level" : `${pitch}-degree`} view, with no part drawn flatter, steeper or from another direction. ` +
    "The table is an ordinary dining table at its real size and height, not enlarged or tipped up toward the camera. " +
    REAL_HEIGHTS
  );
}

/**
 * Table height drift (Fernando, 2026-11-14): at the near-overhead test angle the table was drawn at
 * bar height, level with the sofa back and the kitchen counters, with the room seen from eye level.
 * Every angle states the real heights the room is built around.
 */
export const REAL_HEIGHTS =
  "Real heights stay true to the room: the tabletop is about 75 cm off the floor, chair seats about 45 cm, a sofa seat about 45 cm and its back about 85 cm, kitchen counters about 90 cm; the floor is always a full table height below the tabletop, never drawn level with it or just under it.";

/** REAL_HEIGHTS for a steep view, from the surface's own height and the kind of place. */
function realHeights(venue?: Venue, surface?: Surface): string {
  const h = surfaceHeightCm(surface);
  if (venue === "on-the-go")
    return `Real heights stay true: the tabletop is about ${h} cm off the ground, and the ground is always a full ${h} cm below it, never drawn level with it or just under it.`;
  if (venue === "restaurant")
    return `Real heights stay true to the room: the tabletop is about ${h} cm off the floor and chair seats about 45 cm; the floor is always a full table height below the tabletop, never drawn level with it or just under it.`;
  return REAL_HEIGHTS.replace("the tabletop is about 75 cm", `the tabletop is about ${h} cm`);
}

/** Where the table's far edge sits in the frame, matching the solver's limit for this angle (solver.ts rearLimit). */
export function farEdgeSentence(angle: AngleOption): string {
  const rear = angle.hidden.rear_edge_max_y ?? 0.5;
  if (rear >= 1) return "the tabletop runs past the top of the frame, so no background shows above it.";
  if (horizonPlace(angle.hidden.pitch_deg) === "well-above" && angle.hidden.pitch_deg >= 60)
    return `the table's far edge sits no higher than about ${Math.round(rear * 100)}% of the way up the frame; the narrow strip above it shows only the floor beyond the table, seen from high above, never a wall or furniture seen from the side.`;
  return rear <= 0.5
    ? "the table's far edge sits at or below the middle of the frame, leaving the upper half for soft background."
    : `the table's far edge sits no higher than about ${Math.round(rear * 100)}% of the way up the frame, leaving the strip above it for soft background.`;
}

/** What this camera sees of the room behind the table, by where the eye level falls (agent and photo prompts). */
export function backgroundView(angle: AngleOption, venue?: Venue): string {
  const kind = viewKind(angle);
  if (venue === "on-the-go" && kind === "overhead")
    return "almost nothing beyond the table: past its far edge only a narrow strip of the ground, seen from high above and a full table height below the tabletop, with at most the foot of a stall, a bench or a planter in it; no stalls, awnings, people, walls or sky, which are all out of frame above";
  if (venue === "on-the-go" && kind === "steep")
    return `looking down about ${angle.hidden.pitch_deg} degrees, mostly the ground beyond the table seen from above: paving, grass or sand, the feet of stalls, benches or other tables; no sky, and nothing seen at eye level`;
  if (angle.hidden.background) return angle.hidden.background;
  switch (horizonPlace(angle.hidden.pitch_deg)) {
    case "inside":
      return "the far wall seen nearly straight on, with chair backs, the tops of other tables and wall details at about table height";
    case "just-above":
      return "the room seen from just above table height: the tops of other tables and chair seats, with the walls rising into the top of the frame";
    default:
      return `looking down about ${angle.hidden.pitch_deg} degrees, mostly the floor and the lower part of the room seen from above: chair seats, other tabletops, the bases of walls and furniture; no ceiling, and no window or wall detail seen at eye level`;
  }
}

/** Which background details the agent may name: a steep camera sees floor, not walls and windows (agent.ts environmentalOverview). */
export function backgroundDetails(angle: AngleOption, venue?: Venue): string {
  const kind = viewKind(angle);
  const out = venue === "on-the-go";
  if (kind === "overhead")
    return out
      ? "the ground's material and color (paving, grass, sand), the foot of a stall or a bench, all seen from high above; never stalls, awnings, people or sky, which are out of frame"
      : "the floor's material and color, the edge of a rug, the seat of a chair, all seen from high above; never a wall, window, counter or sofa back, which are out of frame";
  if (kind === "steep")
    return out
      ? "the ground (paving, grass, sand), the feet of stalls, benches or other tables, seen from above; never sky, awnings or anything at eye level"
      : "the floor's material and color, chair seats, other tabletops and the bases of walls and furniture, seen from above; never a window or wall detail at eye level";
  return "wall color, tile, chairs, plants, a window where one would be in view";
}

/**
 * Perspective drift (Fernando, 2026-10-20): backgrounds were drawn from a different viewpoint than
 * the table. The tabletop and background segment restates the camera, so the room is built on the
 * table's own perspective rather than described as if from anywhere.
 */
export function backgroundPerspectiveSentence(angle: AngleOption, venue?: Venue): string {
  const kind = viewKind(angle);
  if (kind !== "level") {
    const g = groundWord(venue);
    const lead = `The tabletop and the background are seen through the same camera as the table, tilted about ${angle.hidden.pitch_deg} degrees down from ${angle.hidden.viewpoint ?? "a seated diner's eye height"}, so the background shows ${backgroundView(angle, venue)}. `;
    return kind === "overhead"
      ? lead + `The edges of the tabletop and the ${g} beyond it recede to the same vanishing points as the table; table and chair legs, where any show, slant exactly as the table's own legs do in this view; and anything on the ${g} beyond the table is drawn smaller with distance at the same rate as the table itself.`
      : lead +
          (venue === "on-the-go"
            ? "The edges of the tabletop and the ground, and the feet of stalls, benches and other tables, all recede to the same vanishing points as the table; every upright (stall poles, bench and table legs) slants exactly as the table's own legs do in this view, never more or less; "
            : "The edges of the tabletop, the floor and the bases of walls and furniture all recede to the same vanishing points as the table; every upright (chair and table legs, the lower part of wall corners) slants exactly as the table's own legs do in this view, never more or less; ") +
          "and everything behind the table gets smaller with distance at the same rate as the table itself, so a chair two meters back is drawn smaller than the chairs at this table.";
  }
  return (
    `The tabletop and the background are seen through the same camera as the table, ${angle.hidden.pitch_deg === 0 ? "held level" : `tilted about ${angle.hidden.pitch_deg} degrees down`} from ${angle.hidden.viewpoint ?? "a seated diner's eye height"}, ` +
    `so the background shows ${backgroundView(angle)}. ` +
    "The edges of the tabletop, the floor, wall bases, shelves and window sills all recede to the same vanishing points and the same eye level as the table; " +
    "every upright (wall corners, door and window frames, shelf sides, chair and table legs) slants exactly as the table's own legs do in this view, never more or less; " +
    "and everything behind the table gets smaller with distance at the same rate as the table itself, so a chair two meters back is drawn smaller than the chairs at this table."
  );
}

// ---------------------------------------------------------------------------
// Time of day and lighting
// ---------------------------------------------------------------------------

export function timeFromOccasion(o: Occasion): SceneSpec["scene"]["time"] | null {
  const map = lightingPresets.time_of_day.from_occasion as Record<string, string>;
  return (map[o] as SceneSpec["scene"]["time"]) ?? null;
}

export interface LightingPreset {
  id: string;
  /** A short lowercase phrase for the light, closing the film sentence (story.ts filmSentence). */
  condition?: string;
  prompt: string;
  warmth: "neutral" | "cool" | "warm" | "ambient";
  rig: {
    key: { type: string; azimuth_deg: number; elevation_deg: number; kelvin: number; softness: number };
    fill_ratio: number;
    ambient_kelvin: number;
    practicals?: string[];
  };
}

export function selectLighting(scene: SceneSpec["scene"]): LightingPreset {
  const presets = lightingPresets.presets as Record<string, Omit<LightingPreset, "id">>;
  const def = lightingPresets.default_preset as { preset: string | null; except_times?: string[] } | null;
  const forced = def?.preset;
  if (forced && !def?.except_times?.includes(scene.time)) return { id: forced, ...presets[forced] };
  for (const row of lightingPresets.select) {
    const venueOk = row.venue === "*" || row.venue === scene.venue || (Array.isArray(row.venue) && row.venue.includes(scene.venue));
    if (row.setting === scene.setting && venueOk && row.time.includes(scene.time)) {
      const p = (lightingPresets.presets as Record<string, Omit<LightingPreset, "id">>)[row.preset];
      return { id: row.preset, ...p };
    }
  }
  const fallback = "home-window-daylight";
  return { id: fallback, ...(lightingPresets.presets as Record<string, Omit<LightingPreset, "id">>)[fallback] };
}

export function skuLightSentence(sku: SkuInfo, glass: boolean, warmth: LightingPreset["warmth"]): string {
  if (lightingPresets.sku_light.paper_cup.packages.includes(sku.package)) return lightingPresets.sku_light.paper_cup.prompt;
  const transparent = lightingPresets.sku_light.transparent.packages.includes(sku.package);
  if (!transparent) return lightingPresets.sku_light.opaque.prompt;
  const drinks = glass ? "the Coca-Cola bottle and the bell-shaped Coca-Cola glass" : "the Coca-Cola bottle";
  return (lightingPresets.sku_light.transparent.prompt_by_warmth as Record<string, string>)[warmth].replace("{drinks}", drinks);
}

// ---------------------------------------------------------------------------
// SKU size, venue and glass rules
// ---------------------------------------------------------------------------

export const LARGE_SKU_ML = glassRules.large_sku.sku_volume_ml_at_least;

export function isLargeSku(sku: SkuInfo): boolean {
  return sku.volumeMl >= LARGE_SKU_ML;
}

export type GlassRule = "never" | "required" | "optional";

export function glassRule(sku: SkuInfo, venue: SceneSpec["scene"]["venue"]): GlassRule {
  if (venue === "on-the-go" || sku.package === "fountain-cup") return "never";
  if (isLargeSku(sku)) return "required";
  return "optional";
}

export function venueAllowed(sku: SkuInfo, venue: SceneSpec["scene"]["venue"]): boolean {
  return !isLargeSku(sku) || (glassRules.large_sku.allowed_venues as string[]).includes(venue);
}

function stylingMatchText(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9&']+/g, " ")} `;
}

/** The food-styling rules (rules/food-styling.json) of every dish named in the texts, grouped per dish; empty when none match. */
export function foodStylingRules(texts: Array<string | undefined>): Array<{ label: string; rules: string[] }> {
  const haystack = stylingMatchText(texts.filter(Boolean).join(" \n "));
  return foodStyling.dishes
    .filter((d) => d.match.some((m) => haystack.includes(stylingMatchText(m))))
    .map((d) => ({ label: d.label, rules: d.rules }));
}

/** The camera a draft starts with before the Camera Angle step: the default look and the angle recommended for the dish. */
export function defaultCamera(entree: Parameters<typeof recommendAngle>[0]): { look: string; angle: string } {
  return { look: DEFAULT_LOOK, angle: recommendAngle(entree)?.angle ?? DEFAULT_ANGLE };
}
