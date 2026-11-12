// Everything the wizard remembers: the answers so far, current step, and the
// agent/compose/story results. Autosaved to localStorage under one key so a
// refresh (or an accidental tab close) never loses the draft; proxy PNGs are
// re-rendered from the blueprint rather than stored.

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Selections } from '../../shared/spec.ts';
import type { Blueprint, Decision, Primitive, StepName } from '../../shared/types.ts';
import { emptyReview, type LayoutReview } from '../../shared/review.ts';
import type { LayoutOption } from '../../shared/solver.ts';
import type { Validation } from '../../shared/story.ts';
import { EMPTY_WORKSPACE, type WorkspaceState } from '../../shared/workspace.ts';
import type { Brief, ComposeResult, StepId, StoryState } from './types.ts';
import { EMPTY_BRIEF } from './types.ts';

const STORAGE_KEY = 'tablescape-intake:draft:v1';
const SAVED_FLASH_MS = 1500;

/**
 * Changing an answer clears everything downstream of it. The camera and the
 * glass are never cleared this way: the camera is independent of the food, and
 * the glass belongs to the scene (only a venue change clears it, see sceneChange).
 */
const ORDER: Array<keyof Selections> = ['scene', 'prep', 'plating', 'sides', 'glass', 'camera', 'accent', 'napkin'];
const KEPT: Array<keyof Selections> = ['camera', 'glass'];

/** Decision steps that depend on each selection; asking the agent again is required once cleared. */
const STEP_DEPS: Partial<Record<keyof Selections, StepName[]>> = {
  prep: ['plating', 'sides', 'accent'],
  plating: ['sides', 'accent'],
  sides: ['accent'],
  glass: ['accent'],
  camera: [],
};

const DOWNSTREAM_LABELS: Partial<Record<keyof Selections, string>> = {
  prep: 'the plating, sides and layout',
  plating: 'the sides and layout',
  sides: 'the layout',
  glass: 'the layout',
  camera: 'the layout',
};

type Scene = NonNullable<Selections['scene']>;

/**
 * A new scene answer. The scene comes before the food, and the plating and
 * sides are chosen for the venue, kind of place and party, so changing one of
 * those clears them (the preparation stays). Time, setting and surface only
 * clear the layout. The first scene of a draft clears nothing.
 */
function sceneChange(d: Draft, scene: Scene): Draft {
  const prev = d.sel.scene;
  const food = !!prev && (prev.venue !== scene.venue || prev.party !== scene.party || prev.venueType !== scene.venueType);
  const venueChanged = !!prev && prev.venue !== scene.venue;
  const sel: Selections = { ...d.sel, scene };
  const decisions = { ...d.decisions };
  delete sel.accent;
  delete sel.napkin;
  delete decisions.accent;
  if (food) {
    delete sel.plating;
    delete sel.sides;
    delete decisions.plating;
    delete decisions.sides;
  }
  if (venueChanged) {
    delete sel.glass;
    delete decisions.surface;
  }
  return {
    ...d,
    sel,
    decisions,
    compose: null,
    picked: null,
    story: null,
    validation: null,
    workspace: { ...freshSegments(d.workspace), proxy: null },
  };
}

export interface Draft {
  step: StepId;
  brief: Brief;
  sel: Selections;
  decisions: Partial<Record<StepName, Decision<unknown>>>;
  compose: ComposeResult | null;
  picked: number | null;
  story: StoryState | null;
  validation: Validation | null;
  /** Generated turnaround views per proxy label, tied to the segment text they were made from. */
  turnarounds: Record<string, SavedTurnaround>;
  /** The detailed sketch on Sketch review, tied to the layout (its signature), the prompt it was drawn from and the review edits in it (by item id, 'scene' for the notes). */
  sketch: { url: string; prompt: string; at: number; layout?: string; edits?: Record<string, string>; /** Where each item landed in the drawing (0..1), found after it was drawn. */ boxes?: Record<string, { x0: number; y0: number; x1: number; y1: number } | null>; /** Dishes or drinks the drawing added that aren't in the layout (they'd carry into the photo). */ extras?: Array<{ what: string; box: { x0: number; y0: number; x1: number; y1: number } }> } | null;
  /** Every recent detailed sketch by its layout key (see sketchKey), so switching back to an arrangement on Sketch review doesn't redraw it. */
  sketches: Record<string, NonNullable<Draft['sketch']>>;
  /** The node workspace (step 10): segment edits, previews, scene settings and results. */
  workspace: WorkspaceState;
  /** The sketch review of the picked layout; ignored once a different layout is picked (see layoutKey). */
  review: LayoutReview | null;
  /** Names this session, so My Projects can reopen it from any scene it produced (see useSessionSync). */
  sessionId: string;
}

