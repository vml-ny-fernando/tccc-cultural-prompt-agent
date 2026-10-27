// Moments for the two seated people (Fernando, 2026-10-27; first built as poses on staging,
// 2026-10-15). Every moment is candid: both people are caught mid-action, talking, laughing,
// reaching, passing or eating, never neutral, limp or posed like stock photography. At least one
// person holds their Coca-Cola (a glass for a large SKU, the bottle or can itself for a small one).
// The art director picks a moment before the layout is drawn; the solver puts the held drink in the
// hand, the proxy draws the arms, and the sketch and photo prompts describe the same moment in words.

import { isLargeSku } from "./rules";
import type { Blueprint, Primitive, SceneSpec } from "./types";

export type PersonId = "PERSON_1" | "PERSON_2";
type V3 = readonly [number, number, number];

/** One arm, in the person's own frame (x toward their right, y up from the seat, -z forward); x is flipped for the hand away from the other person. */
interface Arm {
  elbow: V3;
  hand: V3;
}

export interface PersonPose {
  /** Torso tilt: negative leans in over the table, positive leans back. */
  lean: number;
  /** The hand nearer the other person. */
  near: Arm;
  /** The other hand. */
  far: Arm;
  /** This person holds their own Coca-Cola drink, in the near hand unless `holdWith` says far. */
  holds: boolean;
  holdWith?: "far";
  /** The pose in words; {drink} becomes what they hold. */
  text: string;
}

export interface Pose {
  id: string;
  label: string;
  detail: string;
  people: Record<PersonId, PersonPose>;
}

/** The table top, above the seat. Matches SEAT_DROP in the solver plus the table's thickness. */
const T = 0.475;

const REST: Arm = { elbow: [0.2, T, -0.36], hand: [0.1, T, -0.58] };
const IN = -0.18;

/** A hand wrapped around a drink standing on the table. */
const AROUND_DRINK: Arm = { elbow: [0.22, T, -0.34], hand: [0.12, T + 0.05, -0.55] };
/** A drink held loosely just above the table. */
const DRINK_UP: Arm = { elbow: [0.22, T, -0.36], hand: [0.15, T + 0.1, -0.54] };
/** A hand raised high mid-gesture, telling a story. */
const STORY: Arm = { elbow: [0.26, T + 0.02, -0.28], hand: [0.28, T + 0.22, -0.42] };
/** A hand open mid-gesture while talking. */
const GESTURE: Arm = { elbow: [0.24, T, -0.3], hand: [0.24, T + 0.13, -0.48] };
/** A hand reaching into their own plate for a bite. */
const REACH_PLATE: Arm = { elbow: [0.18, T + 0.02, -0.38], hand: [0.06, T + 0.04, -0.64] };
/** A hand flat on the table, leaning back laughing. */
const PALM_DOWN: Arm = { elbow: [0.24, T, -0.3], hand: [0.22, T, -0.46] };
/** An arm stretched across the table, passing or taking a dish. */
const ACROSS_TABLE: Arm = { elbow: [0.16, T + 0.02, -0.46], hand: [0.06, T + 0.03, -0.78] };
/** Food held up in the hand, about to take a bite, not yet at the mouth. */
const BITE: Arm = { elbow: [0.2, T + 0.02, -0.3], hand: [0.08, T + 0.2, -0.4] };
/** Raising a drink toward the other person. */
const RAISE: Arm = { elbow: [0.24, T + 0.02, -0.34], hand: [0.14, T + 0.14, -0.6] };

