// The Food Stylist — Regional Expert. Each intake step becomes one Gemini
// text call: the instructions and a budgeted knowledge-base excerpt go
// in the system prompt, the brief + choices + task in the prompt, and the
// answer comes back as JSON matching the step's schema. Submitting and
// parsing are separate so the browser polls the task instead of holding one
// request open for the whole generation.

import { z } from 'zod';
import tablewareStyle from '../../rules/tableware-style.json';
import { ON_THE_GO_SURFACE_RULE, benchSurface, onTheGoSurfaceRule, seatLikeSurface, withoutRoundTable } from '../shared/registry.ts';
import { angleById, backgroundView, foodStylingRules } from '../shared/rules.ts';
import { environmentBrief, venueType } from '../shared/venues.ts';
import type { TextTask } from './gemini.ts';
import { keywords, knowledgeBlock, loadKnowledge, type ContextFocus } from './knowledge.ts';
import { limitScene, type Selections } from '../shared/spec.ts';
import type { PromptLesson } from '../shared/feedback.ts';
import { ImageCheck, Story, Validation, foodLabels, storyFacts } from '../shared/story.ts';
import {
  AccentChoice,
  IntakeInput,
  PlatingChoice,
  PrepChoice,
  SidesChoice,
  SurfaceChoice,
  Vessel,
  type Blueprint,
  type Decision,
  type SceneSpec,
  type StepName,
  type Venue,
} from '../shared/types.ts';

/** Decision steps run on Gemini Flash (fast, many calls); the story, its check and the image check on Gemini Pro. */
const MODELS = {
  step: 'fast',
  story: 'pro',
} as const;

const PROMPT_CAP = 48_000;

export type AgentKind = StepName | 'story' | 'validate' | 'imageCheck';

export interface Brief extends IntakeInput {
  countryLabel: string;
  regionLabel: string;
}

export function toBrief(input: IntakeInput): Brief {
  const kb = loadKnowledge();
  const country = kb.countries.find((c) => c.id === input.country);
  const region = country?.regions.find((r) => r.id === input.region);
  return {
    ...input,
    countryLabel: country?.label ?? input.country,
    regionLabel: region?.label ?? input.region ?? '',
  };
}

const INSTRUCTIONS = `You are the Food Stylist — Regional Expert behind an intake tool that plans photorealistic Coca-Cola meal imagery for The Coca-Cola Company.

The operator is building one scene step by step. At each step you return the options they choose from.

How to work:
- Ground every suggestion in the knowledge-base files provided (the country file first, then the regional file, then the brand and tableware references). Name the sections you relied on in "sources" (for example "spain.md › DISH CATALOG › Paella and arroces").
- If the knowledge base doesn't cover something, say so plainly in the rationale ("not covered in the country file; general knowledge") rather than presenting it as sourced. Never contradict a knowledge-base rule, and respect every "never stage" or avoid rule in it.
- If the dish is served essentially one way in this region, return status "resolved" with exactly one option. Otherwise return status "choose" with two or three genuinely different options, the most common first (it is shown as the suggested option A).
- Keep labels short (2-6 words). Details are one or two plain sentences, at most 40 words: they are shown in full on the option card, so every word should earn its place. promptText is written for an image model: concrete, visual, no brand names except Coca-Cola.
- Vessels must come from the allowed vocabulary: ${Vessel.options.join(', ')}. Pick the closest one and put the exact wording in promptText. A condiment served from its own container uses that container's shape: condiment-bottle for a bottle (malt vinegar, hot sauce, ketchup), shaker for salt, pepper or spice, jar for mustard, chutney or pickles; ramekin, small-bowl and sauce-boat are only for condiments spooned into a dish.
- Every vessel gets a vesselStyle: its material, color and finish. Follow the dishware rules below.
- The Coca-Cola product is always the only drink in the scene; never suggest another beverage.
- Tables are never round, circular or oval: describe a square or rectangular table with straight edges, in every option, surface and "Table:" description.
- No hands appear in any image and nobody sits at the table. Even for food eaten by hand (empanadas, tacos, sandwiches, slices), describe it resting on its vessel or the surface; never write "handheld", "held", "in hand", "picked up" or "bitten". In an environment description, people may appear only far behind the table as one or two soft, unrecognizable shapes: never a face or features, never a child, never someone at or beside the table.

Dishware rules (the country files give each vessel's type and size but rarely its look, so without these every bowl comes out plain white):
${tablewareStyle.rules.map((r) => `- ${r}`).join('\n')}
Examples of vesselStyle: ${tablewareStyle.examples.join('; ')}.

The knowledge base below is an excerpt: the sections of each file most relevant to this step. If something you need isn't in it, treat it as not covered.`;