/**
 * A different story means different segment text: drop the edits, bypasses and
 * previews made against the old one. Settings, canvas positions and past
 * scene results stay (the results are still valid images).
 */
function freshSegments(ws: WorkspaceState): WorkspaceState {
  return { ...ws, edits: {}, bypassed: {}, previews: {}, useAsRef: {} };
}

export interface SavedTurnaround {
  text: string;
  /** Profile, 30° down, top down. Null until that view has been generated. */
  urls: Array<string | null>;
}

/** Detailed sketches remembered per arrangement. */
const MAX_SKETCHES = 8;

const EMPTY_DRAFT: Draft = {
  step: 'brief',
  brief: EMPTY_BRIEF,
  sel: {},
  decisions: {},
  compose: null,
  picked: null,
  story: null,
  validation: null,
  turnarounds: {},
  sketch: null,
  sketches: {},
  workspace: EMPTY_WORKSPACE,
  review: null,
  sessionId: '',
};

function newSessionId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function freshDraft(): Draft {
  return { ...EMPTY_DRAFT, sessionId: newSessionId() };
}

function loadDraft(): Draft {
  if (typeof window === 'undefined') return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshDraft();
    return normalizeDraft(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return freshDraft();
  }
}

/** A saved draft (from this browser, or a session reopened from My Projects) brought up to the current shape. */
export function normalizeDraft(rawParsed: Record<string, unknown>): Draft {
  const parsed = rawParsed as Partial<Draft>;
  // Old drafts saved on the since-removed 'accent' or 'layout' steps land on Sketch review, which now composes and picks the layout itself;
  // one left on the removed Express step restarts at the brief.
  const rawStep = typeof rawParsed.step === 'string' ? rawParsed.step : undefined;
  const step = (rawStep === 'accent' || rawStep === 'layout' ? 'review' : rawStep === 'express' ? 'brief' : rawStep) as StepId | undefined;
  const { mode: _mode, ...saved } = parsed as Partial<Draft> & { mode?: unknown };
  return {
    ...EMPTY_DRAFT,
    ...saved,
    step: step ?? EMPTY_DRAFT.step,
    brief: { ...EMPTY_BRIEF, ...parsed.brief },
    turnarounds: parsed.turnarounds ?? {},
    sketch: parsed.sketch ?? null,
    sketches: parsed.sketches ?? {},
    review: parsed.review ?? null,
    workspace: { ...EMPTY_WORKSPACE, ...parsed.workspace },
    sessionId: typeof parsed.sessionId === 'string' && parsed.sessionId ? parsed.sessionId : newSessionId(),
  };
}

