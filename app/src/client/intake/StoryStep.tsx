import { ChevronDown, ChevronRight, CircleCheck, CircleDashed, Download, Pencil, RotateCcw, TriangleAlert, Workflow, X } from 'lucide-react';
import { STYLING_TIPS } from '../lib/stylingTips.ts';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { MODEL_FRAMING_WIDEN } from '../../shared/rules.ts';
import { venueType } from '../../shared/venues.ts';
import type { LayoutOption } from '../../shared/solver.ts';
import { assemblePrompt, compositionSegments, productSwapPrompt, storyFacts, type Validation } from '../../shared/story.ts';
import {
  assembleWorkspacePrompt,
  isEdited,
  segmentText,
  workspaceSegments,
  WORKSPACE_MODEL_LABEL,
  type WorkspaceState,
  type WsSegment,
} from '../../shared/workspace.ts';
import { MODEL_PROXY_WIDTH, renderProxy } from '../lib/renderProxy.ts';
import { useAgentTask } from '../lib/useAgentTask.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import { savedUrls, useTurnarounds } from '../lib/useTurnarounds.ts';
import { Accordion } from '../ui/Accordion.tsx';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { CodeBlock } from '../ui/CodeBlock.tsx';
import { CopyButton, DownloadButton, triggerDownload } from '../ui/DownloadCopy.tsx';
import { SkeletonText } from '../ui/Skeleton.tsx';
import { TextArea } from '../ui/TextArea.tsx';
import { AgentStatus } from './AgentStatus.tsx';
import { imageCheckStatus, SceneHero, SceneImageCheck, useSceneGenerator } from './ScenePanel.tsx';
import { TurnaroundRow } from './TurnaroundRow.tsx';
import { reviewDirections, reviewFacts, type LayoutReview } from '../../shared/review.ts';
import { OCCASION_LABELS, type Brief, type ComposeResult, type StoryState } from './types.ts';
import type { Draft, SavedTurnaround } from './useIntake.ts';
import styles from './StoryStep.module.css';
import { StepActions } from './StepActions.tsx';