/** Knowledge-base search words for where the meal is eaten. */
function sceneWords(scene: { venue: Venue; venueType?: string | undefined } | undefined): string[] {
  if (!scene) return [];
  const place = venueType(scene.venue, scene.venueType);
  const venue = scene.venue === 'on-the-go' ? 'street food takeaway vendor stall' : scene.venue === 'home' ? 'home household family' : 'restaurant';
  // Retired ids (food-court, gastropub, local-spot…) still name sections the knowledge base was written around.
  return [venue, ...(place ? [place.label, ...(place.aliases ?? []).map((a) => a.replace(/-/g, ' '))] : [])];
}

/**
 * The scene is chosen before the food, so the food steps are told where it is
 * eaten: what is served there, and what it is served on, depends on the venue.
 */
function venueFit(sel: Selections, step: 'prep' | 'plating' | 'sides'): string {
  const scene = sel.scene && limitScene(sel.scene);
  if (!scene) return '';
  const place = venueType(scene.venue, scene.venueType)?.label;
  const where = `${scene.venue === 'on-the-go' ? 'on the go' : `at ${scene.venue === 'home' ? 'home' : 'a restaurant'}`}${place ? ` (${place})` : ''}`;
  if (step === 'prep')
    return ` The meal is eaten ${where}: lead with the preparation people actually eat there, and leave out styles that only belong somewhere else.`;
  const vessels =
    scene.venue === 'on-the-go'
      ? 'street and takeaway service: paper, foil or a wrapper, a paper boat or basket, a disposable or market tray, a cutting board at a stall; never fine china or household plates'
      : scene.venue === 'home'
        ? 'household dishware a family here would own, as it is served at home; never restaurant-only presentation or disposable takeaway packaging'
        : `how this kind of place serves it${place ? ` (${place}: its own plates, boards, baskets or trays)` : ''}; never disposable packaging unless this kind of place uses it`;
  const fit = ` The meal is eaten ${where}, so every vessel must fit ${vessels}. If the dish is unusual ${where}, say so in the rationale.`;
  if (step === 'sides') return fit;
  const shared =
    scene.party === 'family' || scene.party === 'group'
      ? ` The party is a ${scene.party}: use service "shared" when the dish is typically served family-style from one large vessel on the table (a whole roast, a pizza, a paella pan); the scene then shows that vessel plus one plated portion. Otherwise individual.`
      : scene.party === '2'
        ? ' The party is two people, sitting at a right angle around one corner of the table, and each always gets their own plated portion. Also use service "shared" when the dish is typically brought to the table family-style for diners to plate from (mandi on a large tray, a whole roast, a paella pan, a big platter of rice and meat): the scene then adds that one serving vessel between the two plates, and the sides and breads are shared too. Otherwise individual.'
        : ' The party is one person, so service is always "individual": they get their own portion, never one large shared vessel.';
  return fit + shared;
}

const STEP_TASKS: Record<StepName, (sel: Selections) => string> = {
  prep: (sel) =>
    `Identify the hero dish and how it is prepared and enjoyed in this region. If it has regional variants or preparation styles, offer them.${venueFit(sel, 'prep')}`,
  plating: (sel) =>
    `Identify how this dish is most commonly served here (entree plate, wrapped in foil, basket, cutting board, and so on). For a plate, use "plate" (28 cm entree) by default and "lunch-plate" (23 cm) when the main is a small, delicate protein or a compact stack, so the food fills the plate; never an oversized charger.${
      sel.scene
        ? venueFit(sel, 'plating')
        : ' Use service "shared" only when the dish is typically served family-style from one large vessel on the table (a whole roast, a pizza, a paella pan); the scene then shows that vessel plus one plated portion.'
    }`,
  sides: (sel) =>
    `Identify the side dishes and accompaniments this dish is commonly served with here: grain, vegetable, side dish, bread, condiment, and the container each is served in. Each option is a complete set. Keep it to what a real table would show: at most two side dishes, at most two or three condiments, bread only if customary (tableware reference §4). ${sel.plating?.service === 'shared' ? 'The meal is family-style, so side dishes are shared (service shared) in serving bowls; condiments stay individual. ' : ''}If the operator requested a side dish, include it in option A when it is culturally plausible; if it isn't, still include it in one option and say why it's unusual. pairsWith is "MAIN" unless a condiment belongs to a specific side. Set cutlery for each option by walking every item on the table (tableware reference §3): leave it empty when the main and sides are eaten by hand or with bread here (falafel, wraps, sandwiches, burgers), use the local utensils where they differ from fork and knife, and add a utensil only for an item that needs one. Never add fork and knife by default; name the cutlery in the detail.${venueFit(sel, 'sides')}`,
  surface: () =>
    `This is a meal on the go. The food always sits on a surface, never in a hand. ${ON_THE_GO_SURFACE_RULE} This overrides the knowledge base where it mentions eating on steps or a railing. Suggest the surfaces that fit this dish and country: surface "picnic-table" (a picnic table, benches attached is fine), "park-table" (a small park or café-style outdoor table), "counter-top" (a counter top, window bar or high table), "food-truck-counter" or "street-ledge" (a wide ledge, deep enough to hold the meal). A bench (surface "bench") may be one of the options only when the knowledge base shows people here commonly eat this on a bench; it is never option A and never the only option, so always answer "choose" with at least one table-like option first.`,
  accent: () =>
    'The composition needs one more small table item to make the count odd. Suggest small accents that genuinely belong with this meal here (a condiment, garnish, or lime dish in a ramekin, small bowl or sauce boat). Never a drink, never something the knowledge base says to avoid.',
};