// Modelled on the brand's meal photography (Fernando's references, 2026-10-16): faces cropped out,
// the story told by hands around the food and the Coca-Cola.
export const POSES: Pose[] = [
  {
    id: "telling-a-story",
    label: "Telling a story",
    detail: "One person tells a story mid-sentence, one hand up; the other laughs and reaches into their food.",
    people: {
      PERSON_1: {
        lean: IN + 0.06,
        near: AROUND_DRINK,
        far: STORY,
        holds: true,
        text: "mid-sentence telling a story, animated, one hand raised mid-gesture, the other hand wrapped loosely around {drink} on the table",
      },
      PERSON_2: {
        lean: IN,
        near: REST,
        far: REACH_PLATE,
        holds: false,
        text: "laughing at the story, leaning in and reaching into their own plate for a bite, the other forearm resting on the table",
      },
    },
  },
  {
    id: "sharing-a-laugh",
    label: "Sharing a laugh",
    detail: "One person leans back laughing, a hand flat on the table; the other laughs too, drink in hand.",
    people: {
      PERSON_1: {
        lean: 0.06,
        near: PALM_DOWN,
        far: REST,
        holds: false,
        text: "leaning back mid-laugh, one hand flat on the table, the other resting near their plate",
      },
      PERSON_2: {
        lean: IN,
        near: DRINK_UP,
        far: GESTURE,
        holds: true,
        text: "laughing along, holding {drink} loosely just above the table in the hand nearer the other person, the other hand open mid-gesture",
      },
    },
  },
  {
    id: "passing-a-dish",
    label: "Passing a dish",
    detail: "One person slides a side dish across the table; the other reaches to take it, their drink in the other hand.",
    people: {
      PERSON_1: {
        lean: IN - 0.04,
        near: ACROSS_TABLE,
        far: REST,
        holds: false,
        text: "leaning in and sliding a side dish across the table toward the other person, mid-sentence",
      },
      PERSON_2: {
        lean: IN - 0.04,
        near: ACROSS_TABLE,
        far: AROUND_DRINK,
        holds: true,
        holdWith: "far",
        text: "smiling and reaching across with one hand to take the dish, the other hand wrapped loosely around {drink} on the table",
      },
    },
  },
  {
    id: "digging-in",
    label: "Digging in",
    detail: "One person holds up some food, about to take a bite; the other talks about it, drink in hand.",
    people: {
      PERSON_1: {
        lean: IN,
        near: BITE,
        far: REST,
        holds: false,
        text: "holding a piece of their food up in one hand, about to take a bite but not yet at the mouth, the other forearm resting on the table",
      },
      PERSON_2: {
        lean: IN,
        near: DRINK_UP,
        far: GESTURE,
        holds: true,
        text: "mid-sentence, gesturing at the food with one open hand, holding {drink} loosely just above the table in the other",
      },
    },
  },
  {
    id: "cheers",
    label: "Cheers",
    detail: "Both raise their drinks toward each other over the table, about to clink.",
    people: {
      PERSON_1: {
        lean: IN,
        near: RAISE,
        far: REST,
        holds: true,
        text: "leaning in and smiling, raising {drink} a little above the table toward the other person, about to clink",
      },
      PERSON_2: {
        lean: IN,
        near: RAISE,
        far: REST,
        holds: true,
        text: "leaning in and smiling, raising {drink} a little above the table toward the other person, about to clink",
      },
    },
  },
];

export const DEFAULT_POSE = POSES[0]!.id;

export function poseById(id: string | undefined): Pose {
  return POSES.find((p) => p.id === id) ?? POSES[0]!;
}

/** The label of the drink this person holds: a glass for a large SKU, the bottle or can for a small one. */
export function heldLabel(spec: SceneSpec, labels: string[], id: PersonId): string | null {
  const two = id === "PERSON_2" ? "_2" : "";
  const want = isLargeSku(spec.sku) ? [`GLASS${two}`] : [`SKU${two}`, `GLASS${two}`];
  return want.find((l) => labels.includes(l)) ?? null;
}

/** The drink in words, for the pose text. */
export function drinkWord(spec: SceneSpec): string {
  if (isLargeSku(spec.sku)) return "their branded Coca-Cola glass";
  return spec.sku.package === "can" ? "their Coca-Cola can" : "their Coca-Cola bottle";
}

/** A world offset (dx, dd) from a person, in their own frame (x to their right, z backward; forward is -z). */
export function toLocal(self: { yawDeg: number }, dx: number, dd: number): { x: number; z: number } {
  const a = (self.yawDeg * Math.PI) / 180; // undoes the group's rotation.y (= -yaw)
  const wz = -dd;
  return { x: dx * Math.cos(a) + wz * Math.sin(a), z: -dx * Math.sin(a) + wz * Math.cos(a) };
}

/** +1 when the other person sits to this person's right (their own +x), else -1. */
export function sideToward(self: { x: number; d: number; yawDeg: number }, other: { x: number; d: number }): 1 | -1 {
  return toLocal(self, other.x - self.x, other.d - self.d).x >= 0 ? 1 : -1;
}

/** A point in the person's frame, flipped to one side, in world terms (x, height above the seat, d). */
export function toWorld(self: { x: number; d: number; yawDeg: number }, v: V3, sx: 1 | -1): { x: number; y: number; d: number } {
  const t = (-self.yawDeg * Math.PI) / 180; // the group's rotation.y
  const lx = v[0] * sx;
  const lz = v[2];
  return { x: self.x + lx * Math.cos(t) + lz * Math.sin(t), y: v[1], d: self.d + lx * Math.sin(t) - lz * Math.cos(t) };
}

/**
 * Whose part of the pose a seated person plays. Over the shoulder (Fernando, 2026-10-27) PERSON_2
 * faces the camera, so when only one person holds a drink, PERSON_2 takes that part and its label
 * reads; PERSON_1, seen from behind, takes the other.
 */
export function poseRole(id: string, seating: "across" | "corner" | undefined, pose: Pose): PersonId {
  const swap = seating === "across" && pose.people.PERSON_1.holds && !pose.people.PERSON_2.holds;
  if (!swap) return id as PersonId;
  return id === "PERSON_1" ? "PERSON_2" : "PERSON_1";
}

/** The hand that holds this person's drink, in their own frame, and which side it is on (near = +1). */
export function holdingHand(pp: PersonPose): { hand: V3; side: 1 | -1 } {
  return pp.holdWith === "far" ? { hand: pp.far.hand, side: -1 } : { hand: pp.near.hand, side: 1 };
}

export function poseOf(bp: Blueprint, p: Primitive): PersonPose {
  const pose = poseById(bp.layout_meta.pose);
  return pose.people[poseRole(p.id, bp.layout_meta.seating, pose)] ?? poseById(undefined).people.PERSON_1;
}
