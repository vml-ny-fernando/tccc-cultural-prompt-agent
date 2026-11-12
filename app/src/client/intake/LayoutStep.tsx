// The step between Camera and the sketch, done for the operator: when the item
// count is even it adds the suggested accent (the plain paper napkin on the go),
// composes the layouts and picks the top-ranked one, then Sketch review takes
// over. The other arrangements and the accent are changed from the sketch
// (ArrangementBar). Only a failure or a table nothing fits stops here.

import { STYLING_TIPS } from '../lib/stylingTips.ts';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { RuleEffects } from '../../api.ts';
import { type Selections } from '../../shared/spec.ts';
import type { AccentChoice, Decision } from '../../shared/types.ts';
import { recordDuration, useProgress } from '../lib/progress.ts';
import { useAgentTask } from '../lib/useAgentTask.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import { trpc } from '../trpc.ts';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { ProgressRing } from '../ui/ProgressRing.tsx';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import { AgentStatus } from './AgentStatus.tsx';
import type { Brief, ComposeResult } from './types.ts';
import styles from './LayoutStep.module.css';

/** The selections the solver composes with: an accent/napkin left over from a rules change that no longer calls for one is ignored. */
export function composeSelections(sel: Selections, needsAccent: boolean | undefined): Selections {
  return { ...sel, accent: needsAccent ? sel.accent : null, napkin: needsAccent ? !!sel.napkin : false };
}