const STEP_VALUES = {
  prep: PrepChoice,
  plating: PlatingChoice,
  sides: SidesChoice,
  surface: SurfaceChoice,
  accent: AccentChoice,
} as const;

function decisionSchema<T extends z.ZodType>(value: T) {
  return z.object({
    status: z.enum(['resolved', 'choose']),
    options: z
      .array(
        z.object({
          rationale: z
            .string()
            .describe('Why this option, and whether the knowledge base covers it'),
          sources: z
            .array(z.string())
            .describe('Knowledge-base sections relied on; empty if general knowledge'),
          value,
        })
      )
      .min(1)
      .describe('One option when resolved; two or three when choose, most common first'),
  });
}

function schemaFor(kind: AgentKind): z.ZodType {
  if (kind === 'story') return Story;
  if (kind === 'validate') return Validation;
  if (kind === 'imageCheck') return ImageCheck;
  return decisionSchema(STEP_VALUES[kind]);
}

function answerFormat(kind: AgentKind): string {
  const schema = JSON.stringify(z.toJSONSchema(schemaFor(kind)));
  return `Answer with a single JSON object and nothing else — no prose before or after it, no code fence. It must match this JSON Schema:\n${schema}`;
}

function briefText(b: Brief, sel: Selections = {}): string {
  const lines = [
    `Country: ${b.countryLabel}${b.regionLabel ? ` — region: ${b.regionLabel}` : ''}`,
    `Hero dish: ${b.heroDish}`,
    `Side dish request: ${b.sideDishRequest || '(none)'}`,
    `Occasion: ${b.occasion}`,
    `Product SKU: ${b.skuId}`,
  ];
  if (b.operatingUnit) lines.splice(1, 0, `Operating unit: ${b.operatingUnit}`);
  if (sel.prep) lines.push(`Chosen preparation: ${sel.prep.label} — ${sel.prep.detail}`);
  if (sel.plating)
    lines.push(
      `Chosen plating: ${sel.plating.label} (${sel.plating.vessel}${sel.plating.vesselStyle ? `, ${sel.plating.vesselStyle}` : ''}, ${sel.plating.service} service)`
    );
  if (sel.sides)
    lines.push(
      `Chosen sides: ${sel.sides.accompaniments.map((a) => `${a.name} (${a.role}, ${a.vessel}${a.vesselStyle ? `, ${a.vesselStyle}` : ''})`).join('; ') || 'none'}`
    );
  if (sel.scene) {
    const scene = limitScene(sel.scene);
    const place = venueType(scene.venue, scene.venueType);
    lines.push(
      `Scene: ${scene.setting}, ${scene.venue}${place ? ` (${place.label})` : ''}, party of ${scene.party}${scene.time ? `, ${scene.time}` : ''}`
    );
    const env = environmentBrief(sel.scene);
    if (env) lines.push(env);
  }
  return lines.join('\n');
}

export interface AgentRequest {
  kind: AgentKind;
  brief: IntakeInput;
  selections?: Selections | undefined;
  spec?: SceneSpec | undefined;
  blueprint?: Blueprint | undefined;
  story?: Story | undefined;
  notes?: string[] | undefined;
  /** story: the art director's directions from the layout sketch review. */
  directions?: string[] | undefined;
  /** The operator's own version of a decision step, in their words. */
  custom?: string | undefined;
  /** The options already shown, so the custom text can refer to them ("like B, but grilled"). */
  shownOptions?: string[] | undefined;
  /** Lessons the team confirmed for this country + dish from past generated images. */
  lessons?: PromptLesson[] | undefined;
  /** imageCheck: the generated scene images, and the prompt and node names they were made from. */
  imageUrls?: string[] | undefined;
  prompt?: string | undefined;
  elements?: string[] | undefined;
}

