// The story output: Scene Summary + prompt segments (the segment set defined
// in knowledge-base/00-methods/image-generation-pipeline.md Stage 3), plus
// one segment per proxy label so the image model can map each labeled shape
// in the proxy PNG to its text.

import { z } from "zod";
import { BELL_GLASS, NAPKIN_SIZES, SURFACES, VESSELS, RECTANGULAR_TABLE_RULE, VESSEL_SHORT, napkinFoldedCm, skuProxy, vesselPhrase, withoutRoundTable } from "./registry";
import { Projector } from "./camera";
import { seatedPeopleRule, hasSeatedPeople, isOverShoulder, personText, soloMode } from "./people";
import { BACKGROUND_PEOPLE_RULE, type LightingPreset, angleById, angleSentence, backgroundPerspectiveSentence, farEdgeSentence, depthById, glassRules, isLargeSku, lookById, lookSentence, selectLighting, skuLightSentence, withoutHands } from "./rules";
import { sceneItems } from "./scene";
import type { Blueprint, Primitive, SceneSpec, Vessel } from "./types";
import { venueType } from "./venues";

export const StorySegments = z.object({
  entreeDish: z.string(),
  traditionalSideDishes: z.array(z.string()).describe("One segment per side dish or condiment"),
  productDetail: z.string(),
  environmentalOverview: z.string(),
  platingAndTableware: z.string(),
  productServingDetails: z.string(),
  brandVisId: z.string().describe("Camera, lens, angle and framing"),
});
export type StorySegments = z.infer<typeof StorySegments>;

export const Story = z.object({
  sceneSummary: z.string().describe("A few paragraphs of prose, written like a food stylist's brief"),
  briefSummary: z.string().describe("The scene summary abbreviated to about half its length"),
  culturalNotes: z.array(z.string()).describe("Cultural do's and don'ts for this scene, each one line"),
  segments: StorySegments,
  labelSegments: z.array(z.object({ label: z.string(), text: z.string() })).describe("One entry per proxy label, in the given order"),
});
export type Story = z.infer<typeof Story>;

export const Validation = z.object({
  pass: z.boolean(),
  notes: z.array(z.string()).describe("Specific problems found; empty when the scene passes"),
});
export type Validation = z.infer<typeof Validation>;

/** The generated scene compared with the story and the prompt it was made from. */
export const ImageCheck = z.object({
  images: z
    .array(
      z.object({
        image: z.number().int().describe("1-based image number, in the order the images were given"),
        pass: z.boolean().describe("False when the image has any major issue"),
        issues: z.array(
          z.object({
            element: z.string().describe('The node it concerns, from the given list (MAIN, SIDE_1, SKU, ENVIRONMENT …), or "SCENE" for the whole image'),
            severity: z.enum(["major", "minor"]).describe("major = a food stylist would reject the image for it"),
            expected: z.string().describe("What the story and prompt ask for, briefly"),
            seen: z.string().describe("What the image actually shows"),
            fix: z.string().describe("A sentence to add to that node's text so the next generation gets it right"),
          })
        ),
      })
    )
    .describe("One entry per image, in order"),
  summary: z.string().describe("One or two sentences: which image is closest and what most needs fixing"),
});
export type ImageCheck = z.infer<typeof ImageCheck>;

/** Facts computed from the rules and the chosen layout. The story must use them verbatim. */
export interface StoryFacts {
  genreLine: string;
  lightingId: string;
  lightingSentence: string;
  lightingWarmth: "neutral" | "cool" | "warm" | "ambient";
  skuLightSentence: string;
  /** Optional so stories saved before it existed still load. */
  colorSentence?: string;
  /** The photodocumentary look: subject, place, lens, film and light. Optional so older stories still load. */
  filmSentence?: string;
  lookSentence: string;
  angleSentence: string;
  /** The tabletop and background seen through the same camera (rules.ts backgroundPerspectiveSentence). Optional so older stories still load. */
  backgroundPerspective?: string;
  /** Corner layouts: where the table's corner and edges sit in the frame. Empty otherwise. */
  viewSentence: string;
  framingSentence: string;
  surfaceText: string;
  servingSentence: string;
  labels: Array<{
    label: string;
    what: string;
    where: string;
    /** The container, with its real size, worded so the text matches the proxy shape. */
    vessel: string;
    /** Product and napkin labels use fixed text; only food labels are written by the agent. */
    fixedText?: string;
    /** Second place setting (party "2"): this label's text is derived from the single-setting
     * label named here (currently only MAIN_2 → "MAIN") instead of written by the agent. */
    sameAs?: string;
    /** Text prepended before the referenced label's resolved text. */
    sameAsPrefix?: string;
  }>;
  labelInstruction: string;
  /** Opens the image prompt: how to read the proxy (image 1). */
  proxyInstruction: string;
  /** Target object sizes in the frame, from the true framing. */
  scaleSentence: string;
  /** The Coca-Cola product's and the glass's real sizes next to the plate. */
  productScale: string;
  /** The art director's placement changes from the sketch review; they amend the layout guide. */
  adjustments?: string[];
  /** The approved sketch for this layout, when there is one: it replaces the proxy as image 1. */
  layoutSketch?: { url: string };
  /** The art director's changes in their own words, applied on top of image 1: with a sketch, only
   * the ones it doesn't show yet ("approved with changes"); without one, all of them. */
  directorChanges?: string[];
  /** Closes the image prompt. */
  exclusions: string;
}

/** Labels whose text the agent writes (the food). Second-setting labels that copy another label's text are excluded. */
export function foodLabels(facts: StoryFacts): StoryFacts["labels"] {
  return facts.labels.filter((l) => !l.fixedText && !l.sameAs);
}

/** Centimeters to the nearest half (a 12 in plate reads 30.5 cm). */
function cm(m: number): number {
  return Math.round(m * 200) / 2;
}

