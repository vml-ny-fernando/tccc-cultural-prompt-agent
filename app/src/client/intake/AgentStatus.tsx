// The status line + skeleton + error handling every agent-backed step shows
// while its decision task runs, shared so sign-in/forbidden handling stays
// consistent everywhere it's needed.

import { SignInPrompt, signInRequiredFrom } from '../lib/signIn.tsx';

import { type Progress, useProgress } from '../lib/progress.ts';
import type { AgentTaskStatus, TaskTiming } from '../lib/useAgentTask.ts';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { LoadingOverlay } from '../ui/LoadingOverlay.tsx';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import styles from './AgentStatus.module.css';

function isForbidden(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('data' in err)) return false;
  const data = (err as { data?: unknown }).data;
  return typeof data === 'object' && data !== null && (data as { code?: unknown }).code === 'FORBIDDEN';
}

export function AgentStatus({
  status,
  timing,
  agentError,
  trpcError,
  workingLabel,
  workingTitle,
  onSignedIn,
  onRetry,
  skeletonCards = 0,
  skeletonLayout = 'grid',
  overlay = false,
}: {
  status: AgentTaskStatus;
  timing: TaskTiming;
  agentError: string | null;
  trpcError: unknown;
  workingLabel: string;
  /** Heading above the message in the loading modal (overlay only). */
  workingTitle?: string;
  onSignedIn: () => void;
  onRetry: () => void;
  /** Number of skeleton option cards to show while pending, shaped like the real ones. */
  skeletonCards?: number;
  /** Match the option group's layout: three cards in a row, or stacked full-width rows. */
  skeletonLayout?: 'grid' | 'list';
  /** The whole step is waiting on this: show the loading modal over the page instead of an inline progress bar. */
  overlay?: boolean;
}) {
  const busy = status === 'starting' || status === 'polling';
  const progress = useProgress(timing.key, busy ? timing.startedAt : null, timing.reported);
  return (
    <>
      {/* Always mounted (in the same place) so it can top up to 100% when the task finishes. */}
      {overlay && <LoadingOverlay open={busy} title={workingTitle} label={workingLabel} percent={progress?.percent ?? null} failed={status === 'error'} />}
      <StatusBody
        status={status}
        agentError={agentError}
        trpcError={trpcError}
        workingLabel={workingLabel}
        onSignedIn={onSignedIn}
        onRetry={onRetry}
        skeletonCards={skeletonCards}
        skeletonLayout={skeletonLayout}
        progress={overlay ? null : progress}
      />
    </>
  );
}

function StatusBody({
  status,
  agentError,
  trpcError,
  workingLabel,
  onSignedIn,
  onRetry,
  skeletonCards,
  skeletonLayout,
  progress,
}: {
  status: AgentTaskStatus;
  agentError: string | null;
  trpcError: unknown;
  workingLabel: string;
  onSignedIn: () => void;
  onRetry: () => void;
  skeletonCards: number;
  skeletonLayout: 'grid' | 'list';
  /** Inline progress bar; null when the loading modal shows the progress instead. */
  progress: Progress | null;
}) {
  const busy = status === 'starting' || status === 'polling';

  if (busy) {
    return (
      <>
        {progress && <ProgressBar label={workingLabel} progress={progress} />}
        {skeletonCards > 0 && (
          <div className={styles.cardsWrap}>
            <div className={skeletonLayout === 'list' ? styles.rows : styles.cards}>
              {Array.from({ length: skeletonCards }, (_, i) => (
                <SkeletonBlock key={i} height={skeletonLayout === 'list' ? 156 : 132} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  if (status !== 'error') return null;

  const signIn = signInRequiredFrom(trpcError);
  if (signIn) {
    return (
      <SignInPrompt
        onSignedIn={onSignedIn}
      />
    );
  }

  const forbidden = isForbidden(trpcError);
  return (
    <Alert tone="error" title={forbidden ? "This step isn't available to you" : "The cultural agent couldn't answer"}>
      {agentError ?? 'Something went wrong. Try again.'}
      {!forbidden && (
        <div className={styles.retryRow}>
          <Button size="sm" onPress={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </Alert>
  );
}
