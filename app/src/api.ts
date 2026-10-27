import { createHash } from 'node:crypto';

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { forgetSessions, type AppUser } from './server/auth.ts';
import { env } from './server/env.ts';
import { GeminiError, generateImages, generateText, isReadableRef, type ImageTask, type TextTask } from './server/gemini.ts';
import {
  failGeneration,
  finishGeneration,
  LimitReachedError,
  listMembers,
  myGenerations,
  reserveGeneration,
  studioData,
  usageThisMonth,
  type GenerationKind,
  type SceneBrief,
} from './server/generations.ts';
import { doneJob, getJob, startJob } from './server/jobs.ts';
import { documentStore } from './server/store.ts';
import { db } from './server/supabase.ts';
import { buildTask, parseAnswer, repairTask, type AgentResult } from './server/agent.ts';
import {
  addLesson,
  approvedEditsMarkdown,
  confirmedLessons,
  dishFeedback,
  exportFeedback,
  listDishes,
  submitFeedback,
  updateKbEdit,
  updateLesson,
  type Actor,
} from './server/feedback.ts';
import { buildLearnTask, mergeLearnAnswer } from './server/learn.ts';
import { loadKnowledge } from './server/knowledge.ts';
import { locateItems } from './server/locate.ts';
import { kbHighlights } from './server/insights.ts';
import { glassReferenceLine, pouredGlass, productElement, skuReferenceLines, skuShots, type SkuShot } from './server/references.ts';
import { SKU_CATALOG } from './shared/registry.ts';
import {
  ANGLES,
  DEFAULT_ANGLE,
  DEFAULT_LOOK,
  LOOKS,
  glassRule,
  selectLighting,
  timeFromOccasion,
  venueAllowed,
  type GlassRule,
  type LightingPreset,
} from './shared/rules.ts';
import { needsAccent, sceneItems, type ItemKind } from './shared/scene.ts';
import { solve } from './shared/solver.ts';
import { buildSpec, skuById, type Selections } from './shared/spec.ts';
import { FeedbackInput, KbEditStatus, LessonStatus, type LearningDoc } from './shared/feedback.ts';
import { SKETCH_ASPECT_RATIO, SKETCH_IMAGE_SIZE, SKETCH_MODEL } from './shared/sketch.ts';
import { Story } from './shared/story.ts';
import {
  TURNAROUND_ASPECT_RATIO,
  TURNAROUND_IMAGE_SIZE,
  TURNAROUND_MODEL,
  turnaroundPrompt,
} from './shared/turnaround.ts';
import {
  WORKSPACE_ASPECT_RATIOS,
  WORKSPACE_IMAGE_SIZES,
  WORKSPACE_MAX_REFERENCES,
  WORKSPACE_MODEL,
  WORKSPACE_MODEL_LABEL,
} from './shared/workspace.ts';
import {
  AccentChoice,
  IntakeInput,
  Occasion,
  Party,
  PlatingChoice,
  PrepChoice,
  Setting,
  SidesChoice,
  Surface,
  TimeOfDay,
  Venue,
  type Blueprint,
  type SceneSpec,
} from './shared/types.ts';
import { SessionTooLargeError, loadSession, saveSession } from './server/sessions.ts';
import { adminProcedure, publicProcedure, router, signedInProcedure } from './trpc.ts';

export type { AgentResult } from './server/agent.ts';
export type { SceneCard, StudioData, MemberRow } from './server/generations.ts';
export type { KbHighlights } from './server/insights.ts';

/** The signed-in user, as the browser sees them. */
export interface AppProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: AppUser['role'];
  sceneLimit: number;
  imageLimit: number;
}

/** The intake answers so far, validated at the boundary. */
const SelectionsInput = z.object({
  prep: PrepChoice.optional(),
  plating: PlatingChoice.optional(),
  sides: SidesChoice.optional(),
  scene: z
    .object({
      setting: Setting,
      venue: Venue,
      party: Party,
      time: TimeOfDay.optional(),
      surface: Surface.optional(),
      surfaceText: z.string().optional(),
      venueType: z.string().max(64).optional(),
      environmentNote: z.string().max(600).optional(),
      seated: z.boolean().optional(),
      pose: z.string().max(40).optional(),
      seating: z.enum(["corner", "across"]).optional(),
    })
    .optional(),
  glass: z.boolean().optional(),
  camera: z.object({ look: z.string(), angle: z.string() }).optional(),
  accent: AccentChoice.nullable().optional(),
  napkin: z.boolean().optional(),
});