/**
 * A single-serve drink with no glass beside it is ready to drink: the can's tab is open, or the
 * bottle is uncapped with its cap lying beside it (part of the drink, not an extra object). A
 * shared bottle or one served with a glass stays closed.
 */
function openingText(spec: SceneSpec): string {
  const open = !spec.sku.glass && !isLargeSku(spec.sku);
  if (spec.sku.package === "can") return open ? "Opened, its tab pulled up, no straw." : "Unopened, no straw.";
  if (!open) return "Capped, no straw.";
  const cap = spec.sku.package === "contour-glass-bottle" ? "its red crown cap lying upside down" : "its red screw cap lying on its side";
  return `Opened: no cap on the neck, ${cap} on the table right beside the bottle's base (the cap is part of the bottle, not another object), no straw. Where its description or product photo shows the cap on, this overrides it: the cap is off.`;
}

function labelVessel(spec: SceneSpec, proxy: string, role: string, style?: string, seated = false): { vessel: string; fixedText?: string } {
  const isPartnerDrink = role === "partner-sku" || role === "partner-glass";
  if (proxy.startsWith("sku:")) {
    const h = cm(skuProxy(spec.sku).height);
    const cold = `cold, with fine condensation on the ${spec.sku.package === "can" ? "can" : spec.sku.package === "pet-bottle" ? "bottle" : "glass"}`;
    // Describe the shape, not the catalog name: package words in the prompt get printed on the label.
    const shape =
      spec.sku.package === "can"
        ? "Coca-Cola can"
        : spec.sku.package === "contour-glass-bottle"
          ? "glass Coca-Cola bottle in the classic contour shape, filled to the neck with cola"
          : "clear plastic Coca-Cola bottle, filled to the neck with cola";
    const label = spec.sku.appearance
      ? `It is a ${spec.sku.appearance}; print nothing on it beyond that real label`
      : `${spec.sku.package === "can" ? "The can shows the white Coca-Cola script logo on red" : "A solid red label band wraps the middle of the bottle, with the white Coca-Cola script logo"}; print no other words, sizes or descriptions on it`;
    const text = `exactly one ${shape}, about ${h} cm tall, standing upright and facing the camera straight on so the full logo reads, ${cold}. ${openingText(spec)} ${label}.${isPartnerDrink ? " This is the second diner's own, a duplicate of the other one." : ""}`;
    return { vessel: `the ${spec.sku.displayName}, about ${h} cm tall${isPartnerDrink ? " (the second diner's)" : ""}`, fixedText: text[0].toUpperCase() + text.slice(1) };
  }
  if (proxy === "bell-glass") {
    const text = `Exactly one classic Coca-Cola bell glass, about ${cm(BELL_GLASS.height)} cm tall: a stemless tumbler with a heavy flat base and a narrow lower body that swells into a rounded bell shape near the top, the white Coca-Cola script on the bell (no stem, not a goblet, wine glass, pint glass or straight-sided tumbler). ${glassRules.glass.fill_prompt[0]!.toUpperCase()}${glassRules.glass.fill_prompt.slice(1)}, with ice and a thin head of foam, the logo facing the camera.${role === "partner-glass" ? " This is the second diner's own glass." : ""}`;
    return { vessel: `a branded bell-shaped Coca-Cola glass, about ${cm(BELL_GLASS.height)} cm tall${role === "partner-glass" ? " (the second diner's)" : ""}`, fixedText: text };
  }
  if (role === "napkin-set" || role === "partner-napkin") {
    const cutlery = spec.napkinSet ? spec.napkinSet.cutlery.join(" and ") : "fork and knife";
    const size = spec.napkinSet?.size ?? "luncheon";
    const material = spec.napkinSet?.material ?? "cotton";
    const [w, d] = napkinFoldedCm(size);
    const kind = size === "dinner" ? "everyday dinner napkin" : "luncheon napkin";
    // Seated, each person's cutlery faces them (PERSON_1 sits across from the camera).
    const facing = seated
      ? `handles toward ${role === "partner-napkin" ? "PERSON_2" : "PERSON_1"}`
      : role === "partner-napkin" ? "handles toward the second diner" : "handles toward the camera";
    if (material === "paper") {
      const text = `A plain white paper napkin, folded into a flat rectangle about ${w} by ${d} cm, lying flat with its long side toward the camera. Soft, slightly textured paper with a light embossed edge, no print, logo or text, no cutlery on it.`;
      return { vessel: "a folded paper napkin", fixedText: text };
    }
    const cloth =
      material === "polyester"
        ? "a smooth polyester restaurant napkin with a faint sheen, crisp pressed edges and no wrinkles"
        : "a soft cotton napkin with a matte woven texture and a few gentle natural creases";
    const text = `A plain ${kind} (${NAPKIN_SIZES[size].inches} inches, about ${NAPKIN_SIZES[size].cm} cm square unfolded): ${cloth}, folded only twice, in thirds and then in half, into a flat rectangle about ${w} by ${d} cm and a few millimetres thick. It lies flat, long side toward the camera, ${cutlery ? `with a ${cutlery} on top, ${facing}` : "with nothing on it"}. Not a thick stack of folds, no decorative fold, no napkin ring. No print or text on the napkin.`;
    return { vessel: `a folded ${material} napkin`, fixedText: text };
  }
  if (proxy in VESSELS) return { vessel: vesselPhrase(proxy as Vessel, style) };
  return { vessel: proxy };
}

/**
 * Seated corner (staging): the camera looks across the corner, so "left" and "behind" in table
 * terms don't match the frame. Say where each thing lands in the picture, and whose place it is.
 */