export function useIntake() {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [saved, setSaved] = useState(false);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSaveFlash = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage full or unavailable (private browsing) — the draft simply
      // won't survive a reload; nothing else in the app depends on it.
      return;
    }
    if (skipNextSaveFlash.current) {
      skipNextSaveFlash.current = false;
      return;
    }
    setSaved(true);
    if (flashRef.current) clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setSaved(false), SAVED_FLASH_MS);
  }, [draft]);

  useEffect(() => () => {
    if (flashRef.current) clearTimeout(flashRef.current);
  }, []);

  const setStep = useCallback((step: StepId) => setDraft((d) => ({ ...d, step })), []);

  const setBrief = useCallback((brief: Brief) => {
    setDraft((d) => ({
      step: d.step,
      brief,
      // A new hero dish gets its own recommended angle (Camera step), so the old camera choice goes.
      sel: d.sel.camera && d.brief.heroDish === brief.heroDish ? { camera: d.sel.camera } : {},
      decisions: {},
      compose: null,
      picked: null,
      story: null,
      validation: null,
      turnarounds: {},
      sketch: null,
      sketches: {},
      workspace: { ...freshSegments(d.workspace), proxy: null },
      review: null,
      sessionId: d.sessionId,
    }));
  }, []);

  /** What changing `key` would clear right now, for the "changing this clears…" note. Null when nothing downstream exists yet. */
  const describeClears = useCallback(
    (key: keyof Selections): string | null => {
      if (key === 'scene') {
        if (draft.sel.plating || draft.sel.sides) return 'the plating, sides and layout';
        return draft.compose !== null ? 'the layout' : null;
      }
      const deps = STEP_DEPS[key] ?? [];
      const i = ORDER.indexOf(key);
      const laterSel = i >= 0 ? ORDER.slice(i + 1).filter((k) => !KEPT.includes(k)) : [];
      const hasDownstream =
        laterSel.some((k) => draft.sel[k] !== undefined) ||
        deps.some((s) => draft.decisions[s] !== undefined) ||
        draft.compose !== null ||
        draft.picked !== null;
      if (!hasDownstream) return null;
      return DOWNSTREAM_LABELS[key] ?? 'later steps';
    },
    [draft.sel, draft.decisions, draft.compose, draft.picked],
  );

  const choose = useCallback(<K extends keyof Selections>(key: K, value: Selections[K]) => {
    setDraft((d) => {
      if (key === 'scene') return sceneChange(d, value as Scene);
      const nextSel: Selections = { ...d.sel, [key]: value };
      const i = ORDER.indexOf(key);
      for (const k of ORDER.slice(i + 1)) if (!KEPT.includes(k)) delete nextSel[k];
      const nextDecisions = { ...d.decisions };
      for (const s of STEP_DEPS[key] ?? []) delete nextDecisions[s];
      const clearsRest = i >= 0;
      return {
        ...d,
        sel: nextSel,
        decisions: nextDecisions,
        compose: clearsRest ? null : d.compose,
        picked: clearsRest ? null : d.picked,
        story: clearsRest ? null : d.story,
        validation: clearsRest ? null : d.validation,
        workspace: clearsRest ? { ...freshSegments(d.workspace), proxy: null } : d.workspace,
      };
    });
  }, []);

  /**
   * The kind of place and the environment note refine the scene without
   * touching the surface or glass. A new kind of place changes what the food
   * is served on, so it clears the plating, sides and layout (see sceneChange);
   * the note only feeds the story, so it clears that.
   */
  const setPlace = useCallback((patch: { venueType?: string | undefined; environmentNote?: string | undefined }) => {
    setDraft((d) => {
      if (!d.sel.scene) return d;
      const scene = { ...d.sel.scene };
      for (const [k, v] of Object.entries(patch) as Array<[keyof typeof patch, string | undefined]>) {
        if (v) scene[k] = v;
        else delete scene[k];
      }
      if ('venueType' in patch && patch.venueType !== d.sel.scene.venueType) return sceneChange(d, scene);
      const next = { ...d, sel: { ...d.sel, scene } };
      if (!d.story) return next;
      return { ...next, story: null, validation: null, turnarounds: {}, workspace: freshSegments(d.workspace) };
    });
  }, []);

  const setDecision = useCallback((step: StepName, decision: Decision<unknown>) => {
    setDraft((d) => ({ ...d, decisions: { ...d.decisions, [step]: decision } }));
  }, []);

  const setCompose = useCallback((compose: ComposeResult | null) => {
    setDraft((d) => ({
      ...d,
      compose,
      picked: null,
      story: null,
      validation: null,
      workspace: { ...freshSegments(d.workspace), proxy: null },
    }));
  }, []);

  const setPicked = useCallback((picked: number | null) => {
    setDraft((d) => ({
      ...d,
      picked,
      story: null,
      validation: null,
      workspace: { ...freshSegments(d.workspace), proxy: null },
    }));
  }, []);

  const setStory = useCallback((story: StoryState | null) => {
    // A new story means new segment text, so earlier turnarounds no longer match it.
    setDraft((d) => ({ ...d, story, validation: null, turnarounds: {}, workspace: freshSegments(d.workspace) }));
  }, []);

  /**
   * An arrangement made in the sketch editor: it joins the arrangements and becomes the one
   * drawn. Editing an edit replaces it, so each solver arrangement has at most one edit.
   */
  const addEditedLayout = useCallback((option: LayoutOption, review: LayoutReview) => {
    setDraft((d) => {
      if (!d.compose || d.picked === null) return d;
      const options = [...d.compose.options];
      let picked = d.picked;
      if (options[picked]?.edit) options[picked] = option;
      else {
        const prior = options.findIndex((o) => o.edit?.from === option.edit?.from);
        if (prior >= 0) options[prior] = option;
        else options.push(option);
        picked = prior >= 0 ? prior : options.length - 1;
      }
      return {
        ...d,
        compose: { ...d.compose, options },
        picked,
        review,
        story: null,
        validation: null,
        workspace: { ...freshSegments(d.workspace), proxy: null },
      };
    });
  }, []);

  /** Gives the draft a camera before the Camera Angle step, so the table can be laid out first. Never replaces one already chosen. */
  const ensureCamera = useCallback((camera: NonNullable<Selections['camera']>) => {
    setDraft((d) => (d.sel.camera ? d : { ...d, sel: { ...d.sel, camera } }));
  }, []);

  /**
   * The table laid out first, then the camera (2026-11-12): `blueprint` is the picked layout as
   * the person left it, seen from `camera` (moved items, a new angle, or both). It replaces the
   * picked edit, or joins the arrangements as an edit of the solver's one, so "Reset to
   * recommended" can always go back. The spec follows the camera, so the sketch and the
   * story describe the angle that was picked.
   */
  const setWorkingLayout = useCallback((blueprint: Blueprint, camera?: NonNullable<Selections['camera']>) => {
    setDraft((d) => {
      if (!d.compose || d.picked === null) return d;
      const cur = d.compose.options[d.picked];
      if (!cur) return d;
      const options = [...d.compose.options];
      const from = cur.edit?.from ?? d.picked;
      const option: LayoutOption = { archetype: cur.archetype, blueprint, edit: { from } };
      let picked = d.picked;
      if (cur.edit) options[picked] = option;
      else {
        const prior = options.findIndex((o) => o.edit?.from === from);
        if (prior >= 0) options[prior] = option;
        else options.push(option);
        picked = prior >= 0 ? prior : options.length - 1;
      }
      const spec = camera ? { ...d.compose.spec, camera: { ...d.compose.spec.camera, ...camera } } : d.compose.spec;
      return {
        ...d,
        sel: camera ? { ...d.sel, camera } : d.sel,
        compose: { ...d.compose, spec, options },
        picked,
        review: emptyReview(blueprint),
        story: null,
        validation: null,
        workspace: { ...freshSegments(d.workspace), proxy: null },
      };
    });
  }, []);

  /** The review feeds the story, so changing it drops a story written before the change. */
  const setReview = useCallback((review: LayoutReview) => {
    setDraft((d) => {
      const next = { ...d, review };
      if (!d.story) return next;
      return { ...next, story: null, validation: null, turnarounds: {}, workspace: freshSegments(d.workspace) };
    });
  }, []);

  /** Who a seated person is and what they wear, kept on the picked layout's blueprint (the sketch and photo read it there). Drops a story written before. */
  const setPerson = useCallback((id: string, person: NonNullable<Primitive['person']>) => {
    setDraft((d) => {
      if (!d.compose || d.picked === null) return d;
      const options = [...d.compose.options];
      const option = options[d.picked];
      if (!option) return d;
      const primitives = option.blueprint.primitives.map((p) => (p.id === id ? { ...p, person } : p));
      options[d.picked] = { ...option, blueprint: { ...option.blueprint, primitives } };
      const next = { ...d, compose: { ...d.compose, options } };
      if (!d.story) return next;
      return { ...next, story: null, validation: null, turnarounds: {}, workspace: freshSegments(d.workspace) };
    });
  }, []);

  /** Functional update of the workspace; everything in it autosaves with the draft. */
  const updateWorkspace = useCallback((fn: (ws: WorkspaceState) => WorkspaceState) => {
    setDraft((d) => ({ ...d, workspace: fn(d.workspace) }));
  }, []);

  /** Records one generated view; starting a new set for changed text drops the old views. */
  const setTurnaroundView = useCallback((label: string, text: string, index: number, url: string) => {
    setDraft((d) => {
      const prev = d.turnarounds[label];
      const urls = prev && prev.text === text ? [...prev.urls] : [null, null, null];
      urls[index] = url;
      return { ...d, turnarounds: { ...d.turnarounds, [label]: { text, urls } } };
    });
  }, []);

  const setSketch = useCallback((sketch: Draft['sketch']) => {
    setDraft((d) => {
      if (!sketch?.layout) return { ...d, sketch };
      // Keep the few most recent, so the saved draft stays small.
      const kept = Object.entries({ ...d.sketches, [sketch.layout]: sketch })
        .sort(([, a], [, b]) => b.at - a.at)
        .slice(0, MAX_SKETCHES);
      return { ...d, sketch, sketches: Object.fromEntries(kept) };
    });
  }, []);

  const setValidation = useCallback((validation: Validation | null) => {
    setDraft((d) => ({ ...d, validation }));
  }, []);

  const startOver = useCallback(() => {
    skipNextSaveFlash.current = true;
    setDraft(freshDraft());
  }, []);

  /** Replaces the draft with a session reopened from My Projects. */
  const restoreSession = useCallback((saved: Record<string, unknown>) => {
    skipNextSaveFlash.current = true;
    setDraft(normalizeDraft(saved));
  }, []);

  return {
    draft,
    saved,
    setStep,
    setBrief,
    choose,
    setPlace,
    describeClears,
    setDecision,
    setCompose,
    setPicked,
    setStory,
    setReview,
    setPerson,
    addEditedLayout,
    ensureCamera,
    setWorkingLayout,
    setSketch,
    setValidation,
    setTurnaroundView,
    updateWorkspace,
    startOver,
    restoreSession,
  };
}
