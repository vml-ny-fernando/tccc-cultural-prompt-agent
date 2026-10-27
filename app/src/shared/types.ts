import { z } from "zod";

// ---------------------------------------------------------------------------
// Closed vocabularies. The agent maps free text onto these; the exact wording
// is kept separately for the prompt.
// ---------------------------------------------------------------------------

export const Occasion = z.enum([
  "breakfast",
  "brunch",
  "weekday-lunch",
  "weekend-lunch",
  "afternoon-snack",
  "dinner",
  "late-night",
  "celebration",
  "game-night",
]);
export type Occasion = z.infer<typeof Occasion>;

export const Vessel = z.enum([
  "plate",
  "lunch-plate",
  "side-plate",
  "bowl",
  "small-bowl",
  "large-bowl",
  "ramekin",
  "board",
  "basket",
  "foil-wrap",
  "tray",
  "leaf",
  "casserole",
  "platter",
  "sauce-boat",
  "condiment-bottle",
  "shaker",
  "jar",
  "paellera",
]);
export type Vessel = z.infer<typeof Vessel>;

export const MassClass = z.enum(["flat", "heaped", "stacked", "wrapped"]);
export type MassClass = z.infer<typeof MassClass>;

export const Service = z.enum(["individual", "shared"]);
export type Service = z.infer<typeof Service>;

export const AccompanimentRole = z.enum([
  "side",
  "starch",
  "salad",
  "bread",
  "condiment",
  "sauce",
  "garnish",
]);
export type AccompanimentRole = z.infer<typeof AccompanimentRole>;

export const Setting = z.enum(["indoor", "outdoor"]);
export const Venue = z.enum(["home", "restaurant", "on-the-go"]);
export const Party = z.enum(["1", "2", "group", "family"]);
export const TimeOfDay = z.enum(["morning", "midday", "golden-hour", "evening"]);
export const Surface = z.enum([
  "table-2top",
  "table-4top",
  "long-table",
  "picnic-table",
  "park-table",
  "counter-top",
  /** On the go only where benches are culturally normal, and never as the only or suggested option (agent.ts benchNotAlone). */
  "bench",
  "food-truck-counter",
  "street-ledge",
]);
export type Surface = z.infer<typeof Surface>;
export type NapkinSize = "luncheon" | "dinner";
export type NapkinMaterial = "cotton" | "polyester" | "paper";
export type Venue = z.infer<typeof Venue>;

// ---------------------------------------------------------------------------
// Intake (the fields the operator fills in first)
// ---------------------------------------------------------------------------

export const IntakeInput = z.object({
  /** Filled from the country file; empty when the knowledge base doesn't confirm it. */
  operatingUnit: z.string().optional().default(""),
  /** Country id from the knowledge base front matter, e.g. "united_states". */
  country: z.string().min(2),
  /** Regional file id (e.g. "us-texas") when the country has regional files, else free text or empty. */
  region: z.string().optional().default(""),
  skuId: z.string().min(1),
  heroDish: z.string().min(1),
  sideDishRequest: z.string().optional().default(""),
  occasion: Occasion,
});
export type IntakeInput = z.infer<typeof IntakeInput>;

// ---------------------------------------------------------------------------
// Decision steps: "one way → resolved", "several ways → A (suggested) / B / C"
// ---------------------------------------------------------------------------

export const PrepChoice = z.object({
  label: z.string().describe("Short name of this preparation, 2-6 words"),
  detail: z.string().describe("One or two sentences, at most 40 words, describing how it is prepared and enjoyed locally"),
  promptText: z.string().describe("Photographic description of the finished dish for an image prompt, one sentence"),
  massClass: MassClass.describe("Rough silhouette of the food on its vessel"),
});
export type PrepChoice = z.infer<typeof PrepChoice>;

const VesselStyle = z
  .string()
  .default("")
  .describe("The vessel's material, color and finish, following the dishware rules, e.g. \"speckled oatmeal stoneware with a brown rim\". Never plain white for side bowls, ramekins or sauce boats");