/** Confirmed-lessons block for a prompt; empty string when there are none. */
function lessonsBlock(lessons: PromptLesson[] | undefined, note?: string): string {
  if (!lessons?.length) return '';
  const header = 'Confirmed lessons from rated images of this dish (follow these; they override generic habits):';
  return `\n\n${header}\n${lessons.map((l) => `- [${l.element}] ${l.text}`).join('\n')}${note ? `\n${note}` : ''}`;
}

/** Lowercased text with every non-alphanumeric run (except & and ') collapsed to one space, padded for whole-word matching. */
/** Food-styling rules (rules/food-styling.json) for every dish named in the given texts; empty string when none match. */
function dishRulesBlock(texts: Array<string | undefined>, note?: string): string {
  const dishes = foodStylingRules(texts);
  if (!dishes.length) return '';
  const lines = dishes.flatMap((d) => [`${d.label}:`, ...d.rules.map((r) => `- ${r}`)]);
  return `\n\nFood-styling rules for this dish (the team's standards; follow them in every option, label and description, and state them in the text the image model reads):\n${lines.join('\n')}${note ? `\n${note}` : ''}`;
}

function customTask(custom: string, shown: string[] | undefined): string {
  return `The operator wants their own version instead of (or adapted from) the options already shown.${shown?.length ? `\nOptions already shown:\n- ${shown.join('\n- ')}` : ''}

The operator's description: ${JSON.stringify(custom)}

Return status "resolved" with exactly one option that realizes their description as closely as the allowed vocabulary permits. If they refer to a shown option ("like B, but…"), start from it and change only what they asked. Keep their wording in the label where you can. If what they ask for is unusual in this region or conflicts with a knowledge-base rule, still build it, but say so plainly at the start of the rationale.`;
}

