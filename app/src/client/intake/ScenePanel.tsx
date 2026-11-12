// The scene generator on the Story & scene step: the labeled proxy as image 1
// plus the prompt assembled from the story's segments (with any edits), sent
// to Nano Banana Pro. Shares the workspace state with the node workspace, so
// the proxy upload, the edits and the results history are the same in both.
//
// useSceneGenerator holds the state; SceneHero is the big image with its
// Download / Re-generate buttons, SceneImageCheck the check against the story
// (shown with the other checks further down the page).

import { STYLING_TIPS } from '../lib/stylingTips.ts';
import { CircleCheck, Download, ImageOff, MessageSquareWarning, SlidersHorizontal, TriangleAlert, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { LayoutOption } from '../../shared/solver.ts';
import {
  assembleWorkspacePrompt,
  checkElements, ratedElements,
  checkFixEdits,
  PROXY_ASPECT_RATIO,
  PROXY_URL_MAX_AGE_MS,
  referenceLabel,
  sceneReferences,
  WORKSPACE_MODEL_LABEL,
  productRefLabels,
  productRefs,
  type WorkspaceState,
  type WsResult,
  type WsSegment,
} from '../../shared/workspace.ts';
import { useProgress } from '../lib/progress.ts';
import { useAgentTask } from '../lib/useAgentTask.ts';
import { uploadImage } from '../lib/uploadImage.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import { isForbidden, useWorkspaceTasks } from '../lib/useWorkspaceTasks.ts';
import { trpc } from '../trpc.ts';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { CopyButton, triggerDownload } from '../ui/DownloadCopy.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { ProgressRing } from '../ui/ProgressRing.tsx';
import { SegmentedControl } from '../ui/SegmentedControl.tsx';
import { Select } from '../ui/Select.tsx';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import { FeedbackDialog } from '../workspace/FeedbackDialog.tsx';
import { ImageCheckPanel, type CheckIssue } from '../workspace/ImageCheckPanel.tsx';
import { Lightbox, type LightboxState } from '../workspace/Lightbox.tsx';
import { TaskError } from '../workspace/TaskError.tsx';
import type { Brief, ComposeResult, StoryState } from './types.ts';
import styles from './ScenePanel.module.css';

async function downloadUrl(url: string, name: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    triggerDownload(name, blobUrl);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank', 'noreferrer');
  }
}

/** "16:9" → 16 / 9, for sizing the empty stage and skeletons like the image that's coming. */
function ratioValue(ratio: string): number {
  const [w, h] = ratio.split(':').map(Number);
  return w && h ? w / h : 16 / 9;
}

export interface SceneGeneratorInput {
  brief: Brief;
  compose: ComposeResult;
  option: LayoutOption;
  story: StoryState | null;
  segments: WsSegment[];
  ws: WorkspaceState;
  updateWorkspace: (fn: (ws: WorkspaceState) => WorkspaceState) => void;
  proxyDataUrl: string;
  /** A short confirmation shown by the step, e.g. after the check's fixes land in the segments. */
  onFlash: (message: string) => void;
}

