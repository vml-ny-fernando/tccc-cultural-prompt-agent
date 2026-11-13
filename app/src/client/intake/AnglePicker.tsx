import { Check } from 'lucide-react';
import { Radio, RadioGroup } from 'react-aria-components';

import { useCameraIllustration } from '../lib/cameraIllustrations.ts';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import styles from './AnglePicker.module.css';

export type AnglePickerOption = {
  id: string;
  label: string;
  pitchDeg?: number;
};

export type AnglePickerProps = {
  'aria-label': string;
  value: string | null;
  onChange: (value: string) => void;
  options: AnglePickerOption[];
  /** The currently selected look, so the angle row is shown with that look's framing. */
  lookId: string;
  lookLabel: string;
  focalMm?: number;
  /** The angle recommended for this entree: its card gets a "Recommended" tag. */
  recommendedId?: string | undefined;
  /**
   * The operator's own table from each angle (Tablescape first, 2026-11-12), by angle id: the
   * drawing (null while it renders), why the angle can't be used, or what it cuts off. Without
   * it the cards show the stand-in illustrations.
   */
  views?: Record<string, AngleView> | undefined;
  /**
   * False: cards name the angle without a picture (Fernando, 2026-11-13), so the table is only
   * seen from an angle in the large drawing it switches.
   */
  media?: boolean | undefined;
};

export type AngleView = { url: string | null; unavailable?: string | undefined; problems?: string[] | undefined };

/** Three cards, one per camera angle, each showing the same scene from that angle, framed like the currently selected look. */
export function AnglePicker({ 'aria-label': ariaLabel, value, onChange, options, lookId, lookLabel, focalMm, recommendedId, views, media = true }: AnglePickerProps) {
  return (
    <RadioGroup aria-label={ariaLabel} value={value ?? ''} onChange={onChange} className={styles.group}>
      {lookLabel && !views && media && <p className={styles.framingNote}>Shown with the {lookLabel} framing.</p>}
      <div className={styles.grid}>
        {options.map((o) => (
          <Radio
            key={o.id}
            value={o.id}
            isDisabled={!!views?.[o.id]?.unavailable}
            aria-label={o.id === recommendedId ? `${o.label} (recommended)` : o.label}
            className={styles.card}
            data-text-only={media ? undefined : true}
          >
            {({ isSelected }) => {
              const view = views?.[o.id];
              return (
                <>
                  {media && (
                    <div className={styles.media}>
                      {view ? (
                        view.url ? (
                          <img src={view.url} alt={`Your table from ${o.label}`} className={styles.image} />
                        ) : view.unavailable ? (
                          <div className={styles.fallback}>
                            <div className={styles.fallbackNote}>{view.unavailable}</div>
                          </div>
                        ) : (
                          <SkeletonBlock height="100%" />
                        )
                      ) : (
                        <AngleIllustration lookId={lookId} angleId={o.id} focalMm={focalMm} pitchDeg={o.pitchDeg} label={o.label} />
                      )}
                      {isSelected && <Check size={16} className={styles.check} aria-hidden />}
                    </div>
                  )}
                  <div className={styles.label}>{o.label}</div>
                  {o.id === recommendedId && <span className={styles.recommended}>Recommended</span>}
                  {view?.unavailable && <span className={styles.viewNote}>Not available for this table</span>}
                  {!!view?.problems?.length && (
                    <span className={styles.viewNote} data-tone="warn">
                      {view.problems.length === 1 ? '1 item to fix' : `${view.problems.length} items to fix`}
                    </span>
                  )}
                </>
              );
            }}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}

function AngleIllustration({
  lookId,
  angleId,
  focalMm,
  pitchDeg,
  label,
}: {
  lookId: string;
  angleId: string;
  focalMm?: number;
  pitchDeg?: number;
  label: string;
}) {
  const state = useCameraIllustration(lookId, angleId, focalMm, pitchDeg);

  if (state.status === 'loading') return <SkeletonBlock height="100%" />;
  if (state.status === 'error') {
    return (
      <div className={styles.fallback}>
        <div className={styles.fallbackLabel}>{label}</div>
        <div className={styles.fallbackNote}>Illustration unavailable</div>
      </div>
    );
  }
  return <img src={state.url} alt="" className={styles.image} />;
}