function whereInFrame(bp: Blueprint, p: Primitive): string {
  const b = p.screen_bbox;
  const h = b ? ((b.x0 + b.x1) / 2 < 0.38 ? "left" : (b.x0 + b.x1) / 2 > 0.62 ? "right" : "centre") : "centre";
  if (p.role === "person") return soloMode(bp) === "hands" ? "out of frame at the right; only their hand and forearm reach in" : `seated at the table, on the ${h} of the frame`;
  if (p.held_by) return `in ${p.held_by}'s hand, ${h === "centre" ? "centre of the frame" : `${h} of the frame`}`;
  const v = b ? ((b.y0 + b.y1) / 2 < 0.3 ? "lower" : (b.y0 + b.y1) / 2 > 0.55 ? "upper" : "middle") : "middle";
  const spot = h === "centre" ? `${v} centre of the frame` : `${v} ${h} of the frame`;
  const people = hasSeatedPeople(bp);
  // Which side each place is on comes from where its plate stands now, so an edit that moves a plate is described as moved.
  const at = (id: string) => {
    const plate = bp.primitives.find((q) => q.id === id);
    return people || !plate ? "" : ` ${edgePhrase(bp, plate)}`;
  };
  // One person at the table: everything is theirs.
  if (soloMode(bp)) return `${spot}${["main", "sku", "glass", "napkin-set"].includes(p.role) ? ", at PERSON_1's place" : ""}`;
  const whose = p.role.startsWith("partner-")
    ? `, at ${people ? "PERSON_2's" : "the second diner's"} place${at("MAIN_2")}`
    : p.role === "sku" && !bp.primitives.some((q) => q.role === "partner-sku")
      ? ", between the two places, shared by both"
      : ["main", "sku", "glass", "napkin-set"].includes(p.role)
      ? `, at ${people ? "PERSON_1's" : "the first diner's"} place${at("MAIN")}`
      : ", between the two places";
  return `${spot}${whose}`;
}

type TableEdge = "far" | "near" | "left" | "right";

/** The table edge a plate stands nearest to: the side its diner sits on. */
function nearestEdge(bp: Blueprint, p: Primitive): TableEdge {
  const W = bp.table.width;
  const D = bp.table.depth;
  const gaps: Array<[TableEdge, number]> = [
    ["far", D - p.world.d],
    ["near", p.world.d],
    ["left", W / 2 + p.world.x],
    ["right", W / 2 - p.world.x],
  ];
  return gaps.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
}

function edgePhrase(bp: Blueprint, p: Primitive): string {
  const e = nearestEdge(bp, p);
  return e === "far" ? "on the far long side" : e === "near" ? "on the near long side" : `at the table's ${e} end`;
}

/** Two diners at a right angle around one corner of the table, people shown or not. */
function isCornerLayout(bp: Blueprint): boolean {
  return hasSeatedPeople(bp) || bp.primitives.some((q) => q.role === "partner-main" && Math.abs(q.rotation_euler_deg.yaw) === 90);
}

/**
 * How the table sits in a corner layout's frame, in words (Fernando, 2026-10-17): the image model
 * otherwise redraws the table square-on with the plates side by side, ignoring image 1.
 */
export function cornerViewSentence(spec: SceneSpec, bp: Blueprint): string {
  if (isOverShoulder(bp)) return overShoulderViewSentence(bp);
  if (!isCornerLayout(bp)) return "";
  const main2 = bp.primitives.find((q) => q.role === "partner-main");
  if (!main2) return "";
  const surf = SURFACES[spec.scene.surface];
  // The corner is the one the camera looks across (left when it stands off the right side), not
  // wherever MAIN_2 stands: an edit can move MAIN_2, never the camera.
  const side = bp.camera.position[0] > 0 ? "left" : "right";
  const other = side === "left" ? "right" : "left";
  const c = bp.camera;
  const turn = Math.round((Math.abs(Math.atan2(c.target[0] - c.position[0], -(c.target[2] - c.position[2]))) * 180) / Math.PI / 5) * 5;
  const proj = new Projector(c);
  const corner = proj.project(((side === "left" ? -1 : 1) * surf.width) / 2, 0, surf.depth);
  const h = corner.x < 0.38 ? "left of centre" : corner.x > 0.62 ? "right of centre" : "near the middle";
  const v = corner.y > 1 ? "just above the top edge of the frame" : corner.y > 0.6 ? "in the upper part of the frame" : "in the middle of the frame";
  const people = hasSeatedPeople(bp);
  const first = people ? "PERSON_1" : "the first diner";
  const second = people ? "PERSON_2" : "the second diner";
  const main = bp.primitives.find((q) => q.id === "MAIN");
  // Each place is said where its plate stands now (an edit can move a plate to another side).
  const e1 = main ? nearestEdge(bp, main) : "far";
  const e2 = nearestEdge(bp, main2);
  const around = [e1, e2].includes("far") && [e1, e2].includes(side);
  const places = people
    ? `${first}'s place (MAIN) is on the far long side and ${second}'s place (MAIN_2) is at the table's ${side} end, at a right angle to each other around that corner, never side by side or opposite each other.`
    : `${first[0]!.toUpperCase()}${first.slice(1)}'s plate (MAIN) is ${main ? edgePhrase(bp, main) : "on the far long side"} and ${second}'s plate (MAIN_2) is ${edgePhrase(bp, main2)}${around ? ", at a right angle to each other around that corner, never side by side or opposite each other." : ", each exactly where image 1 puts it."}`;
  return `The camera is not square to the table: it stands off the table's near ${other} side and is turned about ${turn} degrees, looking diagonally across the tabletop toward the table's far ${side} corner, which sits ${h}, ${v}, exactly as in image 1. From that corner the table's far long edge runs away toward the ${other} of the frame and its ${side} end edge runs down toward the ${side}, so no table edge runs straight across the frame. ${places} The table's near edges and near corner are mostly out of frame.${people ? "" : " An empty chair is pulled up at each diner's place, just behind the table edge nearest their plate, as in image 1."}`;
}

/**
 * Over the shoulder (Fernando, 2026-10-27): the camera stands behind PERSON_1, off the near side,
 * turned so the table's near edge runs diagonally across the frame.
 */
