// The wait indicator for a large image frame (the generated scene, the sketch):
// a ring centered over the frame that fills clockwise from 0 to 100% with the
// percent inside its opening,
// and what's happening plus the time left underneath. Small node cards keep
// the linear ProgressBar.

import type { CSSProperties } from 'react';

import type { Progress } from '../lib/progress.ts';
import { DidYouKnow } from './DidYouKnow.tsx';
import { timeLeftText } from './ProgressBar.tsx';
import styles from './ProgressRing.module.css';

export function ProgressRing({
  label,
  progress,
  status,
  hint,
  tips,
}: {
  label: string;
  /** null before the job reports or has an estimate: an empty ring with no number. */
  progress: Progress | null;
  /** Replaces the time-left line, e.g. "Uploading the layout image…" before the job starts. */
  status?: string;
  /** One plain sentence under the time left, e.g. what you can do while it waits. */
  hint?: string;
  /** Food styling lines for a "Did you know?" panel under the ring, one at a time. */
  tips?: readonly string[];
}) {
  const left = progress ? timeLeftText(progress) : (status ?? 'Starting…');
  return (
    <div className={styles.overlay}>
      <div
        className={styles.card}
        data-hint={hint || tips?.length ? true : undefined}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress?.percent}
        aria-valuetext={progress ? `${progress.percent}%${progress.estimated ? ' (estimated)' : ''}, ${left}` : left}
      >
        <div className={styles.ring} aria-hidden style={{ '--p': progress?.percent ?? 0 } as CSSProperties}>
          <span className={styles.percent}>{progress ? `${progress.percent}%` : ''}</span>
        </div>
        <p className={styles.label} aria-hidden>
          {label}
        </p>
        <p className={styles.meta} aria-hidden>
          {left}
        </p>
        {hint && <p className={styles.hint}>{hint}</p>}
        {tips && <DidYouKnow tips={tips} />}
      </div>
    </div>
  );
}
