// Sketch review: the picked layout seen through the photo's camera as a detailed
// black-and-white pencil sketch of the finished scene (Nano Banana 2, drawn
// automatically on arrival): the food, dishes and drinks where the photo will put
// them. The numbered markers, the click map and the Change highlight come from
// the 3D layout traced off-screen, so the art director marks each item Keep or
// Change (with placement reasons and a note) right on the drawing and adds
// scene-wide notes; all of it amends the story and image prompt before anything
// else is generated, and a redraw shows the changes. The traced line drawing is
// only shown while the detailed sketch can't be (failed, plan-gated or expired).

import { SignInPrompt, signInRequiredFrom } from '../lib/signIn.tsx';
import { ArrowRight, Check, CheckCheck, Download, Move, Pencil, PencilLine, RotateCw, Sparkles, Trash2, X } from 'lucide-react';
import { Dialog, Heading, Modal } from 'react-aria-components';
import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';

import { PLACEMENT_REASONS, changeSummary, emptyReview, layoutKey, sketchEdits, sketchKey, reviewAdjustments, reviewCounts, reviewDirections, reviewFacts, type ItemReview, type LayoutReview } from '../../shared/review.ts';
import { editedBlueprint, placementOf, removable } from '../../shared/layoutEdit.ts';
import { MODEL_FRAMING_WIDEN } from '../../shared/rules.ts';
import { SKETCH_MODEL_LABEL, sketchChanges, sketchPrompt } from '../../shared/sketch.ts';
import type { LayoutOption } from '../../shared/solver.ts';
import { defaultPersonDetails, type PersonDetails } from '../../shared/people.ts';
import type { Blueprint } from '../../shared/types.ts';
import { recordDuration, useProgress } from '../lib/progress.ts';
import { MODEL_PROXY_WIDTH, renderProxy, renderSketch, type Sketch } from '../lib/renderProxy.ts';
import { uploadImage } from '../lib/uploadImage.ts';
import { isForbidden } from '../lib/useTurnarounds.ts';
import { trpc } from '../trpc.ts';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { ProgressRing } from '../ui/ProgressRing.tsx';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import { TextArea } from '../ui/TextArea.tsx';
import { TextInput } from '../ui/TextInput.tsx';
import { SketchEditor } from './SketchEditor.tsx';
import { StepActions } from './StepActions.tsx';
import type { ComposeResult } from './types.ts';
import type { Draft } from './useIntake.ts';
import styles from './ReviewStep.module.css';

type DetailSketch = NonNullable<Draft['sketch']>;

const POLL_MS = 3000;
const POLL_TIMEOUT_MS = 6 * 60_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The detailed sketch being drawn, kept for the browser session so leaving the step (or
 * reloading) mid-draw picks the same task back up instead of paying for a second one.
 */
type Pending = { layout: string; prompt: string; taskId: string; startedAt: number; edits: Record<string, string> };
const PENDING_KEY = 'scene-composer:sketch-pending';

function readPending(layout: string): Pending | null {
  try {
    const p = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null') as Pending | null;
    return p && p.layout === layout && Date.now() - p.startedAt < POLL_TIMEOUT_MS ? p : null;
  } catch {
    return null;
  }
}

function writePending(p: Pending | null) {
  try {
    if (p) sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // Session storage is unavailable (private mode): a revisit mid-draw simply draws again.
  }
}

