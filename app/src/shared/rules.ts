// Rule data files live in /rules so they can change without code changes.
import cameraOptions from "../../rules/camera-options.json";
import lightingPresets from "../../rules/lighting-presets.json";
import glassRules from "../../rules/glass-rules.json";
import foodStyling from "../../rules/food-styling.json";
import type { Occasion, SceneSpec, SkuInfo } from "./types";

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
  hidden: { pitch_deg: number; setback_scale?: number; front_edge_min_y?: number; rear_edge_max_y?: number };
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
export function lookSentence(look: LookOption, drinks: string, depth: DepthOption = depthById(undefined)): string {
  if (!look.prompt.startsWith("[")) return look.prompt;
  // The lens itself is named by the film sentence (story.ts filmSentence).
  return [depth.focus.replaceAll("{drinks}", drinks), depth.layers, look.texture].filter(Boolean).join(" ");
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

export function angleSentence(angle: AngleOption): string {
  if (!angle.prompt.startsWith("[")) return angle.prompt;
  const pitch = angle.hidden.pitch_deg;
  const place = horizonPlace(pitch);
  const eyeLine =
    place === "inside"
      ? `the horizon (the camera's eye level) sits about ${Math.round(horizonFromTop(pitch) * 100)}% down from the top of the frame`
      : place === "just-above"
        ? "the horizon (the camera's eye level) sits just above the top edge of the frame"
        : "the horizon (the camera's eye level) is well above the frame, so the room behind is seen from above";
  return (
    `One camera, from a seated diner's eye height, tilted about ${pitch} degrees down toward the table; ${eyeLine}. ` +
    "Draw the room, walls, furniture and background from this same camera height and tilt, so their lines meet the same eye level as the table's; never draw the room from a different, standing viewpoint. " +
    "The table is an ordinary dining table at its real size and height, not enlarged or tipped up toward the camera."
  );
}

/** Where the table's far edge sits in the frame, matching the solver's limit for this angle (solver.ts rearLimit). */
export function farEdgeSentence(angle: AngleOption): string {
  const rear = angle.hidden.rear_edge_max_y ?? 0.5;
  return rear <= 0.5
    ? "the table's far edge sits at or below the middle of the frame, leaving the upper half for soft background."
    : `the table's far edge sits no higher than about ${Math.round(rear * 100)}% of the way up the frame, leaving the strip above it for soft background.`;
}

/** What this camera sees of the room behind the table, by where the eye level falls (agent and photo prompts). */
export function backgroundView(angle: AngleOption): string {
  switch (horizonPlace(angle.hidden.pitch_deg)) {
    case "inside":
      return "the far wall seen nearly straight on, with chair backs, the tops of other tables and wall details at about table height";
    case "just-above":
      return "the room seen from just above table height: the tops of other tables and chair seats, with the walls rising into the top of the frame";
    default:
      return `looking down about ${angle.hidden.pitch_deg} degrees, mostly the floor and the lower part of the room seen from above: chair seats, other tabletops, the bases of walls and furniture; no ceiling, and no window or wall detail seen at eye level`;
  }
}

/**
 * Perspective drift (Fernando, 2026-10-20): backgrounds were drawn from a different viewpoint than
 * the table. The tabletop and background segment restates the camera, so the room is built on the
 * table's own perspective rather than described as if from anywhere.
 */
export function backgroundPerspectiveSentence(angle: AngleOption): string {
  return (
    `The tabletop and the background are seen through the same camera as the table, tilted about ${angle.hidden.pitch_deg} degrees down from a seated diner's eye height, ` +
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
  if (venue === "on-the-go") return "never";
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