function storyTask(spec: SceneSpec, bp: Blueprint, notes?: string[], directions?: string[]): string {
  const facts = storyFacts(spec, bp);
  return `Write the scene story for the image team.

Scene spec:
${JSON.stringify({ scene: spec.scene, sku: spec.sku, entree: spec.entree, accompaniments: spec.accompaniments, accent: spec.accent, napkinSet: spec.napkinSet }, null, 1)}

Fixed facts (use these, do not contradict them):
- Surface: ${facts.surfaceText}${onTheGoSurfaceRule(spec.scene) ? `\n- On the go: ${onTheGoSurfaceRule(spec.scene)}` : ''}${environmentBrief(spec.scene) ? `\n- Environment brief (build the Background from this): ${environmentBrief(spec.scene)}${spec.scene.venueType ? ' Where the knowledge base has a venue profile for this kind of place in this country, follow its look over this generic description.' : ''}` : ''}
- Lighting: ${facts.lightingSentence}
- Light on the product: ${facts.skuLightSentence}
- Look (write the environment and food as this candid, unstyled moment): ${facts.filmSentence}
- Camera: ${facts.lookSentence} ${facts.angleSentence}
- Framing: ${facts.framingSentence}
- Product serving: ${facts.servingSentence}
- Layout (from the chosen proxy): ${facts.labels.map((l) => `${l.label} = ${l.what}, ${l.where}`).join('; ')}
${spec.scene.seated && spec.scene.solo ? `\nOne person sits at this table (PERSON_1), ${spec.scene.solo === 'hands' ? 'just out of frame, so only their hand and forearm reach in toward their drink' : 'across the table facing the camera, their face cropped by the top of the frame'}; this overrides the general "nobody sits at the table" rule for this scene only. Their looks, clothes and pose already have fixed text, so do not write a label for them and do not add other people at the table. Mention them briefly in the scene summary as someone enjoying the meal, and still describe no hands holding or lifting food.` : spec.scene.seated && spec.scene.party === '2' ? '\nTwo people sit at this table, at one corner (PERSON_1 and PERSON_2); this overrides the general "nobody sits at the table" rule for this scene only. Their looks, clothes and pose already have fixed text, so do not write labels for them and do not add other people at the table. Mention them briefly in the scene summary as two people sharing the meal, and still describe no hands holding or lifting food. The second diner\'s dish (MAIN_2) is the same plate as MAIN and already has fixed text, so do not write a separate food label for it.' : spec.scene.party === '2' ? '\nThis table is set for two, at a right angle around one corner (nobody sits at it in the image, only their place settings show). Mention briefly in the scene summary that the table is set for two; the second diner\'s dish (MAIN_2) is the same plate as MAIN and already has fixed text, so do not write a separate food label for it.' : ''}

Write:
- sceneSummary: a few paragraphs of prose as a food stylist would brief it: what's on the table, where, the setting, the mood, and the cultural framing.
- briefSummary: the sceneSummary abbreviated to about half its length, for a quick read: the same scene in the same order (setting and occasion, then the hero dish, then the sides, drink and napkin), keeping every item on the table but dropping the extra description. Same voice; paragraphs separated by a blank line.
- culturalNotes: the do's and don'ts from the knowledge base that matter for this scene. Start each one with "Do" or "Don't".
- segments: entreeDish, traditionalSideDishes (one per side or condiment), productDetail (the exact Coca-Cola product and its size, with a real-world scale anchor), environmentalOverview (the table and the background; see below), platingAndTableware, productServingDetails (use the product serving fact), brandVisId (camera, lens, angle and framing from the fixed facts).
- labelSegments: one entry for each food label below, in this order. The image model draws each labeled shape from this text alone, so each text must make the component unmistakable:
  - When the dish has countable pieces, start with the exact count ("Exactly three tacos side by side", "Two slices") and say none is hidden behind another.
  - Name the food by its local name, then what it visibly looks like: colors, textures, how it is cut, filled, sauced and garnished, as it is actually served in this region.
  - Say how the pieces sit on the container the way they land when served, not lined up for display ("two halves, one leaning on the other, neither hidden").
  - For stuffed, wrapped or sandwiched food (pita, samoon, wraps, burgers), describe the filling as it really is: broken or crushed pieces packed inside with the salad and pickles, sauce soaked into the bread and running out at the opening, never whole pieces lined up on top or a sauce drizzled over the outside.
  - Give every sauce its real color and consistency, compared with something familiar, so it can't read as melted cheese or mustard (amba is a thin, ochre-orange mango pickle sauce with small fruit bits).
  - Add one or two signs the food was just made by hand: torn bread edges, uneven browning, crumbs, a drip or smear on the plate.
  - Give proportions: what makes up most of the dish and what is only an accent ("mostly rice, with only a few small pieces of chicken"), and the real size of distinctive pieces ("beans about 2 cm long"). Listing ingredients with equal weight makes the image model draw each one large and prominent.
  - A plated portion served from a shared dish is smaller and simpler than the dish in its vessel: mostly the base, with a few small pieces.
  - Say what it sits on using the given container wording, including the size and its material and color. If a container has no material or color given, choose one following the dishware rules (never plain white for a side bowl, ramekin or sauce boat).
  - When a common look-alike exists, say what it is not (al pastor is thinly shaved, not shredded; tortillas are small soft corn, not flour).
  - No position, lighting, mood or camera words; the layout gives the position.
  - One or two sentences.
  Food labels: ${foodLabels(facts).map((l) => `${l.label} = ${l.what}, on ${l.vessel}`).join('; ')}.
  (The product and napkin labels have fixed text; do not write them.)
- environmentalOverview: the environment segment of the image prompt, in two parts. Start with "Table:" and describe the tabletop the objects stand on, building on the fixed surface: material, color, finish, and a cloth or runner only if it belongs to this place. Then "Background:" and give two or three recognizable details of the place behind the table, as this camera sees it (${backgroundView(angleById(spec.camera.angle))}): wall color, tile, chairs, plants, a window where one would be in view, soft but still recognizable in shape and color, with at most one or two people far behind as blurred, unrecognizable shapes (no faces, no children) where the place would naturally have them, never anything with writing on it (no menus, signs or posters), because the image model renders it as garbled text. The background should read as this place rather than a blank studio; when there is an environment brief, it is the place. No lighting, camera or color words; those have their own segment.${notes?.length ? `\n\nA previous version failed validation. Fix these problems:\n- ${notes.join('\n- ')}` : ''}${directions?.length ? `\n\nThe art director reviewed a sketch of this layout. Follow their directions in the labels and the environment (the shapes' positions are handled separately, so don't describe moving anything):\n- ${directions.join('\n- ')}` : ''}`;
}

function validateTask(spec: SceneSpec, fullStory: Story): string {
  // The brief summary only abbreviates the detailed one; validation reads the detailed summary.
  const { briefSummary: _brief, ...story } = fullStory;
  return `Check this scene story for cultural authenticity and consistency before any image is generated. Check it against the knowledge base (country file, regional file, brand and tableware references) and against the brief. Fail it only for real problems: a wrong dish or variant for this region, a broken cultural or brand rule, a side or vessel that doesn't belong, an inconsistency between segments, or a claim the knowledge base marks as unconfirmed presented as fact. Each note names the problem and what to change.

Story:
${JSON.stringify(story, null, 1)}

Scene spec:
${JSON.stringify({ scene: spec.scene, sku: spec.sku, entree: spec.entree, accompaniments: spec.accompaniments, accent: spec.accent }, null, 1)}`;
}