export function StoryStep({
  brief,
  compose,
  option,
  review,
  sketch,
  story,
  validation,
  onStory,
  onValidation,
  turnarounds,
  onTurnaroundView,
  ws,
  updateWorkspace,
  onOpenWorkspace,
}: {
  brief: Brief;
  compose: ComposeResult;
  option: LayoutOption;
  /** The sketch review: its directions go to the story agent, its placement changes into the layout guide. */
  review: LayoutReview | null;
  /** This layout's detailed sketch, when one was drawn: the approved plan, image 1 for the photograph. */
  sketch: Draft['sketch'];
  story: StoryState | null;
  validation: Validation | null;
  onStory: (s: StoryState) => void;
  onValidation: (v: Validation) => void;
  turnarounds: Record<string, SavedTurnaround>;
  onTurnaroundView: (label: string, text: string, index: number, url: string) => void;
  /** Shared with the node workspace: segment edits, the uploaded proxy and the scene results. */
  ws: WorkspaceState;
  updateWorkspace: (fn: (ws: WorkspaceState) => WorkspaceState) => void;
  onOpenWorkspace: () => void;
}) {
  const storyTask = useAgentTask('story');
  const validateTask = useAgentTask('validate');
  const onSignedIn = useOnSignedIn();
  const sku = compose.spec.sku;
  const turnaround = useTurnarounds(onTurnaroundView, { ...(sku.gtin ? { skuId: sku.id } : {}), glass: sku.glass, high: false });

  const generateStory = (notes?: string[]) => {
    storyTask.run({
      brief,
      spec: compose.spec,
      blueprint: option.blueprint,
      notes,
      directions: reviewDirections(review, option.blueprint),
    });
  };

  useEffect(() => {
    if (!story) generateStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (storyTask.result?.kind === 'story') {
      const facts = { ...storyFacts(compose.spec, option.blueprint), ...reviewFacts(review, option.blueprint, sketch) };
      const prompt = assemblePrompt(storyTask.result.story, facts);
      const swapPrompt = productSwapPrompt(compose.spec, facts);
      onStory({ story: storyTask.result.story, facts, prompt, swapPrompt });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyTask.result]);

  useEffect(() => {
    if (validateTask.result?.kind === 'validate') onValidation(validateTask.result.validation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateTask.result]);

  const runValidate = () => {
    if (!story) return;
    validateTask.run({ brief, spec: compose.spec, story: story.story });
  };

  // One proxy: the image model's framing factor (rules/camera-options.json) is 1, i.e. the true framing.
  const proxy = useMemo(
    () =>
      renderProxy(option.blueprint, compose.lighting, {
        width: MODEL_PROXY_WIDTH,
        widen: MODEL_FRAMING_WIDEN,
      }),
    [option, compose.lighting],
  );
  const slug = `${brief.heroDish}-${brief.country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'scene';

  const ruleResults = option.blueprint.layout_meta.rule_results;
  // Preferences (the odd count) never count against the layout.
  const rulesPassed = ruleResults.filter((r) => r.pass || r.soft).length;
  const rulesAllPass = rulesPassed === ruleResults.length;

  // The segments are the composition prompt's components, with the operator's edits (shared with the node
  // workspace); the prompt is built from them, so the two never drift.
  const segments = useMemo(() => (story ? workspaceSegments(story.story, story.facts) : []), [story]);
  const sameAs = useMemo(
    () => new Map(story ? compositionSegments(story.story, story.facts).map((sg) => [sg.key, sg.sameAs] as const) : []),
    [story],
  );
  const compositionPrompt = useMemo(() => (story ? assembleWorkspacePrompt(segments, ws) : ''), [story, segments, ws]);
  const segmentsText = segments.map((sg) => `${sg.chip} (${sg.title})\n${segmentText(sg, ws)}`).join('\n\n');
  const editedCount = segments.filter((sg) => isEdited(sg, ws)).length;
  const considerations = useMemo(() => splitConsiderations(story?.story.culturalNotes ?? []), [story]);
  const summaryText = story
    ? [
        story.story.sceneSummary,
        considerations.dos.length ? `Do:\n${considerations.dos.map((n) => `- ${n}`).join('\n')}` : '',
        considerations.donts.length ? `Do Not:\n${considerations.donts.map((n) => `- ${n}`).join('\n')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
    : '';
  const rulesText = ruleResults
    .map((r) => `[${r.pass ? 'PASS' : r.soft ? 'PREFERRED' : 'FAIL'}] ${r.id} ${r.name}: ${r.detail}`)
    .join('\n');

  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showFlash = (message: string) => {
    setFlash(message);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 6000);
  };
  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  const storyJson = () =>
    story &&
    triggerDownload(
      `${slug}-story.json`,
      JSON.stringify(
        {
          spec: compose.spec,
          ...story,
          prompt: compositionPrompt,
          segments: segments.map((sg) => ({ key: sg.key, chip: sg.chip, title: sg.title, text: segmentText(sg, ws) })),
        },
        null,
        2,
      ),
      'application/json',
    );

  const gen = useSceneGenerator({
    brief,
    compose,
    option,
    story,
    segments,
    ws,
    updateWorkspace,
    proxyDataUrl: proxy,
    onFlash: showFlash,
  });

  // The proxy lives with the LAYOUT GUIDE segment, the text that tells the image model how to read it.
  const sketchUrl = story?.facts.layoutSketch?.url;
  const proxyFigure = sketchUrl ? (
    <figure className={styles.proxyFigure}>
      <img className={styles.proxy} src={sketchUrl} alt="The approved pencil sketch: image 1 for the scene prompt" />
      <figcaption className={styles.proxyCaption}>
        <span className={styles.caption}>Approved sketch · image 1 for the scene prompt</span>
      </figcaption>
    </figure>
  ) : (
    <figure className={styles.proxyFigure}>
      <img className={styles.proxy} src={proxy} alt="Labeled proxy template: image 1 for the scene prompt" />
      <figcaption className={styles.proxyCaption}>
        <span className={styles.caption}>Proxy · image 1 for the scene prompt</span>
        <DownloadButton label="proxy image" onPress={() => triggerDownload(`${slug}-proxy.png`, proxy)} />
      </figcaption>
    </figure>
  );

  const storyBusy = storyTask.status === 'starting' || storyTask.status === 'polling';
  const validateBusy = validateTask.status === 'starting' || validateTask.status === 'polling';

  // One combined status for the merged "Checks" accordion header.
  const cultureLabel = validateBusy
    ? 'checking…'
    : validation?.pass
      ? 'passed'
      : validation
        ? `needs changes (${validation.notes.length})`
        : 'not checked';
  const checksTone =
    rulesAllPass && (!validation || validation.pass)
      ? styles.statusOk
      : !validateBusy && ((validation && !validation.pass) || !rulesAllPass)
        ? styles.statusWarn
        : styles.statusMuted;
  const checksMeta = (
    <span className={checksTone}>
      Layout {rulesPassed}/{ruleResults.length} · Culture: {cultureLabel} · Image: {imageCheckStatus(gen)}
    </span>
  );

  const titleLine = [
    brief.heroDish,
    OCCASION_LABELS[brief.occasion] ?? brief.occasion,
    venueType(compose.spec.scene.venue, compose.spec.scene.venueType)?.label ?? compose.spec.scene.venue,
    brief.region || brief.countryLabel || brief.country,
  ]
    .filter(Boolean)
    .join(', ');
  // Stories written before the brief summary existed fall back to the detailed one.
  const briefSummary = story?.story.briefSummary || '';

  return (
    <section>
      <h1>Story &amp; Scene</h1>
      <p>
        The agent writes the scene story, then {WORKSPACE_MODEL_LABEL} renders it from {sketchUrl ? 'your approved sketch' : 'the labeled proxy'} and the story's prompt segments.
        Edit any segment below and generate again.
      </p>

      {flash && (
        <Alert tone="success" title={flash} className={styles.flash}>
          <Button size="sm" variant="ghost" icon={<X size={14} aria-hidden />} aria-label="Dismiss" onPress={() => setFlash(null)} />
        </Alert>
      )}

      <div className={styles.accordionStack}>
        <SceneHero gen={gen} slug={slug} />

        <AgentStatus
          status={storyTask.status}
          timing={storyTask.timing}
          agentError={storyTask.agentError}
          trpcError={storyTask.trpcError}
          workingLabel="We are writing up a detailed summary of your scene. This will help us validate what is and what isn’t working in your composition."
          workingTitle="Scene Story"
          workingTips={STYLING_TIPS.story}
          overlay
          onSignedIn={() => onSignedIn(() => generateStory())}
          onRetry={() => generateStory()}
        />

        <section className={styles.brief} aria-labelledby="brief-summary">
          <h2 id="brief-summary" className={styles.briefLabel}>
            Brief summary
          </h2>
          <p className={styles.briefTitle}>{titleLine}</p>
          {story ? (
            <div className={styles.briefProse}>
              {(briefSummary || story.story.sceneSummary).split(/\n\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {!briefSummary && (
                <p className={styles.statusMuted}>This story was written before brief summaries, so this is the detailed summary.</p>
              )}
            </div>
          ) : storyBusy ? (
            <SkeletonText rows={4} />
          ) : (
            <p className={styles.statusMuted}>The summary appears here once the agent has written the story.</p>
          )}
        </section>

        <Group title="Cultural & Visual Authentication">
          <Accordion
            title="Design guides & cultural authenticity checklist"
            meta={story ? checksMeta : <span className={styles.statusMuted}>Waiting for the story</span>}
          >
            <div className={styles.checksBody}>
              <section>
                <div className={styles.blockHead}>
                  <h3 className={styles.blockLabel}>Cultural Accuracy</h3>
                  <Button
                    variant={validation ? 'default' : 'primary'}
                    size="sm"
                    loading={validateBusy}
                    disabled={!story || storyBusy}
                    onPress={runValidate}
                  >
                    {validation ? 'Check again' : 'Check cultural accuracy'}
                  </Button>
                </div>
                <div className={styles.checks}>
                  <AgentStatus
                    status={validateTask.status}
                    timing={validateTask.timing}
                    agentError={validateTask.agentError}
                    trpcError={validateTask.trpcError}
                    workingLabel="The agent is checking cultural accuracy"
                    onSignedIn={() => onSignedIn(runValidate)}
                    onRetry={runValidate}
                  />
                  {validation && !validation.pass && !validateBusy && (
                    <Alert tone="warning" title="Needs changes">
                      <ul className={styles.notesList}>
                        {validation.notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                      <div className={styles.actionRow}>
                        <Button size="sm" loading={storyBusy} onPress={() => generateStory(validation.notes)}>
                          Rewrite with these notes
                        </Button>
                      </div>
                    </Alert>
                  )}
                  {validation?.pass && !validateBusy && (
                    <p className={styles.statusOk}>
                      <CircleCheck size={14} aria-hidden /> The agent found nothing to change.
                    </p>
                  )}
                  {!validation && !validateBusy && (
                    <p className={styles.statusMuted}>
                      The agent reads the detailed scene summary against the knowledge base and lists anything that doesn't belong at this
                      table.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className={styles.blockLabel}>Generated Image</h3>
                <SceneImageCheck gen={gen} />
              </section>

              <section>
                <div className={styles.blockHead}>
                  <h3 className={styles.blockLabel}>Layout Rules</h3>
                  <DownloadButton label="layout rules" onPress={() => triggerDownload(`${slug}-rule-checks.txt`, rulesText)} />
                </div>
                <ul className={styles.ruleList}>
                  {ruleResults.map((r) => (
                    <li key={r.id} className={styles.rule}>
                      {r.pass ? (
                        <CircleCheck size={14} className={styles.ruleIconOk} aria-label="Passed" />
                      ) : r.soft ? (
                        <CircleDashed size={14} className={styles.ruleIconSoft} aria-label="Preference not met" />
                      ) : (
                        <TriangleAlert size={14} className={styles.ruleIconFail} aria-label="Failed" />
                      )}
                      <span className={styles.ruleId}>{r.id}</span>
                      <span className={styles.ruleBody}>
                        <strong>{r.name}</strong> <span className={styles.ruleDetail}>{r.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </Accordion>

          <Accordion
            title="Detailed scene summary"
            meta={
              <span className={styles.statusMuted}>
                {story ? 'Used for the cultural accuracy check' : storyBusy ? 'Being written…' : 'Not written yet'}
              </span>
            }
          >
            {story ? (
              <>
                <div className={styles.summaryGrid}>
                  <div className={styles.prose}>
                    {story.story.sceneSummary.split(/\n\n+/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <div className={styles.considerations}>
                    <h3>Considerations</h3>
                    {considerations.dos.length === 0 && considerations.donts.length === 0 && (
                      <p className={styles.statusMuted}>The agent listed no cultural do's or don'ts for this scene.</p>
                    )}
                    {considerations.dos.length > 0 && (
                      <>
                        <h4 className={styles.blockLabel}>Do</h4>
                        <ul className={styles.notesList}>
                          {considerations.dos.map((n, i) => (
                            <li key={i}>{n}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {considerations.donts.length > 0 && (
                      <>
                        <h4 className={styles.blockLabel}>Do Not</h4>
                        <ul className={styles.notesList}>
                          {considerations.donts.map((n, i) => (
                            <li key={i}>{n}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.summaryFooter}>
                  <Button aria-label="Download scene summary" onPress={() => triggerDownload(`${slug}-scene-summary.txt`, summaryText)}>
                    Download
                  </Button>
                </div>
              </>
            ) : (
              <p className={styles.statusMuted}>The summary appears here once the agent has written the story.</p>
            )}
          </Accordion>
        </Group>

        <Group title="Segments">
          <Accordion
            title="Scene components — prompts + thumbnails"
            meta={
              <span className={styles.statusMuted}>
                {story
                  ? `Proxy + ${segments.length} segments${editedCount > 0 ? ` · ${editedCount} edited` : ''} · edits save automatically`
                  : 'Proxy image · segments follow the story'}
              </span>
            }
            actions={
              story && <DownloadButton label="prompt segments" onPress={() => triggerDownload(`${slug}-prompt-segments.txt`, segmentsText)} />
            }
          >
            {story ? (
              <ol className={styles.labelList}>
                {segments.map((sg) => (
                  <SegmentRow
                    key={sg.key}
                    seg={sg}
                    ws={ws}
                    updateWorkspace={updateWorkspace}
                    turnaroundSlot={
                      sg.kind === 'guide' ? (
                        proxyFigure
                      ) : sg.kind === 'object' ? (
                        sameAs.get(sg.key) ? (
                          <p className={styles.statusMuted}>Same as {sameAs.get(sg.key)} — shares that label's image, no separate turnaround.</p>
                        ) : (
                          <TurnaroundRow
                            label={sg.chip}
                            title={sg.title}
                            urls={savedUrls(turnarounds[sg.key], segmentText(sg, ws))}
                            live={turnaround.live[sg.key]}
                            onGenerate={() => turnaround.generate([{ label: sg.key, text: segmentText(sg, ws) }])}
                          />
                        )
                      ) : null
                    }
                  />
                ))}
              </ol>
            ) : (
              <>
                {proxyFigure}
                <p className={styles.statusMuted}>The prompt segments appear here once the agent has written the story.</p>
              </>
            )}
          </Accordion>

          {story && (
            <Accordion
              title="Full scene prompt"
              meta={editedCount > 0 ? <span className={styles.statusMuted}>Includes your edits</span> : undefined}
              actions={
                <>
                  <CopyButton label="full scene prompt" text={compositionPrompt} />
                  <DownloadButton label="full scene prompt" onPress={() => triggerDownload(`${slug}-prompt-composition.txt`, compositionPrompt)} />
                </>
              }
            >
              <CodeBlock code={compositionPrompt} label="full scene prompt" />
            </Accordion>
          )}

          <Accordion title="JSON files" meta={<span className={styles.statusMuted}>Blueprint and story JSON</span>}>
            <div className={styles.downloads}>
              <Button
                icon={<Download size={16} aria-hidden />}
                onPress={() => triggerDownload(`${slug}-blueprint.json`, JSON.stringify(option.blueprint, null, 2), 'application/json')}
              >
                Blueprint JSON
              </Button>
              <Button icon={<Download size={16} aria-hidden />} disabled={!story} onPress={storyJson}>
                Story JSON
              </Button>
            </div>
          </Accordion>
        </Group>
      </div>
      <StepActions>
        {story && (
          <Button variant="primary" icon={<Workflow size={16} aria-hidden />} onPress={onOpenWorkspace}>
            Open in workspace
          </Button>
        )}
      </StepActions>
    </section>
  );
}

/** A collapsible group of accordions (Cultural & Visual Authentication, Segments), open to start with. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <details className={styles.group} open onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className={styles.groupSummary}>
        <h2 className={styles.groupTitle}>{title}</h2>
        <span className={styles.groupChevron} aria-hidden>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </summary>
      <div className={styles.groupBody}>{children}</div>
    </details>
  );
}

/** One prompt segment: its text, editable in place (saved to the shared workspace edits), with Reset back to the story's wording. */
function SegmentRow({
  seg,
  ws,
  updateWorkspace,
  turnaroundSlot,
}: {
  seg: WsSegment;
  ws: WorkspaceState;
  updateWorkspace: (fn: (ws: WorkspaceState) => WorkspaceState) => void;
  turnaroundSlot: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const text = segmentText(seg, ws);
  const edited = isEdited(seg, ws);
  const setText = (v: string) =>
    updateWorkspace((w) => {
      const edits = { ...w.edits };
      if (v === seg.baseText) delete edits[seg.key];
      else edits[seg.key] = v;
      return { ...w, edits };
    });

  return (
    <li className={styles.labelRow}>
      <div className={styles.labelHead}>
        <code className={[styles.chip, seg.kind !== 'object' && styles.chipBg].filter(Boolean).join(' ')}>{seg.chip}</code>
        <span className={styles.labelRole}>{seg.title}</span>
        <span className={styles.labelWhat}>{seg.note}</span>
        {seg.fixed && !edited && <span className={styles.fixedTag}>Fixed wording</span>}
        {edited && <span className={styles.editedTag}>Edited</span>}
        <span className={styles.segmentActions}>
          {edited && (
            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} aria-hidden />} onPress={() => setText(seg.baseText)}>
              Reset
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon={editing ? undefined : <Pencil size={14} aria-hidden />}
            aria-label={editing ? `Done editing ${seg.chip}` : `Edit ${seg.chip}`}
            onPress={() => setEditing((e) => !e)}
          >
            {editing ? 'Done' : 'Edit'}
          </Button>
        </span>
      </div>
      {turnaroundSlot}
      {editing ? (
        <TextArea
          aria-label={`${seg.chip} segment text`}
          value={text}
          onChange={setText}
          rows={Math.min(12, Math.max(3, Math.ceil(text.length / 90)))}
          autoFocus
        />
      ) : (
        text.split(/\n\n+/).map((para, i) => (
          <p key={i} className={styles.labelText}>
            {para}
          </p>
        ))
      )}
    </li>
  );
}

const DONT = /^\s*(don['’]?t|do not|never|avoid|no\b|not\b)/i;

/** Splits the agent's cultural notes into the Do / Do Not columns of the scene summary. */
function splitConsiderations(notes: string[]) {
  const dos: string[] = [];
  const donts: string[] = [];
  for (const n of notes) (DONT.test(n) ? donts : dos).push(n);
  return { dos, donts };
}
