// Pictures beside the options on Preparation and Plating (Fernando, 2026-11-11). Preparation
// shows a realistic photo, made once per country, dish and option and shared by everyone;
// Plating shows a light pencil drawing of the vessel, drawn in the browser.

import { useEffect, useState } from 'react';

import type { MassClass, Vessel } from '../../shared/types.ts';
import { platingSketch } from '../lib/platingSketch.ts';
import { trpc } from '../trpc.ts';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import styles from './OptionPictures.module.css';

export function PrepPhoto({
  country,
  countryLabel,
  heroDish,
  label,
  promptText,
}: {
  country: string;
  countryLabel: string;
  heroDish: string;
  label: string;
  promptText: string;
}) {
  const q = trpc.prepPhoto.useQuery(
    { country, countryLabel, heroDish, label, promptText: promptText.slice(0, 1200) },
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      // Still being made: ask again every few seconds until the saved photo is there.
      refetchInterval: (query) => (query.state.data && 'pending' in query.state.data ? 4000 : false),
    },
  );
  const data = q.data;
  if (data && 'url' in data) {
    return (
      <figure className={styles.figure}>
        <img src={data.url} alt={`${label}: reference photo`} loading="lazy" />
        <figcaption className={styles.tag}>Reference</figcaption>
      </figure>
    );
  }
  if (q.isError || (data && 'error' in data)) {
    return <div className={styles.empty}>No picture yet</div>;
  }
  return (
    <div className={styles.waiting} aria-label="Making a reference photo">
      <SkeletonBlock height="100%" />
      <span className={styles.waitText}>Making a reference photo…</span>
    </div>
  );
}

export function PlatingSketch({ vessel, massClass, label }: { vessel: Vessel; massClass: MassClass | undefined; label: string }) {
  const [url, setUrl] = useState<string | null>(null);
  // After the first paint, so the step shows before the drawing is traced.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setUrl(platingSketch(vessel, massClass)));
    return () => cancelAnimationFrame(frame);
  }, [vessel, massClass]);
  if (!url) return <SkeletonBlock height="100%" />;
  return <img className={styles.sketch} src={url} alt={`${label}: pencil sketch of the serving vessel`} />;
}
