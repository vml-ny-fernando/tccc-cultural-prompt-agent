import { Check, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { specForLayout } from '../shared/layoutEdit.ts';
import { defaultCamera } from '../shared/rules.ts';
import { layoutKey, reviewFacts, sketchKey } from '../shared/review.ts';
import type { LayoutOption } from '../shared/solver.ts';
import type { AccentChoice, Decision, PlatingChoice, PrepChoice, SidesChoice, SurfaceChoice } from '../shared/types.ts';
import { AppShell } from './layouts/AppShell.tsx';
import { trpc } from './trpc.ts';
import { Alert } from './ui/Alert.tsx';
import { Button } from './ui/Button.tsx';
import { EmptyState } from './ui/EmptyState.tsx';
import { SegmentedControl } from './ui/SegmentedControl.tsx';
import { ErrorBoundary } from './ui/ErrorBoundary.tsx';
import { BriefStep } from './intake/BriefStep.tsx';
import { ArrangementBar, OPTION_LETTERS } from './intake/ArrangementBar.tsx';
import { TableStep } from './intake/TableStep.tsx';
import { PlatingStep } from './intake/PlatingStep.tsx';
import { PrepStep } from './intake/PrepStep.tsx';
import { ReviewStep } from './intake/ReviewStep.tsx';
import { SceneStep } from './intake/SceneStep.tsx';
import { SidesStep } from './intake/SidesStep.tsx';
import { StoryStep } from './intake/StoryStep.tsx';
import { STEP_ORDER, briefOk, type ComposeResult, type StepId } from './intake/types.ts';
import { useIntake } from './intake/useIntake.ts';
import { useSessionSync } from './intake/useSessionSync.ts';
import { WorkspaceOverlay } from './intake/WorkspaceOverlay.tsx';
import { WorkspaceStep } from './intake/WorkspaceStep.tsx';
import { StepBackContext } from './intake/StepActions.tsx';
import { AdminPage } from './admin/AdminPage.tsx';
import { setActiveBrief } from './lib/activeBrief.ts';
import { envLabel, signOut } from './lib/auth.ts';
import { LearningPage } from './learning/LearningPage.tsx';
import { MyScenesPage } from './studio/MyScenesPage.tsx';
import { HomePage, InsightsPage, WhatsNewPage } from './studio/HomePage.tsx';
import { SnapshotPage } from './studio/SnapshotPage.tsx';
import { AboutPage } from './studio/AboutPage.tsx';
import { SkusPage } from './skus/SkusPage.tsx';
import styles from './App.module.css';

/** Every top-level view, each at its own `#hash` so a reload or a shared link
 * lands back on the same page. Home (the shared dashboard) has none. */
const VIEW_HASH = {
  home: '',
  compose: '#compose',
  insights: '#insights',
  whatsNew: '#whats-new',
  about: '#about',
  snapshot: '#snapshot',
  mine: '#my-projects',
  skus: '#skus',
  admin: '#admin',
  learning: '#admin/learning',
} as const;
type View = keyof typeof VIEW_HASH;

/** Hashes from earlier versions of the app. */
const OLD_HASH: Record<string, View> = { '#studio': 'home', '#learning': 'learning', '#my-scenes': 'mine' };

/** The intake's own state lives in `useIntake()` regardless of which view is
 * rendered, so switching views never resets the draft. */
function viewFromHash(): View {
  const hash = window.location.hash;
  const hit = (Object.keys(VIEW_HASH) as View[]).find((k) => VIEW_HASH[k] && VIEW_HASH[k] === hash);
  return hit ?? OLD_HASH[hash] ?? 'home';
}

function openView(view: View) {
  if (VIEW_HASH[view]) {
    window.location.hash = VIEW_HASH[view];
  } else {
    // Clears the hash without leaving a trailing "#" in the address bar.
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

const STEP_META: Record<StepId, { label: string }> = {
  brief: { label: 'Getting Started' },
  scene: { label: 'Time & Place' },
  prep: { label: 'Preparation' },
  plating: { label: 'Plating' },
  sides: { label: 'Sides' },
  camera: { label: 'Camera Angle' },
  layout: { label: 'Tablescape & Camera' },
  review: { label: 'Sketch Review' },
  story: { label: 'Story & Scene' },
  workspace: { label: 'Node workspace' },
};

/**
 * An arrangement edited in the sketch editor may have left dishes out: the steps after it
 * see the spec as that layout shows it, so the story and prompts never bring them back.
 */
const editedCompose = new WeakMap<LayoutOption, { from: ComposeResult; result: ComposeResult }>();
function composeFor(compose: ComposeResult, option: LayoutOption): ComposeResult {
  if (!option.edit) return compose;
  const hit = editedCompose.get(option);
  if (hit && hit.from === compose) return hit.result;
  const spec = specForLayout(compose.spec, option.blueprint);
  const result = spec === compose.spec ? compose : { ...compose, spec };
  editedCompose.set(option, { from: compose, result });
  return result;
}

export function App() {
  const profile = trpc.profile.useQuery();
  const {
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
  } = useIntake();
  useSessionSync(draft);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [view, setView] = useState<View>(viewFromHash);
  useEffect(() => {
    void envLabel()
      .then((label) => {
        if (label && !document.title.startsWith(`[${label}]`)) document.title = `[${label}] ${document.title}`;
      })
      .catch(() => {});
  }, []);
  const config = trpc.config.useQuery();

  // Every generated image is filed under the brief being worked on (Studio and My scenes read it).
  useEffect(() => {
    const b = draft.brief;
    setActiveBrief({
      country: b.country,
      countryLabel: config.data?.countries.find((c) => c.id === b.country)?.label,
      region: b.region,
      heroDish: b.heroDish,
      occasion: b.occasion,
      skuId: b.skuId,
    });
  }, [draft.brief, config.data]);

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Publish the frozen step headline's height so sticky parts below it (the sketch, the composition list) clear it.
  const stepBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const body = stepBodyRef.current;
    if (!body) return;
    const root = document.documentElement;
    let heading: Element | null = null;
    const sizer = new ResizeObserver(([entry]) => {
      root.style.setProperty('--app-step-head-h', `${Math.ceil(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height)}px`);
    });
    const track = () => {
      const next = body.querySelector(':scope > section > h1');
      if (next === heading) return;
      if (heading) sizer.unobserve(heading);
      heading = next;
      if (heading) sizer.observe(heading);
      else root.style.removeProperty('--app-step-head-h');
    };
    track();
    const watcher = new MutationObserver(track);
    watcher.observe(body, { childList: true, subtree: true });
    return () => {
      watcher.disconnect();
      sizer.disconnect();
      root.style.removeProperty('--app-step-head-h');
    };
  }, [view]);

  const rulesQuery = trpc.rules.useQuery({ brief: draft.brief, selections: draft.sel }, { enabled: !!draft.brief.skuId && view === 'compose' });
  const rules = rulesQuery.data ?? null;

  const canVisit = (id: StepId): boolean => {
    switch (id) {
      case 'brief':
        return true;
      case 'scene':
        return briefOk(draft.brief);
      case 'prep':
        return briefOk(draft.brief) && !!draft.sel.scene;
      case 'plating':
        return !!draft.sel.prep && !!draft.sel.scene;
      case 'sides':
        return !!draft.sel.plating;
      case 'layout':
        // Tablescape & Camera: the table is laid out, then seen from each angle, on one page (2026-11-12).
        return !!draft.sel.sides && !!draft.sel.scene;
      case 'camera':
        return !!draft.sel.sides && !!draft.sel.scene && !!draft.compose && draft.picked !== null;
      case 'review':
        return !!draft.sel.camera && !!draft.sel.scene && !!draft.compose && draft.picked !== null;
      case 'story':
        return draft.picked !== null;
      case 'workspace':
        return draft.picked !== null && !!draft.story;
    }
  };

  const stepOrder = STEP_ORDER;
  // The node workspace sits outside the rail; it goes back to Story & scene.
  const currentIndex = draft.step === 'workspace' ? stepOrder.length : stepOrder.indexOf(draft.step);

  const prevStep = draft.step === 'workspace' ? 'story' : currentIndex > 0 ? stepOrder[currentIndex - 1] : undefined;
  const back = prevStep ? { label: STEP_META[prevStep].label, onBack: () => setStep(prevStep) } : undefined;

  const goTo = (id: StepId) => {
    if (canVisit(id)) setStep(id);
  };

  // A review only counts for the layout it was made on.
  const reviewFor = (option: LayoutOption) => (draft.review && draft.review.key === layoutKey(option.blueprint) ? draft.review : null);
  const sketchFor = (option: LayoutOption) => draft.sketches[sketchKey(option.blueprint)] ?? draft.sketch;
  // The story's layout image and the art director's changes follow the latest sketch and review, so a
  // redraw after the story was written still becomes image 1 of the photograph.
  const pickedOption = draft.compose && draft.picked !== null ? draft.compose.options[draft.picked] : undefined;
  const live = useMemo(() => {
    if (!draft.story || !pickedOption) return draft.story;
    const review = draft.review && draft.review.key === layoutKey(pickedOption.blueprint) ? draft.review : null;
    const sketch = draft.sketches[sketchKey(pickedOption.blueprint)] ?? draft.sketch;
    return { ...draft.story, facts: { ...draft.story.facts, ...reviewFacts(review, pickedOption.blueprint, sketch) } };
  }, [draft.story, draft.review, draft.sketches, draft.sketch, pickedOption]);

  // The table is laid out before the Camera Angle step, through the angle recommended for the dish
  // until one is picked (the solver and the rules need a camera).
  useEffect(() => {
    if ((draft.step === 'layout' || draft.step === 'camera') && !draft.sel.camera) ensureCamera(defaultCamera({ dish: draft.brief.heroDish, prep: draft.sel.prep, plating: draft.sel.plating }));
  }, [draft.step, draft.sel.camera, draft.brief.heroDish, draft.sel.prep, draft.sel.plating, ensureCamera]);

  const renderStep = (step: typeof draft.step) => {
    switch (step) {
      case 'brief':
        return (
          <BriefStep
            brief={draft.brief}
            onSave={setBrief}
            onNext={() => setStep('scene')}
          />
        );

      case 'prep':
        return (
          <PrepStep
            brief={draft.brief}
            sel={draft.sel}
            decision={(draft.decisions.prep as Decision<PrepChoice> | undefined) ?? null}
            selected={draft.sel.prep}
            clearsNote={draft.sel.prep ? describeClears('prep') : null}
            onDecision={(d) => setDecision('prep', d)}
            onPick={(v) => choose('prep', v)}
            onNext={() => setStep('plating')}
          />
        );

      case 'plating':
        return (
          <PlatingStep
            brief={draft.brief}
            sel={draft.sel}
            decision={(draft.decisions.plating as Decision<PlatingChoice> | undefined) ?? null}
            selected={draft.sel.plating}
            clearsNote={draft.sel.plating ? describeClears('plating') : null}
            onDecision={(d) => setDecision('plating', d)}
            onPick={(v) => choose('plating', v)}
            onNext={() => setStep('sides')}
          />
        );

      case 'sides':
        return (
          <SidesStep
            brief={draft.brief}
            sel={draft.sel}
            decision={(draft.decisions.sides as Decision<SidesChoice> | undefined) ?? null}
            selected={draft.sel.sides}
            clearsNote={draft.sel.sides ? describeClears('sides') : null}
            onDecision={(d) => setDecision('sides', d)}
            onPick={(v) => choose('sides', v)}
            onNext={() => setStep('layout')}
          />
        );

      case 'scene':
        return (
          <SceneStep
            brief={draft.brief}
            sel={draft.sel}
            rules={rules}
            clearsNote={draft.sel.scene ? describeClears('scene') : null}
            surfaceDecision={(draft.decisions.surface as Decision<SurfaceChoice> | undefined) ?? null}
            onSurfaceDecision={(d) => setDecision('surface', d)}
            onScene={(s) => choose('scene', s)}
            onPlace={setPlace}
            onGlass={(g) => choose('glass', g)}
            onNext={() => setStep('prep')}
          />
        );

      case 'camera':
      case 'layout':
      case 'review': {
        const accentDecision = (draft.decisions.accent as Decision<AccentChoice> | undefined) ?? null;
        const onAccentDecision = (d: Decision<AccentChoice>) => setDecision('accent', d);
        const onAccent = (v: AccentChoice | null) => choose('accent', v);
        const onNapkin = () => {
          // Picking the napkin replaces any accent (choosing the accent clears the napkin, which comes after it).
          choose('accent', null);
          choose('napkin', true);
        };
        const compose = draft.compose;
        const option = compose && draft.picked !== null ? compose.options[draft.picked] : undefined;
        if (step === 'layout' || step === 'camera') {
          return (
            <TableStep
              brief={draft.brief}
              sel={draft.sel}
              rules={rules}
              accentDecision={accentDecision}
              onAccentDecision={onAccentDecision}
              onAccent={onAccent}
              onNapkin={onNapkin}
              compose={compose}
              picked={draft.picked}
              onCompose={setCompose}
              onPick={setPicked}
              onBackToSides={() => setStep('sides')}
              onWorkingLayout={(bp, camera) => setWorkingLayout(bp, camera)}
              onNext={() => setStep('review')}
            />
          );
        }
        if (!compose || !option) {
          return (
            <EmptyState
              title="Lay out the table first"
              hint="The sketch is drawn from your tablescape and the camera angle you pick for it."
              action={<Button onPress={() => setStep('layout')}>Go to Tablescape &amp; Camera</Button>}
            />
          );
        }
        const key = sketchKey(option.blueprint);
        return (
          <ReviewStep
            // A fresh step per arrangement: its marks, selection and sketch run belong to that layout.
            key={key}
            compose={composeFor(compose, option)}
            option={option}
            sourceName={`arrangement ${OPTION_LETTERS[option.edit?.from ?? draft.picked!]}`}
            onEditLayout={({ blueprint, review }) =>
              addEditedLayout({ archetype: option.archetype, blueprint, edit: { from: option.edit?.from ?? draft.picked! } }, review)
            }
            review={reviewFor(option)}
            onReview={setReview}
            onPerson={setPerson}
            detail={draft.sketches[key] ?? draft.sketch}
            onDetail={setSketch}
            hasStory={!!draft.story}
            arrangement={(drawing) => (
              <ArrangementBar
                brief={draft.brief}
                sel={draft.sel}
                rules={rules}
                accentDecision={accentDecision}
                onAccentDecision={onAccentDecision}
                compose={compose}
                picked={draft.picked!}
                onPick={setPicked}
                hasSketch={(i) => !!draft.sketches[sketchKey(compose.options[i]!.blueprint)]}
                onAccent={onAccent}
                onNapkin={onNapkin}
                drawing={drawing}
                stage="review"
              />
            )}
            onNext={() => setStep('story')}
          />
        );
      }

      case 'story': {
        const option = draft.compose && draft.picked !== null ? draft.compose.options[draft.picked] : undefined;
        if (!draft.compose || !option) {
          return (
            <EmptyState
              title="Pick a layout first"
              hint="Go to Sketch Review, which picks the best layout for this table."
              action={<Button onPress={() => setStep('review')}>Go to Sketch Review</Button>}
            />
          );
        }
        return (
          <StoryStep
            brief={draft.brief}
            compose={composeFor(draft.compose, option)}
            option={option}
            review={reviewFor(option)}
            sketch={sketchFor(option)}
            story={live}
            validation={draft.validation}
            onStory={setStory}
            onValidation={setValidation}
            turnarounds={draft.turnarounds}
            onTurnaroundView={setTurnaroundView}
            ws={draft.workspace}
            updateWorkspace={updateWorkspace}
            onOpenWorkspace={() => setStep('workspace')}
          />
        );
      }

      case 'workspace': {
        const option = draft.compose && draft.picked !== null ? draft.compose.options[draft.picked] : undefined;
        if (!draft.compose || !option || !draft.story) {
          return (
            <EmptyState
              title="Create the scene first"
              hint="Go back to Story & Scene and create the scene."
              action={<Button onPress={() => setStep('story')}>Go to Story & Scene</Button>}
            />
          );
        }
        return (
          <WorkspaceStep
            brief={draft.brief}
            compose={composeFor(draft.compose, option)}
            option={option}
            story={live!}
            ws={draft.workspace}
            updateWorkspace={updateWorkspace}
            saved={saved}
          />
        );
      }
    }
  };

  const isAdmin = profile.data?.role === 'admin';
  const draftInProgress = draft.step !== 'brief' || !!draft.brief.heroDish.trim();
  const menuItems = [
    // Get Started opens the scene builder where it was left; it doesn't clear a draft.
    { id: 'compose', label: 'Get Started', current: view === 'compose', accent: true },
    { id: 'about', label: 'About Us', current: view === 'about' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', current: view === 'admin' || view === 'learning' }] : []),
    { id: 'whatsNew', label: "What's New", current: view === 'whatsNew' },
    { id: 'snapshot', label: 'Global Snapshot', current: view === 'snapshot' },
    { id: 'mine', label: 'My Projects', current: view === 'mine' },
    // Insights and Adding SKUs are out of the menu for now; their pages still open at #insights and #skus.
  ];

  return (
    <AppShell
      title={
        <a
          href="/"
          className={styles.logoLink}
          aria-label="Scene Composer home"
          onClick={(e) => {
            e.preventDefault();
            openView('home');
          }}
        >
          <img src="/scene-composer-logo.png" alt="Scene Composer" className={styles.logoImg} />
        </a>
      }
      user={profile.data ?? undefined}
      onSignOut={() => void signOut()}
      menuItems={menuItems}
      onMenuAction={(id) => openView(id as View)}
      actions={
        view !== 'compose' ? null : confirmingReset ? (
          <div className={styles.confirmRow}>
            <span className={styles.confirmText}>Start over and clear the whole draft?</span>
            <Button size="sm" onPress={() => setConfirmingReset(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onPress={() => {
                startOver();
                setConfirmingReset(false);
              }}
            >
              Start over
            </Button>
          </div>
        ) : (
          <>
            <Button variant="ghost" size="sm" icon={<RotateCcw size={14} aria-hidden />} onPress={() => setConfirmingReset(true)}>
              Start over
            </Button>
          </>
        )
      }
      maxWidth={view === 'compose' ? 1360 : 1200}
    >
      {view === 'admin' || view === 'learning' ? (
        <ErrorBoundary label="admin">
          {isAdmin ? (
            <>
              <SegmentedControl
                aria-label="Admin section"
                className={styles.adminTabs}
                value={view}
                onChange={(v) => openView(v as View)}
                options={[
                  { value: 'admin', label: 'People' },
                  { value: 'learning', label: 'Learning' },
                ]}
              />
              {view === 'admin' ? <AdminPage selfEmail={profile.data?.email ?? ''} /> : <LearningPage />}
            </>
          ) : (
            <EmptyState title="Only admins can open this page." />
          )}
        </ErrorBoundary>
      ) : view === 'home' ? (
        <ErrorBoundary label="studio">
          <HomePage
            name={profile.data?.name ?? ''}
            draftInProgress={draftInProgress}
            onContinue={() => openView('compose')}
            onNewScene={() => {
              startOver();
              openView('compose');
            }}
          />
        </ErrorBoundary>
      ) : view === 'insights' ? (
        <ErrorBoundary label="insights">
          <InsightsPage onSnapshot={() => openView('snapshot')} />
        </ErrorBoundary>
      ) : view === 'whatsNew' ? (
        <ErrorBoundary label="what's new">
          <WhatsNewPage />
        </ErrorBoundary>
      ) : view === 'about' ? (
        <ErrorBoundary label="about us">
          <AboutPage />
        </ErrorBoundary>
      ) : view === 'snapshot' ? (
        <ErrorBoundary label="global snapshot">
          <SnapshotPage />
        </ErrorBoundary>
      ) : view === 'skus' ? (
        <ErrorBoundary label="SKUs">
          <SkusPage />
        </ErrorBoundary>
      ) : view === 'mine' ? (
        <ErrorBoundary label="my scenes">
          <MyScenesPage
            onNewScene={() => openView('compose')}
            currentSessionId={draft.sessionId}
            draftInProgress={draftInProgress}
            onOpenSession={(saved) => {
              restoreSession(saved);
              openView('compose');
            }}
          />
        </ErrorBoundary>
      ) : (
        <div className={styles.layout}>
          <div className={styles.railColumn}>
            <ErrorBoundary label="step navigation">
              <nav className={styles.rail} aria-label="Intake steps">
                {stepOrder.map((id, i) => {
                  const meta = STEP_META[id];
                  // The node workspace opens over Story & scene, so that step stays current.
                  const isActive = id === (draft.step === 'workspace' ? 'story' : draft.step);
                  const isDone = i < currentIndex;
                  const reachable = canVisit(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      className={styles.railItem}
                      data-active={isActive || undefined}
                      data-done={isDone || undefined}
                      disabled={!reachable}
                      aria-current={isActive ? 'step' : undefined}
                      onClick={() => goTo(id)}
                    >
                      <span className={styles.railNumber} aria-hidden>
                        {i + 1}
                      </span>
                      <span className={styles.railLabel}>{meta.label}</span>
                      {isDone && <Check size={16} className={styles.railCheck} aria-hidden />}
                    </button>
                  );
                })}
              </nav>
            </ErrorBoundary>
            <div className={styles.savedRow} role="status">
              {saved && (
                <>
                  <Check size={12} className={styles.savedIcon} aria-hidden />
                  Draft saved
                </>
              )}
            </div>
          </div>

          <section className={styles.panel}>
            {rulesQuery.isError && draft.brief.skuId && (
              <Alert tone="error" title="Couldn't load the rule effects for this brief">
                {rulesQuery.error.message}
              </Alert>
            )}
            <ErrorBoundary label={STEP_META[draft.step === 'workspace' ? 'story' : draft.step].label.toLowerCase()}>
              <StepBackContext.Provider value={back}>
                <div ref={stepBodyRef} className={styles.stepBody}>
                  {renderStep(draft.step === 'workspace' ? 'story' : draft.step)}
                </div>
                <WorkspaceOverlay isOpen={draft.step === 'workspace'} onClose={() => setStep('story')}>
                  <ErrorBoundary label="node workspace">{draft.step === 'workspace' && renderStep('workspace')}</ErrorBoundary>
                </WorkspaceOverlay>
              </StepBackContext.Provider>
            </ErrorBoundary>
          </section>

        </div>
      )}
    </AppShell>
  );
}