/** The detailed sketch as a PNG, forced to greyscale in case the model let any color through. */
async function greyscalePng(url: string): Promise<Blob> {
  const bitmap = await createImageBitmap(await (await fetch(url)).blob());
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.filter = 'grayscale(1)';
  ctx.drawImage(bitmap, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the sketch'))), 'image/png'));
}

function errorText(err: unknown): string {
  const code = typeof err === 'object' && err && 'data' in err ? (err as { data?: { code?: string } }).data?.code : undefined;
  if (code === 'TOO_MANY_REQUESTS') return 'Gemini is busy right now. Wait a moment, then draw again.';
  return err instanceof Error ? err.message : String(err);
}

export function ReviewStep({
  compose,
  option,
  review: savedReview,
  onReview,
  hasStory,
  detail: savedDetail,
  onDetail,
  arrangement,
  sourceName,
  onEditLayout,
  onPerson,
  onNext,
}: {
  compose: ComposeResult;
  option: LayoutOption;
  /** How this arrangement is named in an edit of it, e.g. "arrangement A". */
  sourceName: string;
  /** Saves an edit from the sketch editor as a new arrangement and switches to it. */
  onEditLayout: (edit: { blueprint: Blueprint; review: LayoutReview }) => void;
  /** Null when there is no review yet for this layout. */
  review: LayoutReview | null;
  onReview: (r: LayoutReview) => void;
  /** Saves who a seated person is and what they wear (seated layouts only); their pose stays the layout's. */
  onPerson?: (id: string, person: PersonDetails) => void;
  /** A story already exists for this layout: changing the review rewrites it. */
  hasStory: boolean;
  /** The detailed sketch, when one was drawn (for any layout; only this layout's is shown). */
  detail: DetailSketch | null;
  onDetail: (d: DetailSketch) => void;
  /** The side panel beside the sketch (layout guide, arrangements, accent), told whether a sketch is drawing (switching then would orphan that draw). */
  arrangement?: (drawing: boolean) => ReactNode;
  onNext: () => void;
}) {
  const bp = option.blueprint;
  const review = savedReview ?? emptyReview(bp);
  const [sketch, setSketch] = useState<Sketch | null>(null);
  const [sketchError, setSketchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  /** Items whose Change editor is open; a Change that's been confirmed with Done folds to one line. */
  const [editing, setEditing] = useState<ReadonlySet<string>>(() => new Set());
  const [howOpen, setHowOpen] = useState(false);
  const [confirmRedraw, setConfirmRedraw] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  /** Items marked Remove: they leave the layout on the next redraw, which makes it a new arrangement, as Edit sketch does. */
  const [removing, setRemoving] = useState<ReadonlySet<string>>(() => new Set());
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const rowRefs = useRef<Array<HTMLLIElement | null>>([]);

  // The detailed sketch: this layout's, if one was drawn, and whether the review has changed since.
  const signature = sketchKey(bp);
  const detail = savedDetail && savedDetail.layout === signature ? savedDetail : null;
  const [expired, setExpired] = useState(false);
  const [run, setRun] = useState<{ startedAt: number; reported: number | null; error: string | null; cause: unknown } | null>(null);
  const showDetail = !!detail && !expired;
  const drawing = !!run && !run.error;
  const progress = useProgress('review-sketch', drawing ? run.startedAt : null, run?.reported);
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  useEffect(() => setExpired(false), [detail?.url]);
  const start = trpc.sketchStart.useMutation();
  const locate = trpc.sketchLocate.useMutation();
  // Once a sketch is drawn, find where it put each item, so the markers sit on the drawing.
  // Saved with the sketch; a failed lookup leaves the planned positions in place.
  const locatedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!detail || detail.boxes || locatedFor.current === detail.url) return;
    locatedFor.current = detail.url;
    const items = bp.primitives.map((p) => ({ id: p.id, name: p.component_name }));
    locate
      .mutateAsync({ url: detail.url, items })
      .then((r) => {
        if (aliveRef.current) onDetail({ ...detail, boxes: r.boxes, extras: r.extras });
      })
      .catch(() => {
        // keep the planned positions
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per drawn sketch
  }, [detail?.url, detail?.boxes]);
  // On the drawn sketch, items are where the drawing put them; otherwise where the layout plans them.
  const boxes = showDetail ? detail.boxes : undefined;
  const extras = showDetail ? detail.extras : undefined;
  const boxAt = (fx: number, fy: number): number | null => {
    if (!boxes) return null;
    let best: number | null = null;
    let bestArea = Infinity;
    bp.primitives.forEach((p, i) => {
      const b = boxes[p.id];
      if (!b || fx < b.x0 || fx > b.x1 || fy < b.y0 || fy > b.y1) return;
      const area = (b.x1 - b.x0) * (b.y1 - b.y0);
      if (area < bestArea) {
        bestArea = area;
        best = i;
      }
    });
    return best;
  };
  const anchors = bp.primitives.map((p, i) => {
    if (!boxes) return sketch?.anchors[i] ?? null;
    const b = boxes[p.id];
    return b ? { x: (b.x0 + b.x1) / 2, y: b.y0 + (b.y1 - b.y0) * 0.45 } : null;
  });
  const poll = trpc.turnaroundPoll.useMutation();

  // Drawn after the first paint so the skeleton shows while the CPU traces the lines.
  useEffect(() => {
    setSketch(null);
    setSketchError(null);
    const frame = requestAnimationFrame(() => {
      try {
        setSketch(renderSketch(bp, compose.lighting, { width: 1280 }));
      } catch (err) {
        setSketchError(err instanceof Error ? err.message : String(err));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [bp, compose.lighting]);

  // Highlights: Change = amber with black diagonal hatching; the selected non-change item in the selected red,
  // the hovered one in the hover grey.
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !sketch) return;
    const { width, height, hit } = sketch;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    if (boxes) {
      // The drawn sketch: highlight each item's found box.
      ctx.clearRect(0, 0, width, height);
      // Dishes or drinks the drawing added on its own: dashed red, since they'd carry into the photo.
      ctx.save();
      ctx.setLineDash([width / 120, width / 200]);
      ctx.lineWidth = Math.max(2, width / 450);
      ctx.strokeStyle = 'rgba(231, 34, 58, 0.9)';
      for (const e of extras ?? []) ctx.strokeRect(e.box.x0 * width, e.box.y0 * height, (e.box.x1 - e.box.x0) * width, (e.box.y1 - e.box.y0) * height);
      ctx.restore();
      bp.primitives.forEach((p, i) => {
        const b = boxes[p.id];
        if (!b) return;
        const change = review.items[p.id]?.verdict === 'change';
        const on = selected === i || hover === i;
        if (!change && !on) return;
        const [x, y, w, h] = [b.x0 * width, b.y0 * height, (b.x1 - b.x0) * width, (b.y1 - b.y0) * height];
        ctx.fillStyle = change ? `rgba(255, 204, 51, ${on ? 0.4 : 0.28})` : selected === i ? 'rgba(231, 34, 58, 0.22)' : 'rgba(120, 120, 120, 0.2)';
        ctx.fillRect(x, y, w, h);
        ctx.lineWidth = Math.max(2, width / 500);
        ctx.strokeStyle = change ? 'rgba(0, 0, 0, 0.7)' : selected === i ? 'rgba(231, 34, 58, 0.9)' : 'rgba(80, 80, 80, 0.7)';
        ctx.strokeRect(x, y, w, h);
      });
      return;
    }
    const img = ctx.createImageData(width, height);
    const change = bp.primitives.map((p) => review.items[p.id]?.verdict === 'change');
    const picked = selected === null ? -1 : selected + 1;
    const hovered = hover === null ? -1 : hover + 1;
    for (let i = 0; i < hit.length; i++) {
      const item = hit[i]!;
      if (!item) continue;
      const o = i * 4;
      if (change[item - 1]) {
        const x = i % width;
        const y = (i / width) | 0;
        if ((x + y) % 8 < 2) {
          img.data[o + 3] = 120;
        } else {
          img.data[o] = 255;
          img.data[o + 1] = 204;
          img.data[o + 2] = 51;
          img.data[o + 3] = item === picked || item === hovered ? 150 : 110;
        }
      } else if (item === picked) {
        img.data[o] = 231;
        img.data[o + 1] = 34;
        img.data[o + 2] = 58;
        img.data[o + 3] = 80;
      } else if (item === hovered) {
        img.data[o] = 120;
        img.data[o + 1] = 120;
        img.data[o + 2] = 120;
        img.data[o + 3] = 60;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [sketch, boxes, extras, review.items, selected, hover, bp]);

  const itemAt = (e: MouseEvent<HTMLElement>): number | null => {
    if (boxes) {
      const r = e.currentTarget.getBoundingClientRect();
      return boxAt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    }
    if (!sketch) return null;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * sketch.width);
    const y = Math.floor(((e.clientY - r.top) / r.height) * sketch.height);
    const item = sketch.hit[y * sketch.width + x] ?? 0;
    return item ? item - 1 : null;
  };

  const select = (i: number | null) => {
    setSelected(i);
    if (i !== null) rowRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const setItem = (id: string, next: ItemReview | null) => {
    const items = { ...review.items };
    if (next) items[id] = next;
    else delete items[id];
    onReview({ ...review, items });
  };

  const setEditingItem = (id: string, on: boolean) =>
    setEditing((cur) => {
      const next = new Set(cur);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const setVerdict = (id: string, verdict: ItemReview['verdict']) => {
    const cur = review.items[id];
    // Pressing the active verdict again clears it back to unmarked.
    if (cur?.verdict === verdict) setItem(id, null);
    else setItem(id, { verdict, reasons: cur?.reasons ?? [], note: cur?.note ?? '' });
    setEditingItem(id, verdict === 'change' && cur?.verdict !== 'change');
  };

  const toggleRemove = (id: string) => {
    const on = !removing.has(id);
    setRemoving((cur) => {
      const next = new Set(cur);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    if (on) {
      if (review.items[id]) setItem(id, null);
      setEditingItem(id, false);
    }
  };

  const markAllWorking = () => {
    const items: Record<string, ItemReview> = {};
    for (const p of bp.primitives) if (p.role !== 'person' && !removing.has(p.id)) items[p.id] = review.items[p.id]?.verdict === 'change' ? review.items[p.id]! : { verdict: 'keep', reasons: [], note: '' };
    onReview({ ...review, items });
  };

  const adjustments = useMemo(() => reviewAdjustments(review, bp), [review, bp]);
  const directions = useMemo(() => reviewDirections(review, bp), [review, bp]);
  const counts = reviewCounts(review);
  const changes = useMemo(() => sketchChanges(adjustments, directions), [adjustments, directions]);
  // An edited arrangement is redrawn from its proxy alone. It used to get the sketch it was edited on
  // as image 2 for style, but Nano Banana copied that sketch's positions and extra dishes back in
  // (Fernando, 2026-10-17: moved plates snapped back, invented plates came back on every redraw).
  const detailPrompt = useMemo(() => sketchPrompt(compose.spec, bp, changes), [compose.spec, bp, changes]);
  const detailStale = !!detail && detail.prompt !== detailPrompt;
  // With a sketch, the edits it doesn't show yet go into the photo prompt word for word.
  const photoChanges = useMemo(() => reviewFacts(review, bp, detail).directorChanges, [review, bp, detail]);

  // What the next redraw adds, one line per edit that differs from the sketch on screen.
  const edits = useMemo(() => sketchEdits(review, bp), [review, bp]);
  const drawnEdits = detail?.edits;
  const inSketch = (key: string) => !!drawnEdits && drawnEdits[key] === edits[key];
  const pending = useMemo(() => {
    if (!drawnEdits) return Object.values(edits);
    const keys = [...new Set([...Object.keys(edits), ...Object.keys(drawnEdits)])];
    return keys.filter((k) => edits[k] !== drawnEdits[k]).map((k) => edits[k] ?? `${drawnEdits[k]} (removed)`);
  }, [edits, drawnEdits]);
  const pendingText = pending.length === 1 ? '1 edit' : `${pending.length} edits`;
  // Items marked Change with nothing picked yet: they don't change anything until they're filled in.
  const unfinished = bp.primitives.filter((p) => review.items[p.id]?.verdict === 'change' && !edits[p.id]);

  /** Submits a new drawing, or picks up `resume` (a task already running for this layout), and polls it to the end. */
  const drawDetail = async (resume?: Pending) => {
    const startedAt = resume?.startedAt ?? Date.now();
    const prompt = resume?.prompt ?? detailPrompt;
    const drawn = resume?.edits ?? edits;
    setRun({ startedAt, reported: null, error: null, cause: null });
    try {
      let taskId = resume?.taskId;
      if (!taskId) {
        // Image 1 is the same labeled proxy, at the same framing, that the photograph is made from.
        const png = renderProxy(bp, compose.lighting, { width: MODEL_PROXY_WIDTH, widen: MODEL_FRAMING_WIDEN });
        const { url: proxyUrl } = await uploadImage(png);
        taskId = (await start.mutateAsync({ prompt, proxyUrl })).taskId;
        writePending({ layout: signature, prompt, taskId, startedAt, edits: drawn });
      }
      const deadline = startedAt + POLL_TIMEOUT_MS;
      for (;;) {
        await sleep(POLL_MS);
        // Leaving the step stops polling; the pending task is picked up on the way back.
        if (!aliveRef.current) return;
        const r = await poll.mutateAsync({ taskId });
        if (!r.done) {
          setRun((cur) => (cur && cur.startedAt === startedAt ? { ...cur, reported: r.progress } : cur));
          if (Date.now() > deadline) throw new Error(`${SKETCH_MODEL_LABEL} is taking much longer than usual. Draw again in a minute.`);
          continue;
        }
        writePending(null);
        if ('error' in r) throw new Error(r.error);
        recordDuration('review-sketch', startedAt);
        onDetail({ url: r.url, prompt, at: Date.now(), layout: signature, edits: drawn });
        if (aliveRef.current) setRun(null);
        return;
      }
    } catch (err) {
      writePending(null);
      if (aliveRef.current) setRun({ startedAt, reported: null, error: errorText(err), cause: err });
    }
  };

  // The detailed sketch is the default view: draw it on arrival when this layout has none yet,
  // or pick up one still drawing from an earlier visit. Review changes never redraw on their own.
  const autoRef = useRef<string | null>(null);
  useEffect(() => {
    if (autoRef.current === signature) return;
    autoRef.current = signature;
    setRemoving(new Set());
    const pending = readPending(signature);
    if (pending) void drawDetail(pending);
    else if (!detail) void drawDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per layout
  }, [signature]);

  // Seated people aren't marked Working or Change: their pose is locked, their looks are edited in place.
  const unmarked = bp.primitives.filter((p) => p.role !== 'person' && !removing.has(p.id)).length - counts.keep - counts.change;
  // Removal goes through the same edit as Edit sketch; seated people and a drink in a hand stay.
  const canRemove = (p: Blueprint['primitives'][number]) => removable(p);
  const removals = bp.primitives.filter((p) => removing.has(p.id));
  const removalLines = removals.map((p) => `Remove ${p.component_name}`);
  const editCount = pending.length + removals.length;
  const editCountText = editCount === 1 ? '1 edit' : `${editCount} edits`;

  const download = async () => {
    const save = (href: string, name: string) => {
      const a = document.createElement('a');
      a.href = href;
      a.download = name;
      a.click();
    };
    if (showDetail) {
      try {
        const blob = await greyscalePng(detail.url);
        const href = URL.createObjectURL(blob);
        save(href, 'detailed-sketch.png');
        setTimeout(() => URL.revokeObjectURL(href), 10_000);
      } catch {
        // The image host doesn't allow a direct download: open it so it can be saved from the tab.
        window.open(detail.url, '_blank', 'noopener');
      }
      return;
    }
    if (sketch) save(sketch.url, 'layout-sketch.png');
  };

  const redraw = () => {
    setConfirmRedraw(false);
    setEditing(new Set());
    if (removals.length) {
      // The removed items leave the layout: a new arrangement, redrawn from its proxy with
      // the other edits carried over (saveEdit), exactly as if they'd been deleted in Edit sketch.
      const place = placementOf(bp);
      for (const p of removals) delete place[p.id];
      setRemoving(new Set());
      saveEdit(editedBlueprint(bp, place, sourceName));
      return;
    }
    void drawDetail();
  };

  /** The edited layout becomes a new arrangement; marks on items that stayed put carry over, and so do the scene notes. */
  const saveEdit = (edited: Blueprint) => {
    setEditOpen(false);
    const items: Record<string, ItemReview> = {};
    for (const p of edited.primitives) {
      const r = review.items[p.id];
      const was = bp.primitives.find((q) => q.id === p.id);
      if (!r || !was) continue;
      const moved = was.world.x !== p.world.x || was.world.d !== p.world.d;
      if (!moved) items[p.id] = r;
      // A moved item keeps its note about the dish, not its placement reasons.
      else if (r.note.trim()) items[p.id] = { ...r, reasons: [] };
    }
    onEditLayout({
      blueprint: edited,
      review: { key: layoutKey(edited), items, notes: review.notes },
    });
  };

  const signIn = run?.error ? signInRequiredFrom(run.cause) : null;
  const forbidden = run?.error ? isForbidden(run.cause) : false;

  return (
    <section>
      <h1>Review the Sketch</h1>
      <p className={styles.lede}>
        The photo follows this layout. Mark each item Working or Change, then approve.{' '}
        <button type="button" className={styles.howLink} aria-expanded={howOpen} onClick={() => setHowOpen((v) => !v)}>
          {howOpen ? 'Hide how this works' : 'How this works'}
        </button>
      </p>
      {howOpen && (
        <p className={styles.how}>
          This is the scene sketched in pencil through the camera you picked: the food, dishes and drinks where they will land in the photo. Click an item
          or its number to mark what is working and what isn't, and add anything else the scene needs. Approve the sketch and the photograph is built from the same 3D layout, so it keeps its camera,
          framing and placement. Edits made after the sketch was drawn either redraw it, or go straight into the photo prompt with Approve with changes.
        </p>
      )}

      <div className={styles.compare}>
        <div className={styles.frameCol}>
        <div className={styles.frame}>
          {showDetail ? (
            <img
              className={`${styles.sketch} ${styles.mono}`}
              src={detail.url}
              alt="Detailed black-and-white pencil sketch of the finished scene, 16:9, through the photo's camera"
              onError={() => setExpired(true)}
            />
          ) : drawing ? (
            <SkeletonBlock height="100%" />
          ) : sketchError ? (
            <div className={styles.frameMessage} role="alert">
              Couldn't draw the sketch: {sketchError}
            </div>
          ) : sketch ? (
            <img className={styles.sketch} src={sketch.url} alt="Black-and-white outline drawing of the picked layout, 16:9" />
          ) : (
            <SkeletonBlock height="100%" />
          )}
          {sketch && <canvas className={styles.overlay} ref={overlayRef} aria-hidden />}
          {(sketch || showDetail) && !drawing && (
            <button type="button" className={styles.frameDownload} onClick={() => void download()} aria-label={showDetail ? 'Download the sketch' : 'Download the outline'}>
              <Download size={16} aria-hidden />
            </button>
          )}
          {drawing && (
            <ProgressRing
              label={showDetail ? 'Redrawing the sketch' : 'Drawing the sketch'}
              progress={progress ?? null}
              hint={showDetail ? 'The current sketch stays until the new one is ready.' : 'You can start marking items while the sketch draws.'}
            />
          )}
          {sketch && (
            <div
              className={styles.hitArea}
              data-pointer={hover !== null || undefined}
              aria-hidden
              onMouseMove={(e) => setHover(itemAt(e))}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => select(itemAt(e))}
            />
          )}
          {sketch && anchors.map((a, i) => {
            const p = bp.primitives[i]!;
            if (!a) return null;
            const verdict = review.items[p.id]?.verdict;
            return (
              <button
                key={p.id}
                type="button"
                className={styles.marker}
                style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }}
                data-verdict={verdict}
                data-selected={selected === i || undefined}
                aria-label={`${i + 1}. ${p.component_name} (${p.id})${verdict ? `, marked ${verdict}` : ''}`}
                onClick={() => select(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {verdict === 'keep' ? <Check size={12} strokeWidth={3} aria-hidden /> : i + 1}
              </button>
            );
          })}
        </div>

        {/* Under the sketch: change it by hand on the left, draw it again on the right. */}
        <div className={styles.toolbar}>
          <Button size="sm" icon={<Move size={14} aria-hidden />} onPress={() => setEditOpen(true)} disabled={!sketch || drawing}>
            Edit sketch
          </Button>
          <Button
            size="sm"
            variant={!detail || expired ? 'primary' : 'default'}
            icon={detail ? <RotateCw size={14} aria-hidden /> : <Sparkles size={14} aria-hidden />}
            onPress={() => (detail && !expired ? setConfirmRedraw(true) : removals.length ? redraw() : void drawDetail())}
            disabled={drawing}
          >
            {!detail || expired ? 'Draw the sketch' : (detailStale && pending.length) || removals.length ? `Redraw with ${editCountText}` : 'Redraw'}
          </Button>
        </div>
          <div className={styles.detailBar} aria-live="polite">
            {drawing ? null : run?.error ? (
              signIn ? (
                <SignInPrompt
                  onSignedIn={() => void drawDetail()}
                />
              ) : (
                <Alert tone="error" title={forbidden ? 'Monthly limit reached' : "Couldn't draw the sketch"}>
                  {forbidden ? (
                    `${run.error} The outline drawing below still shows where each item sits.`
                  ) : (
                    <span className={styles.errorBody}>
                      {run.error} The outline drawing below shows where each item sits until it can be drawn.
                      <Button size="sm" icon={<RotateCw size={14} aria-hidden />} onPress={() => void drawDetail()}>
                        Try again
                      </Button>
                    </span>
                  )}
                </Alert>
              )
            ) : (
              <div className={styles.detailRow}>
                <p className={styles.detailText}>
                  {!detail
                    ? `The sketch draws the food, the dishes and the drinks in pencil, as they will land in the photo (${SKETCH_MODEL_LABEL}, counted toward your monthly limit).`
                    : expired
                      ? 'The sketch has expired. Draw it again to see it; the outline drawing shows where each item sits meanwhile.'
                      : removals.length
                        ? `${editCountText} since this sketch was drawn. Removing an item takes a redraw, so the photo can't leave it out until then; each redraw counts toward your monthly limit.`
                      : detailStale
                        ? pending.length
                          ? `${pendingText} since this sketch was drawn. Make all your edits first, then redraw once: each redraw counts toward your monthly limit.`
                          : 'The sketch was drawn from an earlier version of the prompt. Redraw it to bring it up to date.'
                        : changes.length
                          ? 'The sketch includes your changes.'
                          : 'The sketch is up to date with this layout.'}
                </p>
                {showDetail && !detailStale && !removals.length && extras && extras.length > 0 && (
                  <p className={styles.extraText}>
                    {`The sketch also drew ${extras.length === 1 ? 'something that isn\u2019t' : `${extras.length} things that aren\u2019t`} in the layout (outlined in red: ${extras.map((e) => e.what.toLowerCase()).join(', ')}). It would carry into the photo, so redraw to drop ${extras.length === 1 ? 'it' : 'them'}.`}
                  </p>
                )}
              </div>
            )}
          </div>
          {hasStory && (
            <Alert tone="info" title="This layout already has a scene">
              Changing anything here rewrites the scene when you continue.
            </Alert>
          )}
        </div>

        {arrangement?.(drawing)}
      </div>

      <div className={styles.layoutGrid}>
        <div className={styles.itemsCol}>
        <div className={styles.itemsHead}>
          <h2 className={styles.sectionTitle}>Items</h2>
          <span className={styles.tally}>
            {counts.keep} working · {counts.change} to change{removals.length ? ` · ${removals.length} to remove` : ''}{unmarked ? ` · ${unmarked} unmarked` : ''}
          </span>
          <Button size="sm" variant="ghost" icon={<CheckCheck size={14} aria-hidden />} onPress={markAllWorking} disabled={unmarked === 0}>
            Mark the rest working
          </Button>
        </div>
        <ol className={styles.items}>
          {bp.primitives.map((p, i) => {
            const r = review.items[p.id];
            const hidden = sketch && !anchors[i];
            return (
              <li
                key={p.id}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={styles.item}
                data-selected={selected === i || undefined}
                data-verdict={removing.has(p.id) ? 'remove' : r?.verdict}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div className={styles.itemHead}>
                  <button type="button" className={styles.itemName} onClick={() => select(selected === i ? null : i)} aria-label={`Show ${p.component_name} on the sketch`}>
                    <span className={styles.itemNumber} data-verdict={r?.verdict} aria-hidden>
                      {i + 1}
                    </span>
                    <span className={styles.itemText}>
                      <span className={styles.itemTitle}>{p.component_name}</span>
                      <span className={styles.itemMeta}>
                        {p.id}
                        {p.role === 'person' ? ' · pose locked by the layout' : ''}
                        {hidden ? (boxes ? ' · not found in the sketch' : ' · not visible from this camera') : ''}
                      </span>
                    </span>
                  </button>
                  {p.role !== 'person' && (
                  <div className={styles.verdicts} role="group" aria-label={`${p.component_name}: is it working?`}>
                    <button type="button" className={styles.verdict} data-kind="keep" aria-pressed={r?.verdict === 'keep'} aria-label="Working" title="Working" onClick={() => setVerdict(p.id, 'keep')}>
                      <Check size={18} strokeWidth={2.5} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={styles.verdict}
                      data-kind="change"
                      aria-pressed={r?.verdict === 'change'}
                      aria-label="Change"
                      title="Change"
                      onClick={() => {
                        setVerdict(p.id, 'change');
                        setSelected(i);
                      }}
                    >
                      <Pencil size={16} strokeWidth={2.5} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={styles.verdict}
                      data-kind="remove"
                      aria-pressed={removing.has(p.id)}
                      aria-label="Remove"
                      title={!canRemove(p) ? 'Stays in every scene' : removing.has(p.id) ? 'Keep it' : 'Remove'}
                      disabled={!canRemove(p)}
                      onClick={() => toggleRemove(p.id)}
                    >
                      <X size={18} strokeWidth={2.5} aria-hidden />
                    </button>
                  </div>
                  )}
                </div>

                {p.role === 'person' && (
                  <PersonFields
                    details={p.person ?? { who: '', heritage: '', wearing: '' }}
                    defaults={defaultPersonDetails(compose.spec, p.id)}
                    disabled={!onPerson}
                    onChange={(details) => onPerson?.(p.id, details)}
                  />
                )}

                {removing.has(p.id) && (
                  <div className={styles.changeDone}>
                    <Trash2 size={14} className={styles.changeDoneIcon} aria-hidden />
                    <span className={styles.changeDoneText}>Removed from the scene</span>
                    {detail && <span className={styles.sketchTag}>Next redraw</span>}
                  </div>
                )}

                {r?.verdict === 'change' && !editing.has(p.id) && (
                  <div className={styles.changeDone}>
                    <Check size={14} className={styles.changeDoneIcon} aria-hidden />
                    <span className={styles.changeDoneText}>
                      {edits[p.id] ? changeSummary(r) : <span className={styles.muted}>Marked to change, nothing picked yet</span>}
                    </span>
                    {edits[p.id] && detail && (
                      <span className={styles.sketchTag} data-in={inSketch(p.id) || undefined}>
                        {inSketch(p.id) ? 'In the sketch' : 'Next redraw'}
                      </span>
                    )}
                    <Button size="sm" variant="ghost" icon={<PencilLine size={14} aria-hidden />} onPress={() => setEditingItem(p.id, true)}>
                      Edit
                    </Button>
                  </div>
                )}

                {r?.verdict === 'change' && editing.has(p.id) && (
                  <div className={styles.change}>
                    <div className={styles.reasons} role="group" aria-label="What's off about its placement">
                      {PLACEMENT_REASONS.map((reason) => {
                        const on = r.reasons.includes(reason.id);
                        return (
                          <button
                            key={reason.id}
                            type="button"
                            className={styles.reason}
                            data-active={on || undefined}
                            aria-pressed={on}
                            onClick={() =>
                              setItem(p.id, { ...r, reasons: on ? r.reasons.filter((x) => x !== reason.id) : [...r.reasons, reason.id] })
                            }
                          >
                            {reason.label}
                          </button>
                        );
                      })}
                    </div>
                    <TextInput
                      label="Anything else about this item"
                      placeholder="A different dish, vessel or garnish, e.g. grilled not fried, a clay bowl"
                      value={r.note}
                      maxLength={400}
                      onChange={(note) => setItem(p.id, { ...r, note })}
                      onPressEnter={edits[p.id] ? () => setEditingItem(p.id, false) : undefined}
                    />
                    <div className={styles.changeFoot}>
                      <span className={styles.changeHint}>
                        {edits[p.id] ? 'Saved. Add your other edits too, then redraw once.' : "Pick what's off, or describe the change."}
                      </span>
                      <Button size="sm" variant="primary" icon={<Check size={14} aria-hidden />} onPress={() => setEditingItem(p.id, false)} disabled={!edits[p.id]}>
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles.notesCol}>
      <h2 className={styles.sectionTitle}>Notes for the Whole Scene</h2>
      <TextArea
        aria-label="Notes for the whole scene"
        placeholder="Anything that isn't one item's placement: the environment, the mood, the light, a dish swap. E.g. make it feel like a busy Saturday market stall."
        rows={3}
        value={review.notes}
        onChange={(notes) => onReview({ ...review, notes })}
      />
      {edits['scene'] && (
        <p className={styles.notesSaved} role="status">
          <Check size={12} aria-hidden /> Saved
          {detail && <span className={styles.sketchTag} data-in={inSketch('scene') || undefined}>{inSketch('scene') ? 'In the sketch' : 'Next redraw'}</span>}
        </p>
      )}

      <div className={styles.preview} aria-live="polite">
        <h3 className={styles.previewTitle}>What Changes in the Prompt</h3>
        {showDetail ? (
          <>
            <p className={styles.previewEmpty}>
              The photo is built from the same 3D layout as this sketch, so it keeps its camera, framing and placement.
              {photoChanges.length ? ' Approve with changes to add the edits below without redrawing.' : ''}
            </p>
            {photoChanges.length > 0 && (
              <div className={styles.previewBlock}>
                <span className={styles.previewLabel}>Added to the photo prompt word for word</span>
                <ul>
                  {photoChanges.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : adjustments.length === 0 && directions.length === 0 ? (
          <p className={styles.previewEmpty}>Nothing yet. Unmarked items are described just as the sketch shows them.</p>
        ) : (
          <>
            {adjustments.length > 0 && (
              <div className={styles.previewBlock}>
                <span className={styles.previewLabel}>Layout guide, in the image prompt</span>
                <ul>
                  {adjustments.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
            {directions.length > 0 && (
              <div className={styles.previewBlock}>
                <span className={styles.previewLabel}>Directions for the scene description</span>
                <ul>
                  {directions.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      </div>
      </div>

      <StepActions pinned={false}>
        {detail && !expired && !drawing && ((detailStale && pending.length > 0) || removals.length > 0) && (
          <Button icon={<RotateCw size={16} aria-hidden />} onPress={() => setConfirmRedraw(true)}>
            Redraw with {editCountText}
          </Button>
        )}
        <Button variant="primary" iconEnd={<ArrowRight size={16} aria-hidden />} onPress={onNext} disabled={removals.length > 0}>
          {showDetail && pending.length ? 'Approve with changes' : showDetail ? 'Approve the sketch' : hasStory ? 'Continue to the scene' : 'Create the scene'}
        </Button>
      </StepActions>

      <SketchEditor
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        blueprint={bp}
        spec={compose.spec}
        lighting={compose.lighting}
        sourceName={sourceName}
        onSave={saveEdit}
      />

      <Modal isOpen={confirmRedraw} onOpenChange={setConfirmRedraw} isDismissable className={styles.modalOverlay}>
        <Dialog className={styles.dialog}>
          <Heading slot="title" className={styles.dialogTitle}>
            {editCount ? `Redraw with ${editCount === 1 ? '1 Edit' : `${editCount} Edits`}?` : 'Draw the Same Sketch Again?'}
          </Heading>
          <p className={styles.dialogText}>
            Each redraw counts toward your monthly limit ({SKETCH_MODEL_LABEL}), so make all your edits first and redraw once.
          </p>
          {editCount > 0 ? (
            <>
              <span className={styles.previewLabel}>This redraw includes</span>
              <ul className={styles.dialogList}>
                {[...removalLines, ...pending].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles.dialogText}>Nothing has changed since this sketch, so this gives a new take on the same scene.</p>
          )}
          {unfinished.length > 0 && (
            <Alert tone="info" title={unfinished.length === 1 ? '1 item has no change picked' : `${unfinished.length} items have no change picked`}>
              {unfinished.map((p) => p.component_name).join(', ')} {unfinished.length === 1 ? 'is' : 'are'} marked to change with nothing
              picked yet, so the sketch won't change {unfinished.length === 1 ? 'it' : 'them'}.
            </Alert>
          )}
          <div className={styles.dialogActions}>
            <Button onPress={() => setConfirmRedraw(false)}>Keep editing</Button>
            <Button variant="primary" icon={<RotateCw size={16} aria-hidden />} onPress={redraw}>
              Redraw
            </Button>
          </div>
        </Dialog>
      </Modal>
    </section>
  );
}

/** Who a seated person is and what they wear. Empty fields fall back to the defaults shown as placeholders. */
function PersonFields({
  details,
  defaults,
  disabled,
  onChange,
}: {
  details: PersonDetails;
  defaults: PersonDetails;
  disabled: boolean;
  onChange: (d: PersonDetails) => void;
}) {
  return (
    <div className={styles.change}>
      <TextInput label="Who they are" placeholder={`e.g. ${defaults.who}`} value={details.who} maxLength={200} disabled={disabled} onChange={(who) => onChange({ ...details, who })} />
      <TextInput label="Heritage" placeholder={`e.g. ${defaults.heritage}`} value={details.heritage} maxLength={200} disabled={disabled} onChange={(heritage) => onChange({ ...details, heritage })} />
      <TextInput label="Wearing" placeholder={`e.g. ${defaults.wearing}`} value={details.wearing} maxLength={200} disabled={disabled} onChange={(wearing) => onChange({ ...details, wearing })} />
      <span className={styles.changeHint}>Left blank, the default shown greyed out is used. Redraw the sketch to see the change.</span>
    </div>
  );
}