function imageCheckTask(spec: SceneSpec, story: Story, prompt: string, count: number, elements: string[]): string {
  return `Check the generated scene ${count > 1 ? `images (${count} variants of the same prompt, attached in order as images 1 to ${count})` : 'image (attached)'} against the scene story and the prompt they were made from, before the operator uses them. You are the food stylist on set: look at each image closely, as if zoomed in, and compare it with what was asked for.

Check, element by element:
- The food is the right dish, prepared and cut the way the story and the knowledge base describe for this region: how it is cut, split, butterflied, sliced, rolled, filled or stacked; the bread, wrapper or base and its size and shape; the exact count of pieces; the proportions (what makes up most of the dish and what is only an accent). A look-alike dish counts as wrong (a whole sausage on a long hot-dog bun is not a butterflied sausage on a short crusty roll).
- Each side, condiment and garnish is present, recognizable, in the right container (material and color), and nothing was added that the story doesn't list. Missing or duplicated items count.
- The Coca-Cola product matches the product detail: the right package, size and color, the logo correct and not garbled, upright and fully visible.
- The table, background and setting read as the place described, with no writing, signs, menus or garbled text, and no people beyond what the story allows.
- The objects sit roughly where the layout puts them and nothing hides another item it shouldn't.
Ignore photographic taste (light, color grade, depth of field) unless it hides something the story asks for.

Severity: "major" when a food stylist would reject the image for it (wrong dish or preparation, wrong count, missing or extra item, wrong or garbled product, text in the image); "minor" for small differences the image could still ship with. An image passes only when it has no major issue. Don't invent issues to seem thorough: if an image matches, say so with an empty issues list.

For each issue, "element" is one of these node names: ${[...elements, 'SCENE'].join(', ')}. "fix" is one plain sentence the operator can add to that node's text, written for the image model: concrete and visual, saying what the item is and what it is not.

Scene story (what the image should show):
${story.sceneSummary}

Element descriptions:
${story.labelSegments.map((l) => `- ${l.label}: ${l.text}`).join('\n')}

Cultural notes:
${story.culturalNotes.map((n) => `- ${n}`).join('\n')}

Scene spec:
${JSON.stringify({ scene: spec.scene, sku: spec.sku, entree: spec.entree, accompaniments: spec.accompaniments, accent: spec.accent }, null, 1)}

The exact prompt the images were generated from (the operator may have edited it; where it differs from the story, the prompt is what was asked for). Image 1 of that prompt was a gray layout guide, not attached here:
${prompt}`;
}