const BriefInput = IntakeInput.extend({ countryLabel: z.string().optional() });

/** Spec and blueprint round-trip from `compose`; the solver built them. */
const SpecInput = z.custom<SceneSpec>(
  (v) => typeof v === 'object' && v !== null && 'sku' in v && 'entree' in v
);
const BlueprintInput = z.custom<Blueprint>(
  (v) => typeof v === 'object' && v !== null && 'primitives' in v
);

const AgentKindInput = z.enum([
  'prep',
  'plating',
  'sides',
  'surface',
  'accent',
  'story',
  'validate',
  'imageCheck',
]);

function withLabel(brief: z.infer<typeof BriefInput>) {
  const kb = loadKnowledge();
  const c = kb.countries.find((c) => c.id === brief.country);
  return { ...brief, countryLabel: c?.label ?? brief.country };
}

/**
 * Reclassify model and limit failures for the client. A reached limit is
 * FORBIDDEN (terminal, no retry); a busy model is TOO_MANY_REQUESTS (the
 * client waits and resubmits).
 */
function modelError(err: unknown): never {
  if (err instanceof TRPCError) throw err;
  if (err instanceof LimitReachedError) throw new TRPCError({ code: 'FORBIDDEN', message: err.message });
  if (err instanceof GeminiError && err.rateLimited) throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: err.message });
  if (err instanceof Error) throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
  throw err;
}

export interface RuleEffects {
  venues: Array<{ venue: SceneSpec['scene']['venue']; allowed: boolean; glass: GlassRule }>;
  timeFromOccasion: SceneSpec['scene']['time'] | null;
  lighting?: LightingPreset;
  needsAccent?: boolean;
  /** What's already on the table before any accent, in solver order (the napkin set counts once). */
  items?: Array<{ kind: ItemKind; name: string }>;
}

export type AgentPoll =
  /** `taskId` is set when the server swapped in a repair task; keep polling that one. */
  | { done: false; progress: number | null; taskId?: string; repairing?: boolean }
  | { done: true; error: string }
  | { done: true; result: AgentResult };

export type TurnaroundPoll =
  | { done: false; progress: number | null }
  | { done: true; error: string }
  | { done: true; url: string };

export type LearnPoll =
  | { done: false; progress: number | null }
  | { done: true; error: string }
  | { done: true; learning: LearningDoc };

/** Who is rating or deciding. */
function actor(user: AppUser): Actor {
  return { email: user.email, name: user.name };
}

/** Storage failures as readable messages next to the thing that failed. */
function storageError(err: unknown, doing: string): never {
  if (err instanceof TRPCError) throw err;
  const message = err instanceof Error ? err.message : String(err);
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Couldn't ${doing}: ${message}` });
}

const DishKeyInput = z.string().min(3).max(140).regex(/^[a-z0-9-]+$/);

export type WorkspacePoll =
  | { done: false; progress: number | null }
  | { done: true; error: string }
  | { done: true; urls: string[] };

type WorkspaceAspectRatio = (typeof WORKSPACE_ASPECT_RATIOS)[number];
const isWorkspaceAspectRatio = (r: string): r is WorkspaceAspectRatio =>
  (WORKSPACE_ASPECT_RATIOS as readonly string[]).includes(r);

/** A reference image: one of the app's own `/media/` files or a product photo from the repo. */
const RefUrl = z.string().min(1).max(500).refine(isReadableRef, { message: 'Use an image stored by this app.' });

/** Which catalog photos to add (see `productRefs` in shared/workspace.ts). */
const ProductRefsInput = z.object({ skuId: z.string().max(80).optional(), glass: z.boolean(), high: z.boolean() });

/**
 * Append the catalog's product photos to `references` for the SKU or GLASS
 * element (`label`), or for the whole `scene`, and return the prompt lines
 * that name them by image number. Never goes past the model's reference cap.
 */