export const PlatingChoice = z.object({
  label: z.string(),
  detail: z.string(),
  vessel: Vessel,
  vesselStyle: VesselStyle,
  service: Service.describe("shared = served family-style in one large vessel on the table, plus a plated portion for each diner"),
  promptText: z.string().describe("How the dish is presented, for the image prompt, one sentence"),
});
export type PlatingChoice = z.infer<typeof PlatingChoice>;

export const Accompaniment = z.object({
  name: z.string(),
  role: AccompanimentRole,
  vessel: Vessel,
  vesselStyle: VesselStyle,
  service: Service,
  pairsWith: z.string().describe("Label of the dish this accompanies, usually MAIN"),
  promptText: z.string().describe("Photographic description for the image prompt, one short sentence"),
});
export type Accompaniment = z.infer<typeof Accompaniment>;

export const Cutlery = z.enum(["fork", "knife", "spoon"]);
export type Cutlery = z.infer<typeof Cutlery>;

export const SidesChoice = z.object({
  label: z.string(),
  detail: z.string(),
  accompaniments: z.array(Accompaniment),
  cutlery: z
    .array(Cutlery)
    .optional()
    .describe("The utensils on the diner's napkin for this whole meal, following tableware reference §3: empty when everything is eaten by hand or with bread"),
});
export type SidesChoice = z.infer<typeof SidesChoice>;

export const SurfaceChoice = z.object({
  label: z.string(),
  detail: z.string(),
  surface: Surface,
  promptText: z.string(),
});
export type SurfaceChoice = z.infer<typeof SurfaceChoice>;

export const AccentChoice = z.object({
  label: z.string(),
  detail: z.string(),
  name: z.string(),
  vessel: Vessel,
  vesselStyle: VesselStyle,
  promptText: z.string(),
});
export type AccentChoice = z.infer<typeof AccentChoice>;

export type StepName = "prep" | "plating" | "sides" | "surface" | "accent";

export interface Decision<T> {
  step: StepName;
  status: "resolved" | "choose";
  /** options[0] is the suggested one (A). */
  /** "custom" is the operator's own version, built by the agent from their description. */
  options: Array<{ id: "A" | "B" | "C" | "custom"; suggested: boolean; rationale: string; value: T }>;
  source: "agent" | "sample";
}

// ---------------------------------------------------------------------------
// SceneSpec: everything the composer needs
// ---------------------------------------------------------------------------

export interface SkuInfo {
  id: string;
  displayName: string;
  package: "contour-glass-bottle" | "can" | "pet-bottle";
  volumeMl: number;
  /** GTIN-14 from the TCCC product data; names the reference photos in references/sku/<gtin>/. */
  gtin?: string;
  /** Measured package size, when known; otherwise skuProxy() estimates it from package + volume. */
  heightM?: number;
  radiusM?: number;
  /** What the real package looks like, for the prompts (cap, label, colour). */
  appearance?: string;
}

export interface SceneSpec {
  specVersion: "0.2";
  operatingUnit: string;
  country: string;
  countryLabel: string;
  region: string;
  occasion: Occasion;
  heroDish: string;
  scene: {
    setting: z.infer<typeof Setting>;
    venue: Venue;
    party: z.infer<typeof Party>;
    time: z.infer<typeof TimeOfDay>;
    surface: Surface;
    surfaceText?: string;
    /** Finer kind of place within the venue (see shared/venues.ts), e.g. "gastropub". */
    venueType?: string;
    /** The operator's own description of the environment. */
    environmentNote?: string;
    /** Two people sit at the table (party "2" only): the seated-corner layout with posed figures. */
    seated?: boolean;
    /** How the seated people sit (see shared/poses.ts); at least one holds their Coca-Cola. */
    pose?: string;
    /**
     * Where the two seated people sit: "corner" (default) at a right angle around a far corner, or
     * "across" facing each other, PERSON_1 in the near-left foreground seen over the shoulder.
     */
    seating?: "corner" | "across";
  };
  /** depth: a depth_of_field preset id (camera-options.json); unset means the default. */
  camera: { look: string; angle: string; depth?: string };
  sku: SkuInfo & { glass: boolean };
  entree: { name: string; prep: PrepChoice; plating: PlatingChoice };
  accompaniments: Accompaniment[];
  napkinSet: {
    napkinShape: "rect" | "triangle";
    /** Cotton at home, polyester at restaurants. Missing in drafts saved before 2026-10-01. */
    material?: NapkinMaterial;
    /** Luncheon for daytime meals, dinner size for dinner, late night and celebrations. */
    size?: NapkinSize;
    cutlery: string[];
    targets: "MAIN";
  } | null;
  accent: AccentChoice | null;
}

