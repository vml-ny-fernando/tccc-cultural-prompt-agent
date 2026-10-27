// Poses for the two seated people (staging, 2026-10-15). Fernando's rule: at least one person
// holds the Coca-Cola product (a glass for a large SKU, the bottle or can itself for a small
// one), and every pose is casual. The art director picks a pose before the layout is drawn;
// the solver puts the held drink in the hand, the proxy draws the arms, and the sketch and
// photo prompts describe the same pose in words.

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
  /** The near hand holds this person's own Coca-Cola drink. */
  holds: boolean;
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

/** A hand holding a fork just above the plate, mid-meal (never lifted to the mouth). */
const FORK: Arm = { elbow: [0.2, T, -0.34], hand: [0.1, T + 0.07, -0.6] };
/** A hand open mid-gesture while talking. */
const GESTURE: Arm = { elbow: [0.24, T, -0.3], hand: [0.24, T + 0.13, -0.48] };

// Modelled on the brand's meal photography (Fernando's references, 2026-10-16): faces cropped out,
// the story told by hands around the food and the Coca-Cola.
export const POSES: Pose[] = [
  {
    id: "drink-in-hand",
    label: "Drink in hand, chatting",
    detail: "One person holds their drink loosely mid-conversation; the other has a fork over their plate.",
    people: {
      PERSON_1: {
        lean: IN,
        near: { elbow: [0.22, T, -0.36], hand: [0.15, T + 0.1, -0.54] },
        far: REST,
        holds: true,
        text: "leaning in with one elbow on the table, holding {drink} loosely in the hand nearer the other person, just above the table, the other forearm resting on the table, mid-conversation",
      },
      PERSON_2: {
        lean: IN,
        near: REST,
        far: FORK,
        holds: false,
        text: "leaning in, one hand holding a fork just above their own plate mid-meal, the other forearm resting on the table, listening",
      },
    },
  },
  {
    id: "hand-on-drink",
    label: "Hand on the bottle",
    detail: "One person rests a hand around their drink on the table while talking; the other reaches into their meal.",
    people: {
      PERSON_1: {
        lean: IN,
        near: { elbow: [0.22, T, -0.34], hand: [0.12, T + 0.05, -0.55] },
        far: GESTURE,
        holds: true,
        text: "leaning in, one hand resting loosely around {drink} as it stands on the table, the other hand open mid-gesture as they talk",
      },
      PERSON_2: {
        lean: IN,
        near: REST,
        far: FORK,
        holds: false,
        text: "leaning in, one hand holding a fork just above their own plate, the other forearm resting on the table",
      },
    },
  },
  {
    id: "sharing-the-meal",
    label: "Sharing the meal",
    detail: "Both lean in over the food; one holds their drink just above the table, the other serves themselves.",
    people: {
      PERSON_1: {
        lean: IN - 0.04,
        near: FORK,
        far: REST,
        holds: false,
        text: "leaning in over the table, one hand holding a fork just above their own plate as they eat, the other forearm resting on the table",
      },
      PERSON_2: {
        lean: IN,
        near: { elbow: [0.22, T, -0.34], hand: [0.15, T + 0.08, -0.54] },
        far: FORK,
        holds: true,
        text: "leaning in, holding {drink} loosely just above the table in the hand nearer the other person, the other hand holding a fork over their own plate",
      },
    },
  },
  {
    id: "cheers",
    label: "Cheers over the corner",
    detail: "Both raise their drinks toward each other over the corner of the table, about to clink.",
    people: {
      PERSON_1: {
        lean: IN,
        near: { elbow: [0.24, T + 0.02, -0.34], hand: [0.14, T + 0.14, -0.6] },
        far: REST,
        holds: true,
        text: "leaning in, raising {drink} a little above the table toward the other person, over the corner of the table, about to clink",
      },
      PERSON_2: {
        lean: IN,
        near: { elbow: [0.24, T + 0.02, -0.34], hand: [0.14, T + 0.14, -0.6] },
        far: REST,
        holds: true,
        text: "leaning in, raising {drink} a little above the table toward the other person, over the corner of the table, about to clink",
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

export function poseOf(bp: Blueprint, p: Primitive): PersonPose {
  const pose = poseById(bp.layout_meta.pose);
  return pose.people[poseRole(p.id, bp.layout_meta.seating, pose)] ?? poseById(undefined).people.PERSON_1;
}