function overShoulderViewSentence(bp: Blueprint): string {
  const c = bp.camera;
  const turn = Math.round((Math.abs(Math.atan2(c.target[0] - c.position[0], -(c.target[2] - c.position[2]))) * 180) / Math.PI / 5) * 5;
  const from = c.position[0] > c.target[0] ? "right" : "left";
  const angled = turn >= 10 ? `, turned about ${turn} degrees so the table's near edge runs diagonally across the lower part of the frame and no table edge runs straight across it` : "";
  return `The camera stands behind PERSON_1, just past their ${from === "right" ? "right" : "left"} shoulder on the table's near side${angled}, exactly as in image 1. PERSON_1 fills the left foreground, seen from behind; PERSON_2 sits across the table on the right, facing the camera. Each has their own place (PERSON_1's is MAIN, near the camera; PERSON_2's is MAIN_2, across the table), opposite each other.`;
}

/** An edit moved MAIN off its spot front and centre: say where it now stands, on the table and in the frame. */
function movedMainWhere(bp: Blueprint, p: Primitive): string {
  const depth = p.world.d / bp.table.depth;
  const onTable = depth > 0.6 ? "toward the back of the table" : depth > 0.35 ? "in the middle of the table" : "near the front edge of the table";
  const b = p.screen_bbox;
  const cx = b ? (b.x0 + b.x1) / 2 : 0.5;
  const inFrame = cx < 0.4 ? "on the left of the frame" : cx > 0.6 ? "on the right of the frame" : "in the centre of the frame";
  return `${onTable}, ${inFrame}, exactly where its shape sits in image 1`;
}

function whereOnTable(bp: Blueprint, id: string): string {
  const p = bp.primitives.find((q) => q.id === id)!;
  // Two diners sit at a right angle around a corner (seated people or just their settings): the
  // camera looks across that corner, so say where things land in the frame.
  if (isCornerLayout(bp)) return whereInFrame(bp, p);
  const main = bp.primitives.find((q) => q.id === "MAIN")!;
  // MAIN is placed front and centre; after an edit moves it, say where it now stands.
  if (id === "MAIN") return bp.layout_meta.moved?.includes("MAIN") ? movedMainWhere(bp, p) : "foreground, center of the frame";
  // Second place setting (party "2"): phrase from the partner's own yaw rather than its offset
  // from MAIN, since across and corner settings sit in very different directions from it.
  if (p.role.startsWith("partner-")) {
    const corner = p.rotation_euler_deg.yaw === 90;
    if (id === "MAIN_2") {
      return corner
        ? "at the left end of the table, the second diner's place, turned to face the entree"
        : "across the table, the second diner's place";
    }
    return corner ? "at the second diner's place, left end of the table" : "across the table, at the second diner's place";
  }
  const dx = p.world.x - main.world.x;
  const dd = p.world.d - main.world.d;
  const side = Math.abs(dx) < 0.06 ? "" : dx > 0 ? "right" : "left";
  const depth = dd > 0.06 ? "behind" : dd < -0.06 ? "in front of" : "beside";
  if (depth === "beside") return `to the ${side || "side"} of the entree`;
  return `${depth} the entree${side ? `, to the ${side}` : ""}`;
}

/**
 * Exact counts of plates, serving vessels, glasses and products (Fernando, 2026-10-16): image
 * tests added a third plate and extra glasses. A glass belongs to a diner's plate, never to a
 * serving dish or a shared bowl.
 */
export function countsSentence(bp: Blueprint): string {
  const n = (roles: string[]) => bp.primitives.filter((p) => roles.includes(p.role)).length;
  const words = ["no", "one", "two", "three", "four", "five", "six"];
  const w = (k: number) => words[k] ?? String(k);
  const portions = n(["main", "partner-main"]);
  const serving = bp.primitives.filter((p) => p.role === "shared-hero");
  const glasses = n(["glass", "partner-glass"]);
  const products = n(["sku", "partner-sku"]);
  const pkg = bp.primitives.find((p) => p.role === "sku")?.proxy.includes("can") ? "can" : "bottle";
  const parts = [
    // A test split each burger and its onion rings onto two plates (Fernando, 2026-10-17): one serving is one vessel.
    `exactly ${w(portions)} ${portions === 1 ? "serving" : "servings"} of the main dish (${portions === 2 ? "one at each diner's place, MAIN and MAIN_2" : "MAIN"}), ${portions === 1 ? "all of it together on its one vessel" : "each all together on its one vessel"}, never split across a second plate`,
    ...serving.map((p) => `one ${p.proxy in VESSEL_SHORT ? VESSEL_SHORT[p.proxy as Vessel] : "serving dish"} of it to share (${p.id}), which gets no glass and no place setting`),
    `${w(glasses)} Coca-Cola ${glasses === 1 ? "glass" : "glasses"}${glasses === 2 ? ", one beside each diner's plate" : glasses === 1 ? ", beside the diner's plate" : ""}`,
    `${w(products)} Coca-Cola ${products === 1 ? pkg : `${pkg}s`}`,
  ];
  // Every side, sauce, bread and accent dish once (Fernando, 2026-10-17): a test doubled the amba ramekin.
  const big = ["main", "partner-main", "shared-hero", "glass", "partner-glass", "sku", "partner-sku", "person"];
  const small = bp.primitives.filter((p) => !big.includes(p.role) && !p.proxy.includes("napkin")).map((p) => p.id);
  if (small.length) parts.push(`${w(small.length)} smaller ${small.length === 1 ? "dish" : "dishes"} (${small.join(", ")}), one of each, none repeated`);
  return `Count: ${parts.join("; ")}. Add no other plates, bowls, ramekins, glasses, cups or bottles anywhere on the table.`;
}

