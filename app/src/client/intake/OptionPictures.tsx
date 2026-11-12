// Pictures beside the options on Preparation and Plating (Fernando, 2026-11-11), each made once
// and shared by everyone (server/optionPictures.ts). Preparation shows a realistic photo;
// Plating shows a pen-and-ink drawing in Review the Sketch's style.

import { trpc } from '../trpc.ts';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import styles from './OptionPictures.module.css';

export function OptionPicture({
  kind,
  country,
  countryLabel,
  heroDish,
  label,
  promptText,
  prep,
}: {
  kind: 'prep' | 'plating';
  country: string;
  countryLabel: string;
  heroDish: string;
  label: string;
  promptText: string;
  prep?: { label: string; promptText: string } | undefined;
}) {
  const what = kind === 'prep' ? 'reference photo' : 'sketch';
  const q = trpc.prepPhoto.useQuery(
    {
      kind,
      country,
      countryLabel,
      heroDish,
      label,
      promptText: promptText.slice(0, 1200),
      ...(prep ? { prep: { label: prep.label, promptText: prep.promptText.slice(0, 1200) } } : {}),
    },
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
        <img src={data.url} alt={`${label}: ${what}`} loading="lazy" />
        {kind === 'prep' && <figcaption className={styles.tag}>Reference</figcaption>}
      </figure>
    );
  }
  if (q.isError || (data && 'error' in data)) {
    return <div className={styles.empty}>No picture yet</div>;
  }
  return (
    <div className={styles.waiting} aria-label={`Making a ${what}`}>
      <SkeletonBlock height="100%" />
      <span className={styles.waitText}>Making a {what}…</span>
    </div>
  );
}