// ---------------------------------------------------------------------------
// Blueprint: CokeMeals3DTablescapeBlueprint (Part A) + extensions
// ---------------------------------------------------------------------------

export type Layer = "Layer_1_Primary_CoHero" | "Layer_2_Secondary_Side" | "Layer_3_Tertiary_Accent";

export interface Primitive {
  id: string; // role label, e.g. MAIN, SKU, SIDE_1
  component_name: string;
  layer: Layer;
  shape_type: "cylinder" | "flattened_cylinder" | "bounding_box";
  /** x ∈ [-1,1] lateral, y = projected canvas height of the center (0 bottom), z ∈ [0,1] depth (0.5 = table rear edge). */
  center_coordinates: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  rotation_euler_deg: { pitch: number; yaw: number; roll: number };
  directional_vector_target_id?: string;
  // --- extensions ---
  role: string;
  proxy: string; // registry key
  pairs_with?: string;
  group?: string;
  injected?: boolean;
  footprint?: "rect" | "triangle";
  /** For a second-setting item (party "2"): the single-setting label it copies (MAIN, NAPKIN_SET_1, SKU, GLASS). */
  same_as?: string;
  /** A seated person (role "person"): who they are and what they wear, from the art director. */
  person?: { who: string; heritage: string; wearing: string };
  /** A drink held in a seated person's hand (PERSON_1 or PERSON_2) instead of standing on the table. */
  held_by?: string;
  /** Real-world placement in meters: x lateral, d depth from the table's front edge, yawDeg about vertical. */
  world: { x: number; d: number; yawDeg: number; elevation: number };
  screen_bbox?: { x0: number; y0: number; x1: number; y1: number };
}

export interface CameraParams {
  focalLengthMm: number;
  fovDeg: number; // vertical
  pitchDeg: number;
  aspect: number;
  position: [number, number, number];
  target: [number, number, number];
}

export interface RuleResult {
  id: string;
  name: string;
  pass: boolean;
  detail: string;
  /** A preference: a miss is reported but never rejects a layout. */
  soft?: boolean;
  /** Items to move to fix a miss (never MAIN), most movable first. */
  offenders?: string[];
}

export interface Blueprint {
  canvas_metadata: { aspect_ratio: "16:9"; shopper_zone: "Impulse" };
  camera_spec: { pitch_angle_degrees: number; focal_length_mm: number; aperture: string };
  horizon_clamp: { max_table_rear_y_normalized: number };
  visual_mass_distribution: { primary_co_heroes_pct: number; secondary_sides_pct: number; tertiary_accents_pct: number };
  primitives: Primitive[];
  // --- extensions ---
  table: { surface: Surface; width: number; depth: number };
  camera: CameraParams;
  frame: { units: { x_span_m: number; z_span_m: number } };
  layout_meta: {
    archetype: string;
    rationale: string;
    score: number;
    scoreTerms: Record<string, number>;
    rule_results: RuleResult[];
    signature: string;
    seed: number;
    /** Edited layouts: ids of the items the art director moved, over every edit so far. */
    moved?: string[];
    /** Seated layouts: the pose the people were placed in. */
    pose?: string;
    /** Seated layouts: "across" when the two face each other (over the shoulder); unset at the corner. */
    seating?: "across";
  };
}
