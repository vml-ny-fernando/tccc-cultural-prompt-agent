// Seated people (staging, 2026-10-15): two people at a corner of the table. The layout fixes
// their pose (seated, leaning in, forearms on the table, turned toward each other); on Review
// the Sketch the art director describes who they are and what they wear. The sketch and the
// photograph both read the same text, so the people stay the same from one to the other.

import { drinkWord, poseOf } from "./poses";
import type { Blueprint, Primitive, SceneSpec } from "./types";

export interface PersonDetails {
  /** Age, gender and look, in the art director's words ("a woman in her 30s, short curly hair"). */
  who: string;
  /** Heritage or ethnicity. */
  heritage: string;
  /** What they wear. */
  wearing: string;
}

export const PERSON_IDS = ["PERSON_1", "PERSON_2"] as const;

export function hasSeatedPeople(bp: Blueprint): boolean {
  return bp.primitives.some((p) => p.role === "person");
}

/** Over the shoulder (Fernando, 2026-10-27): the two face each other, PERSON_1 seen from behind. */
export function isOverShoulder(bp: Blueprint): boolean {
  return bp.layout_meta.seating === "across" && hasSeatedPeople(bp);
}

/** What a person is when the art director hasn't said: an adult local to the market, dressed for the place. */
export function defaultPersonDetails(spec: SceneSpec, id: string): PersonDetails {
  const place = spec.scene.venue === "restaurant" ? "a meal out" : spec.scene.venue === "home" ? "a relaxed meal at home" : "a casual meal on the go";
  return {
    who: id === "PERSON_1" ? "an adult in their late 20s to 30s" : "an adult in their 30s",
    heritage: `local, from ${spec.countryLabel}`,
    wearing: `everyday clothes that suit ${place} in ${spec.countryLabel}`,
  };
}

export function personDetails(spec: SceneSpec, p: Primitive): PersonDetails {
  const d = defaultPersonDetails(spec, p.id);
  const own = p.person;
  return {
    who: own?.who.trim() || d.who,
    heritage: own?.heritage.trim() || d.heritage,
    wearing: own?.wearing.trim() || d.wearing,
  };
}

/** The locked pose, from the picked pose and where the layout seated them. */
function poseText(spec: SceneSpec, p: Primitive, bp: Blueprint): string {
  const other = bp.primitives.find((q) => q.role === "person" && q.id !== p.id);
  const pose = poseOf(bp, p);
  const across = isOverShoulder(bp);
  const seat = across
    ? p.id === "PERSON_1"
      ? "on the near long side, in the left foreground with their back three-quarters to the camera, facing across the table"
      : "on the far long side, across the table from PERSON_1, facing the camera"
    : p.id === "PERSON_1"
      ? "on the table's far long side, facing toward the camera's side of the table"
      : "at the table's end, facing across it";
  const plate = p.id === "PERSON_1" ? "MAIN" : "MAIN_2";
  const held = bp.primitives.find((q) => q.held_by === p.id);
  const doing = pose.text.replace("{drink}", held ? `${drinkWord(spec)} (${held.id})` : drinkWord(spec));
  return `Sits on a chair ${seat}, near their plate (${plate}), in exactly the pose of the ${p.id} figure in image 1: ${doing}. Turned toward ${other?.id ?? "the other person"}; a casual, unposed moment, ${across && p.id === "PERSON_1" ? "seen from behind: the back of their head, hair and one shoulder, their face turned away and never shown" : "their face above the top of the frame"}.`;
}

/** The fixed text for one seated person, shared by the sketch and the photograph. */
export function personText(spec: SceneSpec, bp: Blueprint, p: Primitive): string {
  const d = personDetails(spec, p);
  return `A real person, not a figure or mannequin: ${d.who}, ${d.heritage}, wearing ${d.wearing}. ${poseText(spec, p, bp)} No logos, text or Coca-Cola red on their clothes.`;
}

/** The rule for people in a seated scene: the sketch and the photograph both use it. */
export function seatedPeopleRule(bp: Blueprint): string {
  const holders = bp.primitives.filter((q) => q.held_by).map((q) => `${q.held_by} holds ${q.id}`);
  const hold = holders.length
    ? `${holders.join(" and ")} in a relaxed, natural grip, label turned toward the camera so the logo reads, never covered by the fingers; nobody drinks from it, and nobody else touches a Coca-Cola product.`
    : "Nobody touches the Coca-Cola product.";
  const faces = isOverShoulder(bp)
    ? "PERSON_1 sits in the left foreground with their back three-quarters to the camera: we see the back of their head, their hair, a shoulder and an arm, soft and out of focus, and never their face. PERSON_2 sits across the table facing the camera; the top edge of the frame crops them between the chin and the nose, so their eyes and upper face are never in the picture and nobody is recognizable. PERSON_2 sits just behind the food and the Coca-Cola, a little softer than them."
    : "The top edge of the frame crops both people between the chin and the nose: their eyes and upper face are never in the picture, so nobody is recognizable; we see at most a smile, then shoulders, arms and hands. They sit just behind the food and the Coca-Cola, a little softer than them.";
  return `Exactly two people sit at the table, PERSON_1 and PERSON_2, and no one else is at or beside it. Both are adults (21 or older), fictional, and look like no real or famous person. ${faces} ${hold} Hands not holding a drink rest on the table, in the lap, mid-gesture or on their food; they may eat, but nobody drinks from a Coca-Cola product in the frame. Anyone further back stays a soft, out-of-focus shape with no visible face, and no children.`;
}