/** A drink a seated person holds: in their hand (or standing with their hand around it), logo to the camera. */
function heldText(text: string, p: Primitive): string {
  const lifted = p.world.elevation > 0;
  const how = lifted ? `held upright in ${p.held_by}'s hand a little above the table` : `standing on the table with ${p.held_by}'s hand wrapped loosely around it`;
  const out = text
    .replace("standing upright and facing the camera straight on so the full logo reads", `${how}, turned so the full logo faces the camera and no fingers cover it`)
    .replace("on the table right beside the bottle's base", "on the table near their plate");
  return out === text ? `${text} It is ${how}, the logo facing the camera and no fingers covering it.` : out;
}

export function storyFacts(spec: SceneSpec, bp: Blueprint): StoryFacts {
  const styles = new Map(sceneItems(spec).map((i) => [i.label, i.style]));
  const lighting = selectLighting(spec.scene);
  const drinks = spec.sku.glass ? "the Coca-Cola bottle and glass" : spec.sku.package === "can" ? "the Coca-Cola can" : "the Coca-Cola bottle";
  const venueWord = spec.scene.venue === "on-the-go" ? "street food" : spec.scene.venue === "restaurant" ? "restaurant food" : "home-cooked food";
  const shared = bp.primitives.some((p) => p.id === "SHARED_HERO");
  const hasPartner = bp.primitives.some((p) => p.role === "partner-main");
  const seated = hasSeatedPeople(bp);
  const tableItems = bp.primitives.filter((p) => p.role !== "person").length;
  const farEdge = farEdgeSentence(angleById(spec.camera.angle));
  const holders = bp.primitives.filter((p) => p.held_by).map((p) => p.held_by!);
  const holding = holders.length === 2 ? " Both people hold their own drink." : holders.length ? ` ${holders[0]} holds their own drink.` : "";
  const solo = soloMode(bp);
  const serving = solo
    ? (spec.sku.glass
      ? `A ${spec.sku.displayName} with a branded bell-shaped Coca-Cola glass filled to the top beside PERSON_1's plate.`
      : `A ${spec.sku.displayName} beside PERSON_1's plate, served as is, no glass.`) + holding
    : seated
    ? (spec.sku.glass
      ? shared || spec.sku.volumeMl >= 1000
        ? `A ${spec.sku.displayName} stands in the foreground as the one shared bottle, fully visible with nothing in front of it, its label to the camera; each person has a Coca-Cola bell glass filled to the top at their place.`
        : `Each person has their own ${spec.sku.displayName} beside their plate, with a branded bell-shaped Coca-Cola glass filled to the top next to it.`
      : `Each person has their own ${spec.sku.displayName} beside their plate, served as is, no glass.`) + holding
    : spec.sku.glass
    ? shared || spec.sku.volumeMl >= 1000
      ? hasPartner
        ? `A ${spec.sku.displayName} stands at the top right of the plate as the one shared bottle for the table, with a branded bell-shaped Coca-Cola glass filled to the top at each place.`
        : `A ${spec.sku.displayName} stands at the top right of the plate as the shared bottle, with a branded bell-shaped Coca-Cola glass filled to the top to its right.`
      : hasPartner
        ? `A ${spec.sku.displayName} at the top right of the plate, with a branded bell-shaped Coca-Cola glass filled to the top to its right; the second diner has their own ${spec.sku.displayName} and glass at their place.`
        : `A ${spec.sku.displayName} at the top right of the plate, with a branded bell-shaped Coca-Cola glass filled to the top to its right.`
    : hasPartner
      ? `A ${spec.sku.displayName} at the top right of the plate, served as is, no glass; the second diner has their own ${spec.sku.displayName} at their place.`
      : `A ${spec.sku.displayName} at the top right of the plate, served as is, no glass.`;
  return {
    genreLine: `Photorealistic ${venueWord} photography, 16:9.`,
    lightingId: lighting.id,
    lightingSentence: lighting.prompt,
    lightingWarmth: lighting.warmth,
    colorSentence: COLOR_BY_WARMTH[lighting.warmth],
    filmSentence: filmSentence(spec, lighting),
    skuLightSentence: skuLightSentence(spec.sku, spec.sku.glass, lighting.warmth),
    lookSentence: lookSentence(lookById(spec.camera.look), drinks, depthById(spec.camera.depth)),
    angleSentence: angleSentence(angleById(spec.camera.angle)),
    backgroundPerspective: backgroundPerspectiveSentence(angleById(spec.camera.angle)),
    viewSentence: cornerViewSentence(spec, bp),
    framingSentence: solo === "hands"
      ? "The camera looks across the table at one person's meal, low and close like the brand's meal photography: the food and the Coca-Cola products sit sharp in the frame, and PERSON_1's hand and forearm reach in from the right edge toward their drink, the rest of them out of frame."
      : solo
      ? "The camera looks across the table at one person mid-meal, low and close like the brand's meal photography: the food and the Coca-Cola products sit sharp in the front of the frame, and PERSON_1 sits just behind them facing the camera, the top edge of the frame cutting across them between the chin and the nose, so we see their shoulders, arms and hands but never their eyes."
      : isOverShoulder(bp)
      ? "The camera looks over PERSON_1's shoulder across the table, low and close like the brand's meal photography: PERSON_1's back and shoulder frame the left foreground, soft; the food and the Coca-Cola products sit sharp in the middle of the frame; PERSON_2 sits across the table on the right, the top edge of the frame cutting across them between the chin and the nose, so we see their shoulders, arms and hands but never their eyes."
      : seated
      ? "The camera looks across the table toward one of its corners, low and close like the brand's meal photography: the food and the Coca-Cola products sit sharp in the front of the frame, and the corner of the table sits near the center. PERSON_1 sits along one side and PERSON_2 at the end, perpendicular to each other, just behind the food; the top edge of the frame cuts across both of them between the chin and the nose, so we see their shoulders, arms and hands but never their eyes."
      : isCornerLayout(bp)
      ? "The camera looks diagonally across the table toward one of its far corners. The two place settings meet at a right angle around that corner, one on the long side and one at the end; what they share sits between them in front of the corner, and the Coca-Cola product sits in the vertical center third of the frame."
      : hasPartner
      ? `The entree and the Coca-Cola product sit together in the vertical center third of the frame; ${farEdge} The second place setting sits further back or to the side as a secondary element, and may be partly cropped at the frame's edge.`
      : `The entree and the Coca-Cola product sit together in the vertical center third of the frame; ${farEdge}`,
    surfaceText: withoutRoundTable(spec.scene.surfaceText || SURFACES[spec.scene.surface].promptText),
    servingSentence: serving,
    labels: bp.primitives.map((p) => {
      if (p.role === "person") return { label: p.id, what: p.component_name, where: whereOnTable(bp, p.id), vessel: "a chair at the table", fixedText: personText(spec, bp, p) };
      const base = { label: p.id, what: p.component_name, where: whereOnTable(bp, p.id), ...labelVessel(spec, p.proxy, p.role, styles.get(p.id), seated) };
      if (p.held_by && base.fixedText) base.fixedText = heldText(base.fixedText, p);
      // Only a label with no fixed text of its own (currently just MAIN_2) borrows another
      // label's agent-written text; NAPKIN_SET_2/SKU_2/GLASS_2 already got their own fixedText above.
      if (!base.fixedText && p.same_as) {
        return { ...base, sameAs: p.same_as, sameAsPrefix: "The second diner's plate, the same dish as MAIN in a matching portion: " };
      }
      return base;
    }),
    labelInstruction:
      "The labeled shapes in the reference layout are placement guides only. Match each shape to the segment with the same label, and do not render the labels or any text as part of the image.",
    proxyInstruction:
      "Transform image 1 into a photograph. Image 1 is a layout guide: each colored shape is one object, and its label names the text below that describes it. Keep every object exactly where its shape sits, at the same size, and keep the same camera position and framing; do not zoom in, crop tighter or add objects. Remove all shapes, labels and outlines. The faint grid on the table top, the floor and the back wall, and the thin light line across the frame where there is one (the camera's eye level), are perspective guides: build the floor, walls, doorways, windows, shelves and furniture on that same floor plane and wall, so their lines recede to the same vanishing points and meet the same eye level as the table, and the wall grid's upright lines show the slant every upright in the room (door and window frames, shelf sides, chair and table legs) takes in this view. Do not draw the grid or the line.",
    scaleSentence: scaleSentence(bp),
    productScale: productScaleSentence(spec, bp),
    exclusions: `Only the ${tableItems} objects described above are on the table${seated ? " or in hand" : ""}, and no other drinks or glasses (no beer, wine, water or juice). ${countsSentence(bp)} No text anywhere except the Coca-Cola product's own label: no menus, signs, posters or writing in the background either.${spec.napkinSet && !spec.napkinSet.cutlery.length ? " No fork, knife, spoon or chopsticks anywhere on the table." : ""} ${seated ? seatedPeopleRule(bp) : BACKGROUND_PEOPLE_RULE}`,
  };
}