export function useSceneGenerator(input: SceneGeneratorInput) {
  const { compose, option, story, segments, ws, updateWorkspace, proxyDataUrl, brief, onFlash } = input;
  const utils = trpc.useUtils();
  const optionsQuery = trpc.workspaceOptions.useQuery();
  const tasks = useWorkspaceTasks();
  const onSignedIn = useOnSignedIn();
  const wsRef = useRef(ws);
  wsRef.current = ws;

  const [proxyStatus, setProxyStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [proxyError, setProxyError] = useState<string | null>(null);

  const proxyKey = `${option.blueprint.layout_meta.signature}:${compose.lighting.id}`;

  const sketchUrl = story?.facts.layoutSketch?.url;
  const ensureProxyUploaded = useCallback(async (): Promise<string> => {
    // The approved sketch is image 1 when there is one; it is already stored by the app.
    if (sketchUrl) return sketchUrl;
    const cur = wsRef.current;
    if (cur.proxy && cur.proxy.key === proxyKey && Date.now() - cur.proxy.at < PROXY_URL_MAX_AGE_MS) return cur.proxy.url;
    setProxyStatus('uploading');
    setProxyError(null);
    try {
      const { url } = await uploadImage(proxyDataUrl);
      updateWorkspace((w) => ({ ...w, proxy: { key: proxyKey, url, at: Date.now() } }));
      setProxyStatus('idle');
      return url;
    } catch (err) {
      setProxyStatus('error');
      setProxyError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }, [sketchUrl, proxyKey, proxyDataUrl, utils, updateWorkspace]);

  // The image check: Claude compares a result with the story and the prompt it came from.
  const checkTask = useAgentTask('imageCheck');
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const checkRun = useRef(checkTask.run);
  checkRun.current = checkTask.run;

  const runCheck = useCallback(
    (result: WsResult) => {
      if (!story) return;
      setCheckingId(result.id);
      checkRun.current({
        brief,
        spec: compose.spec,
        story: story.story,
        imageUrls: result.urls,
        prompt: result.prompt,
        elements: checkElements(segments, wsRef.current),
      });
    },
    [brief, compose.spec, story, segments],
  );

  const checkById = useCallback(
    (id: string) => {
      const result = wsRef.current.results.find((r) => r.id === id);
      if (result) runCheck(result);
    },
    [runCheck],
  );

  useEffect(() => {
    const done = checkTask.result;
    if (done?.kind !== 'imageCheck' || !checkingId) return;
    updateWorkspace((w) => ({ ...w, results: w.results.map((r) => (r.id === checkingId ? { ...r, check: done.check } : r)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkTask.result]);

  const applyFixes = useCallback(
    (issues: CheckIssue[]) => {
      const { edits, nodes } = checkFixEdits(segments, wsRef.current, issues);
      if (!nodes.length) {
        onFlash('These issues are about the whole scene, so no segment was changed. Edit the segments by hand.');
        return;
      }
      updateWorkspace((w) => ({ ...w, edits }));
      onFlash(`Added the fixes to ${nodes.join(', ')}. Generate again to try them.`);
    },
    [segments, updateWorkspace, onFlash],
  );

  const generate = useCallback(async () => {
    if (!story) return;
    let proxyUrl: string;
    try {
      proxyUrl = await ensureProxyUploaded();
    } catch {
      return;
    }
    const cur = wsRef.current;
    const refs = sceneReferences(segments, cur);
    const references = [{ tag: 'layout', url: proxyUrl }, ...refs.map((r) => ({ tag: r.seg.chip.toLowerCase(), url: r.url }))];
    const prompt = assembleWorkspacePrompt(segments, cur);
    const product = productRefs(compose.spec, segments, cur);
    try {
      const urls = await tasks.run('scene', {
        purpose: 'scene',
        label: 'scene',
        prompt,
        aspectRatio: cur.settings.aspectRatio,
        imageSize: cur.settings.imageSize,
        numImages: cur.settings.numImages,
        references,
        product,
      });
      const result: WsResult = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        urls,
        prompt,
        settings: cur.settings,
        references: [...refs.map(referenceLabel), ...productRefLabels(product)],
      };
      updateWorkspace((w) => ({ ...w, results: [result, ...w.results] }));
      runCheck(result);
    } catch {
      // surfaced via tasks.live.scene
    }
  }, [story, ensureProxyUploaded, segments, tasks, updateWorkspace, runCheck, compose.spec]);

  // The first image comes on its own as soon as the first story lands; after
  // that (a rewrite, edits) the operator generates when they're ready.
  const hadStory = useRef(!!story);
  useEffect(() => {
    if (story && !hadStory.current) void generate();
    hadStory.current = !!story;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story]);

  const live = tasks.live.scene;
  const preparing = proxyStatus === 'uploading';
  const running = preparing || live?.status === 'running';
  const progress = useProgress(live?.timingKey ?? '', running && !preparing ? (live?.startedAt ?? null) : null, live?.progress);
  const latest = ws.results[0];
  const checkBusy = checkTask.status === 'starting' || checkTask.status === 'polling';

  return {
    input,
    generate,
    running,
    preparing,
    progress,
    live,
    forbidden: live?.error ? isForbidden(live.cause) : false,
    proxyStatus,
    proxyError,
    latest,
    older: ws.results.slice(1),
    options: optionsQuery.data ?? null,
    onSignedIn,
    check: {
      task: checkTask,
      checkingId,
      busy: checkBusy && !!latest && checkingId === latest.id,
      run: checkById,
      applyFixes,
    },
  };
}

export type SceneGenerator = ReturnType<typeof useSceneGenerator>;

/** One line for the checklist header: how the latest image fared against the story. */
export function imageCheckStatus(gen: SceneGenerator): string {
  const { latest, check } = gen;
  if (!latest) return 'no image yet';
  if (check.busy) return 'checking…';
  if (!latest.check) return 'not checked';
  const major = latest.check.images.filter((i) => !i.pass).length;
  return major === 0 ? 'passed' : `${major} image${major > 1 ? 's' : ''} need${major > 1 ? '' : 's'} changes`;
}

/** The generated scene, large, with Download and Re-generate under it; settings sit behind one toggle. */
export function SceneHero({ gen, slug }: { gen: SceneGenerator; slug: string }) {
  const { story, segments, ws, updateWorkspace, brief, compose, onFlash } = gen.input;
  const { running, preparing, progress, live, latest, older, options } = gen;
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<{ resultId: string; imageIndex: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const settings = ws.settings;
  const setSettings = (patch: Partial<WorkspaceState['settings']>) => updateWorkspace((w) => ({ ...w, settings: { ...w.settings, ...patch } }));
  const sending = sceneReferences(segments, ws).map(referenceLabel);
  const edited = Object.keys(ws.edits).length;
  const ratio = ratioValue(settings.aspectRatio);
  const count = settings.numImages;

  const downloadLatest = () => {
    if (!latest) return;
    latest.urls.forEach((url, i) => void downloadUrl(url, `${slug}-scene${latest.urls.length > 1 ? `-${i + 1}` : ''}.png`));
  };

  return (
    <div className={styles.hero}>
      <div className={styles.stage}>
        {running ? (
          <div className={styles.pending}>
            <div className={styles.grid} data-single={count === 1 || undefined}>
              {Array.from({ length: count }, (_, i) => (
                <div key={i} className={styles.skeleton} style={{ aspectRatio: ratio }}>
                  <SkeletonBlock height="100%" />
                </div>
              ))}
            </div>
            <ProgressRing
              label={`Generating ${count > 1 ? `${count} images` : 'the scene'} with ${WORKSPACE_MODEL_LABEL}`}
              progress={progress}
              status={preparing ? 'Uploading the layout image…' : 'Starting…'}
              tips={STYLING_TIPS.scene}
            />
          </div>
        ) : latest ? (
          <div className={styles.grid} data-single={latest.urls.length === 1 || undefined}>
            {latest.urls.map((url, i) => (
              <ResultTile
                key={url + i}
                url={url}
                index={i}
                ratio={ratioValue(latest.settings.aspectRatio)}
                pass={latest.check?.images.find((c) => c.image === i + 1)?.pass}
                verdict={latest.feedback?.[i + 1]?.verdict}
                onOpen={() =>
                  setLightbox({
                    src: url,
                    alt: `${slug} scene ${i + 1}`,
                    rate: () => setFeedbackTarget({ resultId: latest.id, imageIndex: i + 1 }),
                  })
                }
                onRate={() => setFeedbackTarget({ resultId: latest.id, imageIndex: i + 1 })}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty} style={{ aspectRatio: ratio }}>
            <EmptyState
              title={story ? 'No scene yet' : 'Waiting for the story'}
              hint={
                story
                  ? 'Press Generate scene to render it from the layout and the prompt segments below.'
                  : 'The scene is generated as soon as the agent has written the story.'
              }
            />
          </div>
        )}
      </div>

      {!running && gen.proxyStatus === 'error' && gen.proxyError && (
        <Alert tone="error" title="Couldn't upload the layout image">
          {gen.proxyError}
        </Alert>
      )}
      {!running && live?.error && <TaskError error={live.error} cause={live.cause} onRetry={() => void gen.generate()} />}

      <div className={styles.heroActions}>
        <Button icon={<Download size={16} aria-hidden />} disabled={!latest || running} onPress={downloadLatest}>
          Download{latest && latest.urls.length > 1 ? ` all (${latest.urls.length})` : ''}
        </Button>
        <Button
          variant="primary"
          icon={<Wand2 size={16} aria-hidden />}
          loading={running}
          disabled={!story || gen.forbidden}
          onPress={() => void gen.generate()}
        >
          {latest ? 'Re-generate' : 'Generate scene'}
        </Button>
      </div>

      <div className={styles.settingsBar}>
        <Button
          size="sm"
          variant="ghost"
          icon={<SlidersHorizontal size={14} aria-hidden />}
          aria-expanded={showSettings}
          aria-label={`Image settings: ${settings.aspectRatio}, ${settings.imageSize}, ${count} image${count > 1 ? 's' : ''}`}
          onPress={() => setShowSettings((s) => !s)}
        >
          {settings.aspectRatio} · {settings.imageSize} · {count} image{count > 1 ? 's' : ''}
        </Button>
        {latest && !running && <CopyButton label="prompt used" text={latest.prompt} />}
      </div>

      {showSettings && (
        <div className={styles.settings}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Aspect ratio</span>
            {options ? (
              <Select
                aria-label="Scene aspect ratio"
                value={settings.aspectRatio}
                onChange={(v) => setSettings({ aspectRatio: v })}
                options={options.aspectRatios.map((r) => ({ id: r, label: r }))}
              />
            ) : (
              <SkeletonBlock height={36} />
            )}
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Image size</span>
            {options ? (
              <SegmentedControl
                aria-label="Image size"
                value={settings.imageSize}
                onChange={(v) => setSettings({ imageSize: v as WorkspaceState['settings']['imageSize'] })}
                options={options.imageSizes.map((s) => ({ value: s, label: s }))}
              />
            ) : (
              <SkeletonBlock height={32} />
            )}
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Variants</span>
            <SegmentedControl
              aria-label="Number of variants"
              value={String(count)}
              onChange={(v) => setSettings({ numImages: Number(v) as 1 | 4 })}
              options={[
                { value: '1', label: '1' },
                { value: '4', label: '4' },
              ]}
            />
          </div>
          <p className={styles.note}>
            {settings.aspectRatio !== PROXY_ASPECT_RATIO && (
              <>
                <TriangleAlert size={12} aria-hidden /> The proxy is {PROXY_ASPECT_RATIO}, so the layout will be reframed to fit.{' '}
              </>
            )}
            {WORKSPACE_MODEL_LABEL}, counted toward your monthly limit
            {edited > 0 ? ` · uses your edits to ${edited} segment${edited > 1 ? 's' : ''}` : ''}
            {sending.length > 0 ? ` · plus ${sending.join(', ')}` : ''}
          </p>
        </div>
      )}

      {older.length > 0 && (
        <div className={styles.historyBlock}>
          <span className={styles.fieldLabel}>Earlier scenes</span>
          <div className={styles.history}>
            {older.map((r) => (
              <button
                key={r.id}
                type="button"
                className={styles.historyItem}
                onClick={() => setLightbox({ src: r.urls[0]!, alt: `${slug} scene ${new Date(r.createdAt).toLocaleString()}` })}
                aria-label={`View the scene generated ${new Date(r.createdAt).toLocaleString()}`}
              >
                <img className={styles.historyImg} src={r.urls[0]} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Lightbox state={lightbox} onClose={() => setLightbox(null)} />
      {story && (
        <FeedbackDialog
          result={feedbackTarget ? (ws.results.find((r) => r.id === feedbackTarget.resultId) ?? null) : null}
          imageIndex={feedbackTarget?.imageIndex ?? 1}
          elements={ratedElements(segments, ws)}
          brief={brief}
          spec={compose.spec}
          model={WORKSPACE_MODEL_LABEL}
          sceneSummary={story.story.sceneSummary}
          onClose={() => setFeedbackTarget(null)}
          onSaved={(imageIndex, record) => {
            const targetId = feedbackTarget?.resultId;
            updateWorkspace((w) => ({
              ...w,
              results: w.results.map((r) => (r.id === targetId ? { ...r, feedback: { ...r.feedback, [imageIndex]: record } } : r)),
            }));
            setFeedbackTarget(null);
            onFlash('Thanks — saved to Learning. Confirmed lessons feed the next prompts for this dish.');
          }}
        />
      )}
    </div>
  );
}

/** The latest image compared with the story, with a way to add the suggested fixes to the segments. */
export function SceneImageCheck({ gen }: { gen: SceneGenerator }) {
  const { latest, check } = gen;
  if (!latest) return <p className={styles.muted}>Generate a scene first; the agent then compares it with the story.</p>;
  return (
    <ImageCheckPanel
      resultId={latest.id}
      check={latest.check}
      state={{
        status: check.task.status,
        timing: check.task.timing,
        agentError: check.task.agentError,
        trpcError: check.task.trpcError,
        resultId: check.checkingId,
      }}
      onCheck={() => check.run(latest.id)}
      onApplyFixes={check.applyFixes}
      onSignedIn={() => void gen.onSignedIn(() => check.run(latest.id))}
    />
  );
}

function ResultTile({
  url,
  index,
  ratio,
  pass,
  verdict,
  onOpen,
  onRate,
}: {
  url: string;
  index: number;
  ratio: number;
  pass: boolean | undefined;
  verdict: string | undefined;
  onOpen: () => void;
  onRate: () => void;
}) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className={styles.tile}>
        <div className={styles.tileBroken} style={{ aspectRatio: ratio }}>
          <ImageOff size={16} aria-hidden />
          Link expired
        </div>
      </div>
    );
  }
  return (
    <div className={styles.tile} data-unusable={verdict === 'unusable' || undefined}>
      <button type="button" className={styles.tileButton} onClick={onOpen} aria-label={`View scene image ${index + 1} full size`}>
        <img className={styles.tileImg} src={url} alt={`Generated scene, variant ${index + 1}`} onError={() => setBroken(true)} />
      </button>
      {pass !== undefined && (
        <span className={pass ? styles.tileOk : styles.tileBad} role="img" aria-label={pass ? 'Matches the story' : "Doesn't match the story"}>
          {pass ? <CircleCheck size={14} aria-hidden /> : <TriangleAlert size={14} aria-hidden />}
        </span>
      )}
      <div className={styles.tileActions}>
        <Button size="sm" icon={<MessageSquareWarning size={14} aria-hidden />} aria-label={`Rate image ${index + 1}`} onPress={onRate}>
          {verdict ? 'Re-rate' : 'Rate'}
        </Button>
      </div>
    </div>
  );
}
