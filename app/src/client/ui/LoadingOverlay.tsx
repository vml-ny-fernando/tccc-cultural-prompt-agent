// A modal that dims the page while a whole step waits on its content: a
// "NOW LOADING..." kicker whose dots build one at a time, the step's name in the
// shadow colour, a frying pan tossing a red arc of food and catching it on a
// loop, the line saying what's being prepared and a percentage that counts up. When the
// work finishes the count tops up to 100% and the modal closes a moment later;
// when it fails the modal closes at once (the error shows in the page).

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import styles from './LoadingOverlay.module.css';

/** How long the modal holds at 100% after the work finishes. */
const FINISH_MS = 700;

/** Eases the shown whole number toward `target` so it tallies up instead of jumping. */
function useCountUp(target: number): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  useEffect(() => {
    let frame = 0;
    const step = () => {
      const cur = shownRef.current;
      if (cur === target) return;
      const next = target > cur ? Math.min(target, cur + Math.max(1, Math.ceil((target - cur) * 0.12))) : target;
      shownRef.current = next;
      setShown(next);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return shown;
}

/**
 * The pan toss, after Fernando's food-market loader (2.28 s loop): the pan tips
 * back, flicks, a red arc flies up out of the left rim, over the top and back
 * into the pan, and the pan dips as it catches it. Drawn in the GIF's own
 * pixel space (800 x 600) and cropped to the action.
 */
function PanToss() {
  return (
    <svg className={styles.toss} viewBox="280 136 300 288" aria-hidden>
      <ellipse className={styles.shadow} cx="390" cy="407" rx="64" ry="7" />
      <path className={styles.food} d="M311.2 293.1 A95 95 0 1 1 447.2 315.9" pathLength={1000} />
      <g className={styles.pan}>
        <path d="M312 305 H467 C466 318 456 330 445 335 H336 C324 330 314 318 312 305 Z" />
        <rect x="469.5" y="306" width="3.5" height="16" rx="1.5" />
        <path d="M474 309 C500 309 512 304 530 303 C545 302 566 302 566 313 C566 323 545 323 530 322 C512 321 500 319 474 319 Z" />
      </g>
    </svg>
  );
}

/**
 * The width that sets `text` on exactly two lines of about even length: half its
 * one-line width plus half its longest word, so a break always lands near the
 * middle (CSS text-wrap: balance then evens the two lines). Measured in the
 * element's own font once fonts are loaded; the CSS max-width still caps it.
 */
function useTwoLineWidth(ref: RefObject<HTMLElement | null>, text: string, active: boolean): number | undefined {
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    if (!active) return;
    let live = true;
    const measure = () => {
      const el = ref.current;
      const ctx = document.createElement('canvas').getContext('2d');
      if (!live || !el || !ctx) return;
      ctx.font = getComputedStyle(el).font;
      const whole = ctx.measureText(text).width;
      const longestWord = Math.max(...text.split(/\s+/).map((w) => ctx.measureText(w).width));
      setWidth(Math.ceil(whole / 2 + longestWord / 2 + 4));
    };
    measure();
    void document.fonts?.ready.then(measure);
    return () => {
      live = false;
    };
  }, [ref, text, active]);
  return width;
}

export function LoadingOverlay({
  open,
  title,
  label,
  percent,
  failed = false,
}: {
  /** The work is running. Keep the overlay mounted after it stops so it can finish at 100%. */
  open: boolean;
  /** The step being prepared ("Sides & Accompaniments"), shown above the message. */
  title?: string;
  label: string;
  /** 0-99 while running; null before the first estimate. */
  percent: number | null;
  /** The work ended in an error: close without topping up to 100%. */
  failed?: boolean;
}) {
  const [finishing, setFinishing] = useState(false);
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open && !failed) {
      setFinishing(true);
      const id = setTimeout(() => setFinishing(false), FINISH_MS);
      wasOpen.current = open;
      return () => clearTimeout(id);
    }
    if (open) setFinishing(false);
    wasOpen.current = open;
  }, [open, failed]);

  const target = finishing ? 100 : open ? Math.max(0, Math.min(99, percent ?? 0)) : 0;
  const shown = useCountUp(target);
  const visible = open || finishing;
  const messageRef = useRef<HTMLParagraphElement>(null);
  const messageWidth = useTwoLineWidth(messageRef, label, visible);
  if (!visible) return null;

  return createPortal(
    <div className={styles.backdrop}>
      <div className={styles.card} role="status" aria-live="polite">
        <div className={styles.head}>
          <p className={styles.kicker}>
            Now loading
            <span className={styles.dots} aria-hidden>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
          {title && <p className={styles.title}>{title}</p>}
        </div>
        <PanToss />
        <p className={styles.message} ref={messageRef} style={{ width: messageWidth }}>
          {label}
        </p>
        <p className={styles.percent} aria-label={`${shown} percent`}>
          {shown}%
        </p>
      </div>
    </div>,
    document.body
  );
}