/**
 * The art director's photodocumentary template (2026-10-05), filled from the brief: the food,
 * the place, the look's lens and the light. It opens the Camera part of the prompt.
 */
function filmSentence(spec: SceneSpec, lighting: LightingPreset): string {
  const side = spec.accompaniments.find((a) => a.pairsWith === "MAIN" && a.role !== "condiment")?.name;
  const food = side ? `${spec.entree.name} with ${side}` : spec.entree.name;
  const t = venueType(spec.scene.venue, spec.scene.venueType);
  const place = t ? t.prompt.split(":")[0] : VENUE_PLACE[spec.scene.venue];
  const region = regionName(spec.region, spec.country);
  const where = [region, spec.countryLabel].filter(Boolean).join(", ");
  const lens = lookById(spec.camera.look).hidden.focal_length_mm;
  const light = lighting.condition ?? lighting.prompt.split(/[,.:]/)[0].toLowerCase();
  return (
    `Candid photodocumentary shot of ${food}, ${place}${where ? ` in ${where}` : ""}. ` +
    "Authentic slice-of-life moment, unstyled and realistic texture. " +
    `Shot on ${lens}mm lens, crisp focus. ` +
    "Enhanced color richness with deep true-to-life tones, emphasizing selective rich red tones, well-rounded contrast, " +
    `clean analog look with fine film grain, ${light}. ` +
    "Cinematic realism, documentary aesthetic."
  );
}

const VENUE_PLACE: Record<SceneSpec["scene"]["venue"], string> = {
  home: "at home",
  restaurant: "in a restaurant",
  "on-the-go": "on the go",
};