function addProductReferences(
  label: string,
  product: z.infer<typeof ProductRefsInput> | undefined,
  references: Array<{ tag: string; url: string }>,
  shots: SkuShot[],
): string {
  if (!product) return '';
  const el = label === 'scene' ? 'scene' : productElement(label);
  if (!el) return '';
  const lines: string[] = [];
  if ((el === 'scene' || el === 'sku') && product.skuId) {
    const got = skuShots(product.skuId, shots).slice(0, WORKSPACE_MAX_REFERENCES - references.length);
    const start = references.length + 1;
    references.push(...got.map((g) => ({ tag: `sku_${g.shot}`, url: g.url })));
    lines.push(skuReferenceLines(got.map((g, i) => ({ shot: g.shot, n: start + i }))));
  }
  if ((el === 'scene' || el === 'glass') && product.glass && references.length < WORKSPACE_MAX_REFERENCES) {
    const url = pouredGlass();
    if (url) {
      references.push({ tag: 'poured_glass', url });
      lines.push(glassReferenceLine(references.length));
    }
  }
  return lines.filter(Boolean).join('\n\n');
}

/** Option-step answers depend only on their prompt, so the same brief and picks reuse a saved answer. */
const agentCache = documentStore<{ text: string; at: number }>({ prefix: 'agent-cache/' });
const CACHEABLE_KINDS = new Set(['prep', 'plating', 'sides', 'surface', 'accent']);
/** Job id → cache key, for answers to save once they parse. */
const pendingCacheKeys = new Map<string, string>();

function cacheKeyFor(task: TextTask): string {
  return createHash('sha256').update(`${task.model}\n${task.system_prompt}\n${task.prompt}`).digest('hex');
}

/** Starts an image job: checks the limit, generates, stores the files. The job's result is their `/media/` URLs. */
async function startImageJob(
  user: AppUser,
  brief: SceneBrief | null,
  kind: GenerationKind,
  label: string,
  task: ImageTask,
): Promise<string> {
  const model = task.model === 'pro' ? env.geminiImagePro : env.geminiImageFast;
  const generationId = await reserveGeneration(user, kind, task.numImages, { model, prompt: task.prompt, label, brief });
  return startJob(user.id, async () => {
    try {
      const images = await generateImages(task);
      return await finishGeneration(generationId, user.id, images);
    } catch (err) {
      await failGeneration(generationId, err instanceof Error ? err.message : String(err));
      throw err;
    }
  });
}

/** Where an image job is, in the shape the browser's poll loops expect. */
function imageJobState(taskId: string, userId: string, label: string): { done: false; progress: null } | { done: true; error: string } | { done: true; urls: string[] } {
  const job = getJob<string[]>(taskId, userId);
  if (!job) return { done: true, error: `${label} lost track of this image (the app restarted). Generate again.` };
  if (job.status === 'running') return { done: false, progress: null };
  if (job.status === 'failed') return { done: true, error: `${label} failed: ${job.error}` };
  if (!job.result.length) return { done: true, error: `${label} returned no image. Generate again.` };
  return { done: true, urls: job.result };
}

function toProfile(user: AppUser): AppProfile {
  return { name: user.name, email: user.email, avatarUrl: null, role: user.role, sceneLimit: user.sceneLimit, imageLimit: user.imageLimit };
}