/** The Gemini call for one step. Throws when the request is incomplete. */
export function buildTask(req: AgentRequest): TextTask {
  const brief = toBrief(req.brief);
  const sel = req.selections ?? {};
  let task: string;
  let focus: ContextFocus;
  let words: string[];
  const sceneLevel = req.kind === 'story' || req.kind === 'validate' || req.kind === 'imageCheck';
  if (req.kind === 'story' || req.kind === 'validate' || req.kind === 'imageCheck') {
    const spec = req.spec;
    if (!spec) throw new Error('The scene spec is missing; compose a layout first.');
    words = keywords(
      brief.heroDish,
      spec.entree.prep.label,
      spec.entree.plating.label,
      ...spec.accompaniments.map((a) => a.name),
      spec.accent?.name,
      ...sceneWords(spec.scene),
      // Party "2": pull in any knowledge-base sections about sharing, portions or serving
      // more than one person, since a second place setting is now part of the scene.
      spec.scene.party === '2' ? 'second diner place setting sharing portions together' : undefined
    );
    const dishTexts = [brief.heroDish, brief.sideDishRequest, JSON.stringify({ entree: spec.entree, accompaniments: spec.accompaniments })];
    if (req.kind === 'imageCheck') {
      if (!req.story) throw new Error('The scene story is missing.');
      if (!req.imageUrls?.length || !req.prompt) throw new Error('There is no generated image to check.');
      task =
        imageCheckTask(spec, req.story, req.prompt, req.imageUrls.length, req.elements ?? []) +
        dishRulesBlock(dishTexts, 'Check each rule against each image; treat a violation as an issue for that element.') +
        lessonsBlock(req.lessons, 'Check each lesson against each image; treat a violation as an issue for that element.');
      focus = 'imageCheck';
    } else if (req.kind === 'story') {
      if (!req.blueprint) throw new Error('Pick a layout before writing the story.');
      task =
        storyTask(spec, req.blueprint, req.notes, req.directions) +
        dishRulesBlock(dishTexts, 'Write these into the matching food labels.') +
        lessonsBlock(req.lessons, 'The story must honour these lessons in its labels and descriptions.');
      focus = 'story';
    } else {
      if (!req.story) throw new Error('Write the story before validating it.');
      task =
        validateTask(spec, req.story) +
        dishRulesBlock(dishTexts, 'Flag in your notes any food label that leaves out or contradicts one of these rules.') +
        lessonsBlock(req.lessons, 'Flag in your notes any story text that contradicts one of these lessons.');
      focus = 'validate';
    }
  } else {
    const custom = req.custom?.trim();
    const lessonsForStep =
      req.kind === 'prep' || req.kind === 'plating' || req.kind === 'sides' ? lessonsBlock(req.lessons) : '';
    const dishRules =
      req.kind === 'prep' || req.kind === 'plating' || req.kind === 'sides'
        ? dishRulesBlock([brief.heroDish, brief.sideDishRequest, custom, JSON.stringify({ prep: sel.prep, plating: sel.plating, sides: sel.sides })])
        : '';
    task = `Step: ${req.kind}\n${STEP_TASKS[req.kind](sel)}${custom ? `\n\n${customTask(custom, req.shownOptions)}` : ''}${dishRules}${lessonsForStep}`;
    focus = req.kind;
    words = keywords(
      brief.heroDish,
      brief.sideDishRequest,
      req.custom,
      sel.prep?.label,
      sel.plating?.label,
      ...(sel.sides?.accompaniments.map((a) => a.name) ?? []),
      // The venue words pull in the knowledge-base sections on street food, home meals or restaurant service.
      ...sceneWords(sel.scene)
    );
  }

  const prompt = `${briefText(brief, sceneLevel ? {} : sel)}\n\n${task}\n\n${answerFormat(req.kind)}`;
  // The knowledge base gets whatever the cap leaves after the instructions and
  // the prompt, with headroom for the wrapper tags.
  // The image check carries the whole generation prompt, so its excerpt may shrink further.
  const budget = Math.max(req.kind === 'imageCheck' ? 2_000 : 8_000, PROMPT_CAP - INSTRUCTIONS.length - prompt.length - 1_500);
  const kb = knowledgeBlock({
    country: brief.country,
    region: brief.region || undefined,
    focus,
    words,
    budget: Math.min(budget, 34_000),
  });
  const big = sceneLevel;
  return {
    name: `tablescape-${req.kind}`,
    model: big ? MODELS.story : MODELS.step,
    system_prompt: `${INSTRUCTIONS}\n\n${kb.text}`,
    prompt,
    temperature: req.kind === 'validate' || req.kind === 'imageCheck' ? 0.2 : 0.6,
    // Generous: a cut-off answer is unreadable JSON.
    max_output_tokens: req.kind === 'story' ? 8000 : req.kind === 'imageCheck' ? 4000 : big ? 3000 : 6000,
    ...(req.kind === 'imageCheck' && req.imageUrls ? { images: req.imageUrls.map((url) => ({ url })) } : {}),
  };
}

/**
 * The first complete top-level JSON object in the text, found by matching
 * braces outside strings — so prose or a second object around it, or braces
 * inside string values, don't break it. `truncated` when the text ends
 * before the object closes (the answer ran out of output tokens).
 */
function findObject(text: string): { json: string } | { truncated: true } | null {
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return { json: text.slice(start, i + 1) };
    }
  }
  return { truncated: true };
}

/** Common near-misses: smart quotes around keys/strings, trailing commas. */
function repairJson(json: string): string {
  return json
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/,\s*([}\]])/g, '$1');
}

export class AnswerFormatError extends Error {
  constructor(
    message: string,
    readonly truncated: boolean
  ) {
    super(message);
  }
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const found = findObject(fenced?.[1] ?? text) ?? (fenced ? findObject(text) : null);
  if (!found) throw new AnswerFormatError('no JSON object in the answer', false);
  if ('truncated' in found) throw new AnswerFormatError('the answer was cut off before the JSON ended', true);
  try {
    return JSON.parse(found.json);
  } catch {
    return JSON.parse(repairJson(found.json));
  }
}

/**
 * A follow-up task that turns a malformed answer into valid JSON: the same
 * schema, the broken text, no knowledge base. Sent once, automatically, before
 * the operator sees an error.
 */
export function repairTask(kind: AgentKind, text: string, problem: string): TextTask {
  const budget = PROMPT_CAP - 4_000;
  const broken = text.length > budget ? text.slice(0, budget) : text;
  return {
    name: `tablescape-${kind}-repair`,
    model: MODELS.step,
    system_prompt: 'You fix malformed JSON. Keep every value the original answer gave; change only what is needed to make it valid and complete.',
    prompt: `This answer was supposed to be one JSON object, but ${problem}. If it was cut off, finish the last option briefly and close every bracket; drop an unfinished option only if it can't be completed sensibly.\n\nAnswer to fix:\n${broken}\n\n${answerFormat(kind)}`,
    temperature: 0,
    max_output_tokens: kind === 'story' ? 8000 : 6000,
  };
}

