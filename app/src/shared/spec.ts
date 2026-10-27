// Intake answers → SceneSpec. Shared by the browser (to show rule effects as
// the operator goes) and the server (to compose and write the story).

import { SKU_CATALOG, seatLikeSurface, withoutRoundTable } from "./registry";
import { DEFAULT_POSE } from "./poses";
import { glassRule, timeFromOccasion } from "./rules";
import { venueType } from "./venues";
import type { AccentChoice, IntakeInput, Occasion, PlatingChoice, PrepChoice, SceneSpec, SidesChoice, SkuInfo, Surface } from "./types";

/** Occasions that get an everyday dinner-size napkin; the rest get a luncheon napkin. */
const DINNER_NAPKIN_OCCASIONS: Occasion[] = ["dinner", "late-night", "celebration"];

export interface Selections {
  prep?: PrepChoice;
  plating?: PlatingChoice;
  sides?: SidesChoice;
  scene?: {
    setting: SceneSpec["scene"]["setting"];
    venue: SceneSpec["scene"]["venue"];
    party: SceneSpec["scene"]["party"];
    time?: SceneSpec["scene"]["time"];
    surface?: Surface;
    surfaceText?: string;
    venueType?: string;
    environmentNote?: string;
    /** People sit at the table (two people only, for now). */
    seated?: boolean;
    pose?: string;
    /** Where the two seated people sit; the corner unless "across" (over the shoulder). */
    seating?: "corner" | "across";
    /** One person at the table (party "1"): how they show; unset = nobody at the table. */
    solo?: "facing" | "shoulder" | "hands";
  };
  glass?: boolean;
  camera?: { look: string; angle: string };
  accent?: AccentChoice | null;
  /** On the go only: the operator chose a plain paper napkin as the third item instead of an accent. */
  napkin?: boolean;
}

/**
 * What main offers at the table. Fernando held it to one diner with nobody seated on 2026-10-20
 * and brought people back on 2026-10-27, up to two. Set either to false to hide it again; saved
 * projects that picked it then open as one diner with nobody seated.
 */
export const SCENE_LIMITS = { twoDiners: true, seatedPeople: true };

/** A scene answer held to SCENE_LIMITS: a party of two becomes one, and nobody sits at the table. */
export function limitScene<S extends { party: SceneSpec["scene"]["party"]; seated?: boolean; pose?: string; seating?: string; solo?: string }>(scene: S): S {
  let next = scene;
  if (!SCENE_LIMITS.twoDiners && next.party === "2") next = { ...next, party: "1" };
  if (!SCENE_LIMITS.seatedPeople && (next.seated || next.pose || next.solo)) {
    const { seated: _seated, pose: _pose, seating: _seating, solo: _solo, ...rest } = next;
    next = rest as S;
  }
  return next;
}

export function skuById(id: string): SkuInfo | undefined {
  return SKU_CATALOG.find((s) => s.id === id);
}

export function defaultSurface(venue: SceneSpec["scene"]["venue"], party: SceneSpec["scene"]["party"], shared = false): Surface {
  if (venue === "on-the-go") return "picnic-table";
  if (shared || party === "group" || party === "family") return "long-table";
  return "table-4top";
}

/** Resolve the glass answer against the SKU/venue rules. */
export function resolveGlass(sku: SkuInfo, venue: SceneSpec["scene"]["venue"], answer: boolean | undefined): boolean {
  const rule = glassRule(sku, venue);
  if (rule === "never") return false;
  if (rule === "required") return true;
  return answer ?? false;
}

export function buildSpec(brief: IntakeInput & { countryLabel?: string }, sel: Selections): SceneSpec {
  const sku = skuById(brief.skuId);
  if (!sku) throw new Error(`unknown SKU ${brief.skuId}`);
  if (!sel.prep || !sel.plating || !sel.sides || !sel.scene || !sel.camera) throw new Error("intake is not complete");
  const scene = limitScene(sel.scene);
  const time = scene.time ?? timeFromOccasion(brief.occasion) ?? "midday";
  const venue = scene.venue;
  const shared = sel.plating.service === "shared";
  const place = venueType(venue, scene.venueType);
  return {
    specVersion: "0.2",
    operatingUnit: brief.operatingUnit,
    country: brief.country,
    countryLabel: brief.countryLabel ?? brief.country,
    region: brief.region ?? "",
    occasion: brief.occasion,
    heroDish: brief.heroDish,
    scene: {
      setting: scene.setting,
      venue,
      party: scene.party,
      time,
      surface: scene.surface ?? (shared ? undefined : place?.surface) ?? defaultSurface(venue, scene.party, shared),
      // A seat, step or the ground chosen before the table rule falls back to the surface's own description.
      surfaceText: (seatLikeSurface(scene.surfaceText) ? undefined : scene.surfaceText && withoutRoundTable(scene.surfaceText)) ?? place?.surfaceText,
      venueType: place?.id,
      environmentNote: scene.environmentNote?.trim() || undefined,
      ...(scene.seated && scene.party === "2" ? { seated: true, pose: scene.pose ?? DEFAULT_POSE, ...(scene.seating === "across" ? { seating: "across" as const } : {}) } : {}),
      ...(scene.party === "1" && scene.solo ? { solo: scene.solo } : {}),
    },
    camera: sel.camera,
    sku: { ...sku, glass: resolveGlass(sku, venue, sel.glass) },
    entree: { name: brief.heroDish, prep: sel.prep, plating: sel.plating },
    accompaniments: sel.sides.accompaniments.map((a) => (shared && a.role !== "condiment" && a.role !== "sauce" && a.role !== "garnish" ? { ...a, service: "shared" as const } : a)),
    napkinSet:
      venue === "on-the-go"
        ? sel.napkin
          ? { napkinShape: "rect", material: "paper", size: "luncheon", cutlery: [], targets: "MAIN" }
          : null
        : {
            napkinShape: "rect",
            material: venue === "restaurant" ? "polyester" : "cotton",
            size: DINNER_NAPKIN_OCCASIONS.includes(brief.occasion) ? "dinner" : "luncheon",
            // Older saved sessions have no cutlery answer; they keep the Western default.
            cutlery: sel.sides.cutlery ?? ["fork", "knife"],
            targets: "MAIN",
          },
    accent: sel.accent ?? null,
  };
}