export function PrepareLayout({
  brief,
  sel,
  rules,
  accentDecision,
  onAccentDecision,
  onAccent,
  onNapkin,
  compose,
  onCompose,
  onPick,
  onBack,
  onBackToSides,
  title = 'Review the Sketch',
  lede = "Picking the best layout for this table. The sketch starts drawing as soon as it's ready, and you can try other arrangements from there.",
}: {
  brief: Brief;
  sel: Selections;
  rules: RuleEffects | null;
  accentDecision: Decision<AccentChoice> | null;
  onAccentDecision: (d: Decision<AccentChoice>) => void;
  onAccent: (v: AccentChoice | null) => void;
  onNapkin: () => void;
  compose: ComposeResult | null;
  onCompose: (c: ComposeResult) => void;
  onPick: (i: number) => void;
  /** Back to Tablescape & Camera (older drafts that reach this from Sketch Review). */
  onBack?: (() => void) | undefined;
  /** Back to Sides, to pick a smaller set when nothing fits. */
  onBackToSides: () => void;
  title?: string;
  lede?: string;
}) {
  const needsAccent = rules?.needsAccent;
  const onTheGo = sel.scene?.venue === 'on-the-go';
  const accentAnswered = needsAccent === false || sel.accent !== undefined;

  // 1. The accent: on the go the plain paper napkin, elsewhere the cultural agent's suggestion.
  const accentTask = useAgentTask('accent');
  const onSignedIn = useOnSignedIn();
  const askAccent = () => accentTask.run({ brief, selections: sel });
  const askedRef = useRef(false);
  useEffect(() => {
    if (!rules || accentAnswered || askedRef.current) return;
    askedRef.current = true;
    if (onTheGo) onNapkin();
    else if (!accentDecision) askAccent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, accentAnswered]);
  // Once per answer: the parent's callback is a fresh function each render.
  useEffect(() => {
    if (accentTask.result?.kind === 'accent') onAccentDecision(accentTask.result.decision);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accentTask.result]);
  useEffect(() => {
    if (accentAnswered || onTheGo || !accentDecision) return;
    onAccent(accentDecision.options[0]?.value ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accentDecision, accentAnswered]);

  // 2. Compose, then take the top-ranked layout.
  const composeMutation = trpc.compose.useMutation();
  const [composeStart, setComposeStart] = useState<number | null>(null);
  const runCompose = () => {
    const begun = Date.now();
    setComposeStart(begun);
    composeMutation.mutate(
      { brief, selections: composeSelections(sel, needsAccent) },
      {
        onSuccess: (c) => {
          recordDuration('compose', begun);
          onCompose(c);
        },
      },
    );
  };
  useEffect(() => {
    if (rules && accentAnswered && !compose && !composeMutation.isPending) runCompose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, accentAnswered, compose]);
  // Fresh layouts (or a draft saved with none picked): take the top-ranked one.
  useEffect(() => {
    if (compose?.options.length) onPick(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compose]);

  const composeProgress = useProgress('compose', composeMutation.isPending ? composeStart : null);
  const accentFailed = accentTask.status === 'error';
  const accentBusy = accentTask.status === 'starting' || accentTask.status === 'polling';
  const accentProgress = useProgress(accentTask.timing.key, accentBusy ? accentTask.timing.startedAt : null, accentTask.timing.reported);

  const intro = (
    <>
      <h1>{title}</h1>
      <p>{lede}</p>
    </>
  );

  if (compose && compose.options.length === 0) {
    // Only reached once the solver has tried every other angle, a larger table and leaving out
    // condiments and extra sides (solve(), 2026-11-11), so the way out is a smaller set of sides.
    const onTable = compose.spec.accompaniments.map((a) => a.name);
    return (
      <section>
        {intro}
        <EmptyState
          title="This table is too full to arrange"
          hint={
            <>
              We tried every camera angle, a larger table, and leaving out the condiments and extra sides, and the{' '}
              {compose.spec.entree.name}
              {onTable.length ? ` with ${onTable.join(', ')}` : ''} still doesn't fit together. Go back to Sides and pick a set with fewer or
              smaller dishes, or describe a lighter one in "Describe what you would like to see".
              <details className={styles.why}>
                <summary>Technical detail</summary>
                {compose.infeasible.map((f) => (
                  <div key={f.archetype}>
                    {f.archetype}: {f.reason}
                  </div>
                ))}
              </details>
            </>
          }
          action={
            <div className={styles.emptyActions}>
              <Button variant="primary" icon={<ArrowLeft size={16} aria-hidden />} onPress={onBackToSides}>
                Back to Sides
              </Button>
              {onBack && (
                <Button icon={<ArrowLeft size={16} aria-hidden />} onPress={onBack}>
                  Back to Tablescape &amp; Camera
                </Button>
              )}
            </div>
          }
        />
      </section>
    );
  }

  return (
    <section>
      {intro}
      {/* Errors and sign-in sit above the frame; every wait shows as the ring inside it, like the sketch's own. */}
      {(composeMutation.isError || (rules && !accentAnswered && !accentBusy && accentTask.status !== 'idle')) && (
        <div className={styles.prepStatus} aria-live="polite">
          {composeMutation.isError ? (
            <Alert tone="error" title="Couldn't compose a layout">
              {composeMutation.error.message}
              <div className={styles.retryRow}>
                <Button size="sm" icon={<RotateCw size={14} aria-hidden />} onPress={runCompose}>
                  Try again
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              <AgentStatus
                status={accentTask.status}
                timing={accentTask.timing}
                agentError={accentTask.agentError}
                trpcError={accentTask.trpcError}
                workingLabel="Picking a small accent to make the item count odd"
                onSignedIn={() => onSignedIn(askAccent)}
                onRetry={askAccent}
                skeletonCards={0}
              />
              {accentFailed && (
                <div className={styles.retryRow}>
                  <Button size="sm" onPress={() => onAccent(null)}>
                    Continue without an accent
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div className={styles.prepFrame}>
        <SkeletonBlock height="100%" />
        {composeMutation.isError ? null : !rules ? (
          <ProgressRing label="Checking what the table needs" progress={null} />
        ) : !accentAnswered ? (
          accentBusy || accentTask.status === 'idle' ? (
            <ProgressRing label="Picking a small accent to make the item count odd" progress={accentProgress ?? null} tips={STYLING_TIPS.oddCount} />
          ) : null
        ) : (
          <ProgressRing label="Composing the layout" progress={composeProgress ?? { percent: 0, secondsLeft: null, estimated: true }} tips={STYLING_TIPS.layout} />
        )}
      </div>
    </section>
  );
}
