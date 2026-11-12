// A small "Did you know?" panel for long waits: one food styling line at a time
// that explains what the app is doing, moving to the next line every few seconds.

import { useEffect, useState } from 'react';

import styles from './DidYouKnow.module.css';

const ROTATE_MS = 9000;

export function DidYouKnow({ tips, className }: { tips: readonly string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    if (tips.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % tips.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [tips]);
  if (!tips.length) return null;
  return (
    <aside className={[styles.tip, className].filter(Boolean).join(' ')} aria-label="Did you know?">
      <p className={styles.kicker}>Did you know?</p>
      <p key={i} className={styles.text}>
        {tips[i % tips.length]}
      </p>
    </aside>
  );
}