export const AppRouter = router({
  /** The signed-in user, or null before sign-in. */
  profile: publicProcedure.query(({ ctx }): AppProfile | null => (ctx.user ? toProfile(ctx.user) : null)),

  /** This month's use against the user's limits. */
  usage: signedInProcedure.query(async ({ ctx }) => {
    try {
      return { ...(await usageThisMonth(ctx.user.id)), sceneLimit: ctx.user.sceneLimit, imageLimit: ctx.user.imageLimit };
    } catch (err) {
      storageError(err, 'load your usage');
    }
  }),

  /** Everything the brief and the scene/camera steps need to render. */
  config: signedInProcedure.query(() => {
    const kb = loadKnowledge();
    return {
      knowledge: { available: kb.available, source: kb.source },
      countries: kb.countries.map((c) => ({
        id: c.id,
        label: c.label,
        ou: c.ou,
        regions: c.regions.map((r) => ({ id: r.id, label: r.label })),
      })),
      skus: SKU_CATALOG.filter((s) => !s.retired).map((s) => ({
        id: s.id,
        displayName: s.displayName,
        shortName: s.shortName,
        package: s.package,
        volumeMl: s.volumeMl,
        markets: s.markets ?? null,
        image: s.gtin ? `/sku/${s.gtin}.jpg` : null,
      })),
      occasions: Occasion.options,
      looks: LOOKS.map((l) => ({
        id: l.id,
        label: l.label,
        help: l.help,
        /** For the camera-step illustrations only; never shown as a number. */
        focalMm: l.hidden.focal_length_mm,
        placeholder: l.status === 'placeholder',
      })),
      angles: ANGLES.map((a) => ({
        id: a.id,
        label: a.label,
        pitchDeg: a.hidden.pitch_deg,
        placeholder: a.status === 'placeholder',
      })),
      defaults: { look: DEFAULT_LOOK, angle: DEFAULT_ANGLE },
    };
  }),

  /** Rule effects that follow the answers: venue limits, glass lock, lighting, accent. */
  rules: signedInProcedure
    .input(z.object({ brief: BriefInput, selections: SelectionsInput }))
    .query(({ input }): RuleEffects => {
      const sku = skuById(input.brief.skuId);
      if (!sku) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Unknown product SKU.' });
      const sel: Selections = input.selections;
      const venues = Venue.options.map((v) => ({
        venue: v,
        allowed: venueAllowed(sku, v),
        glass: glassRule(sku, v),
      }));
      const out: RuleEffects = {
        venues,
        timeFromOccasion: timeFromOccasion(input.brief.occasion),
      };
      if (sel.scene) {
        const time = sel.scene.time ?? out.timeFromOccasion ?? 'midday';
        out.lighting = selectLighting({
          ...sel.scene,
          time,
          surface: sel.scene.surface ?? 'table-4top',
        });
      }
      if (sel.prep && sel.plating && sel.sides && sel.scene && sel.camera) {
        const spec = buildSpec(withLabel(input.brief), { ...sel, accent: null, napkin: false });
        out.needsAccent = needsAccent(spec);
        out.items = sceneItems(spec).map((i) => ({ kind: i.kind, name: i.name }));
      }
      return out;
    }),

  /** Solve the layout: up to 3 rule-compliant options from the same elements. */
  compose: signedInProcedure
    .input(z.object({ brief: BriefInput, selections: SelectionsInput }))
    .mutation(({ input }) => {
      try {
        const spec = buildSpec(withLabel(input.brief), input.selections);
        const result = solve(spec);
        // `result.spec` can differ from `spec`: the accent is dropped when no layout has room for it.
        return { lighting: selectLighting(spec.scene), ...result };
      } catch (err) {
        modelError(err);
      }
    }),

  /**
   * Start one agent step (a Gemini text call) and return its id at once; the
   * client polls `agentPoll`. Option steps reuse a saved answer when the same
   * brief and picks were asked before.
   */
  agentStart: signedInProcedure
    .input(
      z.object({
        kind: AgentKindInput,
        brief: BriefInput,
        selections: SelectionsInput.optional(),
        spec: SpecInput.optional(),
        blueprint: BlueprintInput.optional(),
        // Stories saved before the brief summary existed still validate.
        story: Story.extend({ briefSummary: Story.shape.briefSummary.default('') }).optional(),
        notes: z.array(z.string()).optional(),
        directions: z.array(z.string().max(1200)).max(40).optional(),
        custom: z.string().max(800).optional(),
        shownOptions: z.array(z.string().max(1200)).max(4).optional(),
        imageUrls: z.array(RefUrl).min(1).max(4).optional(),
        prompt: z.string().max(20_000).optional(),
        elements: z.array(z.string().max(64)).max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Lessons the team confirmed for this dish go into every agent step.
        const lessons = await confirmedLessons(input.brief.country, input.brief.heroDish);
        const task = buildTask({ ...input, lessons });
        if (CACHEABLE_KINDS.has(input.kind) && !input.custom?.trim()) {
          const key = cacheKeyFor(task);
          const hit = await agentCache.get(key).catch(() => null);
          if (hit) return { taskId: doneJob(ctx.user.id, hit.value.text) };
          const taskId = startJob(ctx.user.id, () => generateText(task));
          pendingCacheKeys.set(taskId, key);
          return { taskId };
        }
        return { taskId: startJob(ctx.user.id, () => generateText(task)) };
      } catch (err) {
        modelError(err);
      }
    }),

  /** One status check of an agent call; parses the answer once it lands. */
  agentPoll: signedInProcedure
    .input(z.object({ taskId: z.string().min(1), kind: AgentKindInput, repair: z.boolean().optional() }))
    .mutation(async ({ ctx, input }): Promise<AgentPoll> => {
      try {
        const job = getJob<string>(input.taskId, ctx.user.id);
        if (!job) return { done: true, error: 'The cultural agent lost track of this answer (the app restarted). Ask again.' };
        if (job.status === 'running') return { done: false, progress: null };
        if (job.status === 'failed') {
          pendingCacheKeys.delete(input.taskId);
          return { done: true, error: `The cultural agent failed: ${job.error}` };
        }
        const text = job.result;
        try {
          const result = parseAnswer(input.kind, text);
          const cacheKey = pendingCacheKeys.get(input.taskId);
          if (cacheKey) {
            pendingCacheKeys.delete(input.taskId);
            void agentCache.put(cacheKey, { text, at: Date.now() }).catch(() => undefined);
          }
          return { done: true, result };
        } catch (err) {
          pendingCacheKeys.delete(input.taskId);
          const message = err instanceof Error ? err.message : String(err);
          console.warn(
            `[agent] ${input.kind} answer unreadable (task ${input.taskId}${input.repair ? ', repair' : ''}): ${message} — ${text.length} chars, ends ${JSON.stringify(text.slice(-160))}`
          );
          if (input.repair) return { done: true, error: message };
          // One automatic fix-up pass before the operator sees an error.
          const problem = /cut off/.test(message) ? 'it was cut off before the end' : `it could not be used (${message.replace(/ Ask again\.$/, '')})`;
          const repair = repairTask(input.kind, text, problem);
          const taskId = startJob(ctx.user.id, () => generateText(repair));
          return { done: false, progress: null, taskId, repairing: true };
        }
      } catch (err) {
        modelError(err);
      }
    }),

  /**
   * Submit one view of an element's turnaround sheet (Nano Banana 2) and
   * return the task id at once; the client polls `turnaroundPoll`. The 30°
   * and top-down views pass the profile image as a reference.
   */
  turnaroundStart: signedInProcedure
    .input(
      z.object({
        label: z.string().min(1).max(64),
        text: z.string().min(1).max(4000),
        view: z.enum(['profile', 'angled', 'top']),
        referenceUrl: RefUrl.optional(),
        product: ProductRefsInput.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const references = input.referenceUrl ? [{ tag: 'profile', url: input.referenceUrl }] : [];
        // The SKU's profile view also gets the side shot, its top-down view the top shot.
        const shots: SkuShot[] = input.view === 'profile' ? ['front', 'side'] : input.view === 'top' ? ['top', 'front'] : ['front'];
        const extra = addProductReferences(input.label, input.product, references, shots);
        const prompt = [turnaroundPrompt(input.text, input.view, Boolean(input.referenceUrl)), extra].filter(Boolean).join('\n\n');
        const taskId = await startImageJob(ctx.user, ctx.brief, 'turnaround', `${input.label}-${input.view}`, {
          model: TURNAROUND_MODEL,
          prompt,
          aspectRatio: TURNAROUND_ASPECT_RATIO,
          imageSize: TURNAROUND_IMAGE_SIZE,
          numImages: 1,
          references,
        });
        return { taskId };
      } catch (err) {
        modelError(err);
      }
    }),

  /**
   * Submit the detailed sketch for Sketch review (Nano Banana 2): the labeled proxy,
   * uploaded first to /api/upload, drawn as a pencil sketch of the finished
   * scene through the same camera. Returns the task id at once; the client polls
   * `turnaroundPoll`, which reads any Nano Banana 2 image task.
   */
  sketchStart: signedInProcedure
    // styleUrl: the earlier sketch, after an edit in the sketch editor (image 2: copy its drawing style).
    .input(z.object({ prompt: z.string().min(1).max(12_000), proxyUrl: RefUrl, styleUrl: RefUrl.optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const taskId = await startImageJob(ctx.user, ctx.brief, 'sketch', 'layout-sketch', {
          model: SKETCH_MODEL,
          prompt: input.prompt,
          aspectRatio: SKETCH_ASPECT_RATIO,
          imageSize: SKETCH_IMAGE_SIZE,
          numImages: 1,
          references: [{ tag: 'layout', url: input.proxyUrl }, ...(input.styleUrl ? [{ tag: 'style', url: input.styleUrl }] : [])],
        });
        return { taskId };
      } catch (err) {
        modelError(err);
      }
    }),

  /**
   * Where each item landed in a drawn sketch, so the review's markers sit on the drawing.
   * One quick text-model call; free (not counted toward the monthly limit).
   */
  sketchLocate: signedInProcedure
    .input(
      z.object({
        url: RefUrl,
        items: z.array(z.object({ id: z.string().min(1).max(64), name: z.string().min(1).max(200) })).min(1).max(30),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await locateItems(input.url, input.items);
      } catch (err) {
        modelError(err);
      }
    }),

  /** One status check of a turnaround view; the image URL once it lands. */
  turnaroundPoll: signedInProcedure
    .input(z.object({ taskId: z.string().min(1) }))
    .mutation(({ ctx, input }): TurnaroundPoll => {
      const state = imageJobState(input.taskId, ctx.user.id, 'Nano Banana 2');
      return 'urls' in state ? { done: true, url: state.urls[0]! } : state;
    }),

  /** Aspect ratios and sizes the workspace's scene generator offers (Nano Banana Pro's own list). */
  workspaceOptions: signedInProcedure.query(() => ({
    aspectRatios: WORKSPACE_ASPECT_RATIOS,
    imageSizes: [...WORKSPACE_IMAGE_SIZES],
  })),

  /**
   * Submit one Nano Banana Pro generation from the workspace — a segment
   * preview or the full scene — and return the task id at once; the client
   * polls `workspacePoll`. Counts toward the user's monthly limit.
   */
  workspaceStart: signedInProcedure
    .input(
      z.object({
        purpose: z.enum(['element', 'environment', 'scene']),
        label: z.string().min(1).max(64),
        prompt: z.string().min(1).max(20_000),
        aspectRatio: z.string().refine(isWorkspaceAspectRatio, {
          message: `${WORKSPACE_MODEL_LABEL} doesn't offer that aspect ratio.`,
        }),
        imageSize: z.enum(WORKSPACE_IMAGE_SIZES),
        numImages: z.union([z.literal(1), z.literal(4)]),
        references: z
          .array(z.object({ tag: z.string().min(1).max(64), url: RefUrl }))
          .max(WORKSPACE_MAX_REFERENCES),
        product: ProductRefsInput.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const references = [...input.references];
        const extra =
          input.purpose === 'environment'
            ? ''
            : addProductReferences(input.purpose === 'scene' ? 'scene' : input.label, input.product, references, [
                'front',
                ...(input.purpose === 'scene' && input.product?.high ? (['top'] as const) : []),
              ]);
        const taskId = await startImageJob(ctx.user, ctx.brief, input.purpose, input.label, {
          model: WORKSPACE_MODEL,
          prompt: [input.prompt, extra].filter(Boolean).join('\n\n'),
          aspectRatio: input.aspectRatio,
          imageSize: input.imageSize,
          numImages: input.numImages,
          references,
        });
        return { taskId };
      } catch (err) {
        modelError(err);
      }
    }),

  /** One status check of a workspace generation; every image URL once it lands. */
  workspacePoll: signedInProcedure
    .input(z.object({ taskId: z.string().min(1) }))
    .mutation(({ ctx, input }): WorkspacePoll => imageJobState(input.taskId, ctx.user.id, WORKSPACE_MODEL_LABEL)),

  // -------------------------------------------------------------------------
  // Image feedback and learning (src/server/feedback.ts, src/server/learn.ts)
  // -------------------------------------------------------------------------

  /** Save one image rating. Free (no credits); signed in so it records who sent it. */
  feedbackSubmit: signedInProcedure.input(FeedbackInput).mutation(async ({ ctx, input }) => {
    const by = actor(ctx.user);
    try {
      return await submitFeedback(input, by);
    } catch (err) {
      storageError(err, 'save the feedback');
    }
  }),

  /** Every dish with feedback, for the Learning page. */
  feedbackDishes: signedInProcedure.query(async () => {
    try {
      return await listDishes();
    } catch (err) {
      storageError(err, 'load the feedback');
    }
  }),

  /** One dish's feedback and what has been learned from it. */
  feedbackDish: signedInProcedure.input(z.object({ dishKey: DishKeyInput })).query(async ({ input }) => {
    try {
      return await dishFeedback(input.dishKey);
    } catch (err) {
      storageError(err, "load this dish's feedback");
    }
  }),

  /** Raw feedback records for a JSON/CSV download; every dish when dishKey is omitted. */
  feedbackExport: signedInProcedure.input(z.object({ dishKey: DishKeyInput.optional() })).query(async ({ input }) => {
    try {
      return await exportFeedback(input.dishKey);
    } catch (err) {
      storageError(err, 'export the feedback');
    }
  }),

  /**
   * Submit a learn run over one dish's feedback (a Gemini Pro call) and
   * return its id at once; the client polls `learnPoll`.
   */
  learnStart: signedInProcedure.input(z.object({ dishKey: DishKeyInput })).mutation(async ({ ctx, input }) => {
    try {
      const task = await buildLearnTask(input.dishKey);
      return { taskId: startJob(ctx.user.id, () => generateText(task)) };
    } catch (err) {
      modelError(err);
    }
  }),

  /** One status check of a learn run; merges its drafts into the dish's learning once it lands. */
  learnPoll: signedInProcedure
    .input(z.object({ taskId: z.string().min(1), dishKey: DishKeyInput }))
    .mutation(async ({ ctx, input }): Promise<LearnPoll> => {
      const job = getJob<string>(input.taskId, ctx.user.id);
      if (!job) return { done: true, error: 'The learning agent lost track of this run (the app restarted). Try again.' };
      if (job.status === 'running') return { done: false, progress: null };
      if (job.status === 'failed') return { done: true, error: `The learning agent failed: ${job.error}` };
      try {
        return { done: true, learning: await mergeLearnAnswer(input.dishKey, input.taskId, job.result) };
      } catch (err) {
        return { done: true, error: err instanceof Error ? err.message : String(err) };
      }
    }),

  /** Write a lesson by hand (starts proposed). */
  lessonAdd: signedInProcedure
    .input(z.object({ dishKey: DishKeyInput, element: z.string().min(1).max(64), text: z.string().trim().min(3).max(1200) }))
    .mutation(async ({ ctx, input }) => {
      const by = actor(ctx.user);
      try {
        return await addLesson(input.dishKey, { element: input.element, text: input.text }, by);
      } catch (err) {
        storageError(err, 'save the lesson');
      }
    }),

  /** Confirm, retire or edit a lesson (admins). Only confirmed lessons reach the agents. */
  lessonUpdate: adminProcedure
    .input(
      z.object({
        dishKey: DishKeyInput,
        lessonId: z.string().min(1).max(80),
        status: LessonStatus.optional(),
        text: z.string().trim().min(3).max(1200).optional(),
        element: z.string().min(1).max(64).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const by = actor(ctx.user);
      try {
        return await updateLesson(input.dishKey, input.lessonId, { status: input.status, text: input.text, element: input.element }, by);
      } catch (err) {
        storageError(err, 'update the lesson');
      }
    }),

  /** Approve, reject or edit a knowledge-base edit (admins). Approved edits are read by the agents straight away. */
  kbEditUpdate: adminProcedure
    .input(
      z.object({
        dishKey: DishKeyInput,
        editId: z.string().min(1).max(80),
        status: KbEditStatus.optional(),
        text: z.string().trim().min(3).max(4000).optional(),
        heading: z.string().trim().min(1).max(300).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const by = actor(ctx.user);
      try {
        return await updateKbEdit(input.dishKey, input.editId, { status: input.status, text: input.text, heading: input.heading }, by);
      } catch (err) {
        storageError(err, 'update the knowledge-base edit');
      }
    }),

  /** Every approved knowledge-base edit as Markdown, to merge into the source knowledge base. */
  kbEditsExport: signedInProcedure.query(async () => {
    try {
      return { markdown: await approvedEditsMarkdown() };
    } catch (err) {
      storageError(err, 'export the knowledge-base edits');
    }
  }),

  // -------------------------------------------------------------------------
  // My scenes, the shared Studio, and admin (src/server/generations.ts)
  // -------------------------------------------------------------------------

  /** The signed-in user's own finished images, newest first. */
  myScenes: signedInProcedure
    .input(z.object({ include: z.enum(['scenes', 'all']).default('scenes') }))
    .query(async ({ ctx, input }) => {
      try {
        const kinds: GenerationKind[] = input.include === 'all' ? ['scene', 'element', 'environment', 'sketch', 'turnaround'] : ['scene'];
        return await myGenerations(ctx.user.id, kinds);
      } catch (err) {
        storageError(err, 'load your scenes');
      }
    }),

  /** Keeps the whole composer session, so My Projects can reopen it from any scene it produced. */
  saveSession: signedInProcedure
    .input(z.object({ sessionId: z.string(), draft: z.record(z.string(), z.unknown()), generationIds: z.array(z.string()).max(200) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await saveSession(ctx.user.id, input.sessionId, input.draft, input.generationIds);
        return { ok: true };
      } catch (err) {
        if (err instanceof SessionTooLargeError) throw new TRPCError({ code: 'PAYLOAD_TOO_LARGE', message: err.message });
        storageError(err, 'save this session');
      }
    }),

  /** The session one of the user's scenes came from, or null for scenes made before sessions were kept. */
  sessionFor: signedInProcedure.input(z.object({ generationId: z.string() })).query(({ ctx, input }) => loadSession(ctx.user.id, input.generationId)),

  /** The shared dashboard: regions being visualized, activity, recent scenes from everyone. */
  /** What the knowledge base covers and its latest additions, for the home screen. */
  kbHighlights: signedInProcedure.query(() => kbHighlights()),

  studio: signedInProcedure.query(async () => {
    try {
      return await studioData();
    } catch (err) {
      storageError(err, 'load the studio');
    }
  }),

  /** Everyone with access and their use this month. */
  adminMembers: adminProcedure.query(async () => {
    try {
      return await listMembers(env.adminEmails);
    } catch (err) {
      storageError(err, 'load the members');
    }
  }),

  /** Invite someone by email: they get a sign-in link and can use the app from then on. */
  adminInvite: adminProcedure
    .input(z.object({ email: z.string().trim().toLowerCase().email().max(200), name: z.string().trim().max(80).optional() }))
    .mutation(async ({ input }) => {
      const { error } = await db().auth.admin.inviteUserByEmail(input.email, {
        ...(env.appUrl ? { redirectTo: env.appUrl } : {}),
        ...(input.name ? { data: { full_name: input.name } } : {}),
      });
      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: `Couldn't invite ${input.email}: ${error.message}` });
      return { ok: true };
    }),

  /** Change someone's role or monthly limits. */
  adminSetMember: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        role: z.enum(['admin', 'member']).optional(),
        name: z.string().trim().max(80).optional(),
        sceneLimit: z.number().int().min(0).max(100_000).optional(),
        imageLimit: z.number().int().min(0).max(100_000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id && input.role === 'member') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "You can't remove your own admin role." });
      }
      const patch: Record<string, unknown> = {};
      if (input.role) patch['role'] = input.role;
      if (input.name !== undefined) patch['name'] = input.name || null;
      if (input.sceneLimit !== undefined) patch['scene_limit'] = input.sceneLimit;
      if (input.imageLimit !== undefined) patch['image_limit'] = input.imageLimit;
      const { error } = await db().from('profiles').update(patch).eq('id', input.id);
      if (error) storageError(error, 'update the member');
      forgetSessions();
      return { ok: true };
    }),

  /** Remove someone's access (their images stay in the gallery). */
  adminRemove: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    if (input.id === ctx.user.id) throw new TRPCError({ code: 'BAD_REQUEST', message: "You can't remove yourself." });
    const { error } = await db().auth.admin.updateUserById(input.id, { ban_duration: '876000h' });
    if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: `Couldn't remove access: ${error.message}` });
    forgetSessions();
    return { ok: true };
  }),
});

export type AppRouterType = typeof AppRouter;