/** Region ids are "<country>-<name>" (e.g. "us-texas"); free-text regions pass through. */
function regionName(region: string, country: string): string {
  const r = region.trim();
  if (!r) return "";
  const prefix = `${country.toLowerCase()}-`;
  if (!r.toLowerCase().startsWith(prefix)) return r;
  return r
    .slice(prefix.length)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Image tests: the model ignores the proxy's scale and draws the front plate at about 43% of
 * the frame width. So the scale is stated in real-world terms it can reason with: how far the
 * camera is, and how wide the frame is at the plate, next to the plate's own size.
 */
function scaleSentence(bp: Blueprint): string {
  const main = bp.primitives.find((p) => p.id === "MAIN");
  if (!main) return "";
  const c = bp.camera;
  const pos = c.position;
  const dir = [c.target[0] - pos[0], c.target[1] - pos[1], c.target[2] - pos[2]];
  const len = Math.hypot(dir[0], dir[1], dir[2]);
  const p = [main.world.x - pos[0], main.dimensions.height / 2 - pos[1], -main.world.d - pos[2]];
  const depth = (p[0] * dir[0] + p[1] * dir[1] + p[2] * dir[2]) / len; // along the view axis
  const frameW = 2 * depth * Math.tan((c.fovDeg * Math.PI) / 360) * c.aspect;
  const plateW = main.dimensions.width;
  const noun = main.proxy in VESSEL_SHORT ? VESSEL_SHORT[main.proxy as Vessel] : "dish";
  const dist = Math.hypot(p[0], p[1], p[2]);
  return `Scale: this is a table shot, not a close-up. The camera is about ${dist.toFixed(1)} m from the ${noun}, and at that distance the frame is about ${Math.round(frameW * 20) * 5} cm wide, so the ${cm(plateW)} cm ${noun} fills only about ${Math.round((plateW / frameW) * 100)}% of the frame width, with open table on both sides. Do not enlarge the food or the product.`;
}

/** A size ratio in words the image model reads more reliably than a percentage. */
function share(r: number): string {
  if (r < 0.42) return "well under half";
  if (r < 0.58) return "about half";
  if (r < 0.7) return "about two thirds";
  if (r < 0.78) return "about three quarters";
  if (r < 0.88) return "about four fifths";
  if (r < 0.97) return "nearly all";
  if (r <= 1.03) return "about the same as";
  if (r < 1.25) return "a little more than";
  if (r < 1.65) return "about one and a half times";
  return "about twice";
}

/**
 * Real-world sizes of the Coca-Cola product (from the SKU's measured dimensions) and the glass,
 * next to the plate. Image tests (Fernando, 2026-10-16): the photo step drew a 22.5 cm 20 oz
 * bottle about a third too tall for its plate and the bell glass as tall as the bottle, because
 * the product photos are close-ups with no scale. The sketch fixes positions, not this.
 */
export function productScaleSentence(spec: SceneSpec, bp: Blueprint): string {
  const sku = skuProxy(spec.sku);
  const pkg = spec.sku.package === "can" ? "can" : "bottle";
  const main = bp.primitives.find((p) => p.id === "MAIN");
  const glass = bp.primitives.some((p) => p.role === "glass" || p.role === "partner-glass");
  const parts = [`the Coca-Cola ${pkg} is ${cm(sku.height)} cm tall and ${cm(2 * sku.radius!)} cm wide`];
  if (main) {
    const noun = main.proxy in VESSEL_SHORT ? VESSEL_SHORT[main.proxy as Vessel] : "dish";
    const r = sku.height / main.dimensions.width;
    parts[0] += `, so its height is ${share(r)} the width of the ${cm(main.dimensions.width)} cm ${noun}`;
  }
  if (glass) {
    const r = BELL_GLASS.height / sku.height;
    parts.push(
      `the glass is ${cm(BELL_GLASS.height)} cm tall and ${cm(2 * BELL_GLASS.radius!)} cm across the rim, ${r < 0.97 ? `shorter than the ${pkg}: ${share(r)} its height` : r <= 1.03 ? `about as tall as the ${pkg}` : `taller than the ${pkg}: ${share(r)} its height`}`,
    );
  }
  const frame = frameShareSentence(bp, pkg);
  const hand = bp.primitives.some((p) => p.role === "person") ? " An adult hand is about 19 cm from wrist to fingertip; keep the product in that proportion where it is held." : "";
  return `Real sizes, which the photograph keeps (the product photos show how the package looks, not how big it is here): ${parts.join("; ")}. Never enlarge the Coca-Cola product or the glass to make them stand out: one nearer the camera looks bigger only through perspective, by the same amount as the food beside it.${frame}${hand}`;
}

/**
 * How much of image 1 the product, a glass and the main plate take up (Fernando, 2026-10-17):
 * real sizes alone still let the photo inflate a large bottle by about a third.
 */
function frameShareSentence(bp: Blueprint, pkg: string): string {
  const box = (id: string) => bp.primitives.find((p) => p.id === id && !p.held_by)?.screen_bbox;
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const sku = box("SKU");
  if (!sku) return "";
  const parts = [`the ${pkg} (SKU) stands about ${pct(sku.y1 - sku.y0)} of the frame's height`];
  const glass = box("GLASS");
  if (glass) parts.push(`the glass beside MAIN (GLASS) about ${pct(glass.y1 - glass.y0)}`);
  const main = box("MAIN");
  if (main) parts.push(`and the MAIN plate spans about ${pct(main.x1 - main.x0)} of the frame's width`);
  return ` In image 1 ${parts.join(", ")}; keep those sizes.`;
}

export function labelText(story: Story, l: StoryFacts["labels"][number]): string {
  return l.fixedText ?? withoutHands(story.labelSegments.find((x) => x.label === l.label)?.text ?? `${l.what}, on ${l.vessel}.`);
}

/** Color direction per lighting warmth, so the prompt names the color treatment on its own line. */
const COLOR_BY_WARMTH: Record<StoryFacts["lightingWarmth"], string> = {
  neutral: "Clean neutral white balance and true-to-life food color; the Coca-Cola red stays rich and accurate, never orange or pink.",
  cool: "Clean, slightly cool daylight white balance with true-to-life food color; the Coca-Cola red stays rich and accurate, never orange or pink.",
  warm: "Warm, golden color with honest food tones, never oversaturated; the Coca-Cola red stays rich and accurate, never orange.",
  ambient: "Warm ambient color with deep but open shadows and honest food tones; the Coca-Cola red stays rich and accurate, never orange or brown.",
};

export type SegmentKind = "guide" | "object" | "environment" | "camera" | "exclusions";

/** One component of the composition prompt. The prompt is exactly these texts, in this order. */
export interface CompositionSegment {
  key: string;
  kind: SegmentKind;
  /** The chip shown in the UI; for objects it is the proxy label that prefixes the prompt line. */
  chip: string;
  /** What the segment covers, in plain words. */
  title: string;
  note: string;
  /** Written from the rules, not by the agent. */
  fixed: boolean;
  /** Second place setting (party "2"): this segment's text was copied from the named label
   * instead of generated for a turnaround, e.g. MAIN_2's "sameAs" is "MAIN". */
  sameAs?: string;
  /** Named sub-parts (camera, lighting, color); `text` is their join. */
  parts?: Array<{ label: string; text: string }>;
  text: string;
}

/**
 * Opens the prompt when image 1 is the art director's approved pencil sketch: the photo copies
 * its camera, framing, table angle and placement exactly, and takes color and detail from the text.
 */
export function sketchInstruction(facts: StoryFacts): string {
  const which = facts.labels.map((l) => `${l.label} is the ${l.what}, ${l.where}`).join("; ");
  return [
    "Turn image 1 into a full-color photograph. Image 1 is the art director's approved pencil sketch of this exact photograph: keep the same camera position, height and angle, the same lens and framing, the same table edges and table angle, and every object exactly where and as large as it is drawn. Do not zoom in, crop, re-center, straighten or tilt the table, and do not add, move or remove objects.",
    "Take only the composition from the sketch: the colors, materials, food detail, light and the Coca-Cola label come from the descriptions below and the reference photos, never from the sketch's grey pencil. Leave no pencil lines, hatching or paper texture.",
    `The labels below name the objects in the sketch: ${which}.`,
  ].join(" ");
}

export function compositionSegments(story: Story, facts: StoryFacts): CompositionSegment[] {
  const camera = [
    { label: "Camera", text: [facts.filmSentence, facts.angleSentence, facts.viewSentence, facts.lookSentence].filter(Boolean).join(" ") },
    { label: "Lighting", text: `${facts.lightingSentence} ${facts.skuLightSentence}`.trim() },
    { label: "Color", text: facts.colorSentence ?? COLOR_BY_WARMTH.neutral },
  ];
  return [
    {
      key: "guide",
      kind: "guide",
      chip: "LAYOUT GUIDE",
      title: "How to read image 1",
      note: "Keep every shape's position and size; states the real-world scale",
      fixed: true,
      text: [
        facts.layoutSketch ? sketchInstruction(facts) : facts.proxyInstruction,
        // The sketch already fixes how big everything is in the frame; the planned scale would contradict it.
        facts.layoutSketch ? "" : facts.scaleSentence,
        // Real sizes hold either way: the sketch places the product, the photo still tends to inflate it.
        facts.productScale,
        RECTANGULAR_TABLE_RULE,
        !facts.layoutSketch && facts.adjustments?.length
          ? `Adjustments to the layout guide (these take priority over the shapes for the items named):\n- ${facts.adjustments.join("\n- ")}`
          : "",
        facts.directorChanges?.length
          ? `The art director's changes${facts.layoutSketch ? " to the sketch" : ""}. They override image 1 and every other line of this prompt, including the fixed descriptions of the product and the table setting:\n- ${facts.directorChanges.join("\n- ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    ...facts.labels.map<CompositionSegment>((l) => {
      // Second-setting label with no text of its own (MAIN_2): quote the referenced label's
      // already-resolved text (agent-written for food) instead of generating a separate one.
      const text = l.sameAs
        ? `${l.sameAsPrefix ?? ""}${labelText(story, facts.labels.find((m) => m.label === l.sameAs) ?? l)}`
        : labelText(story, l);
      return {
        key: l.label,
        kind: "object",
        chip: l.label,
        title: l.what,
        note: l.where,
        fixed: Boolean(l.fixedText) || Boolean(l.sameAs),
        sameAs: l.sameAs,
        text,
      };
    }),
    {
      key: "environment",
      kind: "environment",
      chip: "ENVIRONMENT",
      title: "Background + table",
      note: `Not a shape: the tabletop (${facts.surfaceText}) and the place around and behind it`,
      fixed: false,
      text: [withoutRoundTable(story.segments.environmentalOverview), facts.backgroundPerspective].filter(Boolean).join(" "),
    },
    {
      key: "camera",
      kind: "camera",
      chip: "CAMERA · LIGHTING · COLOR",
      title: "Camera, lighting + color",
      note: "The film look, lens, angle and focus; the light; the color treatment",
      fixed: true,
      parts: camera,
      text: camera.map((p) => `${p.label}: ${p.text}`).join("\n"),
    },
    {
      key: "exclusions",
      kind: "exclusions",
      chip: "EXCLUSIONS",
      title: "What must not appear",
      note: "Closes the prompt",
      fixed: true,
      text: facts.exclusions,
    },
  ];
}

/**
 * The composition prompt (Nano Banana 2), in the order the image tests proved out:
 * how to read the proxy, one line per label, environment, camera + lighting + color, exclusions.
 */
export function assemblePrompt(story: Story, facts: StoryFacts): string {
  const segs = compositionSegments(story, facts);
  const objects = segs.filter((s) => s.kind === "object").map((s) => `${s.chip}: ${s.text}`).join("\n");
  return [
    segs.find((s) => s.kind === "guide")!.text,
    objects,
    ...segs.filter((s) => s.kind !== "guide" && s.kind !== "object").map((s) => s.text),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** The product swap prompt (Seedream): image 1 = the composed photo, image 2 = the product reference. */
export function productSwapPrompt(spec: SceneSpec, facts: StoryFacts): string {
  const noun = spec.sku.package === "can" ? "can" : "bottle";
  return [
    `Replace the Coca-Cola ${noun} in image 1 with the ${spec.sku.displayName} from image 2. Keep its exact position, size and straight-on angle, and keep its base resting on the table.`,
    `Match the lighting of image 1: ${facts.lightingSentence}`,
    facts.skuLightSentence,
    spec.sku.glass ? "Keep the bell-shaped Coca-Cola glass as it is." : "",
    "Change nothing else in image 1.",
  ]
    .filter(Boolean)
    .join(" ");
}