export type AgentResult =
  | { kind: 'prep'; decision: Decision<PrepChoice> }
  | { kind: 'plating'; decision: Decision<PlatingChoice> }
  | { kind: 'sides'; decision: Decision<SidesChoice> }
  | { kind: 'surface'; decision: Decision<SurfaceChoice> }
  | { kind: 'accent'; decision: Decision<AccentChoice> }
  | { kind: 'story'; story: Story }
  | { kind: 'validate'; validation: Validation }
  | { kind: 'imageCheck'; check: ImageCheck };

function toDecision<V>(step: StepName, value: z.ZodType<V>, raw: unknown): Decision<V> {
  const out = decisionSchema(z.unknown()).parse(raw);
  const opts = out.status === 'resolved' ? out.options.slice(0, 1) : out.options.slice(0, 3);
  const ids = ['A', 'B', 'C'] as const;
  return {
    step,
    status: opts.length === 1 ? 'resolved' : 'choose',
    options: opts.map((o, i) => ({
      id: ids[i] ?? 'C',
      suggested: i === 0,
      rationale: o.sources.length ? `${o.rationale} (Sources: ${o.sources.join('; ')})` : o.rationale,
      value: value.parse(o.value),
    })),
    source: 'agent',
  };
}

const PICNIC_TABLE: SurfaceChoice = { label: 'Picnic table', detail: 'A wooden park picnic table', surface: 'picnic-table', promptText: 'a wooden park picnic table' };

/**
 * On-the-go surfaces are table-like: drop any option that puts the food on a
 * seat, a lap or the ground. A bench may stay as an alternative but never leads
 * and is never alone: a picnic table goes first when nothing table-like is left.
 */
function benchNotAlone(d: Decision<SurfaceChoice>): Decision<SurfaceChoice> {
  const isBench = (v: SurfaceChoice) => v.surface === 'bench' || benchSurface(`${v.label} ${v.promptText}`);
  const kept = d.options
    .filter((o) => !seatLikeSurface(`${o.value.label} ${o.value.promptText}`))
    .map((o) => ({ ...o, value: { ...o.value, label: withoutRoundTable(o.value.label).replace(/^./, (c) => c.toUpperCase()), detail: withoutRoundTable(o.value.detail), promptText: withoutRoundTable(o.value.promptText) } }))
    .map((o) => (isBench(o.value) ? { ...o, value: { ...o.value, surface: 'bench' as const } } : o));
  const tables = kept.filter((o) => !isBench(o.value));
  const benches = kept.filter((o) => isBench(o.value));
  const lead = tables.length
    ? tables
    : [{ id: 'A' as const, suggested: true, rationale: 'On the go the food sits on a table first; a picnic table fits almost anywhere.', value: PICNIC_TABLE }];
  const options = [...lead, ...benches].slice(0, 3).map((o, i) => ({ ...o, id: o.id === 'custom' ? o.id : (['A', 'B', 'C'] as const)[i] ?? 'C', suggested: i === 0 }));
  return { ...d, status: options.length === 1 ? 'resolved' : 'choose', options };
}

/** Parse and check the agent's answer for one step. */
export function parseAnswer(kind: AgentKind, text: string): AgentResult {
  let raw: unknown;
  try {
    raw = extractJson(text);
  } catch (err) {
    const truncated = err instanceof AnswerFormatError && err.truncated;
    throw new AnswerFormatError(
      truncated
        ? "The agent's answer was cut off before it finished. Ask again."
        : "The agent's answer wasn't readable JSON. Ask again.",
      truncated
    );
  }
  const parsed = schemaFor(kind).safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AnswerFormatError(
      `The agent's answer didn't match the expected shape${issue ? ` (${issue.path.join('.') || 'root'}: ${issue.message})` : ''}. Ask again.`,
      false
    );
  }
  switch (kind) {
    case 'story':
      return { kind, story: Story.parse(raw) };
    case 'validate':
      return { kind, validation: Validation.parse(raw) };
    case 'imageCheck': {
      // An image with a major issue never passes, whatever the model said.
      const check = ImageCheck.parse(raw);
      return { kind, check: { ...check, images: check.images.map((i) => ({ ...i, pass: i.pass && !i.issues.some((x) => x.severity === 'major') })) } };
    }
    case 'prep':
      return { kind, decision: toDecision(kind, PrepChoice, raw) };
    case 'plating':
      return { kind, decision: toDecision(kind, PlatingChoice, raw) };
    case 'sides':
      return { kind, decision: toDecision(kind, SidesChoice, raw) };
    case 'surface':
      return { kind, decision: benchNotAlone(toDecision(kind, SurfaceChoice, raw)) };
    case 'accent':
      return { kind, decision: toDecision(kind, AccentChoice, raw) };
  }
}
